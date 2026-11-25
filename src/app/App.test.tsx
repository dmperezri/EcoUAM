import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { App } from './App'
import { modules } from '../data/modules'
const setup = (path = '/') => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
describe('Navegación de EcoUAM', () => {
 it('incluye las nueve secciones y una portada sin datos inventados', () => { setup(); const nav = screen.getByRole('navigation', { name: 'Navegación principal' }); expect(within(nav).getAllByRole('link')).toHaveLength(9); expect(screen.getByRole('heading', {level:1})).toHaveTextContent('Conoce y cuida'); expect(screen.getByText('Estamos sembrando las bases')).toBeVisible() })
 it('abre el menú, navega y lo cierra', async () => { const user = userEvent.setup(); setup(); await user.click(screen.getByRole('button', {name:'Abrir menú'})); expect(screen.getByRole('button', {name:'Cerrar menú'})).toHaveAttribute('aria-expanded','true'); await user.click(within(screen.getByRole('navigation')).getByRole('link', {name:'Mapa del campus'})); expect(screen.getByRole('heading', {level:1})).toHaveTextContent('Mapa del campus'); expect(screen.getByRole('button', {name:'Abrir menú'})).toHaveAttribute('aria-expanded','false'); expect(screen.getByText(/Pendiente de recibir y digitalizar/)).toBeVisible() })
 it('cierra el menú con Escape y devuelve el foco', async () => { const user=userEvent.setup();setup();await user.click(screen.getByRole('button',{name:'Abrir menú'}));await user.keyboard('{Escape}');expect(screen.getByRole('button',{name:'Abrir menú'})).toHaveFocus() })
 for (const module of modules.filter(m=>'pending' in m)) it(`mantiene ${module.label} como pendiente`, () => { setup(module.path); expect(screen.getByRole('heading',{level:1})).toHaveTextContent(module.label);expect(screen.getByText('Módulo pendiente')).toBeVisible() })
 it('expone las tres fuentes y el carácter independiente', () => { setup('/fuentes'); expect(screen.getAllByRole('link',{name:/Consultar fuente/})).toHaveLength(3);expect(screen.getByText(/No representa una aplicación oficial/)).toBeVisible() })
 it('maneja direcciones inexistentes', () => { setup('/no-existe');expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Página no encontrada') })
})
