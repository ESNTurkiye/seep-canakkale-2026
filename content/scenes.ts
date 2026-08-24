/**
 * The nine scenes, in scroll order. Each scene is one wall of the museum.
 *
 * `artworks[].src` points at public/artwork/. Missing files render as a painted
 * placeholder of the right proportion, so the site stands up before any image
 * exists. See docs/art-direction.md for the prompt behind each filename.
 */

export type Artwork = {
  src: string
  /** Shown on the museum label, in italics, as a painting title. */
  title: string
  /** The myth being borrowed. Shown on the label beneath the title. */
  myth: string
  alt: string
}

export type Scene = {
  id: string
  kind: 'opening' | 'typographic' | 'artwork' | 'diptych' | 'portraits' | 'closing'
  eyebrow?: string
  headline: string
  body: string
  artworks: Artwork[]
  /**
   * Full scroll choreography (grows to fill the viewport, recedes as it is
   * passed) vs. light movement only — a content decision, not a technical
   * one. See docs/adr/0005-scroll-choreography.md. Only meaningful on a
   * single-artwork `artwork`/`diptych` scene — the opening and closing are
   * always fully choreographed by virtue of their kind (the closing via its
   * own dedicated `ClosingScene`, issue #18), and typographic and portrait
   * scenes have no single painting to choreograph.
   */
  cinematic?: boolean
  /**
   * Whether a cinematic scene recedes back to its hung size after reaching
   * peak (the default, `true` — a gallery walk-past). Set to `false` for a
   * scene that instead holds at peak and hands off to the next scene via the
   * ink-crossfade transition (#15) without receding first — the opening's
   * shape (#14) rather than the standard approach-then-recede. Meaningless
   * unless `cinematic` is also set. See issue #17.
   */
  recede?: boolean
}

export const scenes: Scene[] = [
  {
    id: 'opening',
    kind: 'opening',
    eyebrow: 'South-Eastern European Platform · 15–18 October 2026',
    headline: 'Some delegations arrive unannounced.',
    body: 'SEEP comes to Çanakkale — fifteen countries, one strait, four days.',
    artworks: [
      {
        src: '/artwork/opening-trojan-horse.jpg',
        title: 'The Delegation',
        myth: 'after the Trojan Horse',
        alt: 'Modern travellers with backpacks and suitcases climbing down from the wooden horse of Troy, met by astonished citizens in classical dress.',
      },
    ],
  },
  {
    id: 'this-year',
    kind: 'typographic',
    eyebrow: 'This year',
    headline: 'The largest of the five platforms is coming to the narrowest water in Europe.',
    body: 'Fifteen member countries. Once a year. Hosted by ESN Çanakkale.',
    artworks: [],
  },
  {
    id: 'why-canakkale',
    kind: 'artwork',
    eyebrow: 'Why Çanakkale',
    headline: 'Getting here used to be harder.',
    body: 'A city on both sides of a strait you can see across. Troy an hour south, Assos on the cliffs, Bozcaada an hour by sea, and the Aegean doing what it has always done.',
    cinematic: true,
    recede: false,
    artworks: [
      {
        src: '/artwork/why-hero-leandros.jpg',
        title: 'The Crossing',
        myth: 'after Hero and Leander',
        alt: 'A swimmer crossing the Dardanelles at dawn towards a marble tower, where a woman holds up a phone torch to guide him.',
      },
    ],
  },
  {
    id: 'daytime',
    kind: 'diptych',
    eyebrow: 'Daytime',
    headline: 'Knowledge has always been shared out loud.',
    body: 'Three programme days. Each one opens with a plenary and breaks into parallel sessions — which is where the trouble starts.',
    artworks: [
      {
        src: '/artwork/venues-homer-recital.jpg',
        title: 'The Recital',
        myth: 'after Homer',
        alt: 'Blind Homer reciting on a marble dais to a seated audience, while a scribe transcribes on a laptop.',
      },
      {
        src: '/artwork/venues-judgement-of-paris.jpg',
        title: 'The Choice',
        myth: 'after the Judgement of Paris',
        alt: 'A shepherd holding a golden apple, unable to choose between three goddesses standing before three doorways.',
      },
    ],
  },
  {
    id: 'coffee',
    kind: 'artwork',
    eyebrow: 'Twice a day',
    headline: 'Everyone has a weak spot.',
    body: 'Ours arrives on a brass tray: tea in tulip glasses, Turkish coffee, and peynir helvası you will look up on the way home.',
    artworks: [
      {
        src: '/artwork/coffee-achilles.jpg',
        title: 'The Break',
        myth: "after Achilles' heel",
        alt: 'A hero in bronze greaves sitting on marble steps, ignoring an arrow at his heel, holding a tulip glass of tea and reaching for a tray of sweets.',
      },
    ],
  },
  {
    id: 'evenings',
    kind: 'diptych',
    eyebrow: 'Evenings',
    headline: 'Resistance is traditional.',
    body: 'Intercultural Night, where fifteen countries put their food on one table. Turkish Night, where the host section returns the favour.',
    artworks: [
      {
        src: '/artwork/evenings-intercultural.jpg',
        title: 'The Table',
        myth: 'after the Sirens',
        alt: 'A long marble banquet table above the sea at dusk, figures from many lands passing dishes, two sirens singing unheeded from a balustrade.',
      },
      {
        src: '/artwork/evenings-turkish-night.jpg',
        title: 'The Circle',
        myth: 'after the Anatolian round dance',
        alt: 'Figures in classical drapery dancing in a linked circle on a marble terrace at night, a lute player and a tray of tea glasses beside them.',
      },
    ],
  },
  {
    id: 'stay',
    kind: 'artwork',
    eyebrow: 'Where you will stay',
    headline: 'Hospitality was a sacred duty here long before it was an industry.',
    body: 'Beds, breakfast and a short walk to everything. The Greeks had a word for the rest of it.',
    artworks: [
      {
        src: '/artwork/stay-xenia.jpg',
        title: 'Xenia',
        myth: 'after the Homeric rite of guest-friendship',
        alt: 'A host kneeling to wash the feet of an arriving traveller at a colonnaded threshold, a modern rolling suitcase standing beside them.',
      },
    ],
  },
  {
    id: 'committee',
    kind: 'portraits',
    eyebrow: 'The Organising Committee',
    headline: 'Sixteen people are expecting you.',
    body: 'ESN Çanakkale has been building this since long before you read about it.',
    artworks: [],
  },
  {
    id: 'closing',
    kind: 'closing',
    eyebrow: 'Applications',
    headline: 'We did warn you.',
    body: 'Places are allocated to sections, and there are never enough of them. Nobody believed her either.',
    artworks: [
      {
        src: '/artwork/closing-cassandra.jpg',
        title: 'The Warning',
        myth: 'after Cassandra',
        alt: 'Cassandra on the walls of Troy, arm outstretched to a crowd turning away, a phone at her side showing an almost-full bar.',
      },
    ],
  },
]

for (const scene of scenes) {
  const singleArtworkRequired = scene.cinematic || scene.kind === 'opening' || scene.kind === 'closing'
  if (singleArtworkRequired && scene.artworks.length !== 1) {
    throw new Error(
      `Scene "${scene.id}" needs exactly one artwork but has ${scene.artworks.length} — its scene ` +
        `component (OpeningScene/EnteringScene/ClosingScene) renders only the first, and ` +
        `app/page.tsx reads artworks[0] directly.`,
    )
  }
  if (scene.cinematic !== undefined && (scene.kind === 'opening' || scene.kind === 'closing')) {
    throw new Error(
      `Scene "${scene.id}" sets \`cinematic\` but is kind "${scene.kind}" — that kind is always fully ` +
        `choreographed via its own dedicated component, so \`cinematic\` is meaningless (and ignored by ` +
        `app/page.tsx's dispatch) there.`,
    )
  }
  if (scene.recede !== undefined && !scene.cinematic) {
    throw new Error(`Scene "${scene.id}" sets \`recede\` but isn't cinematic — \`recede\` is meaningless there.`)
  }
}

const lastScene = scenes[scenes.length - 1]
if (lastScene.recede === false) {
  throw new Error(
    `Scene "${lastScene.id}" is the last scene and sets \`recede: false\` — it would crossfade to ` +
      `ink with no next scene to hand off to.`,
  )
}
