import { Map, MapPin, Trees } from 'lucide-react'
import { NaturePhoto } from '../../components/NaturePhoto'
import { NatureSectionHeader } from '../../components/NatureSectionHeader'
import { GreenAreaCards } from './GreenAreaCards'
import './green-areas.css'
import { Link, useSearchParams } from 'react-router-dom'

const points = [
  { id: 'entrada-principal', name: 'Entrada principal', x: 21, y: 85, detail: 'Acceso señalado en el borde inferior del plano.' },
  { id: 'plaza-central', name: 'Plaza Central', x: 30, y: 62, detail: 'Entre el edificio K y los edificios E y G.' },
  { id: 'estacion-meteorologica', name: 'Estación meteorológica', x: 15.4, y: 22.4, detail: 'Junto al edificio Copérnico (P), cerca del tercer acceso.' },
]

export function CampusMap() {
  const [params, setParams] = useSearchParams()
  const selected = points.find((point) => point.id === params.get('punto')) ?? points[0]

  function selectPoint(id: string) {
    const next = new URLSearchParams(params)
    next.set('punto', id)
    setParams(next, { replace: true, preventScrollReset: true })
  }

  return (
    <section className="campus-section">
      <NatureSectionHeader title="Mapa del campus" icon={Map}
        description="Selecciona un punto de referencia en el plano o en la lista."
        artwork={<NaturePhoto photo="sendero" />} />
      <div className="campus-grid">
        <figure className="map-glass nature-glass">
          <div className="campus-plan">
            <img src="/plano-campus-render.png" width="1448" height="1086" alt="Plano ilustrado del campus UAM con edificios, canchas y accesos. El norte apunta hacia abajo, como en el plano original." />
            {points.map((point, index) => (
              <button key={point.name} type="button" className="map-pin"
                style={{ left: point.x + '%', top: point.y + '%' }}
                aria-label={point.name} aria-pressed={selected === point} onClick={() => selectPoint(point.id)}>
                {index + 1}
              </button>
            ))}
          </div>
          <figcaption>Render basado en el plano de la UAM. Los marcadores son aproximados y algunos rótulos del render difieren del original.</figcaption>
        </figure>
        <div className="map-guide nature-glass">
          <h2><MapPin size={20} aria-hidden="true" /> Puntos de referencia</h2>
          <ol className="map-list">
            {points.map((point, index) => (
              <li key={point.name}>
                <button type="button" aria-pressed={selected === point} onClick={() => selectPoint(point.id)}>
                  <span className="map-number" aria-hidden="true">{index + 1}</span> {point.name}
                </button>
              </li>
            ))}
          </ol>
          <p className="map-detail" aria-live="polite"><strong>{selected.name}</strong><br />{selected.detail}</p>
          <Link className="arboretum-link" to="/areas-verdes">Ver arboretum y fichas</Link>
        </div>
      </div>
    </section>
  )
}

export function Arboretum() {
  return (
    <section className="campus-section">
      <NatureSectionHeader title="Áreas verdes" icon={Trees}
        description="Descubre los árboles del arboretum, los senderos y otros rincones verdes de la UAM."
        artwork={<NaturePhoto photo="arboretum" />} />
      <figure className="arboretum-map"><h2 className="mb-2 text-xl font-semibold">Mapa del arboretum de la UAM</h2>
        <a href="/mapa-arboretum.png" target="_blank" rel="noreferrer">
          <img src="/mapa-arboretum.png" width="715" height="523" alt="Abrir en otra pestaña el mapa del arboretum con sus tres áreas y su leyenda" />
        </a>
        <figcaption>Revisión cartográfica del arboretum · Emilio Romero, INAFOR, agosto de 2024. Texto de contexto basado en la nota institucional de la UAM sobre su inventario de especies arbóreas.</figcaption>
      </figure>
      <GreenAreaCards />
      <Link className="arboretum-link" to="/mapa">Volver al mapa del campus</Link>
    </section>
  )
}
