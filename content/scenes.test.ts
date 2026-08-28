import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { scenes } from './scenes.ts'

// app/page.tsx's switch sends every scene whose kind isn't 'opening',
// 'typographic', 'portraits' or 'closing' through either EnteringScene
// (cinematic) or GalleryScene (not) — and only GalleryScene threads
// realPhotoAvailability into HungPainting. These four artworks (issue #20)
// depend on landing in that non-cinematic branch; this pins the routing so a
// future scenes.ts edit can't silently drop the reveal.
const VENUE_SRCS = [
  '/artwork/venues-homer-recital.jpg',
  '/artwork/venues-judgement-of-paris.jpg',
  '/artwork/evenings-intercultural.jpg',
  '/artwork/evenings-turkish-night.jpg',
]

describe('venue artworks route through GalleryScene (issue #20)', () => {
  for (const src of VENUE_SRCS) {
    test(`${src} sits in a non-cinematic 'artwork' or 'wall' scene`, () => {
      const scene = scenes.find((s) => s.artworks.some((a) => a.src === src))
      assert.ok(scene, `no scene contains ${src}`)
      assert.ok(
        scene.kind === 'artwork' || scene.kind === 'wall',
        `scene "${scene.id}" has kind "${scene.kind}" — not routed to GalleryScene`,
      )
      assert.ok(!scene.cinematic, `scene "${scene.id}" is cinematic — routed to EnteringScene instead`)
    })
  }
})
