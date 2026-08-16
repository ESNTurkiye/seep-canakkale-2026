# Video appears once, as a silent seamless loop, and is never scrubbed by scroll

The opening artwork is a short video — three to four seconds, seamless, silent, autoplaying: clouds moving, drapery shifting, the delegates still coming down the ladder. Every other image on the site is still.

Scroll-scrubbed video — driving `currentTime` from scroll position, the technique the reference site appears to use but does not — is deliberately rejected. It is fragile on iOS, needs the whole file before it can respond, and degrades into stutter on exactly the mid-range phones our delegates carry. The scroll choreography is done with transforms instead, which cost nothing and never stall.

## Consequences

- One video asset: `public/artwork/opening-trojan-horse.mp4` (plus a `.webm`), with `opening-trojan-horse.png` staying as the poster frame and the fallback. The still must remain good enough to ship alone.
- `autoplay muted loop playsinline` — the only combination browsers permit without a gesture. Muted is not a limitation here; the site has no sound.
- Under `prefers-reduced-motion`, the poster still is shown and the video never plays.
- If the loop is not seamless, we ship the still. A visible jump cut is worse than no motion.
