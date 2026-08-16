'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import type { Scene } from '@/content/scenes'
import { event } from '@/content/event'
import { openingChoreography } from '@/lib/choreography'
import { Painting } from './Painting'
import s from './museum.module.css'

/**
 * The opening: the viewer starts inside the painting and scrolls backwards out
 * of it until the frame, then the gallery wall, appear around it. This is the
 * device the whole site is built on — every later scene is a painting already
 * hanging on that wall.
 */
export function OpeningScene({ scene, available }: { scene: Scene; available: boolean }) {
  const trackRef = useRef<HTMLElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

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

  const scale = useTransform(
    scrollYProgress,
    (p) => openingChoreography(p, coverRef.current, !!reduced).scale,
  )
  const wallOpacity = useTransform(
    scrollYProgress,
    (p) => openingChoreography(p, coverRef.current, !!reduced).wallOpacity,
  )
  const frameOpacity = useTransform(
    scrollYProgress,
    (p) => openingChoreography(p, coverRef.current, !!reduced).frameOpacity,
  )
  const frameWidth = useTransform(
    scrollYProgress,
    (p) => `${openingChoreography(p, coverRef.current, !!reduced).frameWidthPx}px`,
  )
  const copyOpacity = useTransform(
    scrollYProgress,
    (p) => openingChoreography(p, coverRef.current, !!reduced).copyOpacity,
  )
  const labelOpacity = useTransform(
    scrollYProgress,
    (p) => openingChoreography(p, coverRef.current, !!reduced).labelOpacity,
  )

  const artwork = scene.artworks[0]

  return (
    <section
      ref={trackRef}
      className={s.track}
      style={{ height: reduced ? '100svh' : '340svh' }}
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
          />
        </div>

        <motion.div className={s.copy} style={{ opacity: copyOpacity }}>
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
      </div>
    </section>
  )
}
