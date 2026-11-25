import { useRegisterSW } from 'virtual:pwa-register/react'
export function PwaUpdates() {
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW()
  if (!needRefresh) return null
  return <aside className="pwa-notice" aria-label="Actualización disponible"><p>Hay una nueva versión de EcoUAM.</p><div className="flex flex-wrap gap-3"><button className="button-primary" onClick={() => void updateServiceWorker(true)}>Actualizar</button><button className="button-secondary" onClick={() => setNeedRefresh(false)}>Más tarde</button></div></aside>
}
