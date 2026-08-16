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
   * one. See docs/adr/0005-scroll-choreography.md.
   */
  cinematic?: boolean
}

export const scenes: Scene[] = [
  {
    id: 'opening',
    kind: 'opening',
    eyebrow: 'South-Eastern European Platform · 15–18 October 2026',
    headline: 'Some delegations arrive unannounced.',
    body: 'SEEP comes to Çanakkale — fifteen countries, one strait, four days.',
    cinematic: true,
    artworks: [
      {
        src: '/artwork/opening-trojan-horse.png',
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
    artworks: [
      {
        src: '/artwork/why-hero-leandros.png',
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
        src: '/artwork/venues-homer-recital.png',
        title: 'The Recital',
        myth: 'after Homer',
        alt: 'Blind Homer reciting on a marble dais to a seated audience, while a scribe transcribes on a laptop.',
      },
      {
        src: '/artwork/venues-judgement-of-paris.png',
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
        src: '/artwork/coffee-achilles.png',
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
        src: '/artwork/evenings-intercultural.png',
        title: 'The Table',
        myth: 'after the Sirens',
        alt: 'A long marble banquet table above the sea at dusk, figures from many lands passing dishes, two sirens singing unheeded from a balustrade.',
      },
      {
        src: '/artwork/evenings-turkish-night.png',
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
        src: '/artwork/stay-xenia.png',
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
    cinematic: true,
    artworks: [
      {
        src: '/artwork/closing-cassandra.png',
        title: 'The Warning',
        myth: 'after Cassandra',
        alt: 'Cassandra on the walls of Troy, arm outstretched to a crowd turning away, a phone at her side showing an almost-full bar.',
      },
    ],
  },
]
