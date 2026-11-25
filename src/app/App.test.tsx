import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { App } from './App'
import { modules } from '../data/modules'
import { levels } from '../features/games/platformLevels'
beforeEach(() => { vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null) })
afterEach(() => vi.restoreAllMocks())
const setup = (path = '/') => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
describe('Navegación de EcoUAM', () => {
 it('incluye las nueve secciones y una portada sin datos inventados', () => { setup(); const nav = screen.getByRole('navigation', { name: 'Navegación principal' }); expect(within(nav).getAllByRole('link')).toHaveLength(9); expect(screen.getByRole('heading', {level:1})).toHaveTextContent('Conoce y cuida'); expect(screen.getByRole('link', { name: 'Explorar el campus' })).toBeVisible() })
 it('abre el menú, navega y lo cierra', async () => { const user = userEvent.setup(); setup(); await user.click(screen.getByRole('button', {name:'Abrir menú'})); expect(screen.getByRole('button', {name:'Cerrar menú'})).toHaveAttribute('aria-expanded','true'); await user.click(within(screen.getByRole('navigation')).getByRole('link', {name:'Mapa del campus'})); expect(screen.getByRole('heading', {level:1})).toHaveTextContent('Mapa del campus'); expect(screen.getByRole('button', {name:'Abrir menú'})).toHaveAttribute('aria-expanded','false'); await user.click(within(screen.getByRole('list')).getByRole('button', {name:'Estación meteorológica'})); expect(screen.getByText(/Junto al edificio Copérnico/)).toBeVisible() })
 it('cierra el menú con Escape y devuelve el foco', async () => { const user=userEvent.setup();setup();await user.click(screen.getByRole('button',{name:'Abrir menú'}));await user.keyboard('{Escape}');expect(screen.getByRole('button',{name:'Abrir menú'})).toHaveFocus() })
 for (const module of modules.filter(m=>'pending' in m)) it(`mantiene ${module.label} como pendiente`, () => { setup(module.path); expect(screen.getByRole('heading',{level:1})).toHaveTextContent(module.label);expect(screen.getByText('Módulo pendiente')).toBeVisible() })
 it('expone las tres fuentes y el carácter independiente', () => { setup('/fuentes'); expect(screen.getAllByRole('link',{name:/Consultar fuente/})).toHaveLength(3);expect(screen.getByText(/No representa una aplicación oficial/)).toBeVisible() })
 it('maneja direcciones inexistentes', () => { setup('/no-existe');expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Página no encontrada') })
})


it('muestra las fichas desde el mapa y distingue la foto histórica de Plaza Chilamate', async () => {
  const user = userEvent.setup()
  setup('/mapa')
  await user.click(screen.getByRole('link', { name: 'Ver arboretum y fichas' }))
  expect(screen.getAllByRole('article')).toHaveLength(4)
  const plaza = screen.getByRole('heading', { name: 'Plaza Chilamate' }).closest('article')!
  expect(within(plaza).getByText('Foto histórica')).toBeVisible()
  expect(within(plaza).getByText(/se renovó la plaza/)).toBeVisible()
})
it('enlaza el boletín oficial y selecciona Copérnico desde Clima', async () => {
  const user = userEvent.setup()
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Sin conexión'))
  setup('/clima')
  expect(screen.getByRole('link', { name: 'Consultar boletín oficial' })).toHaveAttribute('href', 'https://www.uam.edu.ni/boletin-meteorologico-uam/')
  await user.click(screen.getByRole('link', { name: 'Ubicar la estación en el mapa' }))
  expect(screen.getByRole('heading', { name: 'Mapa del campus' })).toBeVisible()
  expect(within(screen.getByRole('list')).getByRole('button', { name: 'Estación meteorológica' })).toHaveAttribute('aria-pressed', 'true')
})
it('clasifica residuos con Jaguarcín y permite reiniciar', async () => {
  const user = userEvent.setup()
  setup('/minijuegos')
  await user.click(screen.getByRole('button', { name: 'Separa los residuos' }))
  expect(screen.getByRole('img', { name: /Jaguarcín/ })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Orgánicos' }))
  expect(screen.getByRole('status')).toHaveTextContent('Prueba con otro contenedor')
  expect(screen.getByText('0/6 clasificados')).toBeVisible()
  for (const bin of ['Reciclables', 'Orgánicos', 'No aprovechables', 'Reciclables', 'Orgánicos', 'No aprovechables']) {
    await user.click(screen.getByRole('button', { name: bin }))
  }
  expect(screen.getByRole('status')).toHaveTextContent('¡Misión cumplida!')
  await user.click(screen.getByRole('button', { name: 'Reiniciar juego' }))
  expect(screen.getByText('0/6 clasificados')).toBeVisible()
})

it('redirige el cuestionario a los minijuegos y permite encontrar las parejas', async () => {
  const user = userEvent.setup()
  setup('/cuestionario')
  const memory = await screen.findByRole('button', { name: 'Memoria verde' })
  const random = vi.spyOn(Math, 'random').mockReturnValue(0.999)
  try {
    await user.click(memory)
  } finally {
    random.mockRestore()
  }
  await user.click(screen.getByRole('button', { name: 'Voltear carta 1' }))
  await user.click(screen.getByRole('button', { name: 'Voltear carta 3' }))
  expect(screen.getByRole('status')).toHaveTextContent('no forman pareja')
  await user.click(screen.getByRole('button', { name: 'Cerrar la llave' }))
  for (let i = 2; i <= 8; i++) {
    await user.click(screen.getByRole('button', { name: 'Voltear carta ' + i }))
  }
  expect(screen.getByText('4/4 parejas')).toBeVisible()
  expect(screen.getByRole('status')).toHaveTextContent('¡Encontraste todas las parejas!')
})


it('prepara el nivel de plataformas y enfoca los controles al jugar', async () => {
  const user = userEvent.setup()
  setup('/minijuegos')
  expect(screen.getByRole('heading', { name: 'Jaguarcín y el sendero verde' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: /^Jugar$/ }))
  expect(screen.getByLabelText('Área de juego de plataformas')).toHaveFocus()
  expect(screen.getByRole('button', { name: 'Saltar' })).toBeEnabled()
  expect(screen.getByText('Vidas 3/3')).toBeVisible()
  expect(screen.getByRole('status')).toHaveTextContent('fruta mágica')
  expect(screen.getByRole('button', { name: 'Reiniciar nivel' })).toBeVisible()
})





it('alterna los cuadros de carrera al moverse y recupera la pose fija al parar', () => {
  const drawImage = vi.fn()
  const noop = () => {}
  const context = new Proxy({
    drawImage,
    createLinearGradient: () => ({ addColorStop: noop }),
  }, { get: (target, key) => Reflect.get(target, key) ?? noop })
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(context as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
  vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(1254)
  let frame: FrameRequestCallback = noop
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frame = callback; return 1 })
  vi.stubGlobal('cancelAnimationFrame', noop)
  try {
    const view = setup('/minijuegos')
    fireEvent.click(screen.getByRole('button', { name: /^Jugar$/ }))
    const stage = screen.getByLabelText('Área de juego de plataformas')
    fireEvent.keyDown(stage, { key: 'ArrowRight' })
    act(() => { for (let i = 1; i <= 15; i++) frame(i * 16) })
    const samples = drawImage.mock.calls.filter((args) => args.length === 9)
    expect(new Set(samples.map((args) => args[1] + ',' + args[2])).size).toBeGreaterThanOrEqual(3)
    fireEvent.keyUp(stage, { key: 'ArrowRight' })
    act(() => { for (let i = 16; i <= 45; i++) frame(i * 16) })
    expect(drawImage.mock.lastCall?.length).toBe(5)
    view.unmount()
  } finally {
    vi.unstubAllGlobals()
  }
})

it('recupera el pronóstico y mantiene disponible el boletín cuando falla la API', async () => {
  const payload = {
    current: { time: '2026-11-24T13:45', temperature_2m: 29, apparent_temperature: 31, relative_humidity_2m: 65, wind_speed_10m: 12 },
    daily: {
      time: ['2026-11-24', '2026-11-25', '2026-11-26'],
      temperature_2m_max: [31, 30, 29],
      temperature_2m_min: [22, 21, 22],
      precipitation_probability_max: [10, 20, 80],
    },
  }
  vi.spyOn(globalThis, 'fetch')
    .mockRejectedValueOnce(new Error('Sin conexión'))
    .mockResolvedValue(new Response(JSON.stringify(payload)))
  const user = userEvent.setup()
  setup('/clima')
  expect(await screen.findByText(/no está disponible por el momento/)).toBeVisible()
  expect(screen.getByRole('link', { name: 'Consultar boletín oficial' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Reintentar' }))
  expect(await screen.findByRole('heading', { name: 'Pronóstico de tres días' })).toBeVisible()
  expect(screen.getByText('29 °C', { exact: true })).toBeVisible()
  expect(screen.getByText(/Prob\. de lluvia 80 %/)).toBeVisible()
})

it('avanza por los cuatro niveles y reinicia la aventura desde la meta final', () => {
  const noop = () => {}
  const context = new Proxy({}, { get: () => noop }) as unknown as CanvasRenderingContext2D
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(context)
  let frame: FrameRequestCallback = noop
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frame = callback; return 1 })
  vi.stubGlobal('cancelAnimationFrame', noop)
  const original = levels.map(({ finish }) => finish)
  levels.forEach((level) => { level.finish = 66 })
  try {
    const view = setup('/minijuegos')
    const stage = screen.getByLabelText('Área de juego de plataformas')
    let now = 0
    fireEvent.click(screen.getByRole('button', { name: /^Jugar$/ }))
    for (const [index, scene] of ['Día', 'Atardecer', 'Noche', 'Amanecer'].entries()) {
      expect(screen.getByText(new RegExp('Nivel ' + (index + 1) + '/4.*' + scene))).toBeVisible()
      expect(screen.getByText('Vidas 3/3')).toBeVisible()
      fireEvent.keyDown(stage, { key: 'ArrowRight' })
      act(() => { for (let step = 0; step < 12; step++) frame(now += 16) })
      if (index < 3) fireEvent.click(screen.getByRole('button', { name: 'Siguiente nivel' }))
    }
    expect(screen.getByText('¡Recorrido completo!')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Jugar otra vez' }))
    expect(screen.getByText(/Nivel 1\/4.*Día/)).toBeVisible()
    view.unmount()
  } finally {
    levels.forEach((level, index) => { level.finish = original[index] })
    vi.unstubAllGlobals()
  }
})
it('agarra la liana desde tierra y permite cruzar con solo una pulsación de la flecha arriba', () => {
  const noop = () => {}
  const context = new Proxy({}, { get: () => noop }) as unknown as CanvasRenderingContext2D
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(context)
  let frame: FrameRequestCallback = noop
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frame = callback; return 1 })
  vi.stubGlobal('cancelAnimationFrame', noop)
  const original = levels[0].vine
  levels[0].vine = { x: 230, y: 12, length: 269, entry: 125, landing: 330 }
  try {
    const view = setup('/minijuegos')
    fireEvent.click(screen.getByRole('button', { name: /^Jugar$/ }))
    const stage = screen.getByLabelText('Área de juego de plataformas')
    fireEvent.keyDown(stage, { key: 'ArrowUp' })
    act(() => { frame(16); frame(32) })
    expect(screen.getByRole('status')).toHaveTextContent('¡Te agarraste!')
    fireEvent.keyUp(stage, { key: 'ArrowUp' })
    act(() => { for (let i = 3; i <= 120; i++) frame(i * 16) })
    expect(screen.getByRole('status')).toHaveTextContent('¡Cruzaste el barranco con la liana!')
    expect(screen.getByText('Vidas 3/3')).toBeVisible()
    view.unmount()
  } finally {
    levels[0].vine = original
    vi.unstubAllGlobals()
  }
})
