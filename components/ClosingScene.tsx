'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import type { Scene } from '@/content/scenes'
import { event } from '@/content/event'
import { approachPeak, closingChoreography } from '@/lib/choreography'
import { useResolvedReducedMotion } from '@/lib/useResolvedReducedMotion'
import { Painting } from './Painting'
import s from './museum.module.css'

/**
 * The closing scene (issue #18): a deliberate exception to `EnteringScene`,
 * not a flag on it. It arrives already at full bleed, with no approach of
 * its own — the committee scene before it is not cinematic and has no peak
 * to hand off from — and only recedes, down to the same hung, resting size
 * every other scene settles at, where it then just holds. No
 * recede-then-transition to the next scene: no ink crossfade, no further
 * movement. The Footer follows underneath in ordinary document flow once the
 * track ends. The copy (headline/body/CTA) is shown throughout rather than
 * gated behind reaching a peak — this scene has no "approach" phase to hide
 * it during. See docs/adr/0005-scroll-choreography.md.
 */
export function ClosingScene({
  scene,
  available,
  videoAvailable,
}: {
  scene: Scene
  available: boolean
  videoAvailable: boolean
}) {
  const trackRef = useRef<HTMLElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const trackCollapsed = useResolvedReducedMotion()

  /**
   * How far the painting must be scaled to fill the viewport at the very
   * start of the track. Uncapped and overshooting slightly (`* 1.06`) — the
   * same measurement `EnteringScene`'s `recede: false` path uses, and for
   * the same reason: this scene must actually reach full bleed, not leave a
   * permanent held band of gallery wall. See that component's `peak` comment.
   */
  const [peak, setPeak] = useState(1.9)

  useEffect(() => {
    const measure = () => {
      const el = boxRef.current
      if (!el || !el.offsetWidth || !el.offsetHeight) return
      const below = el.parentElement ? el.parentElement.offsetHeight - el.offsetHeight : 0
      setPeak(
        approachPeak({
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          boxWidth: el.offsetWidth,
          boxHeight: el.offsetHeight,
          below,
          overshoot: 1.06,
        }),
      )
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  })

  // Computed once per frame, then just field-read below — see the per-frame
  // cost note on EnteringScene.
  const state = useTransform(scrollYProgress, (p) => closingChoreography(p, peak, !!reduced))
  const scale = useTransform(state, (st) => st.scale)
  const wallOpacity = useTransform(state, (st) => st.wallOpacity)
  const frameOpacity = useTransform(state, (st) => st.frameOpacity)
  const frameWidth = useTransform(state, (st) => `${st.frameWidthPx}px`)
  const labelOpacity = useTransform(state, (st) => st.labelOpacity)

  const artwork = scene.artworks[0]

  return (
    <section
      ref={trackRef}
      className={s.track}
      // 220svh: at closingRestProgress (0.7) the recede itself covers ~154svh,
      // in line with every other one-way motion on the site (see that
      // constant's comment), leaving ~66svh to hold on the finished resting
      // state before the track ends and the Footer follows in ordinary
      // document flow. Estimate — remeasure against real content, same
      // caveat as OpeningScene's track height.
      style={{ height: trackCollapsed ? '100svh' : '220svh' }}
      aria-label={scene.headline}
    >
      <div className={s.stage}>
        <motion.div className={s.wall} style={{ opacity: wallOpacity }} />

        <div className={s.canvasWrap}>
          <Painting
            variant="entering"
            artwork={artwork}
            available={available}
            boxRef={boxRef}
            scale={scale}
            frameOpacity={frameOpacity}
            frameWidth={frameWidth}
            labelOpacity={labelOpacity}
            videoAvailable={videoAvailable}
            reducedMotion={trackCollapsed}
          />
        </div>

        <div className={s.copy}>
          <p className="eyebrow">{scene.eyebrow}</p>
          <div />
          <div className={s.copyBottom}>
            <h2 className={s.galleryHeadline}>{scene.headline}</h2>
            <div className={s.side}>
              <p>{scene.body}</p>
              {event.applicationUrl ? (
                <a
                  className={s.cta}
                  href={event.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply as a delegate
                </a>
              ) : (
                <span className={s.ctaPending}>Applications open soon</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
