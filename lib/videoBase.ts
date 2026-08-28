/**
 * The base filename a cinematic scene's video pair lives at, next to its
 * still — e.g. `/artwork/opening-trojan-horse.jpg` ->
 * `/artwork/opening-trojan-horse`, which then carries `.mp4`/`.webm`. Used by
 * both `videoAvailable()` (lib/availability.ts, server-only: checks the
 * filesystem) and `Artwork.tsx` (client: builds the `<source>` URLs), kept as
 * one pure function so the two can't drift on what "the video for this
 * artwork" means. Extension-agnostic — not `.jpg`-specific — since a future
 * artwork's still need not be a jpg.
 */
export function videoBase(src: string): string {
  return src.replace(/\.[^./]+$/, '')
}
