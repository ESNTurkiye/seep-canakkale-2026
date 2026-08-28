import type { Scene } from '@/content/scenes'
import { oc } from '@/content/oc'
import { event } from '@/content/event'
import { HungPainting } from './HungPainting'
import { StraitMap } from './StraitMap'
import s from './museum.module.css'

/** The rest between walls: no artwork, one statement, one green rule. */
export function StatementScene({ scene }: { scene: Scene }) {
  return (
    <section className={s.statement} aria-label={scene.headline}>
      <div className={s.statementInner}>
        <p className="eyebrow">{scene.eyebrow}</p>
        <div className={s.rule} />
        <h2 className={s.statementHeadline}>{scene.headline}</h2>
        <div className={s.statementAside}>
          {scene.chart === 'strait' ? <StraitMap /> : null}
          <p className={s.statementBody}>{scene.body}</p>
        </div>
      </div>
    </section>
  )
}

/** One or two paintings hung on the wall, each with its gallery label. */
export function GalleryScene({
  scene,
  availability,
  realPhotoAvailability,
}: {
  scene: Scene
  availability: Record<string, boolean>
  /** See issue #19 — resolved at build time in app/page.tsx, like `availability`. */
  realPhotoAvailability: Record<string, boolean>
}) {
  return (
    <section className={s.gallery} aria-label={scene.headline}>
      <div className={s.galleryHead}>
        <p className="eyebrow">{scene.eyebrow}</p>
        <h2 className={s.galleryHeadline}>{scene.headline}</h2>
        <p className={s.galleryBody}>{scene.body}</p>
      </div>

      <div className={`${s.hang} ${scene.artworks.length > 1 ? s.hangTwo : ''}`}>
        {scene.artworks.map((artwork) => (
          <HungPainting
            key={artwork.src}
            artwork={artwork}
            available={availability[artwork.src] ?? false}
            realPhotoAvailable={realPhotoAvailability[artwork.src] ?? false}
          />
        ))}
      </div>
    </section>
  )
}

/** Sixteen portraits, hung as one wall. */
export function PortraitWall({
  scene,
  availability,
}: {
  scene: Scene
  availability: Record<string, boolean>
}) {
  return (
    <section className={s.gallery} aria-label={scene.headline}>
      <div className={s.galleryHead}>
        <p className="eyebrow">{scene.eyebrow}</p>
        <h2 className={s.galleryHeadline}>{scene.headline}</h2>
        <p className={s.galleryBody}>{scene.body}</p>
      </div>

      <ul className={s.portraitWall}>
        {oc.map((member) => {
          const src = `/portraits/${member.slug}.png`
          const available = availability[src] ?? false
          return (
            <li key={member.slug} className={s.portrait}>
              <div className={s.portraitFrame}>
                {available ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={`${member.name}, ${member.role}`} />
                ) : (
                  <span className={s.portraitAwaiting}>Sitting</span>
                )}
              </div>
              <div>
                <p className={s.portraitName}>{member.name}</p>
                <p className={s.portraitRole}>{member.role}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function Footer() {
  return (
    <footer className={s.footer}>
      <p>
        {event.name} · {event.dateLabel} · {event.city}, {event.country}
      </p>
      <p>
        Hosted by {event.hostSection} for the {event.platform}.
      </p>
      {/* A licence condition of the ODbL data behind the strait chart, not a
          courtesy — see scripts/derive-strait.mjs. Do not drop it. */}
      <p className={s.footerCredit}>
        Coastline data ©{' '}
        <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ODbL.
      </p>
    </footer>
  )
}
