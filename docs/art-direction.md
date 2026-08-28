# Art direction — SEEP Çanakkale 2026

Every image on this site is generated. This file is the source of truth for how: the shared style, the per-scene prompts, and the portrait pipeline. Generated files land in `public/artwork/` and `public/portraits/` under the filenames given below — the code reads those paths, so a regenerated image replaces the old one with no code change.

## Masters vs. committed assets

Scene artwork is generated at a large master resolution, then downsized to a ~2000px web variant. Only the web variant is committed, to `public/artwork/`. The master is not committed — see `docs/adr/0007-masters-out-of-git.md` — it lives in `assets/artwork-masters/`, which is gitignored. Frames have no separate master: they're generated once directly at their final ~2000px size, straight into `public/frames/`.

Masters come in at 5504 × 3072, which is 1.79:1 rather than a true 16:9 — that is what the model returns for a 16:9 request at 4K, and it is what the first nine came in at too, so old and new masters are the same size. Well above the 3000px floor rule 2 sets.

**TODO: masters need a shared archive location, not just one contributor's laptop. Not decided yet — name it here once it exists.**

Target model: Nano Banana Pro (Gemini 3 Pro Image), used directly in Google AI Studio — see "Producing an image in Google AI Studio" below. The first nine artworks and the two frames were made through Higgsfield, which is no longer available to us; it was only ever a front end for this same model, so not one prompt in this file changes. Any model that preserves identity from a reference photograph works for the portraits; the scene artworks are model-agnostic.

## Producing an image in Google AI Studio

Everything is done by hand at [aistudio.google.com](https://aistudio.google.com), on the **Gemini 3 Pro Image** model — that is Nano Banana Pro's product name. The prompts in this file are the entire input; paste one unchanged.

### Account and billing

AI Studio must be pointed at a Google Cloud project with a billing account attached, and generation happens on the **paid tier**. This is not optional and not only about money:

- 4K output and Veo are not available on the free tier at all.
- The free tier may use what you send it to improve Google's products; the paid tier does not. Sixteen Organising Committee members' photographs go through this pipeline under the consent recorded in `docs/adr/0002-ai-generated-oc-portraits.md`. Paid tier is the tier that consent was given for.

Funding comes from Google Developer Program Premium monthly Gen AI credits, which accrue on the billing account and expire a year after each is issued. The whole remaining asset backlog costs a small fraction of one year's accrual — images are cents, and Veo is the only line that moves.

**A credit is not a spending cap.** When it runs out the billing account keeps charging the card, silently. Set a monthly budget and an alert under Billing → Budgets & alerts before the first generation, not after.

| | Aspect ratio | Resolution | Reference image |
|---|---|---|---|
| Scene artwork | 16:9 | 4K | none |
| Frames | 16:9 / 4:5 | 2K | none |
| Portrait | 4:5 | 2K | the member's source photograph |

- **Aspect ratio and resolution are controls in the panel, not prompt text.** Set them there. The shared style block below ends with "16:9" — leave it: the nine existing artworks were generated with that exact string and the set's consistency outranks tidiness. But never *add* "4K" or "3840 × 2160" to a prompt.
- **2K is right for portraits and frames.** 2K is already four times the 800 × 1000 a portrait is committed at, and twice the ~2000px a frame ships at. 4K buys nothing there and generates more slowly.
- If a Google Search grounding toggle is offered, leave it off. It exists for factual graphics and data visualisation; on a Bouguereau pastiche it drags the image towards photographic reference.
- Every image AI Studio returns carries an invisible SynthID watermark. This is fine — the site does not claim these are photographs — but it means the artwork is detectable as generated, which the OC should know before approving a portrait.

### Deriving the web variant by hand

`package.json` has `npm run art`, pointing at `scripts/derive-artwork.mjs` — that file is not in this repository and not in its history, so the command does not run. Until it exists, downsize with ffmpeg:

```
# scene artwork: master -> the committed 2000px JPEG
ffmpeg -i assets/artwork-masters/<name>.png -vf scale=2000:-2 -q:v 3 public/artwork/<name>.jpg

# portrait: AI Studio download -> the committed 800px PNG
ffmpeg -i <download>.png -vf scale=800:-2 public/portraits/<slug>.png
```

Keep the scene master in `assets/artwork-masters/` under the same base name as the committed file. It is gitignored, which is not the same as disposable.

## Rules that apply to every image

1. **No text inside the image.** Models render lettering badly and we overlay real typography anyway. Never ask for a sign, banner, book title or screen text. Where a screen must read as "full", ask for a progress bar or a list of marks, not words.
2. **16:9, 4K (3840 × 2160) for scene artwork.** The museum device zooms into the artwork; anything under 3000px wide falls apart on a large display. Portraits are 4:5 (1600 × 2000).
3. **Reserve the lower-left third.** Headlines sit bottom-left and body copy bottom-right, so composition must keep the lower-left open — sky, sea, marble floor, anything quiet. Push figures right of centre or above the midline.
4. **One light, one palette, across all nine.** Late-afternoon Mediterranean light from the left. Aegean blue, marble white, olive green, terracotta, warm grey. This is what makes nine separate paintings read as one collection rather than nine posters.
5. **The anachronism is one object, not a theme.** Each painting contains contemporary objects placed seriously inside a classical world. The painting must never look like a joke — the humour comes from the object being painted with total sincerity.
6. **No 1915, ever.** No soldiers, no trenches, no memorials, no poppies, no modern military of any period. See `docs/adr/0001-myth-only-no-1915.md`.

## Shared style block

Prepend this to every scene prompt:

> A museum-quality Neoclassical oil painting inspired by High Renaissance composition and 19th-century Academic Realism, in the style of William-Adolphe Bouguereau, Frederic Leighton, Lawrence Alma-Tadema and Jean-Léon Gérôme. Elegant figures with flowing drapery, idealised anatomy, luminous skin, rich oil paint textures, harmonious composition, dramatic clouds, the Dardanelles strait and Aegean landscape, timeless classical beauty, subtly blended with surreal contemporary elements. Late-afternoon light from the left. Restrained, muted tonality with soft atmospheric haze — not vivid, not high-contrast. Palette of Aegean blue, marble white, olive green, terracotta and warm grey. The only contemporary object in the painting is the one this scene names; every ship, building and garment other than that object is ancient. No text, no signature, and no painted frame or border anywhere in the image. 16:9.

Two clauses in that block were added after the first nine were generated, because rule 4 and rule 5 were written down here but never actually reached the model — only this block and the scene paragraph are sent. The muted-tonality clause holds the set to one palette; the one-object clause stops a second anachronism drifting in, which is how a modern freighter turned up on the horizon of a beacon scene. The first nine were generated without them and are not to be regenerated.

## Scene artwork

`scripts/generate.mjs` reads the prompts below straight out of this file, so the structure matters: **the first paragraph under a scene heading is the prompt, verbatim.** Anything addressed to a human — rationale, warnings, comparisons between scenes — goes in a later paragraph, or the model reads it as instruction.


### 1. `opening-trojan-horse.jpg` — Opening

The great wooden horse of Troy standing before the city walls at first light, its side hatch swung open and a rope ladder hanging down. A stream of young modern travellers is climbing out of it — canvas backpacks, rolling suitcases, lanyards with blank badges around their necks — and being met by astonished Trojan citizens in drapery who reach up to help them down. Warm dust in the air. The horse occupies the right two-thirds; the lower-left is open ground and open sky.

### 2. Scene 2 has no artwork

"SEEP is in Çanakkale" is typographic — near-black ground, one line of type, SEEP green rule. This scene is the eye's rest between the opening and the first gallery wall. Do not generate art for it.

### 3. `why-hero-leandros.jpg` — Why Çanakkale

A young man swimming across a narrow moonlit-into-dawn strait towards a marble tower on the far shore, where a woman leans from the parapet holding up a light to guide him — the light is a smartphone torch, held exactly the way a person holds a phone. Both continents visible, the water narrow enough to feel crossable. Wide landscape; the swimmer small, the strait dominant. Lower-left is open water.

### 4a. `venues-homer-recital.jpg` — Daytime venues, plenary

Blind Homer standing on a low marble dais, mid-recital, one hand raised, before a packed semicircle of seated listeners in drapery who lean forward. Beside him a scribe sits cross-legged transcribing — on an open silver laptop resting on his knees. Amphitheatre setting, columns behind, sea visible through the gap. Lower-left corner is empty marble floor.

### 4b. `venues-judgement-of-paris.jpg` — Daytime venues, parallel sessions

The Judgement of Paris: a young shepherd seated on a rock holding a single golden apple, facing three goddesses standing in a row before three separate doorways, each doorway leading into a different bright interior. He is visibly unable to choose. The three goddesses occupy the right; the apple catches the light. Lower-left is open hillside.

### 5. `coffee-achilles.jpg` — Coffee breaks

A young hero in bronze greaves seated on marble steps in the shade of a colonnade, an arrow lying forgotten on the step beside his heel. He is entirely absorbed in a small tulip-shaped glass of tea he holds in one hand, reaching with the other towards a brass tray of white cut sweets and pastries. Relaxed, unheroic, mid-break. Figure right of centre; lower-left is sunlit floor.

### 6a. `evenings-intercultural.jpg` — Intercultural Night

A long marble banquet table on a terrace above the sea at dusk, crowded with figures in drapery from visibly different lands, each presenting a dish or a bottle to the others, plates passing hand to hand. Above them, on a balustrade, two sirens sit watching, singing, entirely ignored. Warm lamplight, no modern object except the crowd's ease. Lower-left is terrace floor.

### 6b. `evenings-turkish-night.jpg` — Turkish Night

Figures in classical drapery joined in a circle dance on a marble terrace at night, holding each other's little fingers in the Anatolian way, learning the steps and laughing. To one side a seated musician plays a long-necked lute, and a small tray of tulip-shaped tea glasses rests on the balustrade. Sea and dark hills behind. Lower-left is open floor.

### 7a. `stay-xenia.jpg` — Where you'll stay, Temizay Otel

The Homeric rite of guest-friendship: a host kneeling at the threshold of a colonnaded villa, washing the feet of an arriving traveller who is seated and clearly exhausted from a long journey. Beside the traveller stands a modern hard-shell rolling suitcase, upright, handle extended. On a marble side table, a small brass reception bell. Evening light through the columns. Lower-left is threshold stone.

### 7b. `stay-kule-beacon.jpg` — Where you'll stay, Kule Otel

Hestia's kept flame, high above the strait: a keeper standing at the top of a stone tower, tending a great hearth-brazier that burns as a beacon over the darkening water, guiding travellers home. The view is from beside the keeper, looking out over the tower's edge rather than up from the shore. A modern hard-shell rolling suitcase rests at the foot of the tower, below the keeper, handle extended. Figure and brazier upper-right; lower-left is open sky and sea.

_Not part of the prompt: that vantage deliberately differs from Scene 3, which sees a tower from the water. The two must not read as the same view twice._

### 8. Scene 8 uses portraits, not scene artwork

See the portrait pipeline below.

### 9. `closing-cassandra.jpg` — Closing / CTA

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

## Animated loops

Any cinematic scene may carry a moving image instead of a still, gated on file presence — not just the opening (issue #17). See `docs/adr/0006-hero-loop-only-no-scrubbed-video.md`. Most artwork on the site stays still; a scene opts in only once its pair of files actually lands.

Shared rules for every loop, regardless of scene:

- Source: the finished still, animated. Do not generate a different composition.
- 3–4 seconds, **seamless** — the last frame must meet the first. Silent. No camera move: the scroll already moves the frame, and a second movement fights it.
- Deliver `<base>.mp4` and `<base>.webm` into `public/artwork/`, next to the still under the same base name. The still stays as poster and fallback.
- If the loop is not seamless, we ship the still. A visible jump is worse than no motion.

### Producing a loop in Google AI Studio

Use **Veo 3.1**, in the same AI Studio project. Seamlessness is the hard part — a freely generated clip almost never lands back on its opening frame, and a loop that does not is not shipped. Veo 3.1 accepts a first frame *and* a last frame, so hand it the same file twice:

- **First frame**: the finished still, e.g. `public/artwork/opening-trojan-horse.jpg`.
- **Last frame**: that same file again. The clip is then obliged to return to where it began, which is exactly the rule above rather than a lucky take.
- **Prompt**: only what moves, one sentence, taken from the per-scene note below. Do not re-describe the painting — the two frames already carry it.
- **Duration**: 4 seconds.
- **Audio**: the site has no sound. Whatever Veo generates is stripped in the encode.

Veo tops out at 1080p, so a loop is 1920 × 1080 against a 2000 × 1116 still. `object-fit: cover` absorbs that; do not upscale the video to match the still.

Encode both files from the download:

```
ffmpeg -i <veo>.mp4 -an -c:v libx264 -crf 23 -pix_fmt yuv420p -movflags +faststart public/artwork/<name>.mp4
ffmpeg -i <veo>.mp4 -an -c:v libvpx-vp9 -crf 34 -b:v 0 public/artwork/<name>.webm
```

Then watch the join, several times round, before committing. If the last frame does not truly meet the first, the still ships instead.

### The opening — `opening-trojan-horse`

- What moves: clouds drifting, dust in the air, drapery shifting, one delegate still stepping down the ladder. Nothing else. The painting should look alive, not animated.

### Why Çanakkale — `why-hero-leandros`

- What moves: the water, the torch flicker, the swimmer's wake. Nothing else — Leandros himself should read as mid-stroke, not visibly progressing across the strait.

## Real photographs — the venue reveal (issue #20)

A hung painting can carry a real photograph behind it, gated on file presence exactly like a loop (issue #19; mechanism in `lib/realPhoto.ts` / `lib/availability.ts`). It crossfades in as the viewer scrolls past. The mechanism is scene-kind-agnostic — it applies to any non-cinematic hung painting, `diptych` or single `artwork`, not just the scenes below — but only these six are wanted live right now.

- **Filename**: `<same-basename>-real.jpg`, next to the painting's still under `public/artwork/`. No other code change required once the file lands.
- **Source**: an actual photograph of the real venue, not generated art — this is where the site follows through on showing the venues themselves, not just the myth.

### 4a. `venues-homer-recital-real.jpg` — the plenary venue behind The Recital

### 4b. `venues-judgement-of-paris-real.jpg` — the parallel-session venue behind The Choice

### 6a. `evenings-intercultural-real.jpg` — the Intercultural Night venue behind The Table

### 6b. `evenings-turkish-night-real.jpg` — the Turkish Night venue behind The Circle

### 7a. `stay-xenia-real.jpg` — Temizay Otel behind Xenia

### 7b. `stay-kule-beacon-real.jpg` — Kule Otel behind The Beacon

**Do not add `coffee-achilles-real.jpg`.** That scene is non-cinematic and would pick up the reveal automatically the moment the file exists — the coffee-break exclusion (issue #20) is enforced only by withholding the asset, not by any code gate, so nobody should "helpfully" supply one.

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

### Per-portrait corrections

`scripts/generate.mjs portrait <slug> --note "…"` appends one sentence to the template. The template itself is never edited: identical wording across all sixteen is what makes them read as one wall rather than sixteen separately-negotiated paintings.

A note is for where the photograph misleads about the person, and the two that exist earn their place:

- **`furkan-ucar`** — his photograph is taken in a cap, so the model had nothing above the eyebrows and invented ginger hair and a full beard. The note says he is bald.
- **`burcu-ozdemir`** — two things. Her hair is long and curly and every take cropped or tied it; "bare neck" in the template appears to pull that way. And the note asks for light makeup and a becoming light, **which deliberately contradicts the template's "do not idealise, do not beautify"**. That was a decision taken with the host section, not a drift: the unbeautified take read gaunt and older than she is, which is its own kind of unlikeness. Do not quietly revert it — and do not generalise it, because that bolded sentence is still what protects the other fifteen.

A note steers a painting back towards the person. It is not a licence to change someone into somebody else, and it never removes the approval in `docs/adr/0002-ai-generated-oc-portraits.md` — the member sees the finished portrait and says yes, note or no note.

In AI Studio, attach the source photograph to the prompt and set the aspect ratio to 4:5. **Start a fresh chat for each member.** In a continuing chat the previous member's photograph and portrait stay in context, and the next face comes back contaminated by them — which is the one failure a wall of sixteen makes obvious.

### Filenames

`public/portraits/<slug>.png`, where the slug is in `content/oc.ts`. A missing file is handled by the design — the frame renders with a canvas texture and the label still shows — so portraits can arrive one at a time.

### Consent

No portrait goes live before that person has seen their own finished portrait and said yes. Anyone may withdraw at any point; the frame degrades to a plain painted card carrying only their name and role. See `docs/adr/0002-ai-generated-oc-portraits.md`.
