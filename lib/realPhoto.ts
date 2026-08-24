import { videoBase } from './videoBase.ts'

/**
 * The real-photo counterpart to a painting's still, if one exists (issue
 * #19) — e.g. `/artwork/venues-homer-recital.jpg` ->
 * `/artwork/venues-homer-recital-real.jpg`. Used by both
 * `realPhotoAvailable()` (lib/availability.ts, server-only: checks the
 * filesystem) and `Painting.tsx` (client: builds the overlay `<img>` src),
 * kept as one pure function so the two can't drift on what "the real photo
 * for this painting" means. Built on `videoBase`'s extension-stripping so
 * the two naming conventions can't quietly diverge on how they treat an
 * extension.
 */
export function realPhotoSrc(src: string): string {
  const base = videoBase(src)
  const ext = src.slice(base.length)
  return `${base}-real${ext}`
}
