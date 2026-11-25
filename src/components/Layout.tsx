import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Leaf, Menu, X } from 'lucide-react'
import { modules } from '../data/modules'
import { Brand } from './Brand'

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const menuButton = useRef<HTMLButtonElement>(null)
  const main = useRef<HTMLElement>(null)
  const previousPath = useRef(location.pathname)
  useEffect(() => {
    setMenuOpen(false)
    if (previousPath.current !== location.pathname) {
      main.current?.focus()
      window.scrollTo({ top: 0, behavior: 'instant' })
      previousPath.current = location.pathname
    }
    const current = modules.find(m => m.path === location.pathname)
    document.title = `${current?.label ?? 'Página no encontrada'} · EcoUAM`
  }, [location.pathname])
  useEffect(() => {
    if (!menuOpen) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus() } }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [menuOpen])
  return <div className="app-shell">
    <a href="#contenido" className="skip-link">Saltar al contenido</a>
    <header className="mobile-header"><NavLink to="/" aria-label="EcoUAM, inicio"><Brand /></NavLink><button ref={menuButton} className="menu-button" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} aria-controls="navegacion" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></header>
    <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
      <NavLink className="desktop-brand" to="/" aria-label="EcoUAM, inicio"><Brand /></NavLink>
      <p className="nav-caption">EXPLORA ECOUAM</p>
      <nav id="navegacion" aria-label="Navegación principal">{modules.map(({ path, label, icon: Icon }) => <NavLink key={path} to={path} end={path === '/'} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}><Icon size={20} aria-hidden="true" /><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-note"><Leaf size={20} aria-hidden="true" /><p>Un campus que conocemos.<br /><strong>Un entorno que cuidamos.</strong></p><span>Proyecto académico independiente</span></div>
    </aside>
    <div className="main-column"><div className="topline"><span>Universidad Americana <span className="topline-place">/ Managua, Nicaragua</span></span><span className="phase-badge">Versión inicial</span></div>
      <main id="contenido" ref={main} tabIndex={-1}><Outlet /></main>
      <footer><span>EcoUAM · Conoce y cuida nuestros espacios verdes.</span><span>Proyecto académico independiente. No es una aplicación oficial de la UAM.</span></footer>
    </div>
  </div>
}
