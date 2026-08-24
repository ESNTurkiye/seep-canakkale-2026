'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import type { Scene } from '@/content/scenes'
import { event } from '@/content/event'
import { enteringChoreography, enteringInkStart, inkCrossfadeOpacity } from '@/lib/choreography'
import { useResolvedReducedMotion } from '@/lib/useResolvedReducedMotion'
import { Painting } from './Painting'
import { InkCrossfade } from './InkCrossfade'
import s from './museum.module.css'

/**
 * A later cinematic scene: already hung on the wall, it grows to fill the
 * viewport as the viewer approaches. Same device as OpeningScene, built from
 * the same primitives — see ADR-0005. Which scenes get this treatment is a
 * `content/scenes.ts` decision, not a mechanism one.
 *
 * By default (`scene.recede` unset or `true`) it recedes back to its hung
 * size as the viewer passes — a gallery walk-past. When `scene.recede` is
 * `false` it instead holds at peak and hands off to the next scene via the
 * ink-crossfade transition (#15), the opening's shape (#14) rather than a
 * walk-past — see issue #17.
 */
export function EnteringScene({
  scene,
  availability,
  videoAvailable,
}: {
  scene: Scene
  availability: Record<string, boolean>
  videoAvailable: boolean
}) {
  const trackRef = useRef<HTMLElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const trackCollapsed = useResolvedReducedMotion()
  const recede = scene.recede ?? true

  /**
   * How far the hung painting must be scaled up to fill the viewport at the
   * midpoint of the approach. Measured rather than assumed — see OpeningScene.
   *
   * `below` accounts for Painting's 'entering' variant grouping the painting
   * with its label beneath it (`.enteringGroup`, centred as one unit by
   * `.canvasWrap`) — the painting's own centre sits `below / 2` above the
   * viewport centre, so covering the viewport means covering that much more
   * on the bottom edge too.
   *
   * Receding scenes stay capped: on a tall narrow phone the resting box is
   * short relative to the viewport height, and covering both edges uncapped
   * would zoom the 16:9 artwork to a sliver rather than a painting filling
   * the view — acceptable there since the painting recedes again straight
   * away. A non-receding scene (issue #17) instead holds at peak and hands
   * off via the ink crossfade, so it must actually reach full bleed the way
   * OpeningScene's uncapped, overshooting `cover * 1.06` does — capping it
   * would leave a permanent, held band of gallery wall (mitigated by the
   * wallOpacity fade below, but the painting itself should still cover what
   * it can).
   */
  const [peak, setPeak] = useState(1.9)

  useEffect(() => {
    const measure = () => {
      const el = boxRef.current
      if (!el || !el.offsetWidth || !el.offsetHeight) return
      const below = el.parentElement ? el.parentElement.offsetHeight - el.offsetHeight : 0
      const widthCover = window.innerWidth / el.offsetWidth
      const heightCover = (window.innerHeight + below) / el.offsetHeight
      const needed = Math.max(widthCover, heightCover)
      setPeak(recede ? Math.min(4.5, needed) : needed * 1.06)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [recede])

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  })

  // Computed once per frame, then just field-read below, so adding more
  // cinematic scenes doesn't multiply the per-property cost the opening pays.
  // `peak` is read directly (not via a ref): this transformer function is
  // recreated on every render, so useTransform always sees the latest value.
  const state = useTransform(scrollYProgress, (p) =>
    enteringChoreography(p, peak, !!reduced, recede),
  )
  const scale = useTransform(state, (st) => st.scale)
  // Constant 1 on the receding path (see enteringChoreography); fades out
  // once recede is false, so whatever the painting doesn't cover at peak
  // reads as --ink like the crossfade it hands off to, not gallery wall.
  const wallOpacity = useTransform(state, (st) => st.wallOpacity)
  const frameOpacity = useTransform(state, (st) => st.frameOpacity)
  const frameWidth = useTransform(state, (st) => `${st.frameWidthPx}px`)
  const copyOpacity = useTransform(state, (st) => st.copyOpacity)
  const labelOpacity = useTransform(state, (st) => st.labelOpacity)
  // Drives the ink-crossfade overlay when `recede` is false — kept as its own
  // transform off scrollYProgress, same reasoning as OpeningScene's
  // inkOpacity. Computed unconditionally (cheap, and keeps hook order
  // stable): a receding scene never renders <InkCrossfade>, and its own
  // copyOpacity already reaches 0 well before enteringInkStart, so folding
  // inkOpacity into copyVisibility below is a no-op for it.
  const inkOpacity = useTransform(scrollYProgress, (p) =>
    inkCrossfadeOpacity(p, enteringInkStart, !!reduced),
  )
  // copyOpacity sits near 0 at both ends of the track (see enteringChoreography)
  // — without this, the closing scene's CTA link stays keyboard-focusable
  // while invisible, same fix as OpeningScene's copyVisibility. Also hidden
  // once the ink crossfade has covered it, so a non-receding scene's copy
  // can't be focused or clicked through the overlay at the end of the track.
  const copyVisibility = useTransform([copyOpacity, inkOpacity], ([co, io]: number[]) =>
    co > 0.02 && io < 0.98 ? 'visible' : 'hidden',
  )

  const artwork = scene.artworks[0]
  const available = availability[artwork.src] ?? false

  return (
    <section
      ref={trackRef}
      className={s.track}
      // A full approach-and-recede round trip costs ~320svh (see ADR-0005).
      // A non-receding scene only makes the approach, so it borrows the
      // opening's one-way estimate instead (260svh: roughly half that round
      // trip plus a tail for the copy to fade in and hold before the ink
      // crossfade) — an estimate to be remeasured against real content, same
      // caveat as OpeningScene's track height.
      style={{ height: trackCollapsed ? '100svh' : recede ? '320svh' : '260svh' }}
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

        <motion.div className={s.copy} style={{ opacity: copyOpacity, visibility: copyVisibility }}>
          <p className="eyebrow">{scene.eyebrow}</p>
          <div />
          <div className={s.copyBottom}>
            <h2 className={s.galleryHeadline}>{scene.headline}</h2>
            <div className={s.side}>
              <p>{scene.body}</p>
              {scene.kind === 'closing' &&
                (event.applicationUrl ? (
                  <a className={s.cta} href={event.applicationUrl}>
                    Apply as a delegate
                  </a>
                ) : (
                  <span className={s.ctaPending}>Applications open soon</span>
                ))}
            </div>
          </div>
        </motion.div>

        {!recede && (
          <InkCrossfade progress={scrollYProgress} start={enteringInkStart} reducedMotion={!!reduced} />
        )}
      </div>
    </section>
  )
}
