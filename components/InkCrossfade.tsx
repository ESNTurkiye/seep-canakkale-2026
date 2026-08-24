'use client'

import type { MotionValue } from 'motion/react'
import { motion, useTransform } from 'motion/react'
import { inkCrossfadeOpacity } from '@/lib/choreography'
import s from './museum.module.css'

/**
 * The reusable transition that carries the viewer from a scene at rest on
 * its full-bleed peak to the next scene — a brief fade through the gallery
 * wall colour rather than an abrupt cut. See
 * docs/adr/0005-scroll-choreography.md and issue #15.
 *
 * Driven by the calling scene's own `scrollYProgress` (it is the last child
 * of that scene's `.stage`, so it paints above everything else in the
 * scene), not a track of its own — any scene that can reach and hold a peak
 * can adopt this once it does. Always rendered, never conditionally mounted,
 * so hydration never has to reconcile its presence; `reducedMotion` collapses
 * it to permanently transparent instead — reduced motion already stacks
 * scenes with no scroll-driven animation, which is already a hard cut.
 */
export function InkCrossfade({
  progress,
  start,
  reducedMotion,
}: {
  progress: MotionValue<number>
  start: number
  reducedMotion: boolean
}) {
  const opacity = useTransform(progress, (p) => inkCrossfadeOpacity(p, start, reducedMotion))

  return <motion.div className={s.inkCrossfade} style={{ opacity }} aria-hidden="true" />
}
