'use client'

import { useLayoutEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

/**
 * useReducedMotion() resolves synchronously on the client, but the server
 * always renders the no-preference default and a plain (non-motion-value)
 * style attribute that mismatches on hydration is not guaranteed to be
 * patched onto the DOM. Settling the value in a layout effect forces a
 * normal pre-paint update instead, so scroll-track heights reliably
 * collapse without a visible frame at the full, uncollapsed height first.
 */
export function useResolvedReducedMotion(): boolean {
  const reduced = useReducedMotion()
  const [resolved, setResolved] = useState(false)

  useLayoutEffect(() => {
    setResolved(!!reduced)
  }, [reduced])

  return resolved
}
