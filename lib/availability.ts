import fs from 'node:fs'
import path from 'node:path'
import { scenes } from '@/content/scenes'
import { oc } from '@/content/oc'
import { videoBase } from './videoBase'
import { realPhotoSrc } from './realPhoto'

/**
 * Which generated images actually exist, resolved at build time.
 *
 * Artwork and portraits arrive one file at a time over several weeks, so the
 * page needs to know what has landed without anyone editing code. Drop a file
 * into public/artwork/ or public/portraits/ and the next build picks it up.
 */
export function imageAvailability(): Record<string, boolean> {
  const sources = [
    ...scenes.flatMap((scene) => scene.artworks.map((artwork) => artwork.src)),
    ...oc.map((member) => `/portraits/${member.slug}.png`),
  ]

  return Object.fromEntries(
    sources.map((src) => [src, fs.existsSync(path.join(process.cwd(), 'public', src))]),
  )
}

/**
 * Whether a cinematic scene's animated loop (docs/adr/0006) has landed for a
 * given artwork. Both encodes are delivered together, so either missing
 * falls back to the still — a scene must render exactly as it does today
 * until both files exist. `src` is an `Artwork.src` (e.g.
 * `/artwork/opening-trojan-horse.jpg`); the video sits next to the still
 * under the same base name.
 */
export function videoAvailable(src: string): boolean {
  const base = path.join(process.cwd(), 'public', videoBase(src))
  return fs.existsSync(`${base}.mp4`) && fs.existsSync(`${base}.webm`)
}

/**
 * Whether the real photograph behind a hung painting has landed (issue
 * #19) — a scene must render exactly as it does today, painting only, until
 * it has. `src` is an `Artwork.src`; the real photo sits next to the still
 * under `realPhotoSrc()`'s naming convention.
 */
export function realPhotoAvailable(src: string): boolean {
  return fs.existsSync(path.join(process.cwd(), 'public', realPhotoSrc(src)))
}
