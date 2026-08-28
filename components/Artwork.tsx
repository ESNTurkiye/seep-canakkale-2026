import type { MotionValue } from 'motion/react'
import type { Artwork as ArtworkType } from '@/content/scenes'
import { videoBase } from '@/lib/videoBase'
import { SceneVideo } from './SceneVideo'
import s from './museum.module.css'

/**
 * Renders the generated painting, or a painted placeholder of the right
 * proportion while it does not exist yet. The site is meant to be looked at
 * before a single image has been generated, so the placeholder is designed,
 * not broken.
 *
 * `video` opts an artwork into its animated loop (docs/adr/0006), gated on
 * file presence via `videoAvailable()` — any cinematic scene may have one,
 * not just the opening. `available` still gates the still image underneath
 * it; a missing artwork renders the placeholder regardless of `video`. With
 * no video files present, or under reduced motion, this renders the exact
 * `<img>` it always has.
 *
 * Passing `progress` moves that loop from the clock to the scroll — the
 * painting advances as the viewer advances instead of cycling on its own.
 * See `SceneVideo`, which carries what that costs. A scene that does not
 * pass one keeps the autoplaying loop.
 */
export function Artwork({
  artwork,
  available,
  video = false,
  reducedMotion = false,
  progress,
  scrubUntil = 1,
}: {
  artwork: ArtworkType
  available: boolean
  video?: boolean
  reducedMotion?: boolean
  /** The scene's own scroll progress. Present means: scrub, do not autoplay. */
  progress?: MotionValue<number>
  /** Progress at which the clip reaches its last frame — see `SceneVideo`. */
  scrubUntil?: number
}) {
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

  if (video && !reducedMotion && progress) {
    return (
      <SceneVideo
        base={videoBase(artwork.src)}
        poster={artwork.src}
        alt={artwork.alt}
        progress={progress}
        until={scrubUntil}
      />
    )
  }

  if (video && !reducedMotion) {
    const base = videoBase(artwork.src)
    return (
      <video
        poster={artwork.src}
        aria-label={artwork.alt}
        autoPlay
        muted
        loop
        playsInline
        // "none" is the most bandwidth-conscious hint, but spec leaves
        // browsers free to ignore it once autoplay is set, which risks the
        // loop silently never starting. "metadata" is the safer middle
        // ground: browsers fetch just enough to play, not the whole file.
        preload="metadata"
      >
        <source src={`${base}.webm`} type="video/webm" />
        <source src={`${base}.mp4`} type="video/mp4" />
      </video>
    )
  }

  // Plain <img>: static export rules out next/image optimisation, so the build
  // pipeline produces the variants instead. See ADR-0003.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={artwork.src} alt={artwork.alt} />
}
