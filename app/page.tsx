import { scenes } from '@/content/scenes'
import { imageAvailability } from '@/lib/availability'
import { OpeningScene } from '@/components/OpeningScene'
import { StatementScene, GalleryScene, PortraitWall, Footer } from '@/components/Scenes'

export default function Home() {
  const availability = imageAvailability()

  return (
    <main>
      {scenes.map((scene) => {
        switch (scene.kind) {
          case 'opening':
            return (
              <OpeningScene
                key={scene.id}
                scene={scene}
                available={availability[scene.artworks[0].src] ?? false}
              />
            )
          case 'typographic':
            return <StatementScene key={scene.id} scene={scene} />
          case 'portraits':
            return <PortraitWall key={scene.id} scene={scene} availability={availability} />
          default:
            return <GalleryScene key={scene.id} scene={scene} availability={availability} />
        }
      })}
      <Footer />
    </main>
  )
}
