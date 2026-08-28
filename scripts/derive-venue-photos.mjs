/**
 * Turns the venue photographs in `assets/venue-photos/` into the committed
 * `-real.jpg` layers that crossfade over the paintings (issue #19/#20):
 *
 *     node scripts/derive-venue-photos.mjs
 *
 * These are photographs of real places, supplied by the section — not
 * generated, not regenerable, and not interchangeable. `derive-artwork.mjs`
 * is the wrong home for them: it downsizes generated masters, one aspect
 * ratio, no decisions. Every photograph here instead needs a crop chosen by
 * eye, because it has to land in the same 16:9 frame as the painting it
 * covers and read as the same view. Recording those crops in code is the
 * point of this file — the alternative is a crop done once in a shell that
 * nobody can reproduce or argue with.
 *
 * Originals stay out of git for the same reason masters do (ADR-0007), with
 * one difference worth knowing: a master can be regenerated from a prompt and
 * these cannot. `assets/venue-photos/` is the only copy.
 */

import { readdir, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const ROOT = new URL('..', import.meta.url).pathname
const FROM = join(ROOT, 'assets/venue-photos')
const TO = join(ROOT, 'public/artwork')

/** The frame every hung painting is cut to, so every photo covering one matches. */
const ASPECT = 16 / 9

/** No photograph is enlarged past its own pixels; this is only a ceiling. */
const MAX_WIDTH = 2000

/**
 * `bias` places the 16:9 window inside a taller source: 0 keeps the top edge,
 * 1 the bottom, 0.5 centres it. It is a fraction rather than a pixel offset so
 * that re-cropping a re-supplied, higher-resolution original still lands in
 * the same place.
 */
const PHOTOS = [
  {
    from: 'kayit-masasi.jpg',
    to: 'venues-ariadne-thread-real.jpg',
    bias: 0.5,
    // Barely taller than 16:9 already. The open plaza sits where the painting
    // keeps its empty marble floor, which is the match that matters.
  },
  {
    from: 'temizay-hotel.jpg',
    to: 'stay-xenia-real.jpg',
    bias: 0.85,
    // A tall façade cropped low, onto the entrance and its sign: Xenia is a
    // painting of a threshold, not of a building, and the upper storeys carry
    // none of that.
  },
  {
    from: 'intercultural-dinner.jpg',
    to: 'evenings-intercultural-real.jpg',
    bias: 0.5,
    // Already 16:9 — nothing to choose.
  },
  {
    from: 'kule-otel.jpg',
    to: 'stay-kule-beacon-real.jpg',
    bias: 0.35,
    // Cropped high, to keep the roof terrace. The painting is a keeper at the
    // top of a tower; the ground floor is not what it rhymes with.
  },
  {
    from: 'container-hall-turkish-night.png',
    to: 'evenings-turkish-night-real.jpg',
    bias: 0.5,
    // A portrait frame cut down to the stage and the front of the crowd —
    // the band standing in for the painting's lute player, the crowd for its
    // circle of dancers.
  },
  {
    from: 'paralel-derslikler.jpeg',
    to: 'venues-judgement-of-paris-real.jpg',
    bias: 0.5,
    // Already 16:9 at 2000px. The only photograph of the eight that arrived
    // needing nothing.
  },
  {
    from: 'acilis-günü-salonu.webp',
    to: 'venues-homer-recital-real.jpg',
    bias: 0.5,
    // A packed rake of seats, which is what The Recital paints: the audience
    // is the subject in both.
  },
  {
    from: 'kapanis-toreni-salonu.JPG',
    to: 'venues-torch-handover-real.jpg',
    bias: 0.45,
    // The closest framing match of the set — shot from the back of the hall
    // towards the dais, which is exactly where The Handover puts the viewer.
    // Cropped slightly high to hold the stage.
  },
]

await mkdir(TO, { recursive: true })

const present = new Set(await readdir(FROM).catch(() => []))
const missing = PHOTOS.filter((p) => !present.has(p.from))
if (missing.length) {
  console.log(`skipping ${missing.length} not in assets/venue-photos/: ${missing.map((p) => p.from).join(', ')}`)
}

let soft = 0
for (const photo of PHOTOS.filter((p) => present.has(p.from))) {
  const src = join(FROM, photo.from)
  const { width, height } = await sharp(src).metadata()

  // Take the widest 16:9 window the source allows, then place it vertically.
  const cropWidth = Math.min(width, Math.round(height * ASPECT))
  const cropHeight = Math.round(cropWidth / ASPECT)
  const top = Math.round((height - cropHeight) * photo.bias)
  const left = Math.round((width - cropWidth) / 2)

  const outWidth = Math.min(MAX_WIDTH, cropWidth)
  const out = join(TO, photo.to)
  await sharp(src)
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .resize(outWidth, Math.round(outWidth / ASPECT))
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out)

  // The painting this covers ships at 2000px. A photograph that crossfades
  // over one at half that is visibly softer at the moment of the swap, which
  // is the one moment the reveal exists for.
  const short = outWidth < MAX_WIDTH
  if (short) soft++
  console.log(
    `${photo.to.padEnd(38)} ${width}×${height} -> ${outWidth}×${Math.round(outWidth / ASPECT)}` +
      (short ? `   UNDER ${MAX_WIDTH}px — ask for a larger original` : ''),
  )
}

if (soft) {
  console.log(`\n${soft} of ${PHOTOS.length} are under ${MAX_WIDTH}px wide and were not enlarged.`)
}
