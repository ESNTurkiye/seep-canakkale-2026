import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  FRAME_WIDTH_PX,
  approachPeak,
  openingChoreography,
  openingRest,
  openingPeakProgress,
  openingInkStart,
  enteringChoreography,
  enteringRest,
  enteringPeakProgress,
  enteringInkStart,
  closingChoreography,
  closingRest,
  closingRestProgress,
  lightMovement,
  inkCrossfadeOpacity,
  realPhotoReveal,
  type OpeningState,
  type EnteringState,
  type ClosingState,
} from './choreography.ts'

// Arbitrary but fixed peak — the scale the hung painting has to reach to fill
// the viewport, which the real caller measures through `approachPeak` (tested
// separately below). Any value above 1 exercises the same math.
const COVER = 1.2
const PEAK_SCALE = COVER * 1.06

function choreograph(progress: number, reducedMotion = false): OpeningState {
  return openingChoreography(progress, PEAK_SCALE, reducedMotion)
}

// A desktop viewport and the painting as it is laid out on one: the hung box
// at --rest-width, plus its label centred underneath. Wide enough that a 16:9
// painting can cover it without losing much of itself off the sides.
const DESKTOP = {
  viewportWidth: 1512,
  viewportHeight: 900,
  boxWidth: 786,
  boxHeight: 442,
  below: 90,
}

// The same measurement on a phone held upright, where covering the screen
// would mean growing the painting to three and a half times its width.
const PHONE = {
  viewportWidth: 390,
  viewportHeight: 844,
  boxWidth: 234,
  boxHeight: 132,
  below: 80,
}

describe('approachPeak — a screen the painting can cover', () => {
  const peak = approachPeak({ ...DESKTOP, overshoot: 1.06 })

  test('the painting covers the viewport in both directions', () => {
    assert.ok(DESKTOP.boxWidth * peak >= DESKTOP.viewportWidth)
    assert.ok(DESKTOP.boxHeight * peak >= DESKTOP.viewportHeight)
  })

  test('and bleeds past it rather than fitting flush against an edge', () => {
    const flush = approachPeak({ ...DESKTOP })
    assert.ok(peak > flush)
  })
})

describe('approachPeak — a phone held upright', () => {
  const peak = approachPeak({ ...PHONE, overshoot: 1.06 })

  test('the painting grows to exactly the width of the screen, never past it', () => {
    // The whole point: at the peak of the approach every last pixel of the
    // artwork's width is on screen. Covering this screen would have thrown
    // three quarters of it off the sides.
    assert.equal(PHONE.boxWidth * peak, PHONE.viewportWidth)
  })

  test('so it does not reach the top and bottom edges — wall is left above and below', () => {
    assert.ok(PHONE.boxHeight * peak < PHONE.viewportHeight)
  })

  test('the overshoot is not applied — there is no edge left to bleed past', () => {
    assert.equal(peak, approachPeak({ ...PHONE }))
  })

  test('and it is still an approach: the painting grows from where it hangs', () => {
    assert.ok(peak > 1)
  })
})

describe('approachPeak — bounds', () => {
  test('the cap holds a receding scene back from a zoom no walk-past needs', () => {
    assert.equal(approachPeak({ ...DESKTOP, cap: 1.5 }), 1.5)
  })

  test('a box that has not been laid out yet stays at its hung size', () => {
    // Measured from a DOM node that may not have a size yet; without this the
    // first paint would scale the painting by Infinity.
    assert.equal(approachPeak({ ...DESKTOP, boxWidth: 0, boxHeight: 0 }), 1)
  })
})

describe('openingChoreography — progress 0 (top of the scroll, hung and framed)', () => {
  test('the artwork is at its hung, unscaled size', () => {
    assert.equal(choreograph(0).scale, 1)
  })

  test('the frame is fully present', () => {
    const state = choreograph(0)
    assert.equal(state.frameOpacity, 1)
    assert.equal(state.frameWidthPx, FRAME_WIDTH_PX)
  })

  test('the gallery wall is fully present', () => {
    assert.equal(choreograph(0).wallOpacity, 1)
  })

  test('the headline copy is fully hidden', () => {
    assert.equal(choreograph(0).copyOpacity, 0)
  })
})

describe('openingChoreography — progress 1 (end of the scroll, full bleed)', () => {
  test('the artwork bleeds past the viewport', () => {
    // Bleeds past the viewport (>COVER) rather than sitting flush — that
    // margin is what makes full bleed read as a bleed, not a flush fit.
    const state = choreograph(1)
    assert.equal(state.scale, PEAK_SCALE)
    assert.ok(state.scale > COVER)
  })

  test('the frame is fully absent', () => {
    const state = choreograph(1)
    assert.equal(state.frameOpacity, 0)
    assert.equal(state.frameWidthPx, 0)
  })

  test('the gallery wall is not visible', () => {
    assert.equal(choreograph(1).wallOpacity, 0)
  })

  test('the headline copy is fully visible', () => {
    assert.equal(choreograph(1).copyOpacity, 1)
  })
})

describe('openingChoreography — scale settles at peak before the ink crossfade starts', () => {
  // The ink-crossfade transition (see the `inkCrossfadeOpacity` tests below)
  // is driven by the same scroll progress starting at `openingInkStart`. If
  // that ever moved earlier than `openingPeakProgress`, the crossfade would
  // start while the painting is still growing — the "janky double
  // transition" issue #15 explicitly rules out.
  test('openingInkStart is not before openingPeakProgress', () => {
    assert.ok(openingInkStart >= openingPeakProgress)
  })

  test('scale has already reached peak by openingPeakProgress', () => {
    assert.equal(choreograph(openingPeakProgress).scale, PEAK_SCALE)
  })

  test('scale is still at peak, unchanged, once the ink crossfade begins', () => {
    assert.equal(choreograph(openingInkStart).scale, PEAK_SCALE)
  })
})

describe('openingChoreography — the frame fades out before the copy has fully faded in', () => {
  // The museum device depends on this ordering: the frame should be most of
  // the way gone before the headline claims the screen, not still fully
  // opaque behind it and not still fading once the headline has settled.
  function firstProgressWhereFrameIsGone(): number {
    const RESOLUTION = 2000
    for (let i = 0; i <= RESOLUTION; i++) {
      const p = i / RESOLUTION
      if (choreograph(p).frameOpacity === 0) return p
    }
    throw new Error('frame never fully fades out across [0, 1]')
  }

  function firstProgressWhereCopyIsVisible(): number {
    const RESOLUTION = 2000
    for (let i = 0; i <= RESOLUTION; i++) {
      const p = i / RESOLUTION
      if (choreograph(p).copyOpacity > 0) return p
    }
    throw new Error('copy never starts fading in across [0, 1]')
  }

  test('the frame is still fully present immediately after the top of the scroll', () => {
    assert.equal(choreograph(0.01).frameOpacity, 1)
  })

  test('the frame has fully faded out well before the copy reaches full opacity', () => {
    const p = firstProgressWhereFrameIsGone()
    assert.ok(p < 1, `expected the frame to fully fade out before p=1, got ${p}`)
    // Pinned to the shipped choreography's actual value (~0.52) with
    // headroom for retuning, so this only fires for a real ordering
    // regression rather than ordinary threshold adjustments.
    assert.ok(
      choreograph(p).copyOpacity < 0.7,
      `expected the copy to still be well short of full opacity when the frame finishes fading out, got ${choreograph(p).copyOpacity}`,
    )
  })

  test('the frame is still visible when the copy begins to fade in — the two overlap', () => {
    const p = firstProgressWhereCopyIsVisible()
    assert.ok(
      choreograph(p).frameOpacity > 0,
      'expected the frame to still be fading out when the copy starts fading in',
    )
  })
})

describe('openingChoreography — the label and the headline copy are never both visible', () => {
  // Painting.tsx's 'opening' variant comment depends on this: the opening
  // never shows copy and label at once, unlike an entering scene where the
  // label travels with the copy on screen the whole time.
  test('across the full sweep, at most one of labelOpacity and copyOpacity is ever nonzero', () => {
    const STEPS = 1000
    for (let i = 0; i <= STEPS; i++) {
      const state = choreograph(i / STEPS)
      assert.ok(
        state.labelOpacity === 0 || state.copyOpacity === 0,
        `both visible at p=${i / STEPS}: label=${state.labelOpacity}, copy=${state.copyOpacity}`,
      )
    }
  })
})

describe('openingChoreography — continuity and monotonicity', () => {
  test('scale never jumps across the full sweep', () => {
    const STEPS = 2000
    let maxDelta = 0
    let previous = choreograph(0).scale
    for (let i = 1; i <= STEPS; i++) {
      const current = choreograph(i / STEPS).scale
      maxDelta = Math.max(maxDelta, Math.abs(current - previous))
      previous = current
    }
    // Largest step between adjacent samples 1/2000 apart. A genuine
    // discontinuity shows up as a jump orders of magnitude larger than this.
    assert.ok(maxDelta < 0.01, `largest adjacent jump was ${maxDelta}`)
  })

  test('scale grows monotonically — the ramp to full bleed never reverses', () => {
    const STEPS = 500
    let previous = choreograph(0).scale
    for (let i = 1; i <= STEPS; i++) {
      const current = choreograph(i / STEPS).scale
      assert.ok(current >= previous - 1e-9, `scale decreased at step ${i}: ${previous} -> ${current}`)
      previous = current
    }
  })

  // The four remaining properties should each move in one direction only —
  // no flicker or reversal partway through the growth.
  const decreasing: Array<keyof OpeningState> = ['wallOpacity', 'frameOpacity', 'frameWidthPx', 'labelOpacity']
  const increasing: Array<keyof OpeningState> = ['copyOpacity']

  for (const key of decreasing) {
    test(`${key} falls monotonically across the full sweep`, () => {
      const STEPS = 500
      let previous = choreograph(0)[key]
      for (let i = 1; i <= STEPS; i++) {
        const current = choreograph(i / STEPS)[key]
        assert.ok(current <= previous + 1e-9, `${key} rose at step ${i}: ${previous} -> ${current}`)
        previous = current
      }
    })
  }

  for (const key of increasing) {
    test(`${key} rises monotonically across the full sweep`, () => {
      const STEPS = 500
      let previous = choreograph(0)[key]
      for (let i = 1; i <= STEPS; i++) {
        const current = choreograph(i / STEPS)[key]
        assert.ok(current >= previous - 1e-9, `${key} fell at step ${i}: ${previous} -> ${current}`)
        previous = current
      }
    })
  }
})

describe('openingChoreography — clamping', () => {
  test('progress below 0 behaves like progress 0', () => {
    assert.deepEqual(choreograph(-5), choreograph(0))
  })

  test('progress above 1 behaves like progress 1', () => {
    assert.deepEqual(choreograph(5), choreograph(1))
  })
})

describe('openingChoreography — reduced motion', () => {
  // The resting state itself, pinned to the ADR 0005 contract: "painting
  // hung, frame visible, no scaling". Asserted on literal values rather than
  // against `openingRest` — openingChoreography returns that same object
  // reference under reduced motion, so comparing against it would only ever
  // prove the function returns whatever the constant happens to hold.
  test('the resting state matches the hung-painting contract', () => {
    assert.deepEqual(openingRest, {
      scale: 1,
      wallOpacity: 1,
      frameOpacity: 1,
      frameWidthPx: FRAME_WIDTH_PX,
      copyOpacity: 1,
      labelOpacity: 0,
    })
  })

  test('every input returns the resting state', () => {
    for (const progress of [-2, 0, 0.3, 0.55, 0.7, 1, 3]) {
      assert.deepEqual(choreograph(progress, true), openingRest)
    }
  })
})

// A later scene, already hung on the wall, approached and passed — see
// docs/adr/0005-scroll-choreography.md. `peak` is the measured scale the hung
// painting needs to fill the viewport at the midpoint of its own track.
const PEAK = 2.4

function enter(progress: number, reducedMotion = false) {
  return enteringChoreography(progress, PEAK, reducedMotion)
}

describe('enteringChoreography — at rest, before and after the approach', () => {
  test('at the start of the track the painting is at its hung, unscaled size', () => {
    assert.equal(enter(0).scale, 1)
  })

  test('at the end of the track the painting has receded back to its hung size', () => {
    assert.equal(enter(1).scale, 1)
  })

  test('the frame is fully present at both ends of the track', () => {
    assert.equal(enter(0).frameOpacity, 1)
    assert.equal(enter(0).frameWidthPx, FRAME_WIDTH_PX)
    assert.equal(enter(1).frameOpacity, 1)
    assert.equal(enter(1).frameWidthPx, FRAME_WIDTH_PX)
  })

  test('the copy is fully hidden at both ends of the track', () => {
    assert.equal(enter(0).copyOpacity, 0)
    assert.equal(enter(1).copyOpacity, 0)
  })
})

describe('enteringChoreography — the frame fades out and the copy fades in as the painting nears peak scale', () => {
  // Mirrors the reversed opening's peak behaviour (#14, see
  // openingChoreography), then plays back in reverse on the way out.
  test('at the peak the frame has fully faded out and the copy is fully visible', () => {
    const state = enter(0.5)
    assert.equal(state.frameOpacity, 0)
    assert.equal(state.frameWidthPx, 0)
    assert.equal(state.copyOpacity, 1)
  })

  test('the frame is still fully present immediately after the start of the approach', () => {
    assert.equal(enter(0.01).frameOpacity, 1)
  })

  test('the frame is still fully present immediately before the end of the recede', () => {
    assert.equal(enter(0.99).frameOpacity, 1)
  })

  function firstProgressWhereFrameIsGone(): number {
    const RESOLUTION = 1000
    for (let i = 0; i <= RESOLUTION; i++) {
      const p = i / RESOLUTION
      if (enter(p).frameOpacity === 0) return p
    }
    throw new Error('frame never fully fades out on the approach')
  }

  function lastProgressWhereFrameIsGone(): number {
    const RESOLUTION = 1000
    for (let i = RESOLUTION; i >= 0; i--) {
      const p = i / RESOLUTION
      if (enter(p).frameOpacity === 0) return p
    }
    throw new Error('frame never fully fades out on the recede')
  }

  test('the frame has fully faded out well before the copy reaches full opacity on approach', () => {
    const p = firstProgressWhereFrameIsGone()
    assert.ok(p < 0.5, `expected the frame to fully fade out before the peak, got ${p}`)
    assert.ok(
      enter(p).copyOpacity < 0.7,
      `expected the copy to still be short of full opacity when the frame finishes fading out, got ${enter(p).copyOpacity}`,
    )
  })

  test('the copy is still well short of full opacity once the frame starts fading back in on recede', () => {
    const p = lastProgressWhereFrameIsGone()
    assert.ok(p > 0.5, `expected the frame to still be gone just after the peak, got ${p}`)
    assert.ok(
      enter(p).copyOpacity < 0.7,
      `expected the copy to already be well short of full opacity once the frame starts returning, got ${enter(p).copyOpacity}`,
    )
  })
})

describe('enteringChoreography — frame and copy motion never reverses within a leg', () => {
  test('on approach, frame opacity/width fall and copy opacity rises monotonically', () => {
    const STEPS = 300
    let prevFrame = enter(0).frameOpacity
    let prevWidth = enter(0).frameWidthPx
    let prevCopy = enter(0).copyOpacity
    for (let i = 1; i <= STEPS; i++) {
      const state = enter((i / STEPS) * 0.5)
      assert.ok(state.frameOpacity <= prevFrame + 1e-9, `frameOpacity rose at step ${i}`)
      assert.ok(state.frameWidthPx <= prevWidth + 1e-9, `frameWidthPx rose at step ${i}`)
      assert.ok(state.copyOpacity >= prevCopy - 1e-9, `copyOpacity fell at step ${i}`)
      prevFrame = state.frameOpacity
      prevWidth = state.frameWidthPx
      prevCopy = state.copyOpacity
    }
  })

  test('on recede, frame opacity/width rise and copy opacity falls monotonically', () => {
    const STEPS = 300
    let prevFrame = enter(0.5).frameOpacity
    let prevWidth = enter(0.5).frameWidthPx
    let prevCopy = enter(0.5).copyOpacity
    for (let i = 1; i <= STEPS; i++) {
      const state = enter(0.5 + (i / STEPS) * 0.5)
      assert.ok(state.frameOpacity >= prevFrame - 1e-9, `frameOpacity fell at step ${i}`)
      assert.ok(state.frameWidthPx >= prevWidth - 1e-9, `frameWidthPx fell at step ${i}`)
      assert.ok(state.copyOpacity <= prevCopy + 1e-9, `copyOpacity rose at step ${i}`)
      prevFrame = state.frameOpacity
      prevWidth = state.frameWidthPx
      prevCopy = state.copyOpacity
    }
  })
})

describe('enteringChoreography — the approach fills the viewport', () => {
  test('at the midpoint the painting has grown to the measured peak scale', () => {
    assert.equal(enter(0.5).scale, PEAK)
  })

  test('the painting never shrinks below its hung size anywhere on the track', () => {
    const STEPS = 500
    for (let i = 0; i <= STEPS; i++) {
      const scale = enter(i / STEPS).scale
      assert.ok(scale >= 1 - 1e-9, `scale dipped below the hung size at p=${i / STEPS}: ${scale}`)
    }
  })

  test('growth is monotonic on the way in — the painting never shrinks during the approach', () => {
    const STEPS = 200
    let previous = enter(0).scale
    for (let i = 1; i <= STEPS; i++) {
      const current = enter((i / STEPS) * 0.5).scale
      assert.ok(current >= previous - 1e-9, `scale shrank at step ${i}: ${previous} -> ${current}`)
      previous = current
    }
  })

  test('recede is monotonic on the way out — the painting never grows again after the peak', () => {
    const STEPS = 200
    let previous = enter(0.5).scale
    for (let i = 1; i <= STEPS; i++) {
      const current = enter(0.5 + (i / STEPS) * 0.5).scale
      assert.ok(current <= previous + 1e-9, `scale grew at step ${i}: ${previous} -> ${current}`)
      previous = current
    }
  })
})

describe('enteringChoreography — the label hides while the painting fills the view', () => {
  test('the label is fully visible at rest, before the approach', () => {
    assert.equal(enter(0).labelOpacity, 1)
  })

  test('the label is fully visible at rest, after receding', () => {
    assert.equal(enter(1).labelOpacity, 1)
  })

  test('the label is fully hidden at the peak, when the frame has left the viewport', () => {
    assert.equal(enter(0.5).labelOpacity, 0)
  })
})

describe('enteringChoreography — clamping', () => {
  test('progress below 0 behaves like progress 0', () => {
    assert.deepEqual(enter(-3), enter(0))
  })

  test('progress above 1 behaves like progress 1', () => {
    assert.deepEqual(enter(4), enter(1))
  })
})

describe('enteringChoreography — reduced motion', () => {
  test('every input returns the hung resting state — frame, copy, and label all shown at once', () => {
    const rest: EnteringState = {
      scale: 1,
      wallOpacity: 1,
      frameOpacity: 1,
      frameWidthPx: FRAME_WIDTH_PX,
      copyOpacity: 1,
      labelOpacity: 1,
    }
    for (const progress of [-2, 0, 0.5, 1, 3]) {
      assert.deepEqual(enter(progress, true), rest)
    }
  })
})

// A non-receding entering scene (issue #17, `content/scenes.ts`'s
// `recede: false`): reaches peak and holds, handing off via the ink
// crossfade instead of receding back to its hung size — the opening's shape
// (#14) rather than a gallery walk-past.
function enterHold(progress: number, reducedMotion = false) {
  return enteringChoreography(progress, PEAK, reducedMotion, false)
}

describe('enteringChoreography — recede: false — progress 0 (hung and framed)', () => {
  test('the artwork is at its hung, unscaled size', () => {
    assert.equal(enterHold(0).scale, 1)
  })

  test('the frame is fully present', () => {
    assert.equal(enterHold(0).frameOpacity, 1)
    assert.equal(enterHold(0).frameWidthPx, FRAME_WIDTH_PX)
  })

  test('the copy is fully hidden', () => {
    assert.equal(enterHold(0).copyOpacity, 0)
  })

  test('the gallery wall is fully present', () => {
    assert.equal(enterHold(0).wallOpacity, 1)
  })
})

describe('enteringChoreography — recede: false — progress 1 (full bleed, no recede)', () => {
  test('the artwork is at its peak scale, not back at its hung size', () => {
    assert.equal(enterHold(1).scale, PEAK)
  })

  test('the frame is fully absent', () => {
    assert.equal(enterHold(1).frameOpacity, 0)
    assert.equal(enterHold(1).frameWidthPx, 0)
  })

  test('the copy is fully visible', () => {
    assert.equal(enterHold(1).copyOpacity, 1)
  })

  test('the gallery wall is not visible — whatever the painting does not cover reads as ink, not wall', () => {
    assert.equal(enterHold(1).wallOpacity, 0)
  })
})

describe('enteringChoreography — recede: false — scale settles at peak before the ink crossfade starts', () => {
  // Same ordering guarantee openingChoreography's peak/inkStart pair
  // provides — see the equivalent openingChoreography describe block above.
  test('enteringInkStart is not before enteringPeakProgress', () => {
    assert.ok(enteringInkStart >= enteringPeakProgress)
  })

  test('scale has already reached peak by enteringPeakProgress', () => {
    assert.equal(enterHold(enteringPeakProgress).scale, PEAK)
  })

  test('scale is still at peak, unchanged, once the ink crossfade begins', () => {
    assert.equal(enterHold(enteringInkStart).scale, PEAK)
  })
})

describe('enteringChoreography — recede: false — the frame fades out before the copy has fully faded in', () => {
  // Mirrors the equivalent openingChoreography describe block above — the two
  // share timing via approachCrossfade, so this exercises the same ordering.
  function firstProgressWhereFrameIsGone(): number {
    const RESOLUTION = 2000
    for (let i = 0; i <= RESOLUTION; i++) {
      const p = i / RESOLUTION
      if (enterHold(p).frameOpacity === 0) return p
    }
    throw new Error('frame never fully fades out across [0, 1]')
  }

  test('the frame is still fully present immediately after the top of the scroll', () => {
    assert.equal(enterHold(0.01).frameOpacity, 1)
  })

  test('the frame has fully faded out well before the copy reaches full opacity', () => {
    const p = firstProgressWhereFrameIsGone()
    assert.ok(p < 1, `expected the frame to fully fade out before p=1, got ${p}`)
    assert.ok(
      enterHold(p).copyOpacity < 0.7,
      `expected the copy to still be well short of full opacity when the frame finishes fading out, got ${enterHold(p).copyOpacity}`,
    )
  })
})

describe('enteringChoreography — recede: false — the label and the headline copy are never both visible', () => {
  // The entering variant renders the label attached to the painting (unlike
  // the opening's separately overlaid label), so an overlap here would be a
  // visible collision, not just a timing curiosity.
  test('across the full sweep, at most one of labelOpacity and copyOpacity is ever nonzero', () => {
    const STEPS = 1000
    for (let i = 0; i <= STEPS; i++) {
      const state = enterHold(i / STEPS)
      assert.ok(
        state.labelOpacity === 0 || state.copyOpacity === 0,
        `both visible at p=${i / STEPS}: label=${state.labelOpacity}, copy=${state.copyOpacity}`,
      )
    }
  })
})

describe('enteringChoreography — recede: false — continuity and monotonicity', () => {
  test('scale grows monotonically across the full sweep — it never recedes', () => {
    const STEPS = 500
    let previous = enterHold(0).scale
    for (let i = 1; i <= STEPS; i++) {
      const current = enterHold(i / STEPS).scale
      assert.ok(current >= previous - 1e-9, `scale decreased at step ${i}: ${previous} -> ${current}`)
      previous = current
    }
  })

  test('scale never jumps across the full sweep', () => {
    // Same threshold and reasoning as openingChoreography's equivalent test
    // above — scale is the property that must read as one continuous grow.
    const STEPS = 2000
    let maxDelta = 0
    let previous = enterHold(0).scale
    for (let i = 1; i <= STEPS; i++) {
      const current = enterHold(i / STEPS).scale
      maxDelta = Math.max(maxDelta, Math.abs(current - previous))
      previous = current
    }
    assert.ok(maxDelta < 0.01, `largest adjacent jump was ${maxDelta}`)
  })

  const decreasing: Array<keyof EnteringState> = ['wallOpacity', 'frameOpacity', 'frameWidthPx', 'labelOpacity']
  const increasing: Array<keyof EnteringState> = ['copyOpacity']

  for (const key of decreasing) {
    test(`${key} falls monotonically across the full sweep`, () => {
      const STEPS = 500
      let previous = enterHold(0)[key]
      for (let i = 1; i <= STEPS; i++) {
        const current = enterHold(i / STEPS)[key]
        assert.ok(current <= previous + 1e-9, `${key} rose at step ${i}: ${previous} -> ${current}`)
        previous = current
      }
    })
  }

  for (const key of increasing) {
    test(`${key} rises monotonically across the full sweep`, () => {
      const STEPS = 500
      let previous = enterHold(0)[key]
      for (let i = 1; i <= STEPS; i++) {
        const current = enterHold(i / STEPS)[key]
        assert.ok(current >= previous - 1e-9, `${key} fell at step ${i}: ${previous} -> ${current}`)
        previous = current
      }
    })
  }
})

describe('enteringChoreography — recede: false — clamping and reduced motion', () => {
  test('progress below 0 behaves like progress 0', () => {
    assert.deepEqual(enterHold(-3), enterHold(0))
  })

  test('progress above 1 behaves like progress 1', () => {
    assert.deepEqual(enterHold(4), enterHold(1))
  })

  test('every input returns the same hung resting state as the receding path', () => {
    const rest: EnteringState = {
      scale: 1,
      wallOpacity: 1,
      frameOpacity: 1,
      frameWidthPx: FRAME_WIDTH_PX,
      copyOpacity: 1,
      labelOpacity: 1,
    }
    for (const progress of [-2, 0, 0.5, 1, 3]) {
      assert.deepEqual(enterHold(progress, true), rest)
    }
  })
})

// The closing scene (issue #18): a deliberate exception to
// enteringChoreography. It arrives already at full bleed and only recedes,
// down to its hung, resting size, where it holds — the mirror image of the
// pre-reversal opening rather than the standard approach-then-recede.
const CLOSING_PEAK = 2.4

function close(progress: number, reducedMotion = false): ClosingState {
  return closingChoreography(progress, CLOSING_PEAK, reducedMotion)
}

describe('closingChoreography — progress 0 (top of the track, full bleed)', () => {
  test('the artwork is at its full-bleed peak scale', () => {
    assert.equal(close(0).scale, CLOSING_PEAK)
  })

  test('the frame is fully absent', () => {
    const state = close(0)
    assert.equal(state.frameOpacity, 0)
    assert.equal(state.frameWidthPx, 0)
  })

  test('the gallery wall is not visible', () => {
    assert.equal(close(0).wallOpacity, 0)
  })

  test('the label is fully hidden', () => {
    assert.equal(close(0).labelOpacity, 0)
  })
})

describe('closingChoreography — at and after closingRestProgress (receded to rest, and holding)', () => {
  test('the artwork has receded to its hung, unscaled size', () => {
    assert.equal(close(closingRestProgress).scale, 1)
  })

  test('the frame, wall and label are all fully present', () => {
    const state = close(closingRestProgress)
    assert.equal(state.frameOpacity, 1)
    assert.equal(state.frameWidthPx, FRAME_WIDTH_PX)
    assert.equal(state.wallOpacity, 1)
    assert.equal(state.labelOpacity, 1)
  })

  test('the resting state holds, unchanged, for the remainder of the track', () => {
    assert.deepEqual(close(closingRestProgress), close(1))
  })
})

describe('closingChoreography — the recede never reverses', () => {
  test('scale shrinks monotonically across the full sweep — it never grows again', () => {
    const STEPS = 500
    let previous = close(0).scale
    for (let i = 1; i <= STEPS; i++) {
      const current = close(i / STEPS).scale
      assert.ok(current <= previous + 1e-9, `scale grew at step ${i}: ${previous} -> ${current}`)
      previous = current
    }
  })

  test('scale never jumps across the full sweep', () => {
    const STEPS = 2000
    let maxDelta = 0
    let previous = close(0).scale
    for (let i = 1; i <= STEPS; i++) {
      const current = close(i / STEPS).scale
      maxDelta = Math.max(maxDelta, Math.abs(current - previous))
      previous = current
    }
    assert.ok(maxDelta < 0.01, `largest adjacent jump was ${maxDelta}`)
  })

  const increasing: Array<keyof ClosingState> = ['wallOpacity', 'frameOpacity', 'frameWidthPx', 'labelOpacity']

  for (const key of increasing) {
    test(`${key} rises monotonically across the full sweep`, () => {
      const STEPS = 500
      let previous = close(0)[key]
      for (let i = 1; i <= STEPS; i++) {
        const current = close(i / STEPS)[key]
        assert.ok(current >= previous - 1e-9, `${key} fell at step ${i}: ${previous} -> ${current}`)
        previous = current
      }
    })
  }
})

describe('closingChoreography — clamping', () => {
  test('progress below 0 behaves like progress 0', () => {
    assert.deepEqual(close(-3), close(0))
  })

  test('progress above 1 behaves like progress 1', () => {
    assert.deepEqual(close(4), close(1))
  })
})

describe('closingChoreography — reduced motion', () => {
  test('the resting state matches the hung-painting contract, with no copyOpacity field', () => {
    assert.deepEqual(closingRest, {
      scale: 1,
      wallOpacity: 1,
      frameOpacity: 1,
      frameWidthPx: FRAME_WIDTH_PX,
      labelOpacity: 1,
    })
  })

  // Pins the "reduced motion shows the same resting state it does today"
  // acceptance criterion (issue #18) to the thing it claims parity with,
  // rather than just asserting hand-copied literals twice.
  test('matches enteringRest field-for-field, aside from the copyOpacity field it deliberately omits', () => {
    assert.deepEqual({ ...closingRest, copyOpacity: 1 }, enteringRest)
  })

  test('every input returns the resting state', () => {
    for (const progress of [-2, 0, 0.2, closingRestProgress, 0.7, 1, 3]) {
      assert.deepEqual(close(progress, true), closingRest)
    }
  })
})

// The restrained treatment for a scene not marked cinematic — see
// docs/adr/0005-scroll-choreography.md: "the rest hung as paintings carrying
// only light movement." `progress` is 0 as the painting first enters the
// viewport, 1 once it has settled into view.
describe('lightMovement — a painting not marked cinematic', () => {
  test('is invisible before it has begun to enter the viewport', () => {
    assert.equal(lightMovement(0, false).opacity, 0)
  })

  test('is fully visible, settled in place, once it has come into view', () => {
    const state = lightMovement(1, false)
    assert.equal(state.opacity, 1)
    assert.equal(state.translateYPx, 0)
  })

  test('starts lifted below its resting position and settles as it fades in', () => {
    assert.ok(lightMovement(0, false).translateYPx > 0, 'should start below resting position')
  })

  test('opacity rises and the lift settles monotonically across the entrance', () => {
    const STEPS = 200
    let previousOpacity = lightMovement(0, false).opacity
    let previousY = lightMovement(0, false).translateYPx
    for (let i = 1; i <= STEPS; i++) {
      const state = lightMovement(i / STEPS, false)
      assert.ok(state.opacity >= previousOpacity - 1e-9, `opacity dipped at step ${i}`)
      assert.ok(state.translateYPx <= previousY + 1e-9, `lift reversed at step ${i}`)
      previousOpacity = state.opacity
      previousY = state.translateYPx
    }
  })
})

describe('lightMovement — clamping', () => {
  test('progress below 0 behaves like progress 0', () => {
    assert.deepEqual(lightMovement(-3, false), lightMovement(0, false))
  })

  test('progress above 1 behaves like progress 1', () => {
    assert.deepEqual(lightMovement(4, false), lightMovement(1, false))
  })
})

describe('lightMovement — reduced motion', () => {
  test('every input returns the settled, fully visible resting state', () => {
    for (const progress of [-2, 0, 0.5, 1, 3]) {
      assert.deepEqual(lightMovement(progress, true), { opacity: 1, translateYPx: 0 })
    }
  })
})

// The reusable primitive behind the ink-crossfade transition (issue #15) —
// generic over whatever scene's own scroll progress and chosen `start` are
// passed in, so it isn't tied to OpeningState/EnteringState. `START` here is
// arbitrary, unrelated to `openingInkStart`, to prove the function takes it
// as a parameter rather than hardcoding a scene's threshold.
const START = 0.75

describe('inkCrossfadeOpacity — before the fade begins', () => {
  test('is fully transparent up to and including start', () => {
    assert.equal(inkCrossfadeOpacity(0, START, false), 0)
    assert.equal(inkCrossfadeOpacity(START, START, false), 0)
  })
})

describe('inkCrossfadeOpacity — the fade to ink', () => {
  test('is fully opaque at the end of the track', () => {
    assert.equal(inkCrossfadeOpacity(1, START, false), 1)
  })

  test('rises monotonically from start to 1', () => {
    const STEPS = 500
    let previous = inkCrossfadeOpacity(START, START, false)
    for (let i = 1; i <= STEPS; i++) {
      const p = START + (i / STEPS) * (1 - START)
      const current = inkCrossfadeOpacity(p, START, false)
      assert.ok(current >= previous - 1e-9, `opacity fell at step ${i}: ${previous} -> ${current}`)
      previous = current
    }
  })
})

describe('inkCrossfadeOpacity — clamping', () => {
  test('progress below start behaves like start (fully transparent)', () => {
    assert.equal(inkCrossfadeOpacity(-3, START, false), 0)
  })

  test('progress above 1 behaves like 1 (fully opaque)', () => {
    assert.equal(inkCrossfadeOpacity(4, START, false), 1)
  })
})

describe('inkCrossfadeOpacity — reduced motion', () => {
  test('is always fully transparent, regardless of progress — a hard cut, not a fade', () => {
    for (const progress of [-2, 0, START, 0.9, 1, 3]) {
      assert.equal(inkCrossfadeOpacity(progress, START, true), 0)
    }
  })
})

// A hung painting's real-photo reveal (issue #19) — `progress` here is the
// painting's own pass-by track, not lightMovement's entrance track. See the
// doc comment on `realPhotoReveal` for why those are kept separate.
describe('realPhotoReveal — before the reveal begins', () => {
  test('is fully transparent at the start of the pass-by track', () => {
    assert.equal(realPhotoReveal(0, false), 0)
  })

  test('the painting is still fully uncovered as it settles into view', () => {
    assert.equal(realPhotoReveal(0.05, false), 0)
  })
})

describe('realPhotoReveal — the reveal', () => {
  test('is fully opaque at the end of the track', () => {
    assert.equal(realPhotoReveal(1, false), 1)
  })

  // The whole point of the reveal is that somebody watches it happen. The
  // track ends with the painting above the top edge of the viewport, so a
  // crossfade still running at the halfway mark is one nobody ever sees —
  // which is exactly what the original 0.6 threshold did.
  test('has finished well before the painting leaves the viewport', () => {
    assert.equal(realPhotoReveal(0.5, false), 1)
  })

  test('rises monotonically across the sweep', () => {
    const STEPS = 500
    let previous = realPhotoReveal(0, false)
    for (let i = 1; i <= STEPS; i++) {
      const current = realPhotoReveal(i / STEPS, false)
      assert.ok(current >= previous - 1e-9, `opacity fell at step ${i}: ${previous} -> ${current}`)
      previous = current
    }
  })
})

describe('realPhotoReveal — clamping', () => {
  test('progress below 0 behaves like progress 0', () => {
    assert.equal(realPhotoReveal(-3, false), realPhotoReveal(0, false))
  })

  test('progress above 1 behaves like progress 1', () => {
    assert.equal(realPhotoReveal(4, false), realPhotoReveal(1, false))
  })
})

describe('realPhotoReveal — reduced motion', () => {
  test('is always fully transparent — resting state is the painting, not the real photo', () => {
    for (const progress of [-2, 0, 0.3, 0.6, 1, 3]) {
      assert.equal(realPhotoReveal(progress, true), 0)
    }
  })
})
