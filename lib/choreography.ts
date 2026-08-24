/**
 * Pure scroll choreography: progress in, transform values out. No DOM, React,
 * or animation-library reference, so it can be tested without a browser — see
 * docs/adr/0005-scroll-choreography.md. The opening grows from a small hung
 * frame into full bleed; later scenes are entered using the same
 * ramp/smoothstep primitives.
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
  frameOpacity: number
  frameWidthPx: number
  copyOpacity: number
  labelOpacity: number
}

/**
 * The reduced-motion resting state: painting hung, frame visible, copy and
 * label all shown at once — see ADR-0005.
 */
export const enteringRest: EnteringState = {
  scale: 1,
  frameOpacity: 1,
  frameWidthPx: 18,
  copyOpacity: 1,
  labelOpacity: 1,
}

/**
 * A later scene's transform values at a point in its own scroll track: the
 * hung painting grows as it is approached and recedes as it is passed. `peak`
 * is the measured scale it needs to fill the viewport at the midpoint. The
 * frame/copy crossfade mirrors the opening's peak behaviour (#14, see
 * openingChoreography) on the way in, then plays back in reverse on the way
 * out: frame back in, copy back out — symmetric with the approach, since
 * (unlike the opening) this scene both approaches and recedes.
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
    frameOpacity: p < 0.5 ? ramp(p, 0.14, 0.26, 1, 0) : ramp(p, 0.74, 0.86, 0, 1),
    frameWidthPx: p < 0.5 ? ramp(p, 0.12, 0.26, 18, 0) : ramp(p, 0.74, 0.88, 0, 18),
    copyOpacity: p < 0.5 ? ramp(p, 0.21, 0.325, 0, 1) : ramp(p, 0.675, 0.79, 1, 0),
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
 * Progress at which the opening's scale ramp reaches its full-bleed peak.
 * Scale holds at peak from here to the end of the track, giving the
 * ink-crossfade transition (see `inkCrossfadeOpacity`) room to hold on a
 * settled full-bleed frame before fading, rather than fading while still
 * growing. `openingInkStart` must be >= this — asserted in
 * choreography.test.ts — or the crossfade starts before the growth finishes.
 */
export const openingPeakProgress = 0.8

/** Progress at which OpeningScene starts its ink-crossfade fade to the next scene. */
export const openingInkStart = 0.88

/**
 * The opening scene's transform values at a point in the scroll: a single
 * monotonic ramp from the small hung painting up to full bleed, the museum
 * framing device established before the myth comes alive — see
 * docs/adr/0005-scroll-choreography.md. `cover` is the measured scale the hung
 * painting needs to fill the viewport at rest; `peak` overshoots it slightly
 * so full bleed reads as a bleed rather than a flush fit. Scale reaches peak
 * at `openingPeakProgress`, well before the track ends, so there is a real
 * hold on the full-bleed frame before the scene hands off to the next one via
 * the ink-crossfade transition (starting at `openingInkStart`) rather than
 * resting.
 */
export function openingChoreography(
  progress: number,
  cover: number,
  reducedMotion: boolean,
): OpeningState {
  if (reducedMotion) return openingRest

  const p = clamp01(progress)
  const peak = cover * 1.06

  return {
    scale: ramp(p, 0, openingPeakProgress, 1, peak),
    wallOpacity: ramp(p, 0.22, 0.6, 1, 0),
    frameOpacity: ramp(p, 0.28, 0.52, 1, 0),
    frameWidthPx: ramp(p, 0.24, 0.52, 18, 0),
    copyOpacity: ramp(p, 0.42, 0.65, 0, 1),
    labelOpacity: ramp(p, 0.04, 0.2, 1, 0),
  }
}

/**
 * Opacity of the ink crossfade that carries the viewer from a scene at rest
 * on its full-bleed peak to the next scene — see
 * docs/adr/0005-scroll-choreography.md and issue #15. A generic ramp from 0
 * to 1 across `[start, 1]` of whatever scroll progress the calling scene
 * already tracks, so any scene's own track can drive it once that scene can
 * reach and hold a peak — not tied to OpeningState/EnteringState. Collapses
 * to permanently transparent under reduced motion: sections are already
 * stacked with no scroll-driven animation in that mode, which is already a
 * hard cut with no fade to add.
 */
export function inkCrossfadeOpacity(progress: number, start: number, reducedMotion: boolean): number {
  if (reducedMotion) return 0
  return ramp(clamp01(progress), start, 1, 0, 1)
}
