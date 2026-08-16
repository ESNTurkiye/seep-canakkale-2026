# Art direction — SEEP Çanakkale 2026

Every image on this site is generated. This file is the source of truth for how: the shared style, the per-scene prompts, and the portrait pipeline. Generated files land in `public/artwork/` and `public/portraits/` under the filenames given below — the code reads those paths, so a regenerated image replaces the old one with no code change.

Target model: Nano Banana Pro (Gemini 3 Pro Image) via Higgsfield. Any model that preserves identity from a reference photograph works for the portraits; the scene artworks are model-agnostic.

## Rules that apply to every image

1. **No text inside the image.** Models render lettering badly and we overlay real typography anyway. Never ask for a sign, banner, book title or screen text. Where a screen must read as "full", ask for a progress bar or a list of marks, not words.
2. **16:9, 4K (3840 × 2160) for scene artwork.** The museum device zooms into the artwork; anything under 3000px wide falls apart on a large display. Portraits are 4:5 (1600 × 2000).
3. **Reserve the lower-left third.** Headlines sit bottom-left and body copy bottom-right, so composition must keep the lower-left open — sky, sea, marble floor, anything quiet. Push figures right of centre or above the midline.
4. **One light, one palette, across all nine.** Late-afternoon Mediterranean light from the left. Aegean blue, marble white, olive green, terracotta, warm grey. This is what makes nine separate paintings read as one collection rather than nine posters.
5. **The anachronism is one object, not a theme.** Each painting contains contemporary objects placed seriously inside a classical world. The painting must never look like a joke — the humour comes from the object being painted with total sincerity.
6. **No 1915, ever.** No soldiers, no trenches, no memorials, no poppies, no modern military of any period. See `docs/adr/0001-myth-only-no-1915.md`.

## Shared style block

Prepend this to every scene prompt:

> A museum-quality Neoclassical oil painting inspired by High Renaissance composition and 19th-century Academic Realism, in the style of William-Adolphe Bouguereau, Frederic Leighton, Lawrence Alma-Tadema and Jean-Léon Gérôme. Elegant figures with flowing drapery, idealised anatomy, luminous skin, rich oil paint textures, harmonious composition, dramatic clouds, the Dardanelles strait and Aegean landscape, timeless classical beauty, subtly blended with surreal contemporary elements. Late-afternoon light from the left. Palette of Aegean blue, marble white, olive green, terracotta and warm grey. No text anywhere in the image. 16:9.

## Scene artwork

### 1. `opening-trojan-horse.png` — Opening

The great wooden horse of Troy standing before the city walls at first light, its side hatch swung open and a rope ladder hanging down. A stream of young modern travellers is climbing out of it — canvas backpacks, rolling suitcases, lanyards with blank badges around their necks — and being met by astonished Trojan citizens in drapery who reach up to help them down. Warm dust in the air. The horse occupies the right two-thirds; the lower-left is open ground and open sky.

### 2. Scene 2 has no artwork

"SEEP is in Çanakkale" is typographic — near-black ground, one line of type, SEEP green rule. This scene is the eye's rest between the opening and the first gallery wall. Do not generate art for it.

### 3. `why-hero-leandros.png` — Why Çanakkale

A young man swimming across a narrow moonlit-into-dawn strait towards a marble tower on the far shore, where a woman leans from the parapet holding up a light to guide him — the light is a smartphone torch, held exactly the way a person holds a phone. Both continents visible, the water narrow enough to feel crossable. Wide landscape; the swimmer small, the strait dominant. Lower-left is open water.

### 4a. `venues-homer-recital.png` — Daytime venues, plenary

Blind Homer standing on a low marble dais, mid-recital, one hand raised, before a packed semicircle of seated listeners in drapery who lean forward. Beside him a scribe sits cross-legged transcribing — on an open silver laptop resting on his knees. Amphitheatre setting, columns behind, sea visible through the gap. Lower-left corner is empty marble floor.

### 4b. `venues-judgement-of-paris.png` — Daytime venues, parallel sessions

The Judgement of Paris: a young shepherd seated on a rock holding a single golden apple, facing three goddesses standing in a row before three separate doorways, each doorway leading into a different bright interior. He is visibly unable to choose. The three goddesses occupy the right; the apple catches the light. Lower-left is open hillside.

### 5. `coffee-achilles.png` — Coffee breaks

A young hero in bronze greaves seated on marble steps in the shade of a colonnade, an arrow lying forgotten on the step beside his heel. He is entirely absorbed in a small tulip-shaped glass of tea he holds in one hand, reaching with the other towards a brass tray of white cut sweets and pastries. Relaxed, unheroic, mid-break. Figure right of centre; lower-left is sunlit floor.

### 6a. `evenings-intercultural.png` — Intercultural Night

A long marble banquet table on a terrace above the sea at dusk, crowded with figures in drapery from visibly different lands, each presenting a dish or a bottle to the others, plates passing hand to hand. Above them, on a balustrade, two sirens sit watching, singing, entirely ignored. Warm lamplight, no modern object except the crowd's ease. Lower-left is terrace floor.

### 6b. `evenings-turkish-night.png` — Turkish Night

Figures in classical drapery joined in a circle dance on a marble terrace at night, holding each other's little fingers in the Anatolian way, learning the steps and laughing. To one side a seated musician plays a long-necked lute, and a small tray of tulip-shaped tea glasses rests on the balustrade. Sea and dark hills behind. Lower-left is open floor.

### 7. `stay-xenia.png` — Where you'll stay

The Homeric rite of guest-friendship: a host kneeling at the threshold of a colonnaded villa, washing the feet of an arriving traveller who is seated and clearly exhausted from a long journey. Beside the traveller stands a modern hard-shell rolling suitcase, upright, handle extended. On a marble side table, a small brass reception bell. Evening light through the columns. Lower-left is threshold stone.

### 8. Scene 8 uses portraits, not scene artwork

See the portrait pipeline below.

### 9. `closing-cassandra.png` — Closing / CTA

Cassandra standing high on the walls of Troy, one arm outstretched towards a crowd below who are turning away from her, uninterested. In her other hand, held down at her side and unnoticed, a phone whose screen glows with a bar that is almost entirely filled. Wind in her drapery, city behind, sea beyond. She is right of centre and high in the frame; the lower-left is wall and sky.

## Frames

Two frame assets, generated once, applied to everything. Never ask for a frame inside an artwork prompt — see `docs/adr/0004-frame-as-nine-slice-overlay.md`.

Both must be produced with a **fully transparent aperture** and even margins, so the CSS 9-slice values stay simple and the carving survives being stretched to any size.

### `public/frames/landscape.png` — 16:9 aperture

> A single ornate gilded picture frame, photographed straight on, centred, complete and unclipped, against a fully transparent background. Carved gold leaf with acanthus scrollwork at the corners, a beaded inner lip, worn gilding with darker recesses and warm highlights, museum quality, nineteenth century. The centre of the frame is empty and fully transparent. Even soft light from the upper left. No wall, no shadow on any surface, no painting inside, no text. 16:9 aperture.

### `public/frames/portrait.png` — 4:5 aperture

Same prompt, with a plainer profile — a simpler moulding suits sixteen small frames hung together, where heavy carving turns into noise:

> A single gilded picture frame, photographed straight on, centred, complete and unclipped, against a fully transparent background. Simple carved gold moulding with a beaded inner lip, restrained ornament, worn gilding with darker recesses, museum quality. The centre of the frame is empty and fully transparent. Even soft light from the upper left. No wall, no shadow, no painting inside, no text. 4:5 aperture.

If the model cannot deliver true transparency, generate against flat magenta and cut the aperture out afterwards — but check the edges, because a halo of leftover background is visible against a dark wall.

## The opening loop

The opening scene is the only moving image on the site. See `docs/adr/0006-hero-loop-only-no-scrubbed-video.md`.

- Source: the finished `opening-trojan-horse.png`, animated. Do not generate a different composition.
- 3–4 seconds, **seamless** — the last frame must meet the first. Silent. No camera move: the scroll already moves the frame, and a second movement fights it.
- What moves: clouds drifting, dust in the air, drapery shifting, one delegate still stepping down the ladder. Nothing else. The painting should look alive, not animated.
- Deliver `opening-trojan-horse.mp4` and `.webm` into `public/artwork/`. The still stays as poster and fallback.
- If the loop is not seamless, we ship the still. A visible jump is worse than no motion.

## Portraits — the sixteen Organising Committee members

Sixteen portraits hang as one wall. They will only read as one wall if the inputs are uniform, so the source photographs matter more than the prompt.

### Source photograph standard

Send this to the OC before anyone sends a photo:

- Plain, untextured wall behind — light grey, white or beige. No rooms, no outdoors, no other people.
- Facing the camera straight on, head and shoulders, eyes level with the lens.
- Even daylight on the face, from the front or slightly to the side. No harsh sun, no backlight, no colour cast from screens.
- No sunglasses, no hat, no hand in frame. Everyday clothing is fine — it will be replaced by drapery.
- Neutral expression or a slight smile. Whatever you choose, that is the expression that ends up on the wall.
- Portrait orientation, at least 1000px on the short side, **portrait/bokeh mode off** — artificial background blur confuses the model.

**What actually goes wrong.** The first photograph sent in was a full-length shot on a stage, arms out, holding trophies. Technically 1080 × 1920 — and useless, because the face occupied about 250px of that height. Cropped to head and shoulders it was roughly 350 × 450px, and likeness is made of face pixels. The number that matters is not the file's resolution but **the face's**: aim for the head filling at least half the frame's height. Send this paragraph along with the standard; "high resolution photo" is not the same instruction and people will hear the wrong one.

### Portrait prompt template

One template, unchanged for all sixteen. Only the reference photograph changes.

> Head-and-shoulders portrait in the style of a 19th-century Academic Realist oil painting — Bouguereau and Alma-Tadema — painted on canvas with visible brushwork and a warm varnish. **Preserve the face from the reference photograph exactly: the same bone structure, the same nose, the same eyes, the same mouth, the same skin tone, the same hair. Do not idealise, do not beautify, do not slim, do not change the age.** Restyle only what surrounds the face: classical drapery over one shoulder, bare neck, no modern clothing. Plain warm-grey painted background with a soft vignette. Even light from the left. Palette of warm grey, terracotta and olive. No text. 4:5 portrait.

The bolded sentence exists because the shared style block asks for "idealised anatomy, luminous skin" — exactly what destroys a likeness. The portrait template deliberately contradicts it. Do not merge the two blocks.

### Filenames

`public/portraits/<slug>.png`, where the slug is in `content/oc.ts`. A missing file is handled by the design — the frame renders with a canvas texture and the label still shows — so portraits can arrive one at a time.

### Consent

No portrait goes live before that person has seen their own finished portrait and said yes. Anyone may withdraw at any point; the frame degrades to a plain painted card carrying only their name and role. See `docs/adr/0002-ai-generated-oc-portraits.md`.
