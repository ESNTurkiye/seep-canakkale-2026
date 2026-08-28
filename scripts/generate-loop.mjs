/**
 * Generates a scene's animated loop with Veo 3.1 on Vertex AI.
 *
 *   node scripts/generate-loop.mjs <name> [--quality]
 *
 * The hard requirement in docs/adr/0006 is that the last frame meets the
 * first — a loop that visibly jumps is not shipped, and a freely generated
 * clip almost never lands back where it started. Veo 3.1 takes a first frame
 * and a last frame, so the finished still is handed in as both. The clip is
 * then obliged to return to its opening, which is the rule rather than a
 * lucky take.
 *
 * Defaults to Veo 3.1 Fast, which is where seam iteration belongs: at roughly
 * a quarter the per-second cost, and the seam either closes or it does not.
 * --quality re-runs the settled prompt on the standard model for the take
 * that ships.
 */
import { readFile, writeFile, access } from 'node:fs/promises'
import { join } from 'node:path'
import { loadLoopPrompts } from './prompts.mjs'

const ROOT = new URL('..', import.meta.url).pathname

/**
 * Veo runs on the Gemini Developer API, not on Vertex AI.
 *
 * That is the opposite of the images, and it was not a free choice. Vertex
 * answers 404 for every Veo version in every region — on the AI Studio
 * project, and on an ordinary billed project with owner permissions where the
 * image model answers normally in the same breath. Veo simply is not open to
 * this account there. The Developer API answers 429 "prepayment credits are
 * depleted" for the same request, which is an access grant with an unpaid
 * bill rather than a closed door.
 *
 * The bill is the catch. The Developer API bills a prepay balance that Google
 * Cloud credits cannot fund until it has been topped up once; after that,
 * Google's billing documentation says eligible Cloud credits are consumed
 * before the prepay balance. Check the credit balance after the first
 * successful generation rather than trusting that.
 */
async function apiKey() {
  const file = await readFile(join(ROOT, '.env.local'), 'utf8').catch(() => '')
  const key = process.env.GEMINI_API_KEY ?? file.match(/^GEMINI_API_KEY=(.+)$/m)?.[1].trim()
  if (!key) throw new Error('GEMINI_API_KEY missing from .env.local')
  return key
}

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': await apiKey() },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`${res.status}: ${json.error?.message ?? JSON.stringify(json).slice(0, 400)}`)
  return json
}

const [name, ...flags] = process.argv.slice(2)
const model = flags.includes('--quality') ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview'

const loops = await loadLoopPrompts()
const moves = loops.get(name)
if (!moves) throw new Error(`no "What moves" note for "${name}". Known: ${[...loops.keys()].join(', ')}`)

const still = join(ROOT, 'public/artwork', `${name}.jpg`)
await access(still).catch(() => {
  throw new Error(`${still} does not exist — the loop is the finished still, animated`)
})
const frame = { bytesBase64Encoded: (await readFile(still)).toString('base64'), mimeType: 'image/jpeg' }

const base = `https://generativelanguage.googleapis.com/v1beta/models/${model}`
console.log(`${model}  ${name}\n  moves: ${moves}`)

const started = await post(`${base}:predictLongRunning`, {
  instances: [{ prompt: moves, image: frame, lastFrame: frame }],
  parameters: {
    durationSeconds: 4,
    aspectRatio: '16:9',
    resolution: '1080p',
    sampleCount: 1,
    generateAudio: false, // the site has no sound, and audio costs more per second
  },
})

process.stdout.write('  generating')
for (let i = 0; i < 60; i++) {
  await new Promise((r) => setTimeout(r, 10_000))
  process.stdout.write('.')
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${started.name}`, {
    headers: { 'x-goog-api-key': await apiKey() },
  })
  const op = await res.json()
  if (!res.ok) throw new Error(`${res.status}: ${op.error?.message ?? ''}`)
  if (!op.done) continue
  if (op.error) throw new Error(`operation failed: ${op.error.message}`)

  const video = op.response?.videos?.[0]
  if (!video?.bytesBase64Encoded) throw new Error(`no video in response: ${JSON.stringify(op.response).slice(0, 300)}`)
  const out = join(ROOT, 'assets/artwork-masters', `${name}.veo.mp4`)
  await writeFile(out, Buffer.from(video.bytesBase64Encoded, 'base64'))
  console.log(`\n  ${out.replace(ROOT, '')}`)
  process.exit(0)
}
throw new Error('timed out after 10 minutes')
