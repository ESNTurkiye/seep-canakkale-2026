import { strait } from '@/content/strait'
import s from './museum.module.css'

/**
 * The Dardanelles as an engraved-chart hairline, hung on the "This Year" wall
 * where a painting would be. It is not decoration: the headline claims
 * Çanakkale sits on the narrowest water in Europe, and this shows the crossing
 * and the figure that backs it. Both come from real coastline geometry — see
 * `scripts/derive-strait.mjs`, which measures the narrows rather than quoting
 * a number, so the label cannot drift away from the drawing.
 *
 * A server component: nothing here moves, and the geometry is baked at build
 * time into `content/strait.ts`.
 */
export function StraitMap() {
  const { viewBox, width, height, coast, narrows, canakkale } = strait

  /**
   * The crossing is 1.4 km across a 53 km view — 26 of 1000 units, a handful of
   * pixels at any sane render size. So it is annotated the way a chart annotates
   * a measurement it cannot draw to scale: end ticks to say exactly which water,
   * and a leader out to the figure itself. Drawing it any thicker would be
   * drawing a strait that isn't there.
   */
  const midX = (narrows.x1 + narrows.x2) / 2
  const midY = (narrows.y1 + narrows.y2) / 2
  const dx = narrows.x2 - narrows.x1
  const dy = narrows.y2 - narrows.y1
  const len = Math.hypot(dx, dy)
  const TICK = 16
  const [tx, ty] = [(-dy / len) * TICK, (dx / len) * TICK]

  /**
   * Where the figure sits, in viewBox units: inland on the Gelibolu side, so
   * its leader runs away from the city mark instead of tangling with it. The
   * two annotations answer different questions and sit on opposite shores.
   */
  const LABEL = { x: 238, y: 752 }

  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`
  const at = (x: number, y: number) => ({ left: pct(x, width), top: pct(y, height) })

  return (
    <figure className={s.strait}>
      <svg className={s.straitSvg} viewBox={viewBox} aria-hidden="true">
        <path className={s.straitCoast} d={coast} />
        <line className={s.straitLeader} x1={midX} y1={midY} x2={LABEL.x} y2={LABEL.y} />
        <line className={s.straitNarrows} x1={narrows.x1} y1={narrows.y1} x2={narrows.x2} y2={narrows.y2} />
        <line
          className={s.straitNarrows}
          x1={narrows.x1 - tx}
          y1={narrows.y1 - ty}
          x2={narrows.x1 + tx}
          y2={narrows.y1 + ty}
        />
        <line
          className={s.straitNarrows}
          x1={narrows.x2 - tx}
          y1={narrows.y2 - ty}
          x2={narrows.x2 + tx}
          y2={narrows.y2 + ty}
        />
      </svg>

      {/* Marks and type sit in HTML, not SVG, so they keep the site's type
          scale instead of being scaled by the viewBox along with the coastline. */}
      <span className={s.straitDot} style={at(canakkale.x, canakkale.y)} />
      <span className={s.straitCity} style={at(canakkale.x, canakkale.y)}>
        Çanakkale
      </span>
      <span className={s.straitGap} style={at(LABEL.x, LABEL.y)}>
        {narrows.km.toFixed(1).replace('.', ',')} km
      </span>

      <figcaption className={s.straitCaption}>
        The Dardanelles at its narrowest, between Kilitbahir and Çanakkale.
      </figcaption>
    </figure>
  )
}
