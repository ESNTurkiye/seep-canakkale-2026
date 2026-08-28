/**
 * Generates artwork and portraits with Nano Banana Pro (Gemini 3 Pro Image).
 *
 *   node scripts/generate.mjs scene <name>      16:9, 4K, no reference
 *   node scripts/generate.mjs portrait <slug>   4:5, 2K, from a source photograph
 *
 * Prompts come from docs/art-direction.md via scripts/prompts.mjs — this file
 * decides only how the request is shaped, never what it says. Output is the
 * ungoverned master: it lands in assets/artwork-masters/, which is gitignored,
 * and scripts/derive-artwork.mjs makes the committed web variant from it.
 *
 * Every successful call costs real money against the billing account. An
 * existing master is never overwritten without --force, so a re-run that was
 * meant as a no-op cannot silently spend.
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadPrompts } from './prompts.mjs'

const run = promisify(execFile)
const MODEL = 'gemini-3-pro-image'
const ROOT = new URL('..', import.meta.url).pathname

/**
 * Two backends speak the same request body and differ only in URL and auth.
 *
 * Vertex AI bills the Google Cloud project, so the Google Developer Program's
 * monthly credits pay for it. The Gemini Developer API does not: it runs on a
 * separate prepay balance that Cloud credits cannot fund until it has been
 * topped up first. That is the whole reason this defaults to Vertex.
 */
async function env(name) {
  const file = await readFile(join(ROOT, '.env.local'), 'utf8').catch(() => '')
  return file.match(new RegExp(`^${name}=(.+)$`, 'm'))?.[1].trim()
}

async function endpoint(model, method) {
  const project = process.env.GOOGLE_CLOUD_PROJECT ?? (await env('GOOGLE_CLOUD_PROJECT'))
  if (project) {
    const { stdout } = await run('gcloud', ['auth', 'print-access-token'])
    return {
      url: `https://aiplatform.googleapis.com/v1/projects/${project}/locations/global/publishers/google/models/${model}:${method}`,
      headers: { authorization: `Bearer ${stdout.trim()}` },
    }
  }
  const key = await env('GEMINI_API_KEY')
  if (!key) throw new Error('set GOOGLE_CLOUD_PROJECT (Vertex) or GEMINI_API_KEY in .env.local')
  return {
    url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:${method}`,
    headers: { 'x-goog-api-key': key },
  }
}

async function exists(p) {
  return access(p).then(() => true, () => false)
}

/**
 * Gemini takes JPEG, PNG and WebP. Source photographs arrive as whatever the
 * sender's phone produced, and half of them are HEIC.
 */
async function readAsInlineImage(path) {
  const ext = path.split('.').pop().toLowerCase()
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
    return { mimeType: mime, data: (await readFile(path)).toString('base64') }
  }
  const converted = join(tmpdir(), `seep-${Date.now()}.jpg`)
  await run('sips', ['-s', 'format', 'jpeg', path, '--out', converted])
  return { mimeType: 'image/jpeg', data: (await readFile(converted)).toString('base64') }
}

async function generate({ prompt, aspectRatio, imageSize, reference }) {
  const parts = [{ text: prompt }]
  if (reference) parts.unshift({ inlineData: reference })

  const { url, headers } = await endpoint(MODEL, 'generateContent')
  const res = await fetch(
    url,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          imageConfig: { aspectRatio, imageSize },
        },
      }),
    },
  )

  const body = await res.json()
  if (!res.ok) throw new Error(`${res.status}: ${body.error?.message ?? JSON.stringify(body)}`)

  const candidate = body.candidates?.[0]
  const image = candidate?.content?.parts?.find((p) => p.inlineData)?.inlineData
  if (!image) {
    const said = candidate?.content?.parts?.map((p) => p.text).filter(Boolean).join(' ')
    throw new Error(
      `no image returned (finishReason: ${candidate?.finishReason ?? 'unknown'})` +
        (said ? ` — model said: ${said}` : ''),
    )
  }
  return { bytes: Buffer.from(image.data, 'base64'), usage: body.usageMetadata }
}

const [kind, name, ...flags] = process.argv.slice(2)
const force = flags.includes('--force')
const { style, portraitTemplate, scenes } = await loadPrompts()

if (kind === 'scene') {
  const scene = scenes.get(name)
  if (!scene) {
    throw new Error(`unknown scene "${name}". Known: ${[...scenes.keys()].join(', ')}`)
  }
  const out = join(ROOT, 'assets/artwork-masters', `${name}.png`)
  if (!force && (await exists(out))) throw new Error(`${out} exists — pass --force to spend again`)

  const { bytes, usage } = await generate({
    prompt: `${style}\n\n${scene}`,
    aspectRatio: '16:9',
    imageSize: '4K',
  })
  await mkdir(join(ROOT, 'assets/artwork-masters'), { recursive: true })
  await writeFile(out, bytes)
  console.log(`${out}  ${(bytes.length / 1e6).toFixed(1)} MB  ${usage?.totalTokenCount ?? '?'} tokens`)
} else if (kind === 'portrait') {
  const dir = join(ROOT, 'assets/source-photos')
  const files = await (await import('node:fs/promises')).readdir(dir)
  const photo = files.find((f) => f.replace(/\.[^.]+$/, '') === name)
  if (!photo) throw new Error(`no source photograph for "${name}" in assets/source-photos/`)

  const out = join(ROOT, 'assets/artwork-masters/portraits', `${name}.png`)
  if (!force && (await exists(out))) throw new Error(`${out} exists — pass --force to spend again`)

  const { bytes, usage } = await generate({
    prompt: portraitTemplate,
    aspectRatio: '4:5',
    imageSize: '2K',
    reference: await readAsInlineImage(join(dir, photo)),
  })
  await mkdir(join(ROOT, 'assets/artwork-masters/portraits'), { recursive: true })
  await writeFile(out, bytes)
  console.log(`${out}  from ${photo}  ${(bytes.length / 1e6).toFixed(1)} MB  ${usage?.totalTokenCount ?? '?'} tokens`)
} else {
  throw new Error('usage: generate.mjs scene <name> | portrait <slug> [--force]')
}
