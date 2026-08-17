/**
 * Pure scroll choreography: progress in, transform values out. No DOM, React,
 * or animation-library reference, so it can be tested without a browser — see
 * docs/adr/0005-scroll-choreography.md. The opening recedes; later scenes are
 * entered using the same ramp/smoothstep primitives.
 */

const smoothstep = (t: number) => t * t * (3 - 2 * t)

/** Linear ramp from a to b across [from, to], eased, clamped at both ends. */
function ramp(p: number, from: number, to: number, a: number, b: number) {
  if (p <= from) return a
  if (p >= to) return b
  return a + (b - a) * smoothstep((p - from) / (to - from))
}

const clamp01 = (p: number) => Math.min(1, Math.max(0, p))

export type OpeningState = {
  scale: number
  wallOpacity: number
  frameOpacity: number
  frameWidthPx: number
  copyOpacity: number
  labelOpacity: number
}

/** The reduced-motion resting state: painting hung, frame visible, no scaling. */
export const openingRest: OpeningState = {
  scale: 1,
  wallOpacity: 1,
  frameOpacity: 1,
  frameWidthPx: 18,
  copyOpacity: 1,
  labelOpacity: 0,
}

export type EnteringState = {
  scale: number
  labelOpacity: number
}

/** The reduced-motion resting state: painting hung at its unscaled size. */
export const enteringRest: EnteringState = {
  scale: 1,
  labelOpacity: 1,
}

/**
 * A later scene's transform values at a point in its own scroll track: the
 * hung painting grows as it is approached and recedes as it is passed. `peak`
 * is the measured scale it needs to fill the viewport at the midpoint.
 */
export function enteringChoreography(
  progress: number,
  peak: number,
  reducedMotion: boolean,
): EnteringState {
  if (reducedMotion) return enteringRest

  const p = clamp01(progress)

  return {
    scale: p < 0.5 ? ramp(p, 0, 0.5, 1, peak) : ramp(p, 0.5, 1, peak, 1),
    labelOpacity: p < 0.5 ? ramp(p, 0, 0.2, 1, 0) : ramp(p, 0.8, 1, 0, 1),
  }
}

export type LightMovementState = {
  opacity: number
  translateYPx: number
}

/** The reduced-motion resting state: settled in place, fully visible. */
export const lightMovementRest: LightMovementState = {
  opacity: 1,
  translateYPx: 0,
}

/**
 * The restrained treatment for a scene not marked cinematic (see
 * docs/adr/0005-scroll-choreography.md): a gentle fade and lift as the
 * painting comes into view, rather than a second full choreography.
 */
export function lightMovement(progress: number, reducedMotion: boolean): LightMovementState {
  if (reducedMotion) return lightMovementRest

  const p = clamp01(progress)

  return {
    opacity: ramp(p, 0, 1, 0, 1),
    translateYPx: ramp(p, 0, 1, 24, 0),
  }
}

/**
 * The opening scene's transform values at a point in the scroll. `cover` is
 * the measured scale the hung painting needs to fill the viewport at rest.
 */
export function openingChoreography(
  progress: number,
  cover: number,
  reducedMotion: boolean,
): OpeningState {
  if (reducedMotion) return openingRest

  const p = clamp01(progress)
  const start = cover * 1.06

  return {
    scale: p < 0.55 ? ramp(p, 0, 0.55, start, 1) : ramp(p, 0.55, 1, 1, 0.62),
    wallOpacity: ramp(p, 0.2, 0.7, 0, 1),
    frameOpacity: ramp(p, 0.3, 0.62, 0, 1),
    frameWidthPx: ramp(p, 0.3, 0.68, 0, 18),
    copyOpacity: ramp(p, 0.18, 0.44, 1, 0),
    labelOpacity: ramp(p, 0.74, 0.95, 0, 1),
  }
}
