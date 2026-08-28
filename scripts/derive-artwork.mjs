/**
 * Makes the committed web assets from the ungoverned masters — the step
 * `npm run art` names. Masters are gitignored working material; only what
 * this produces is ever committed. See docs/adr/0007-masters-out-of-git.md.
 *
 *   assets/artwork-masters/<name>.png           -> public/artwork/<name>.jpg    (2000px wide)
 *   assets/artwork-masters/portraits/<slug>.png -> public/portraits/<slug>.png  (800px wide)
 *
 * Idempotent: a derivative newer than its master is left alone, so running
 * this after generating one image does not rewrite the other eight.
 */
import { readdir, mkdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const ROOT = new URL('..', import.meta.url).pathname

// --force re-encodes every derivative, including the committed artwork of
// scenes nobody touched. That is a real diff across files you did not mean to
// change, and the encoder settings here are not the ones that produced the
// originals. Regenerate one scene, run without --force, commit one file.
const force = process.argv.includes('--force')

async function newerThan(a, b) {
  const [x, y] = await Promise.all([stat(a).catch(() => null), stat(b).catch(() => null)])
  return x && y && x.mtimeMs > y.mtimeMs
}

async function derive({ from, to, width, height, encode, label }) {
  await mkdir(to, { recursive: true })
  const masters = await readdir(from).catch(() => [])
  for (const file of masters.filter((f) => f.endsWith('.png'))) {
    const src = join(from, file)
    const out = join(to, file.replace(/\.png$/, encode === 'jpeg' ? '.jpg' : '.png'))
    if (!force && (await newerThan(out, src))) continue

    // Portraits are cropped to an exact 4:5 rather than merely scaled: the
    // model returns 4:5 approximately (800×993, not 800×1000), and sixteen
    // frames hung as one wall show any drift. Palette quantisation is what
    // keeps a PNG portrait near 450KB instead of 1.8MB — at sixteen of them,
    // the difference is 22MB of repository and of every visitor's download.
    const pipeline = height ? sharp(src).resize(width, height, { fit: 'cover' }) : sharp(src).resize({ width })
    await (encode === 'jpeg'
      ? pipeline.jpeg({ quality: 92, mozjpeg: true })
      : pipeline.png({ palette: true, quality: 90, effort: 8 })
    ).toFile(out)
    const { width: w, height: h } = await sharp(out).metadata()
    const { size } = await stat(out)
    console.log(`${label}  ${out.replace(ROOT, '')}  ${w}×${h}  ${Math.round(size / 1024)} KB`)
  }
}

await derive({
  from: join(ROOT, 'assets/artwork-masters'),
  to: join(ROOT, 'public/artwork'),
  width: 2000,
  encode: 'jpeg',
  label: 'artwork ',
})
await derive({
  from: join(ROOT, 'assets/artwork-masters/portraits'),
  to: join(ROOT, 'public/portraits'),
  width: 800,
  height: 1000,
  encode: 'png',
  label: 'portrait',
})
