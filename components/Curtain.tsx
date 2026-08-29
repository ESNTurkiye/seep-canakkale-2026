'use client'

import { useEffect, useState } from 'react'
import s from './museum.module.css'

/**
 * The wall, before there is anything hanging on it (issue #26).
 *
 * The opening scene is the heaviest thing on the site and the first thing
 * asked for, so on a cold load it assembles in front of the visitor: the wall
 * paints, the gilt frame arrives, the artwork decodes, the display face
 * swaps in under the headline. Nothing there is broken — every piece is gated
 * so the site stands up without it — but the museum device (ADR-0005) is at
 * its most fragile in the first second, which is exactly when it is being
 * established.
 *
 * So the first paint is a lit, empty gallery wall: the same gradient the
 * opening scene's own wall uses, on the same ink. Nothing is announced and
 * nothing spins. When the scene behind it is composed the wall fades, and
 * because it is the *same* wall the only thing that visibly happens is that
 * the painting is now hanging on it. A curtain that is indistinguishable from
 * the set is the one that never looks like a curtain.
 *
 * What it waits for is the honest bar and no more: the two webfonts, the
 * opening still, and the frame asset — the three things whose late arrival is
 * visible as a change rather than as an appearance. Deliberately not the
 * scrubbed clip: it is 2.4 MB, and ADR-0008 already has the scene open on its
 * poster and take the motion when it lands. Holding the door shut for it
 * would be holding it shut for something the design does not need.
 */
export function Curtain({ stillSrc, frameSrc }: { stillSrc: string; frameSrc: string | null }) {
  const [lifting, setLifting] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    let cancelled = false

    const decode = (src: string) => {
      const image = new Image()
      image.src = src
      // A failure to decode is not a reason to hold the door: the site has a
      // placeholder for exactly that, and the visitor should meet it rather
      // than a wall that never lifts.
      return image.decode().catch(() => undefined)
    }

    const ready = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      decode(stillSrc),
      frameSrc ? decode(frameSrc) : Promise.resolve(),
    ])

    // A floor and a ceiling. Under the floor the curtain is a flash, which
    // reads as a fault rather than as an opening — a warm load has everything
    // in hand within a frame or two and would otherwise blink. Over the
    // ceiling it is a closed door: whatever has not arrived by then is not
    // going to arrive soon enough to be worth waiting behind, and every part
    // of the scene degrades on its own.
    const floor = new Promise((resolve) => setTimeout(resolve, 420))
    const ceiling = new Promise((resolve) => setTimeout(resolve, 2400))

    Promise.race([Promise.all([ready, floor]), ceiling]).then(() => {
      if (!cancelled) setLifting(true)
    })

    return () => {
      cancelled = true
    }
  }, [stillSrc, frameSrc])

  if (gone) return null

  return (
    <div
      className={`${s.curtain} ${lifting ? s.curtainLifting : ''}`}
      // Decorative in the strictest sense: it is a sheet of wall with nothing
      // on it, and it is gone by the time anyone could be told about it.
      aria-hidden="true"
      onTransitionEnd={() => setGone(true)}
      onAnimationEnd={() => setGone(true)}
    />
  )
}
