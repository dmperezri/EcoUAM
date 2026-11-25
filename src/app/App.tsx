import { Routes, Route, Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { HomePage } from '../features/home/HomePage'
import { PlaceholderPage } from '../features/placeholder/PlaceholderPage'
import { SourcesPage } from '../features/sources/SourcesPage'
import { modules } from '../data/modules'
export function App() { return <Routes><Route element={<Layout />}><Route index element={<HomePage />} />{modules.filter(m => m.path !== '/' && m.path !== '/fuentes').map(module => <Route path={module.path} key={module.path} element={<PlaceholderPage module={module} />} />)}<Route path="/fuentes" element={<SourcesPage />} /><Route path="*" element={<div className="page-container"><h1 className="page-title">Página no encontrada</h1><p className="page-description">Esta dirección no forma parte de EcoUAM.</p><Link className="button-primary" to="/">Volver al inicio</Link></div>} /></Route></Routes> }
