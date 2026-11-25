import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { HomePage } from '../features/home/HomePage'
import { Arboretum, CampusMap } from '../features/campus/Campus'
import { PlaceholderPage } from '../features/placeholder/PlaceholderPage'
import { GamesPage } from '../features/games/GamesPage'
import { WeatherPage } from '../features/weather/WeatherPage'
import { SourcesPage } from '../features/sources/SourcesPage'
import { modules } from '../data/modules'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/mapa" element={<div className="page-container"><CampusMap /></div>} />
        <Route path="/areas-verdes" element={<div className="page-container"><Arboretum /></div>} />
        {modules.filter((module) => 'pending' in module).map((module) => (
          <Route path={module.path} key={module.path} element={<PlaceholderPage module={module} />} />
        ))}
        <Route path="/minijuegos" element={<GamesPage />} />
        <Route path="/cuestionario" element={<Navigate to="/minijuegos" replace />} />
        <Route path="/clima" element={<WeatherPage />} />
        <Route path="/fuentes" element={<SourcesPage />} />
        <Route path="*" element={
          <div className="page-container">
            <h1 className="page-title">Página no encontrada</h1>
            <p className="page-description">Esta dirección no forma parte de EcoUAM.</p>
            <Link className="button-primary" to="/">Volver al inicio</Link>
          </div>
        } />
      </Route>
    </Routes>
  )
}
