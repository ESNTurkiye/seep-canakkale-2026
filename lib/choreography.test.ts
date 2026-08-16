import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { openingChoreography, openingRest, type OpeningState } from './choreography.ts'

// Arbitrary but fixed "cover" — the measured scale the hung painting needs
// at rest. Real value comes from a DOM measurement; any positive number
// exercises the same math.
const COVER = 1.2
const START_SCALE = COVER * 1.06

// Progress at which the pull-back segment hands off to the recede segment —
// see the 0.55 split in openingChoreography. Pinned here because the
// frame-ordering test below needs to know when the pull-back is "done".
const PULLBACK_END = 0.55

function choreograph(progress: number, reducedMotion = false): OpeningState {
  return openingChoreography(progress, COVER, reducedMotion)
}

describe('openingChoreography — progress 0 (top of the scroll)', () => {
  test('the artwork covers the viewport', () => {
    // Bleeds past the viewport (>COVER) rather than sitting flush — that
    // margin is what makes the pull-back read as movement from frame one.
    assert.ok(choreograph(0).scale > COVER)
  })

  test('the frame is fully absent', () => {
    const state = choreograph(0)
    assert.equal(state.frameOpacity, 0)
    assert.equal(state.frameWidthPx, 0)
  })

  test('the gallery wall is not yet visible', () => {
    assert.equal(choreograph(0).wallOpacity, 0)
  })

  test('the headline copy is fully visible', () => {
    assert.equal(choreograph(0).copyOpacity, 1)
  })
})

describe('openingChoreography — progress 1 (end of the scroll)', () => {
  test('the artwork has receded', () => {
    const state = choreograph(1)
    assert.ok(state.scale < 1, 'should recede past resting scale')
    assert.ok(state.scale < choreograph(0).scale, 'should be smaller than the opening bleed')
  })

  test('the frame is fully present', () => {
    const state = choreograph(1)
    assert.equal(state.frameOpacity, 1)
    assert.equal(state.frameWidthPx, 18)
  })

  test('the gallery wall is fully present', () => {
    assert.equal(choreograph(1).wallOpacity, 1)
  })

  test('the headline copy has fully faded', () => {
    assert.equal(choreograph(1).copyOpacity, 0)
  })
})

describe('openingChoreography — frame ordering', () => {
  // The museum device depends on this: the frame must reveal itself *during*
  // the pull-back, not before it starts and not after it has already
  // finished. Appearing too early breaks the reveal the same way appearing
  // only once the recede is over does — the frame should be part of the
  // same motion, not bracket it.
  const RESOLUTION = 2000

  function firstProgressWhereFrameAppears(): number {
    for (let i = 0; i <= RESOLUTION; i++) {
      const p = i / RESOLUTION
      if (choreograph(p).frameOpacity > 0) return p
    }
    throw new Error('frame never appears across [0, 1]')
  }

  test('the frame is fully absent at the very start of the scroll', () => {
    assert.equal(choreograph(0).frameOpacity, 0)
    assert.equal(choreograph(0).frameWidthPx, 0)
    assert.equal(choreograph(0.01).frameOpacity, 0)
  })

  test('the frame stays fully absent, opacity and width alike, everywhere the pull-back has barely started', () => {
    for (let i = 0; i <= 200; i++) {
      const p = (i / 200) * 0.2
      const state = choreograph(p)
      assert.equal(state.frameOpacity, 0, `frameOpacity at p=${p}`)
      assert.equal(state.frameWidthPx, 0, `frameWidthPx at p=${p}`)
    }
  })

  test('the pull-back is substantially under way before the frame begins to appear', () => {
    const p = firstProgressWhereFrameAppears()
    const scaleAtFrameStart = choreograph(p).scale

    // Fraction of the pull-back (start scale -> 1) already completed by the
    // moment the frame starts to appear. The shipped choreography clears
    // ~57%; this floor is set well below that so it only fires for a
    // threshold regressed toward the very start of the scroll, not for
    // ordinary retuning.
    const pullbackProgress = (START_SCALE - scaleAtFrameStart) / (START_SCALE - 1)
    assert.ok(
      pullbackProgress > 0.25,
      `expected the pull-back to be well under way when the frame appears, got ${pullbackProgress}`,
    )
  })

  test('the frame has begun to appear before the pull-back segment ends', () => {
    // Guards the other direction: a frame that only starts revealing once
    // the artwork has already fully receded is just as broken as one that
    // shows up immediately.
    const p = firstProgressWhereFrameAppears()
    assert.ok(p < PULLBACK_END, `expected the frame to start before p=${PULLBACK_END}, got ${p}`)
  })
})

describe('openingChoreography — continuity across the 0.55 segment boundary', () => {
  test('scale is exactly 1 at the boundary, the join point of both ramps', () => {
    assert.equal(choreograph(PULLBACK_END).scale, 1)
  })

  test('scale never jumps anywhere across the full sweep, boundary included', () => {
    const STEPS = 2000
    let maxDelta = 0
    let previous = choreograph(0).scale
    for (let i = 1; i <= STEPS; i++) {
      const current = choreograph(i / STEPS).scale
      maxDelta = Math.max(maxDelta, Math.abs(current - previous))
      previous = current
    }
    // Largest step between adjacent samples 1/2000 apart. A genuine
    // discontinuity (e.g. two segments joined at mismatched values) shows up
    // as a jump orders of magnitude larger than this.
    assert.ok(maxDelta < 0.01, `largest adjacent jump was ${maxDelta}`)
  })

  test('scale recedes monotonically — the pull-back never reverses', () => {
    const STEPS = 500
    let previous = choreograph(0).scale
    for (let i = 1; i <= STEPS; i++) {
      const current = choreograph(i / STEPS).scale
      assert.ok(current <= previous + 1e-9, `scale increased at step ${i}: ${previous} -> ${current}`)
      previous = current
    }
  })
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
      frameWidthPx: 18,
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
