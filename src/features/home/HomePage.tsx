import { Link } from 'react-router-dom'
import { Leaf, Sprout, Check } from 'lucide-react'
import { modules } from '../../data/modules'
export function HomePage() {
  return <div className="page-container">
    <div className="section-eyebrow"><Sprout size={16} aria-hidden="true" /> EDUCACIÓN AMBIENTAL · UAM</div>
    <section className="welcome-panel" aria-labelledby="home-title">
      <div className="welcome-copy"><span className="small-label">BIENVENIDO A ECOUAM</span><h1 id="home-title">Conoce y cuida<br />nuestros <em>espacios verdes.</em></h1><p>Un espacio para conectar con el entorno de la UAM, aprender sobre su naturaleza y construir una comunidad más consciente.</p><a className="button-primary" href="#secciones">Conocer las secciones</a></div>
      <div className="nature-mark" aria-hidden="true"><div className="nature-circle"><Leaf size={150} strokeWidth={0.8} /></div><span className="nature-caption">CONOCER · VALORAR · CUIDAR</span></div>
    </section>
    <section className="phase-note" aria-label="Estado del proyecto"><span className="phase-icon"><Check size={20} aria-hidden="true" /></span><div><h2>Estamos sembrando las bases</h2><p>Esta primera versión permite recorrer las secciones. Su contenido se incorporará por fases, con información y fuentes verificadas.</p></div><span className="phase-badge">Fase 1</span></section>
    <section id="secciones" aria-labelledby="sections-title"><div className="section-heading"><div><span className="small-label">UN ENTORNO POR DESCUBRIR</span><h2 id="sections-title">Explora EcoUAM</h2></div><span className="section-hint">Contenido en preparación</span></div><div className="module-grid">{modules.slice(1, 7).map(({ path, label, description, icon: Icon }) => <Link className="module-card" to={path} key={path}><span className="module-icon"><Icon size={25} strokeWidth={1.6} aria-hidden="true" /></span><h3>{label}</h3><p>{description}</p><span className="card-status">Próximamente</span></Link>)}</div></section>
    <div className="project-note"><Sprout size={24} aria-hidden="true" /><p>EcoUAM complementa las iniciativas de UAM Verde desde un proyecto académico independiente.</p><Link to="/fuentes">Fuentes y créditos</Link></div>
  </div>
}
