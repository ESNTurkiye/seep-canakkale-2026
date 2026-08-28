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

/**
 * Progress at which a single-approach scene's scale ramp reaches its
 * full-bleed peak. Scale holds at peak from here to the end of the track,
 * giving the ink-crossfade transition (see `inkCrossfadeOpacity`) room to
 * hold on a settled full-bleed frame before fading, rather than fading while
 * still growing. `peakToInkStart` must be >= this — asserted in
 * choreography.test.ts — or the crossfade starts before the growth finishes.
 * Shared by `openingChoreography` and `enteringChoreography`'s `recede:
 * false` path (issue #17) — both are the same shape, so one constant keeps
 * them from silently drifting apart.
 */
const peakProgress = 0.8

/** Progress at which a single-approach scene starts its ink-crossfade fade to the next scene. */
const inkStart = 0.88

/**
 * The shared frame/copy/label crossfade timing for a single approach to
 * peak, used by both `openingChoreography` and `enteringChoreography`'s
 * `recede: false` path (issue #17) — grow once, hold at peak, hand off via
 * the ink crossfade. One function so retuning one doesn't silently desync
 * the other.
 */
/**
 * The frame's resting thickness, in CSS pixels.
 *
 * It is a visual constant, not a free parameter. The gilt frame is a 9-slice
 * asset (issue #12) whose corners carry acanthus carving, and border-image
 * squeezes each corner into exactly this many pixels. At 18 the carving
 * collapsed into a dark smudge while the straight edges still read fine —
 * the corners have to be given room or the asset is worse than the gradient
 * it replaced. Raising this is what buys that room; the ramps below animate
 * to and from it, and the tests assert against it rather than a literal.
 */
export const FRAME_WIDTH_PX = 34

function approachCrossfade(p: number) {
  return {
    frameOpacity: ramp(p, 0.28, 0.52, 1, 0),
    frameWidthPx: ramp(p, 0.24, 0.52, FRAME_WIDTH_PX, 0),
    copyOpacity: ramp(p, 0.42, 0.65, 0, 1),
    labelOpacity: ramp(p, 0.04, 0.2, 1, 0),
  }
}

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
  frameWidthPx: FRAME_WIDTH_PX,
  copyOpacity: 1,
  labelOpacity: 0,
}

/** Progress at which the opening's scale ramp reaches its full-bleed peak — see `peakProgress`. */
export const openingPeakProgress = peakProgress

/** Progress at which OpeningScene starts its ink-crossfade fade to the next scene. */
export const openingInkStart = inkStart

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
    ...approachCrossfade(p),
  }
}

export type EnteringState = {
  scale: number
  wallOpacity: number
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
  wallOpacity: 1,
  frameOpacity: 1,
  frameWidthPx: FRAME_WIDTH_PX,
  copyOpacity: 1,
  labelOpacity: 1,
}

/**
 * Progress at which a non-receding entering scene's growth reaches its peak
 * scale and holds — the `recede: false` counterpart to `openingPeakProgress`,
 * pinned to the same value since the two are the same shape (issue #17).
 * Only meaningful when `recede` is false; see `enteringChoreography`.
 */
export const enteringPeakProgress = peakProgress

/**
 * Progress at which a non-receding entering scene starts its ink-crossfade
 * fade to the next scene — the `recede: false` counterpart to
 * `openingInkStart`, pinned to the same value for the same reason. Must be
 * >= `enteringPeakProgress` — asserted in choreography.test.ts.
 */
export const enteringInkStart = inkStart

/**
 * A later scene's transform values at a point in its own scroll track. `peak`
 * is the measured scale it needs to fill the viewport at the midpoint of the
 * approach (or, when `recede` is false, at `enteringPeakProgress` — see
 * EnteringScene's measurement, which overshoots slightly like the opening's
 * `cover * 1.06` once there is no recede to make a slight overshoot forgiving
 * on its own). The frame/copy crossfade mirrors the opening's peak behaviour
 * (#14, see openingChoreography).
 *
 * `recede` (default true) is the standard shape: approach, then play the same
 * crossfade back in reverse as the scene is passed — frame back in, copy back
 * out, symmetric with the approach. `wallOpacity` stays at 1 throughout: nothing
 * needs to fully bleed on a walk-past, so the gallery wall never needs to fade.
 *
 * Set `recede` to false for a scene that instead reaches peak and holds
 * there, handing off to the next scene via the ink-crossfade transition
 * without receding first — the opening's shape (#14) rather than a gallery
 * walk-past (issue #17). That path reuses `approachCrossfade` — the same
 * timing `openingChoreography` uses — stretched across the full track
 * instead of just its first half, holds at `enteringPeakProgress` the way
 * `openingChoreography` holds at `openingPeakProgress`, and fades
 * `wallOpacity` out the same way `openingChoreography` does: once the
 * painting is meant to fully bleed, whatever it doesn't cover must read as
 * the same `--ink` the crossfade lands on, not gallery wall.
 */
export function enteringChoreography(
  progress: number,
  peak: number,
  reducedMotion: boolean,
  recede: boolean = true,
): EnteringState {
  if (reducedMotion) return enteringRest

  const p = clamp01(progress)

  if (!recede) {
    return {
      scale: ramp(p, 0, enteringPeakProgress, 1, peak),
      wallOpacity: ramp(p, 0.22, 0.6, 1, 0),
      ...approachCrossfade(p),
    }
  }

  return {
    scale: p < 0.5 ? ramp(p, 0, 0.5, 1, peak) : ramp(p, 0.5, 1, peak, 1),
    wallOpacity: 1,
    frameOpacity: p < 0.5 ? ramp(p, 0.14, 0.26, 1, 0) : ramp(p, 0.74, 0.86, 0, 1),
    frameWidthPx: p < 0.5 ? ramp(p, 0.12, 0.26, FRAME_WIDTH_PX, 0) : ramp(p, 0.74, 0.88, 0, FRAME_WIDTH_PX),
    copyOpacity: p < 0.5 ? ramp(p, 0.21, 0.325, 0, 1) : ramp(p, 0.675, 0.79, 1, 0),
    labelOpacity: p < 0.5 ? ramp(p, 0, 0.2, 1, 0) : ramp(p, 0.8, 1, 0, 1),
  }
}

export type ClosingState = {
  scale: number
  wallOpacity: number
  frameOpacity: number
  frameWidthPx: number
  labelOpacity: number
}

/**
 * The reduced-motion resting state — the same hung-and-framed contract as
 * `enteringRest`, minus `copyOpacity`: the closing scene's copy is never
 * gated behind scroll progress in the first place (issue #18), so there is
 * no field for it here.
 */
export const closingRest: ClosingState = {
  scale: 1,
  wallOpacity: 1,
  frameOpacity: 1,
  frameWidthPx: FRAME_WIDTH_PX,
  labelOpacity: 1,
}

/**
 * Progress at which the closing scene's recede from full bleed reaches its
 * resting, hung scale and holds. The rest of the track is a plain hold on
 * that finished resting scene — there is no ink crossfade to reach, since
 * this is the last scene and it does not transition anywhere; the Footer
 * simply follows underneath in ordinary document flow once the track ends.
 * Pinned high (rather than a fast recede with a long hold) so the recede
 * itself covers roughly the same scroll distance as every other one-way
 * motion on the site — compare `enteringChoreography`'s recede leg
 * (`0.5` to `1` of a 320svh track, i.e. 160svh) and the opening's growth
 * (`openingPeakProgress` of a 260svh track, i.e. 208svh) against this
 * progress times `ClosingScene`'s own track height.
 */
export const closingRestProgress = 0.7

/**
 * The closing scene's transform values at a point in its own scroll track
 * (issue #18). Every other cinematic scene is *entered* — hung small, grown
 * on approach — but the closing scene arrives already alive, at full bleed,
 * with no approach of its own: it hands off from the previous (non-cinematic)
 * committee scene already at rest, so there is nothing to grow from. It only
 * recedes, down to the same hung, resting size every scene settles at. This
 * is the mirror image of the *pre-reversal* opening (see
 * docs/adr/0005-scroll-choreography.md and the pre-#14 history of
 * `openingChoreography`): full bleed first, hung frame after, rather than
 * the other way around. `peak` is the measured scale the painting needs to
 * fill the viewport at the very start of the track — uncapped and
 * overshooting slightly, the same measurement `enteringChoreography`'s
 * `recede: false` path uses, so the scene actually reaches full bleed
 * instead of leaving a permanent band of gallery wall.
 *
 * There is deliberately no `copyOpacity` field: the headline, body and CTA
 * are not gated behind reaching a peak the way #16 specifies for other
 * cinematic scenes — this scene has no "approach" phase to hide them during,
 * so the caller renders them at a constant opacity instead of reading one
 * off this state.
 *
 * The four remaining ramps are an exact rescale of `enteringChoreography`'s
 * recede leg onto `[0, closingRestProgress]` (frame 0.475–0.725 of the leg,
 * frameWidth 0.475–0.75, label 0.6–1) and `openingChoreography`'s
 * `wallOpacity` ramp (0.275–0.75 of its own peak progress) — the same
 * ordering and overlap, just stretched to this scene's own rest point
 * instead of `enteringPeakProgress`/`openingPeakProgress`.
 */
export function closingChoreography(
  progress: number,
  peak: number,
  reducedMotion: boolean,
): ClosingState {
  if (reducedMotion) return closingRest

  const p = clamp01(progress)

  return {
    scale: ramp(p, 0, closingRestProgress, peak, 1),
    wallOpacity: ramp(p, 0.19, 0.53, 0, 1),
    frameOpacity: ramp(p, 0.33, 0.51, 0, 1),
    frameWidthPx: ramp(p, 0.33, 0.53, 0, FRAME_WIDTH_PX),
    labelOpacity: ramp(p, 0.42, 0.7, 0, 1),
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

/**
 * Progress (within the reveal's own track — see `realPhotoReveal`) at which
 * a hung painting's real-photo layer starts covering it.
 */
const realPhotoRevealStart = 0.6

/**
 * Opacity of the real-photograph layer that covers a hung, non-cinematic
 * painting as the viewer scrolls past it — the "myth becomes reality" payoff
 * (issue #19). `progress` is the painting's own *pass-by* track: how far the
 * viewer has scrolled past it once it has settled into view, not the
 * entrance track `lightMovement` uses to fade it in. Reusing that entrance
 * track would ramp the reveal in while the painting is still arriving rather
 * than once the viewer has genuinely scrolled past it, so `HungPainting.tsx`
 * measures this on a second, independent scroll track. Ramps in only over
 * the later portion of that track — the painting doesn't need its own
 * opacity animation; the photo simply covers it as it fades in. A pure
 * function of scroll position, like every other scroll-linked effect on the
 * site, so scrolling back up returns the real photo to the painting with no
 * separate "have I seen this" state. Under reduced motion the resting state
 * is the painting, not the real photo — the same "hung, static" contract
 * every other reduced-motion resting state on the site holds to.
 */
export function realPhotoReveal(progress: number, reducedMotion: boolean): number {
  if (reducedMotion) return 0
  return ramp(clamp01(progress), realPhotoRevealStart, 1, 0, 1)
}
