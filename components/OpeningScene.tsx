'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import type { Scene } from '@/content/scenes'
import { event } from '@/content/event'
import { openingChoreography, openingInkStart, inkCrossfadeOpacity } from '@/lib/choreography'
import { useResolvedReducedMotion } from '@/lib/useResolvedReducedMotion'
import { Painting } from './Painting'
import { InkCrossfade } from './InkCrossfade'
import s from './museum.module.css'

/**
 * The opening: the viewer starts on the small painting hanging on the wall,
 * and scrolling grows it into the full-bleed video hero. This establishes the
 * museum framing device — a painting on a wall — before the myth comes alive.
 * Every later scene is a painting already hanging on that same wall.
 */
export function OpeningScene({
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
   * How far the hung painting must be scaled up to fill the viewport. Measured
   * rather than assumed, because it differs wildly between a desktop 16:9 and a
   * phone held upright.
   */
  const [cover, setCover] = useState(1.6)
  const coverRef = useRef(cover)
  coverRef.current = cover

  useEffect(() => {
    const measure = () => {
      const el = boxRef.current
      if (!el || !el.offsetWidth || !el.offsetHeight) return
      // offsetWidth/Height are layout sizes, unaffected by the live transform.
      setCover(
        Math.max(window.innerWidth / el.offsetWidth, window.innerHeight / el.offsetHeight),
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

  // Computed once per frame here, then just field-read below — see the
  // per-frame cost note on EnteringScene.
  const state = useTransform(scrollYProgress, (p) =>
    openingChoreography(p, coverRef.current, !!reduced),
  )
  const scale = useTransform(state, (st) => st.scale)
  const wallOpacity = useTransform(state, (st) => st.wallOpacity)
  const frameOpacity = useTransform(state, (st) => st.frameOpacity)
  const frameWidth = useTransform(state, (st) => `${st.frameWidthPx}px`)
  const copyOpacity = useTransform(state, (st) => st.copyOpacity)
  const labelOpacity = useTransform(state, (st) => st.labelOpacity)
  // Drives the ink-crossfade overlay below — kept as its own transform off
  // scrollYProgress (not a field on `state`) since it isn't part of
  // OpeningState, see InkCrossfade.tsx.
  const inkOpacity = useTransform(scrollYProgress, (p) =>
    inkCrossfadeOpacity(p, openingInkStart, !!reduced),
  )
  // copyOpacity starts at 0 (see openingChoreography) — without this, the CTA
  // link inside stays keyboard-focusable while fully invisible at page load.
  // Also hidden once the ink crossfade has covered it, so the same link
  // can't be focused or clicked through the overlay at the end of the track.
  const copyVisibility = useTransform([copyOpacity, inkOpacity], ([co, io]: number[]) =>
    co > 0.02 && io < 0.98 ? 'visible' : 'hidden',
  )

  const artwork = scene.artworks[0]

  return (
    <section
      ref={trackRef}
      className={s.track}
      // EnteringScene's 320svh is a full approach-and-recede round trip, i.e.
      // ~160svh one-way; the opening only grows one-way but needs a bit more
      // for the copy fade-in to land after full bleed, plus a real hold at
      // peak (openingPeakProgress) before the ink crossfade (openingInkStart)
      // hands off to the next scene, hence 260svh. Estimate — remeasure by
      // scrolling once real content is in place.
      style={{ height: trackCollapsed ? '100svh' : '260svh' }}
      aria-label={scene.headline}
    >
      <div className={s.stage}>
        <motion.div className={s.wall} style={{ opacity: wallOpacity }} />

        <div className={s.canvasWrap}>
          <Painting
            variant="opening"
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

        <motion.div className={s.copy} style={{ opacity: copyOpacity, visibility: copyVisibility }}>
          <p className="eyebrow">{scene.eyebrow}</p>
          <div />
          <div className={s.copyBottom}>
            <h1 className={s.headline}>{scene.headline}</h1>
            <div className={s.side}>
              <p>{scene.body}</p>
              {event.applicationUrl ? (
                <a className={s.cta} href={event.applicationUrl}>
                  Apply as a delegate
                </a>
              ) : (
                <span className={s.ctaPending}>Applications open soon</span>
              )}
            </div>
          </div>
        </motion.div>

        <InkCrossfade progress={scrollYProgress} start={openingInkStart} reducedMotion={!!reduced} />
      </div>
    </section>
  )
}
