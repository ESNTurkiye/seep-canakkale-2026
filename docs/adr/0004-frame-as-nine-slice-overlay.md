# The gilt frame is a separate 9-slice PNG, not painted into the artwork

Every artwork hangs in a frame, and the obvious route is to ask the image model for the frame along with the painting. We are not doing that. The frame is generated once as a transparent PNG — one landscape, one portrait — and applied over any artwork with CSS `border-image` at 9-slice, so corners keep their carving while edges stretch.

## Why not paint it in

- **It breaks the opening.** The site's central device is the artwork filling the viewport with no frame, then the frame appearing as the viewer pulls back. A frame baked into the pixels is present at full-bleed, as a giant gold band across the screen, and the reveal has nothing left to reveal.
- **Twenty-five artworks would carry twenty-five different frames.** On the sixteen-portrait wall that difference is the whole problem — a wall of near-identical-but-not frames reads as assembled, not curated.
- **It couples the frame to the artwork.** Regenerating one painting would mean re-matching its frame to the other twenty-four.

## Why not the CSS gradient border we started with

It works and it is sharp at any size, but it is a bevelled edge, not a carved frame. The museum reading depends on the frame looking like an object.

## Consequences

- Two frame assets to produce: `public/frames/landscape.png` (16:9 aperture) and `public/frames/portrait.png` (4:5 aperture). Both transparent in the middle, with even margins so the slice values are simple.
- Frame opacity and scale stay animatable, because the frame is a separate layer.
- Artwork prompts must never mention a frame.
