import { scenes } from '@/content/scenes'
import { imageAvailability, videoAvailable, realPhotoAvailable, frameAvailable } from '@/lib/availability'
import { Curtain } from '@/components/Curtain'
import { OpeningScene } from '@/components/OpeningScene'
import { EnteringScene } from '@/components/EnteringScene'
import { ClosingScene } from '@/components/ClosingScene'
import { StatementScene, GalleryScene, PortraitWall, Footer } from '@/components/Scenes'

export default function Home() {
  const availability = imageAvailability()
  const realPhotoAvailability = Object.fromEntries(
    scenes.flatMap((scene) => scene.artworks.map((artwork) => [artwork.src, realPhotoAvailable(artwork.src)])),
  )

  const frames = frameAvailable()

  // One flag for the whole page rather than per painting: every frame on the
  // site switches together or not at all (issue #12).
  return (
    <main data-frames={frames ? '' : undefined}>
      {/* Held over the opening until the opening is worth looking at — the
          still, the frame it hangs in and the faces the headline is set in.
          Issue #26. */}
      <Curtain
        stillSrc={scenes[0].artworks[0].src}
        frameSrc={frames ? '/frames/landscape.png' : null}
      />
      {scenes.map((scene) => {
        switch (scene.kind) {
          case 'opening':
            return (
              <OpeningScene
                key={scene.id}
                scene={scene}
                available={availability[scene.artworks[0].src] ?? false}
                videoAvailable={videoAvailable(scene.artworks[0].src)}
              />
            )
          case 'typographic':
            return <StatementScene key={scene.id} scene={scene} />
          case 'portraits':
            return <PortraitWall key={scene.id} scene={scene} availability={availability} />
          case 'closing':
            return (
              <ClosingScene
                key={scene.id}
                scene={scene}
                available={availability[scene.artworks[0].src] ?? false}
                videoAvailable={videoAvailable(scene.artworks[0].src)}
              />
            )
          default:
            return scene.cinematic ? (
              <EnteringScene
                key={scene.id}
                scene={scene}
                availability={availability}
                videoAvailable={videoAvailable(scene.artworks[0].src)}
              />
            ) : (
              <GalleryScene
                key={scene.id}
                scene={scene}
                availability={availability}
                realPhotoAvailability={realPhotoAvailability}
              />
            )
        }
      })}
      <Footer />
    </main>
  )
}
