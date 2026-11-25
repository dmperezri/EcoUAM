import type { CSSProperties } from 'react'

const images = {
  sendero: { x: 29, y: 68, width: 666, height: 408, fullWidth: 1466 },
  arboretum: { x: 761, y: 35, width: 665, height: 407, fullWidth: 1437 },
  chilamate: { x: 38, y: 56, width: 665, height: 380, fullWidth: 1481 },
  'jaguar-jungle': { x: 764, y: 54, width: 665, height: 379, fullWidth: 1452 },
} as const

export function NaturePhoto({ photo }: { photo: keyof typeof images }) {
  const image = images[photo]
  const style = {
    '--photo-ratio': image.width / image.height,
    '--photo-width': image.fullWidth / image.width * 100 + '%',
    '--photo-left': -image.x / image.width * 100 + '%',
    '--photo-top': -image.y / image.height * 100 + '%',
  } as CSSProperties
  return (
    <div className="nature-photo" style={style} aria-hidden="true">
      <div className="nature-photo-plane"><img src={`/album-uam/${photo}.png`} alt="" /></div>
    </div>
  )
}
