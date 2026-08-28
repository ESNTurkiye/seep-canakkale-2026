'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import type { Scene } from '@/content/scenes'
import { event } from '@/content/event'
import { approachPeak, openingChoreography, openingInkStart, inkCrossfadeOpacity, handoffLift } from '@/lib/choreography'
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
   * How far the hung painting must be scaled up to fill the viewport.
   * Measured rather than assumed, because it differs wildly between a desktop
   * 16:9 and a phone held upright — and on the phone `approachPeak` fits the
   * painting whole across the width rather than covering the screen with a
   * strip of it. The opening's label is positioned against the viewport
   * rather than grouped under the painting (see Painting's 'opening'
   * variant), so there is nothing centred below the box to allow for.
   */
  const [peak, setPeak] = useState(1.6)
  const peakRef = useRef(peak)
  peakRef.current = peak

  useEffect(() => {
    const measure = () => {
      const el = boxRef.current
      if (!el || !el.offsetWidth || !el.offsetHeight) return
      // offsetWidth/Height are layout sizes, unaffected by the live transform.
      setPeak(
        approachPeak({
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          boxWidth: el.offsetWidth,
          boxHeight: el.offsetHeight,
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

  // Computed once per frame here, then just field-read below — see the
  // per-frame cost note on EnteringScene.
  const state = useTransform(scrollYProgress, (p) =>
    openingChoreography(p, peakRef.current, !!reduced),
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
  // The second beat of the handoff: once the ink is solid, the whole stage
  // fades out to uncover the next wall, which the negative margin below has
  // already parked exactly behind it. See handoffLift.
  const stageOpacity = useTransform(scrollYProgress, (p) => handoffLift(p, !!reduced))
  // An opacity-0 stage still swallows clicks and text selection from the wall
  // it has just uncovered.
  const stagePointerEvents = useTransform(stageOpacity, (o: number) => (o < 0.02 ? 'none' : 'auto'))
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
      // Remeasured against real content, as the earlier 260svh estimate asked
      // to be. A sticky 100svh stage means the track's scrollable range is
      // `height - 100svh`, so 220svh buys 120svh of choreography: growth to
      // openingPeakProgress, a hold at full bleed, the ink crossfade from
      // openingInkStart, and the stage's lift from handoffLiftStart.
      //
      // The negative margin is what makes the last of those land on the next
      // scene instead of above it. It pulls the following section up by the
      // stage's own height, so the stage's final resting slot and the next
      // wall occupy the same 100svh of document: the stage (positioned, so it
      // paints over the section) hides that wall until it lifts, and when it
      // does the wall is already composed and centred rather than a screen's
      // scroll below. Reduced motion collapses the track and drops the
      // overlap — scenes simply stack there.
      style={{
        height: trackCollapsed ? '100svh' : '220svh',
        marginBottom: trackCollapsed ? undefined : '-100svh',
      }}
      aria-label={scene.headline}
    >
      <motion.div
        className={s.stage}
        style={{ opacity: stageOpacity, pointerEvents: stagePointerEvents }}
      >
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
        </motion.div>

        <InkCrossfade progress={scrollYProgress} start={openingInkStart} reducedMotion={!!reduced} />
      </motion.div>
    </section>
  )
}
