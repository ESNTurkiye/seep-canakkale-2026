import fs from 'node:fs'
import path from 'node:path'
import { scenes } from '@/content/scenes'
import { oc } from '@/content/oc'

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
