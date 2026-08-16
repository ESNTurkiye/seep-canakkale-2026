'use client'

import type { Ref } from 'react'
import type { MotionValue } from 'motion/react'
import { motion } from 'motion/react'
import type { Artwork as ArtworkType } from '@/content/scenes'
import { Artwork } from './Artwork'
import s from './museum.module.css'

/** Title and myth from the artwork itself — never a scene-specific label. */
function LabelText({ artwork }: { artwork: ArtworkType }) {
  return (
    <>
      <p className={s.labelTitle}>{artwork.title}</p>
      <p className={s.labelMyth}>{artwork.myth}</p>
    </>
  )
}

type PaintingProps =
  | {
      /** Renders a frame and a `<figcaption>` label — the caller must wrap it in a `<figure>`. */
      variant: 'hung'
      artwork: ArtworkType
      available: boolean
    }
  | {
      /**
       * The opening's receding reveal: the frame and label are driven by
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
    }
  | {
      /**
       * A later scene's approach and recede: already hung, so the frame is
       * always present — only scale and the label's opacity move, driven by
       * enteringChoreography. See ADR-0005.
       */
      variant: 'entering'
      artwork: ArtworkType
      available: boolean
      boxRef: Ref<HTMLDivElement>
      scale: MotionValue<number>
      labelOpacity: MotionValue<number>
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
    const { boxRef, scale, frameOpacity, frameWidth, labelOpacity } = props
    return (
      <>
        <motion.div
          ref={boxRef}
          className={s.painting}
          style={{ width: 'min(88vw, calc(88svh * 16 / 9))', scale }}
        >
          <div className={s.paintingInner}>
            <Artwork artwork={artwork} available={available} />
          </div>
          <motion.div
            className={s.frame}
            style={{ opacity: frameOpacity, borderWidth: frameWidth }}
          />
        </motion.div>
        <motion.div className={s.label} style={{ opacity: labelOpacity, bottom: '6svh' }}>
          <LabelText artwork={artwork} />
        </motion.div>
      </>
    )
  }

  if (props.variant === 'entering') {
    const { boxRef, scale, labelOpacity } = props
    return (
      <>
        <motion.div ref={boxRef} className={s.enteringPainting} style={{ scale }}>
          <div className={s.paintingInner}>
            <Artwork artwork={artwork} available={available} />
          </div>
          <div className={s.frame} />
        </motion.div>
        <motion.div className={s.label} style={{ opacity: labelOpacity, bottom: '6svh' }}>
          <LabelText artwork={artwork} />
        </motion.div>
      </>
    )
  }

  return (
    <>
      <div className={s.hungFrame}>
        <Artwork artwork={artwork} available={available} />
      </div>
      <figcaption className={s.hungLabel}>
        <LabelText artwork={artwork} />
      </figcaption>
    </>
  )
}
