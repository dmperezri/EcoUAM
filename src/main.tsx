import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import { PwaUpdates } from './components/PwaUpdates'
import './styles/index.css'
import './styles/nature.css'
import './styles/nature-sections.css'
createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><App /></BrowserRouter><PwaUpdates /></StrictMode>)
