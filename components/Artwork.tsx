import type { Artwork as ArtworkType } from '@/content/scenes'
import s from './museum.module.css'

/**
 * Renders the generated painting, or a painted placeholder of the right
 * proportion while it does not exist yet. The site is meant to be looked at
 * before a single image has been generated, so the placeholder is designed,
 * not broken.
 */
export function Artwork({ artwork, available }: { artwork: ArtworkType; available: boolean }) {
  if (!available) {
    return (
      <div className={s.placeholder}>
        <div>
          <p className={s.placeholderMark}>Artwork pending</p>
          <p className={s.placeholderTitle}>{artwork.title}</p>
        </div>
      </div>
    )
  }

  // Plain <img>: static export rules out next/image optimisation, so the build
  // pipeline produces the variants instead. See ADR-0003.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={artwork.src} alt={artwork.alt} />
}
