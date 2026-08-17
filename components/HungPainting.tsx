'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import type { Artwork as ArtworkType } from '@/content/scenes'
import { lightMovement } from '@/lib/choreography'
import { Painting } from './Painting'
import s from './museum.module.css'

/**
 * A painting not marked cinematic (see ADR-0005 and `content/scenes.ts`):
 * hangs in the normal document flow and only fades and lifts gently into
 * place as the viewer scrolls it into view — restrained on purpose, so it
 * never competes with the fully choreographed scenes.
 */
export function HungPainting({
  artwork,
  available,
}: {
  artwork: ArtworkType
  available: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  // Static export (ADR-0003): the site must stand on its own before any
  // script runs. Rendering the scroll-linked style only once mounted keeps
  // the painting at its natural, fully visible opacity until JS is confirmed
  // running, rather than shipping it invisible in the static HTML.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 0.7'],
  })

  const state = useTransform(scrollYProgress, (p) => lightMovement(p, !!reduced))
  const opacity = useTransform(state, (st) => st.opacity)
  const y = useTransform(state, (st) => st.translateYPx)

  return (
    <motion.figure
      ref={ref}
      className={s.hung}
      style={mounted ? { opacity, y } : undefined}
    >
      <Painting variant="hung" artwork={artwork} available={available} />
    </motion.figure>
  )
}
