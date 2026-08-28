'use client'

import type { Ref } from 'react'
import type { MotionValue } from 'motion/react'
import { motion } from 'motion/react'
import type { Artwork as ArtworkType } from '@/content/scenes'
import { realPhotoSrc } from '@/lib/realPhoto'
import { Artwork } from './Artwork'
import s from './museum.module.css'

/** Title, myth and — where the painting is of somewhere real — the room's own
 *  name, all from the artwork itself; never a scene-specific label.
 *
 *  The venue line is rendered here rather than only in the hung variant, so
 *  the data decides where it appears instead of a second rule that could drift
 *  from `Artwork.venue`. Today only hung paintings carry one: the cinematic
 *  scenes are places in the myth, not rooms anyone books. */
function LabelText({ artwork }: { artwork: ArtworkType }) {
  return (
    <>
      <p className={s.labelTitle}>{artwork.title}</p>
      <p className={s.labelMyth}>{artwork.myth}</p>
      {artwork.venue ? <p className={s.labelVenue}>{artwork.venue}</p> : null}
    </>
  )
}

type PaintingProps =
  | {
      /** Renders a frame and a `<figcaption>` label — the caller must wrap it in a `<figure>`. */
      variant: 'hung'
      artwork: ArtworkType
      available: boolean
      /** Whether the real photo behind this painting has landed. See issue #19. */
      realPhotoAvailable: boolean
      /** Crossfade opacity for the real-photo layer — see `realPhotoReveal` (lib/choreography.ts). */
      realPhotoOpacity: MotionValue<number>
    }
  | {
      /**
       * The opening's growing reveal: the frame and label are driven by
       * openingChoreography rather than shown at rest. See ADR-0005.
       */
      variant: 'opening'
      artwork: ArtworkType
      available: boolean
      boxRef: Ref<HTMLDivElement>
      scale: MotionValue<number>
      frameOpacity: MotionValue<number>
      frameWidth: MotionValue<string>
      labelOpacity: MotionValue<number>
      /** Whether the opening's animated loop has landed. See ADR-0006. */
      videoAvailable: boolean
      /** Resolved (hydration-safe) reduced-motion preference. See ADR-0006. */
      reducedMotion: boolean
    }
  | {
      /**
       * A later scene's approach: already hung, so the frame fades out and
       * the copy fades in as it nears peak scale — driven by
       * enteringChoreography. By default (recede: true, the standard
       * gallery walk-past) it then plays back in reverse on the way out;
       * see ADR-0005 and issues #16/#17.
       */
      variant: 'entering'
      artwork: ArtworkType
      available: boolean
      boxRef: Ref<HTMLDivElement>
      scale: MotionValue<number>
      frameOpacity: MotionValue<number>
      frameWidth: MotionValue<string>
      labelOpacity: MotionValue<number>
      /** Whether this artwork's animated loop has landed. See ADR-0006. */
      videoAvailable: boolean
      /** Resolved (hydration-safe) reduced-motion preference. See ADR-0006. */
      reducedMotion: boolean
    }

/**
 * A painting on the museum wall: the artwork or its placeholder, the gilt
 * frame around it (ADR-0004), and the museum label beneath it. The opening
 * scene and every hung scene render through this one component so the frame
 * and label never drift apart between them.
 */
export function Painting(props: PaintingProps) {
  const { artwork, available } = props

  if (props.variant === 'opening') {
    const { boxRef, scale, frameOpacity, frameWidth, labelOpacity, videoAvailable, reducedMotion } =
      props
    return (
      <>
        <motion.div
          ref={boxRef}
          className={s.painting}
          // Same resting size as every other hung painting on the site (see
          // .enteringPainting) — scale 1 now *is* the hung, resting frame,
          // not an intermediate size shrunk further by a separate multiplier.
          style={{ width: 'min(52vw, calc(52svh * 16 / 9))', scale }}
        >
          <div className={s.paintingInner}>
            <Artwork
              artwork={artwork}
              available={available}
              video={videoAvailable}
              reducedMotion={reducedMotion}
            />
          </div>
          <motion.div
            className={s.frame}
            style={{ opacity: frameOpacity, ['--fw' as string]: frameWidth }}
          />
        </motion.div>
        <motion.div className={s.label} style={{ opacity: labelOpacity, bottom: '6svh' }}>
          <LabelText artwork={artwork} />
        </motion.div>
      </>
    )
  }

  if (props.variant === 'entering') {
    const { boxRef, scale, frameOpacity, frameWidth, labelOpacity, videoAvailable, reducedMotion } =
      props
    return (
      // Grouped with the label as one unit, rather than the opening's
      // separately overlaid label: the opening never shows copy and label at
      // once (see openingChoreography's timing), but an entering scene's
      // label travels with the painting instead of pinning to the viewport
      // bottom, where the copy fades in as the frame fades out (issue #16).
      <div className={s.enteringGroup}>
        <motion.div ref={boxRef} className={s.enteringPainting} style={{ scale }}>
          <div className={s.paintingInner}>
            <Artwork
              artwork={artwork}
              available={available}
              video={videoAvailable}
              reducedMotion={reducedMotion}
            />
          </div>
          <motion.div
            className={s.frame}
            style={{ opacity: frameOpacity, ['--fw' as string]: frameWidth }}
          />
        </motion.div>
        <motion.div className={s.enteringLabel} style={{ opacity: labelOpacity }}>
          <LabelText artwork={artwork} />
        </motion.div>
      </div>
    )
  }

  const { realPhotoAvailable, realPhotoOpacity } = props

  return (
    <>
      <div className={s.hungFrame}>
        <Artwork artwork={artwork} available={available} />
        {realPhotoAvailable && (
          <motion.img
            src={realPhotoSrc(artwork.src)}
            alt=""
            aria-hidden="true"
            className={s.hungRealPhoto}
            style={{ opacity: realPhotoOpacity }}
          />
        )}
      </div>
      <figcaption className={s.hungLabel}>
        <LabelText artwork={artwork} />
      </figcaption>
    </>
  )
}
