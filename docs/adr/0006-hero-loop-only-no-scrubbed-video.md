# Video appears on any cinematic scene, gated on file presence, and is never scrubbed by scroll — the last clause superseded by ADR-0008

A cinematic scene's artwork may be a short video — three to four seconds, seamless, silent, autoplaying — rather than a still. (Since ADR-0008 it is played by the scroll instead, and neither seamless nor autoplaying; everything else below is unchanged.) The mechanism shipped for the opening first (#14) and was generalized by #17 (`videoAvailable()` in `lib/availability.ts`, `video`/`reducedMotion` on `Artwork.tsx`) from one hardcoded filename to any artwork's base name. The opening and "Why Çanakkale" are the two scenes opted in today; neither loop has actually been delivered yet, so both still render their stills — see `docs/art-direction.md` for what each one should show once produced. It is still not every image on the site — most artwork stays still, and a scene opts in only once its `.mp4`/`.webm` pair actually lands in `public/artwork/`.

**Superseded by ADR-0008**, which reverses the paragraph below and explains what the reversal costs. The rest of this document still holds. What it says about the technique is not withdrawn — every objection here was paid rather than avoided.

Scroll-scrubbed video — driving `currentTime` from scroll position, the technique the reference site appears to use but does not — is deliberately rejected. It is fragile on iOS, needs the whole file before it can respond, and degrades into stutter on exactly the mid-range phones our delegates carry. The scroll choreography is done with transforms instead, which cost nothing and never stall — only the container's `scale` is scroll-driven, never the video's own playback.

## Consequences

- Each video-bearing artwork ships as `<base>.mp4` plus `<base>.webm` next to its existing still (e.g. `public/artwork/opening-trojan-horse.mp4`/`.webm` beside `opening-trojan-horse.jpg`), with the still staying as the poster frame and the fallback. The still must remain good enough to ship alone — a scene with neither file present renders exactly as it always has, no code change required once they land.
- `autoplay muted loop playsinline` — the only combination browsers permit without a gesture. Muted is not a limitation here; the site has no sound.
- Under `prefers-reduced-motion`, the poster still is shown and the video never plays.
- If the loop is not seamless, we ship the still. A visible jump cut is worse than no motion.
