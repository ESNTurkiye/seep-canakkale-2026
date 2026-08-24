'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import type { Scene } from '@/content/scenes'
import { event } from '@/content/event'
import { enteringChoreography } from '@/lib/choreography'
import { useResolvedReducedMotion } from '@/lib/useResolvedReducedMotion'
import { Painting } from './Painting'
import s from './museum.module.css'

/**
 * A later cinematic scene: already hung on the wall, it grows to fill the
 * viewport as the viewer approaches and recedes as they pass. Same device as
 * OpeningScene, built from the same primitives — see ADR-0005. Which scenes
 * get this treatment is a `content/scenes.ts` decision, not a mechanism one.
 */
export function EnteringScene({
  scene,
  availability,
}: {
  scene: Scene
  availability: Record<string, boolean>
}) {
  const trackRef = useRef<HTMLElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const trackCollapsed = useResolvedReducedMotion()

  /**
   * How far the hung painting must be scaled up to fill the viewport at the
   * midpoint of the approach. Measured rather than assumed — see OpeningScene.
   * Capped: on a tall narrow phone the resting box is short relative to the
   * viewport height, and covering both edges uncapped would zoom the 16:9
   * artwork to a sliver rather than a painting filling the view.
   */
  const [peak, setPeak] = useState(1.9)

  useEffect(() => {
    const measure = () => {
      const el = boxRef.current
      if (!el || !el.offsetWidth || !el.offsetHeight) return
      setPeak(
        Math.min(
          4.5,
          Math.max(window.innerWidth / el.offsetWidth, window.innerHeight / el.offsetHeight),
        ),
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

  // Computed once per frame, then just field-read below, so adding more
  // cinematic scenes doesn't multiply the per-property cost the opening pays.
  // `peak` is read directly (not via a ref): this transformer function is
  // recreated on every render, so useTransform always sees the latest value.
  const state = useTransform(scrollYProgress, (p) => enteringChoreography(p, peak, !!reduced))
  const scale = useTransform(state, (st) => st.scale)
  const frameOpacity = useTransform(state, (st) => st.frameOpacity)
  const frameWidth = useTransform(state, (st) => `${st.frameWidthPx}px`)
  const copyOpacity = useTransform(state, (st) => st.copyOpacity)
  const labelOpacity = useTransform(state, (st) => st.labelOpacity)
  // copyOpacity sits near 0 at both ends of the track (see enteringChoreography)
  // — without this, the closing scene's CTA link stays keyboard-focusable
  // while invisible, same fix as OpeningScene's copyVisibility.
  const copyVisibility = useTransform(copyOpacity, (co) => (co > 0.02 ? 'visible' : 'hidden'))

  const artwork = scene.artworks[0]
  const available = availability[artwork.src] ?? false

  return (
    <section
      ref={trackRef}
      className={s.track}
      style={{ height: trackCollapsed ? '100svh' : '320svh' }}
      aria-label={scene.headline}
    >
      <div className={s.stage}>
        <div className={s.wall} />

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
      </div>
    </section>
  )
}
