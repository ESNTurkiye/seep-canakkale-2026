'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import type { Scene } from '@/content/scenes'
import { event } from '@/content/event'
import { Artwork } from './Artwork'
import s from './museum.module.css'

const smoothstep = (t: number) => t * t * (3 - 2 * t)

/** Linear ramp from a to b across [from, to], eased, clamped at both ends. */
function ramp(p: number, from: number, to: number, a: number, b: number) {
  if (p <= from) return a
  if (p >= to) return b
  return a + (b - a) * smoothstep((p - from) / (to - from))
}

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

  const scale = useTransform(scrollYProgress, (p) => {
    const start = coverRef.current * 1.06
    return p < 0.55 ? ramp(p, 0, 0.55, start, 1) : ramp(p, 0.55, 1, 1, 0.62)
  })
  const wallOpacity = useTransform(scrollYProgress, (p) => ramp(p, 0.2, 0.7, 0, 1))
  const frameOpacity = useTransform(scrollYProgress, (p) => ramp(p, 0.3, 0.62, 0, 1))
  const frameWidth = useTransform(scrollYProgress, (p) => `${ramp(p, 0.3, 0.68, 0, 18)}px`)
  const copyOpacity = useTransform(scrollYProgress, (p) => ramp(p, 0.18, 0.44, 1, 0))
  const labelOpacity = useTransform(scrollYProgress, (p) => ramp(p, 0.74, 0.95, 0, 1))

  const artwork = scene.artworks[0]

  return (
    <section
      ref={trackRef}
      className={s.track}
      style={{ height: reduced ? '100svh' : '340svh' }}
      aria-label={scene.headline}
    >
      <div className={s.stage}>
        <motion.div className={s.wall} style={{ opacity: reduced ? 1 : wallOpacity }} />

        <div className={s.canvasWrap}>
          <motion.div
            ref={boxRef}
            className={s.painting}
            style={{
              width: 'min(88vw, calc(88svh * 16 / 9))',
              scale: reduced ? 1 : scale,
            }}
          >
            <div className={s.paintingInner}>
              <Artwork artwork={artwork} available={available} />
            </div>
            <motion.div
              className={s.frame}
              style={{
                opacity: reduced ? 1 : frameOpacity,
                borderWidth: reduced ? '18px' : frameWidth,
              }}
            />
          </motion.div>
        </div>

        <motion.div className={s.copy} style={{ opacity: reduced ? 1 : copyOpacity }}>
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

        <motion.div
          className={s.label}
          style={{ opacity: reduced ? 0 : labelOpacity, bottom: '6svh' }}
        >
          <p className={s.labelTitle}>{artwork.title}</p>
          <p className={s.labelMyth}>{artwork.myth}</p>
        </motion.div>
      </div>
    </section>
  )
}
