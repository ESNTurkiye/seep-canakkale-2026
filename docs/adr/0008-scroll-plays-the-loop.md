# The scroll plays the painting, and the loop stops being a loop

A cinematic scene's video is no longer an autoplaying seamless loop. Its `currentTime` is driven by the scene's own scroll progress: the clip runs forward as the viewer scrolls in, stops when they stop, rewinds when they scroll back, and reaches its last frame exactly where the painting reaches full bleed. This supersedes the second paragraph of ADR-0006, which rejected scroll-driven playback outright.

Everything else in ADR-0006 stands. Video is still optional and still gated on file presence, most artwork stays still, reduced motion still renders the poster, and a scene with no files renders exactly as it always has.

## Why the reversal

The looping requirement was the expensive half of ADR-0006, and it was expensive in the wrong place — not in code, in production. A loop has to land its last frame back on its first, and a generative model does not do that on its own. The trick for forcing it (hand the model the same still as both first and last frame) works, but it buys a four-second clip in which nothing may actually happen, because anything that happens has to un-happen before the end.

Both delivered clips make the point. In the first, the sun comes up over the strait and one delegate finishes climbing into the horse; in the second, Leandros crosses half the water to the tower. Neither returns home — as loops they were unshippable, and the fix would have been to ask for less motion, twice.

Bound to the scroll, that drift stops being damage and becomes the mechanism. The painting advances because the viewer advances. It is also the more honest version of what this site already does: ADR-0005 drives every other property from scroll position, and a loop cycling on its own clock inside a painting the scroll is busy scaling was the one thing on screen moving to a different beat.

## What it costs

These are the objections ADR-0006 raised. None of them turned out to be wrong; each is paid rather than avoided.

- **Every frame must be a keyframe.** Seeking between sparse keyframes either snaps or forces a decode of everything since, and both read as stutter under a finger. An all-intra encode of the same clip costs roughly six times the bytes: 2.0–2.4 MB at 960 × 540, 12 fps, against ~400 KB for the looping encode at 720p. That is the single largest asset on the site, and it buys one scene's motion.
- **It cannot respond before it has arrived.** A seek into a byte range the browser has not fetched is a network round trip mid-scroll. So nothing is scroll-driven until `canplaythrough`, and until then the video shows its poster — which is the painting's own still. A slow connection gets today's site, then the motion when it lands, never a dead scroll.
- **iOS will not seek a video it has never played.** A muted inline video may start without a gesture, so `SceneVideo` starts and immediately pauses it, once, purely to hand the decoder a frame.
- **h264 goes first.** The looping path lists webm first; this one lists mp4, because Safari — the platform the original objection was really about — seeks h264 far more reliably than VP9.

Seeks are applied from the latest value in an animation frame rather than on every scroll event: scroll fires far more often than a decoder can answer, and queueing every intermediate position is what turns a scrub into a slideshow.

## Consequences

- **This is not verified on a real phone yet.** It is the condition on the whole decision, not a nice-to-have: ADR-0006 rejected this technique on mid-range-phone behaviour, and that objection is answered by a device, not by an argument. If it stutters on an actual iPhone and an actual mid-range Android, the scenes go back to their stills — which costs nothing, because the stills never left.
- A scrubbed clip does not have to loop, so it does not have to be four seconds of nothing. It runs forward, eight seconds, and ends on a frame worth holding — that frame is what the viewer looks at through the whole full-bleed hold. See `docs/art-direction.md`.
- `videoAvailable()` still requires both encodes. For a scrubbed clip the webm is never fetched by any browser we support, so it is weight in the repository and nothing else. Left as it is for now rather than special-cased; revisit if a third scene opts in.
