/**
 * Derives the Dardanelles line chart in `content/strait.ts` from OpenStreetMap
 * coastline data.
 *
 * Run by hand, not at build time — the site is a static export with no server
 * and no network at build (ADR-0003), so the derived geometry is committed and
 * the fetch happens only when someone re-runs this:
 *
 *     node scripts/derive-strait.mjs
 *
 * The output carries the narrowest crossing *measured from the coastline
 * itself* rather than a figure quoted from elsewhere — the "This Year" wall
 * claims Çanakkale sits on the narrowest water in Europe, and the drawing is
 * there to show that rather than decorate the claim. If the coastline data
 * changes, the number on the page changes with it.
 *
 * Source data is © OpenStreetMap contributors, ODbL. The attribution in the
 * site footer is a licence condition, not a courtesy — do not drop it.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const OVERPASS = 'https://overpass-api.de/api/interpreter'

/** Generous enough to pull whole coastline ways; the drawing is cropped to CROP below. */
const QUERY_BBOX = [39.95, 25.95, 40.6, 26.85]

/** What the drawing shows: the Aegean mouth up to the Marmara exit. */
const CROP = { minLat: 40.0, maxLat: 40.47, minLon: 26.13, maxLon: 26.75 }

/**
 * Two landmarks used to tell the strait's own two shores apart from every
 * other coastline in the query box (Gökçeada, the far Marmara shore). Whichever
 * stitched chain passes closest to each is that shore — the chains have no
 * identity of their own in the OSM response.
 */
const KILITBAHIR = [26.3789, 40.1503] // European shore
const CANAKKALE = [26.4064, 40.1517] // Anatolian shore

/** Latitude of the strait, used to compress longitude into an equal-ish aspect. */
const LAT0 = 40.24
const KX = Math.cos((LAT0 * Math.PI) / 180)

/** Douglas–Peucker tolerance, in projected degrees. Tuned by eye at render size. */
const EPSILON = 0.00045

const KM_PER_DEG_LAT = 110.574
const KM_PER_DEG_LON = 111.32

function km(a, b) {
  const dy = (b[1] - a[1]) * KM_PER_DEG_LAT
  const dx = (b[0] - a[0]) * KM_PER_DEG_LON * Math.cos((((a[1] + b[1]) / 2) * Math.PI) / 180)
  return Math.hypot(dx, dy)
}

/**
 * The raw Overpass response, cached. Overpass is a shared free service that
 * rate-limits and times out under load, and the projection and simplification
 * below want re-running far more often than the coastline changes — so the
 * download happens once and every later tweak reads the cache. `--refresh`
 * forces a new download.
 */
const CACHE = new URL('../.cache/overpass-coastline.json', import.meta.url)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function download() {
  const [s, w, n, e] = QUERY_BBOX
  const data = `[out:json][timeout:90];way["natural"="coastline"](${s},${w},${n},${e});out geom;`
  // Overpass answers 429 when busy and 504 when the query outlives its slot;
  // both clear on their own, so back off and try again rather than failing.
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(OVERPASS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Overpass answers 406 to requests without one it recognises.
        'User-Agent': 'seep-canakkale-2026/1.0 (https://github.com/ESNTurkiye/seep-canakkale-2026)',
      },
      body: new URLSearchParams({ data }),
    })
    if (res.ok) return await res.text()
    if (attempt >= 4 || ![429, 504, 503].includes(res.status)) {
      throw new Error(`Overpass ${res.status} ${res.statusText}`)
    }
    const wait = attempt * 20
    console.log(`Overpass ${res.status}; retrying in ${wait}s (attempt ${attempt} of 3)`)
    await sleep(wait * 1000)
  }
}

async function fetchCoastline() {
  const refresh = process.argv.includes('--refresh')
  if (!refresh && existsSync(CACHE)) {
    console.log('using cached Overpass response (--refresh to download again)')
    return JSON.parse(readFileSync(CACHE, 'utf8')).elements
  }
  const body = await download()
  mkdirSync(new URL('../.cache/', import.meta.url), { recursive: true })
  writeFileSync(CACHE, body)
  return JSON.parse(body).elements
}

/**
 * OSM returns a coastline as unordered, unclosed fragments. Drawn as-is they
 * read as a field of disconnected dashes, so they are joined end-to-end first.
 */
function stitch(elements) {
  const key = (p) => `${p[0].toFixed(7)},${p[1].toFixed(7)}`
  const fragments = elements
    .filter((w) => w.geometry?.length > 1)
    .map((w) => w.geometry.map((p) => [p.lon, p.lat]))
  const chains = []
  while (fragments.length) {
    let chain = fragments.pop()
    for (let grew = true; grew; ) {
      grew = false
      for (let i = 0; i < fragments.length; i++) {
        const f = fragments[i]
        const joined =
          key(f[0]) === key(chain.at(-1)) ? chain.concat(f.slice(1))
          : key(f.at(-1)) === key(chain[0]) ? f.slice(0, -1).concat(chain)
          : key(f.at(-1)) === key(chain.at(-1)) ? chain.concat(f.slice(0, -1).reverse())
          : key(f[0]) === key(chain[0]) ? f.slice(1).reverse().concat(chain)
          : null
        if (joined) {
          chain = joined
          fragments.splice(i, 1)
          grew = true
          break
        }
      }
    }
    chains.push(chain)
  }
  return chains
}

const closestDistance = (chain, target) =>
  chain.reduce((best, p) => Math.min(best, km(p, target)), Infinity)

/** Keeps only the runs of a chain that fall inside the crop, as separate subpaths. */
function crop(chain) {
  const inside = (p) =>
    p[1] >= CROP.minLat && p[1] <= CROP.maxLat && p[0] >= CROP.minLon && p[0] <= CROP.maxLon
  const runs = []
  let run = null
  for (let i = 0; i < chain.length; i++) {
    if (inside(chain[i])) {
      // Reach one point past the crop so the line meets the frame edge rather
      // than stopping short of it.
      if (!run) run = i > 0 ? [chain[i - 1]] : []
      run.push(chain[i])
    } else if (run) {
      run.push(chain[i])
      runs.push(run)
      run = null
    }
  }
  if (run) runs.push(run)
  return runs.filter((r) => r.length > 1)
}

function simplify(points, eps) {
  if (points.length < 3) return points
  const [ax, ay] = points[0]
  const [bx, by] = points.at(-1)
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1
  let index = 0
  let max = 0
  for (let i = 1; i < points.length - 1; i++) {
    const d = Math.abs((points[i][0] - ax) * dy - (points[i][1] - ay) * dx) / len
    if (d > max) {
      max = d
      index = i
    }
  }
  if (max <= eps) return [points[0], points.at(-1)]
  return [
    ...simplify(points.slice(0, index + 1), eps).slice(0, -1),
    ...simplify(points.slice(index), eps),
  ]
}

/** The shortest line between the two shores, measured point-to-segment. */
function narrowest(european, anatolian) {
  const toXY = ([lon, lat]) => [lon * KM_PER_DEG_LON * KX, lat * KM_PER_DEG_LAT]
  const lerp = (a, b, t) => [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]
  let best = { d: Infinity }
  const against = (points, segments, flip) => {
    for (const p of points) {
      const [px, py] = toXY(p)
      for (let i = 0; i < segments.length - 1; i++) {
        const [ax, ay] = toXY(segments[i])
        const [bx, by] = toXY(segments[i + 1])
        const dx = bx - ax
        const dy = by - ay
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)))
        const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
        if (d < best.d) {
          const q = lerp(segments[i], segments[i + 1], t)
          best = { d, from: flip ? q : p, to: flip ? p : q }
        }
      }
    }
  }
  against(european, anatolian, false)
  against(anatolian, european, true)
  return best
}

const elements = await fetchCoastline()
const chains = stitch(elements).sort((a, b) => b.length - a.length)

const european = chains.reduce((best, c) =>
  closestDistance(c, KILITBAHIR) < closestDistance(best, KILITBAHIR) ? c : best,
)
const anatolian = chains.reduce((best, c) =>
  c !== european && closestDistance(c, CANAKKALE) < closestDistance(best, CANAKKALE) ? c : best,
  chains.find((c) => c !== european),
)

const inStrait = (p) => p[1] > 40.02 && p[1] < 40.45 && p[0] > 26.15 && p[0] < 26.75
const gap = narrowest(european.filter(inStrait), anatolian.filter(inStrait))

// --- project, then normalise into a 0–1000 viewBox ---
const project = ([lon, lat]) => [lon * KX, -lat]
const runs = [...crop(european), ...crop(anatolian)].map((r) => simplify(r.map(project), EPSILON))

const corners = [
  project([CROP.minLon, CROP.minLat]),
  project([CROP.maxLon, CROP.maxLat]),
]
const minX = Math.min(...corners.map((c) => c[0]))
const maxX = Math.max(...corners.map((c) => c[0]))
const minY = Math.min(...corners.map((c) => c[1]))
const maxY = Math.max(...corners.map((c) => c[1]))

const WIDTH = 1000
const HEIGHT = Math.round((WIDTH * (maxY - minY)) / (maxX - minX))
const fx = (x) => ((x - minX) / (maxX - minX)) * WIDTH
const fy = (y) => ((y - minY) / (maxY - minY)) * HEIGHT
const place = (lonLat) => {
  const [x, y] = project(lonLat)
  return [Number(fx(x).toFixed(1)), Number(fy(y).toFixed(1))]
}

const coast = runs
  .map((r) => 'M' + r.map(([x, y]) => `${fx(x).toFixed(1)} ${fy(y).toFixed(1)}`).join('L'))
  .join('')

const [nx1, ny1] = place(gap.from)
const [nx2, ny2] = place(gap.to)
const [cx, cy] = place(CANAKKALE)

const out = `/**
 * The Dardanelles, as a line chart. GENERATED — do not edit by hand; run
 * \`node scripts/derive-strait.mjs\` instead, which explains every choice here.
 *
 * Coastline © OpenStreetMap contributors, ODbL. The attribution rendered in
 * the site footer is a licence condition.
 */

export const strait = {
  /** Both shores of the strait, as one path in a ${WIDTH}×${HEIGHT} viewBox. */
  viewBox: '0 0 ${WIDTH} ${HEIGHT}',
  width: ${WIDTH},
  height: ${HEIGHT},
  coast:
    '${coast}',
  /** The shortest crossing, measured from the coastline above, not quoted. */
  narrows: {
    x1: ${nx1},
    y1: ${ny1},
    x2: ${nx2},
    y2: ${ny2},
    km: ${gap.d.toFixed(2)},
  },
  /** The city, for a single labelled mark. */
  canakkale: { x: ${cx}, y: ${cy} },
} as const
`

writeFileSync(new URL('../content/strait.ts', import.meta.url), out)

console.log(`chains stitched: ${chains.length}`)
console.log(`european shore: ${european.length} pts   anatolian shore: ${anatolian.length} pts`)
console.log(`subpaths drawn: ${runs.length}   points after simplify: ${runs.reduce((n, r) => n + r.length, 0)}`)
console.log(`narrowest crossing: ${gap.d.toFixed(3)} km`)
console.log(`wrote content/strait.ts (${(out.length / 1024).toFixed(1)} KB), viewBox ${WIDTH}×${HEIGHT}`)
