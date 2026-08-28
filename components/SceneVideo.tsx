'use client'

import { useEffect, useRef } from 'react'
import { type MotionValue } from 'motion/react'

/**
 * A scene's animated loop, played by the scroll rather than by the clock:
 * scroll position drives `currentTime` directly, so the painting moves
 * forward as the viewer moves forward and stops when they stop.
 *
 * This is the technique ADR-0006 rejected, and everything that ADR said
 * about it is still true — it is why this component is written the way it
 * is rather than as three lines in `Artwork`:
 *
 * - **The file must be seekable at every frame.** An ordinary encode places
 *   a keyframe every second or two and seeking between them either snaps to
 *   the nearest keyframe or forces a decode of everything since; both read as
 *   stutter under a finger. The clip therefore ships all-intra, which costs
 *   roughly six times the bytes of the same clip encoded to loop.
 * - **It cannot respond until it has arrived.** A seek into a byte range the
 *   browser has not fetched is a network round trip mid-scroll. So nothing is
 *   scroll-driven until the browser reports it can play the file through. A
 *   paused video that has never played shows its poster, and the poster here
 *   is the painting's own still — so a slow connection gets exactly today's
 *   site until the clip has landed, and the first frame replaces the still
 *   the moment it can.
 * - **iOS will not seek a video it has never played.** A muted, inline video
 *   is allowed to start without a gesture, so it is started and immediately
 *   paused once, purely to hand the decoder a first frame.
 *
 * Seeks are applied in an animation frame from the latest value rather than
 * on every change event: scroll fires far more often than the decoder can
 * answer, and queueing every intermediate position is what turns a scrub into
 * a slideshow.
 */
export function SceneVideo({
  base,
  poster,
  alt,
  progress,
  until,
}: {
  /** Artwork path without its extension — `<base>.webm` and `<base>.mp4` sit next to the still. */
  base: string
  poster: string
  alt: string
  /** The scene's own scroll progress, 0 at the top of its track and 1 at the bottom. */
  progress: MotionValue<number>
  /**
   * The progress at which the clip reaches its last frame and holds there —
   * the point in the scene's choreography the motion is meant to land on,
   * not the end of the track.
   */
  until: number
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    let frame = 0
    let last = -1

    const start = () => {
      // See the iOS note above: played once, muted and inline, then paused on
      // its own first frame. Failure here is not fatal — a browser that
      // refuses simply leaves the poster up.
      video.play().then(() => video.pause()).catch(() => {})

      const tick = () => {
        frame = requestAnimationFrame(tick)
        const p = Math.min(1, Math.max(0, progress.get() / until))
        const time = p * (video.duration || 0)
        // A tolerance of half a frame: below it the seek is invisible and the
        // decoder is doing work nobody asked for.
        if (Math.abs(time - last) < 1 / 48) return
        last = time
        video.currentTime = time
      }
      frame = requestAnimationFrame(tick)
    }

    if (video.readyState >= 4) start()
    else video.addEventListener('canplaythrough', start, { once: true })

    return () => {
      cancelAnimationFrame(frame)
      video.removeEventListener('canplaythrough', start)
    }
  }, [progress, until])

  return (
    <video
      ref={ref}
      poster={poster}
      aria-label={alt}
      muted
      playsInline
      // The whole file, deliberately: a scrub seeks anywhere in it from the
      // first flick of the scroll, and `metadata` would make that a network
      // request instead of a seek.
      preload="auto"
    >
      {/* h264 first, the reverse of the looping path's order: this one is
          seeked rather than played, and Safari — the platform ADR-0006 was
          most worried about — seeks h264 far more reliably than VP9. */}
      <source src={`${base}.mp4`} type="video/mp4" />
      <source src={`${base}.webm`} type="video/webm" />
    </video>
  )
}
