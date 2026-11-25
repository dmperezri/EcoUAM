import { Link } from 'react-router-dom'
import { Construction } from 'lucide-react'
import type { Module } from '../../data/modules'
export function PlaceholderPage({ module }: { module: Module }) {
 const Icon = module.icon
 return <div className="page-container"><div className="section-eyebrow"><Icon size={17} aria-hidden="true" /> ECOUAM EN DESARROLLO</div><h1 className="page-title">{module.label}</h1><p className="page-description">{module.description}</p><section className="empty-panel"><span className="empty-icon"><Construction size={32} aria-hidden="true" /></span><span className="phase-badge">Módulo pendiente</span><h2>Este espacio está por crecer</h2><p>{'pending' in module ? module.pending : 'Contenido pendiente de preparación.'}</p><p className="empty-detail">La navegación está disponible. La funcionalidad de esta sección llegará en una próxima fase.</p><Link className="button-secondary" to="/">Volver al inicio</Link></section></div>
}
