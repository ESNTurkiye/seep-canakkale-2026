'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

/**
 * useReducedMotion() resolves synchronously on the client, but the server
 * always renders the no-preference default and a plain (non-motion-value)
 * style attribute that mismatches on hydration is not guaranteed to be
 * patched onto the DOM. Settling the value in an effect forces a normal
 * post-mount update instead, so scroll-track heights reliably collapse.
 */
export function useResolvedReducedMotion(): boolean {
  const reduced = useReducedMotion()
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    setResolved(!!reduced)
  }, [reduced])

  return resolved
}
