import { Link } from 'react-router-dom'
import { CloudSun, Gamepad2, MapPin, Trees } from 'lucide-react'
import { modules } from '../../data/modules'
import { NaturePhoto } from '../../components/NaturePhoto'

const features = [
  { path: '/areas-verdes', title: 'Áreas verdes', description: 'Senderos, árboles y rincones del campus.', icon: Trees, photo: 'arboretum' },
  { path: '/clima', title: 'Clima en la UAM', description: 'Pronóstico de Managua y boletín del campus.', icon: CloudSun, photo: 'jaguar-jungle' },
  { path: '/minijuegos', title: 'Minijuegos ambientales', description: 'Acompaña a Jaguarcín por el sendero verde.', icon: Gamepad2 },
] as const

export function HomePage() {
  return (
    <div className="page-container nature-page nature-home">
      <section className="nature-hero" aria-labelledby="nature-home-title">
        <NaturePhoto photo="sendero" />
        <div className="nature-hero-shade" />
        <div className="nature-hero-content">
          <p className="nature-location"><MapPin size={17} aria-hidden="true" /> Universidad Americana · Managua</p>
          <h1 id="nature-home-title">Conoce y cuida <span>nuestros espacios verdes.</span></h1>
          <p className="nature-intro">Recorre los senderos de la UAM y descubre la vida que crece entre sus aulas.</p>
          <Link className="nature-cta" to="/mapa"><MapPin size={19} aria-hidden="true" /> Explorar el campus</Link>
        </div>
        <p className="nature-image-credit">Sendero Ecológico · Jennifer Letizia Sequeira Verbis, álbum UAM Verde</p>
      </section>

      <section aria-labelledby="nature-explore-title" className="nature-explore">
        <h2 id="nature-explore-title">Explora EcoUAM</h2>
        <div className="nature-feature-grid">
          {features.map((feature) => (
            <Link className="nature-feature nature-glass" to={feature.path} key={feature.path}>
              <div className="nature-feature-art">
                {'photo' in feature
                  ? <NaturePhoto photo={feature.photo} />
                  : <img src="/games/jaguarcin-pixel.png" alt="" />}
              </div>
              <div className="nature-feature-copy">
                <feature.icon size={19} aria-hidden="true" />
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="nature-more nature-glass" aria-label="Más secciones">
          {modules.filter(({ path }) => path !== '/' && !features.some((feature) => feature.path === path))
            .map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}><Icon size={18} aria-hidden="true" /> {label}</Link>
            ))}
        </div>
      </section>
    </div>
  )
}
