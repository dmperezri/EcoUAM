import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { drumX, GROUND, levels } from './platformLevels'
import type { Level } from './platformLevels'
import './platform.css'

const VIEW = { width: 820, height: 390 }
const PLAYER = { width: 32, height: 51 }
const DRUM_SIZE = 33
const SWING_SECONDS = 1.25
const VINE_REACH = 105
const VINE_EXIT_SECONDS = .38
const WATER_SLOW = 70
const WATER_CRUISE = 175
const WATER_FAST = 235
const BOOST_SECONDS = 5
const MAX_LIVES = 3
const RUN_FPS = 11
const BOOSTED_RUN_FPS = 17
const RUN_FRAMES = [[45, 0], [655, 0], [45, 630], [655, 630]] as const
const controls = ['ArrowLeft', 'ArrowRight', 'ArrowUp'] as const
type Control = (typeof controls)[number]
type Phase = 'ready' | 'playing' | 'won' | 'lost'
type Ride =
  | { kind: 'dolphin'; offset: number; jumpSpeed: number; water: NonNullable<Level['water']> }
  | { kind: 'vine'; elapsed: number; vine: NonNullable<Level['vine']>;
      exit?: { x: number; y: number; elapsed: number } }

function runner(x = 54) {
  return { x, y: GROUND - PLAYER.height, vx: 0, vy: 0, grounded: true, direction: 1 }
}

function vineTip(vine: NonNullable<Level['vine']>, elapsed: number) {
  const angle = -.93 * Math.cos(Math.PI * elapsed / SWING_SECONDS)
  return { x: vine.x + Math.sin(angle) * vine.length, y: vine.y + Math.cos(angle) * vine.length }
}

function canGrabVine(vine: NonNullable<Level['vine']>, player: ReturnType<typeof runner>) {
  const center = player.x + PLAYER.width / 2
  return center >= vine.entry - VINE_REACH && center <= vine.entry + 14 &&
    player.y + PLAYER.height <= GROUND + 18
}

function drawDolphin(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save()
  ctx.translate(Math.round(x), Math.round(y))
  ctx.fillStyle = '#337c9b'
  ctx.beginPath()
  ctx.moveTo(-35, 7)
  ctx.lineTo(-46, -2)
  ctx.lineTo(-42, 10)
  ctx.lineTo(-49, 16)
  ctx.lineTo(-28, 15)
  ctx.quadraticCurveTo(4, 26, 31, 13)
  ctx.lineTo(43, 9)
  ctx.lineTo(43, 5)
  ctx.lineTo(31, 3)
  ctx.quadraticCurveTo(22, -11, 8, -10)
  ctx.lineTo(-2, -24)
  ctx.lineTo(-7, -10)
  ctx.quadraticCurveTo(-22, -7, -35, 7)
  ctx.fill()
  ctx.fillStyle = '#bcecf1'
  ctx.fillRect(0, 13, 25, 4)
  ctx.fillStyle = '#143a4c'
  ctx.fillRect(23, 0, 4, 4)
  ctx.restore()
}

function drawLandscape(ctx: CanvasRenderingContext2D, level: Level, camera: number, age: number) {
  const theme = level.theme
  const { width, height } = VIEW
  const bandHeight = 102
  theme.sky.forEach((color, band) => {
    ctx.fillStyle = color
    ctx.fillRect(0, band * bandHeight, width, band === 2 ? height : bandHeight)
  })
  const lightX = 646 - Math.floor(camera / 56)
  const lightY = theme.landmark === 'wetland' || theme.landmark === 'grove' ? 162 : 70
  ctx.fillStyle = theme.light
  ctx.fillRect(lightX - 19, lightY - 30, 38, 60)
  ctx.fillRect(lightX - 30, lightY - 18, 60, 36)
  if (theme.landmark === 'tower') {
    ctx.fillStyle = theme.sky[0]
    ctx.fillRect(lightX - 28, lightY - 37, 42, 49)
    ctx.fillStyle = '#ffedb8'
    for (let i = 0; i < 24; i++) {
      const x = (i * 137 + 38) % width
      const y = 14 + (i * 37) % 156
      const size = 2 + ((Math.floor(age * 2) + i) % 6 === 0 ? 2 : 0)
      ctx.fillRect(x, y, size, size)
    }
  } else {
    ctx.fillStyle = theme.landmark === 'canopy' ? '#ddf4e6' : '#ffe4c6'
    for (let i = 0; i < 4; i++) {
      const x = ((i * 243 + 96 - Math.floor(camera / 9)) % width + width) % width
      const y = 31 + (i * 29) % 100
      ctx.fillRect(x, y + 9, 70, 10)
      ctx.fillRect(x + 12, y, 37, 10)
    }
  }
  for (const [color, offset, scale, baseline] of [[theme.distant, .14, 96, 275], [theme.hills, .32, 61, 310]] as const) {
    ctx.fillStyle = color
    for (let x = 0; x < width; x += 8) {
      const y = baseline - Math.round((Math.sin((x + camera * offset) / 109) + 1) * scale / 16) * 8
      ctx.fillRect(x, y, 8, height - y)
    }
  }
}

function drawLandmarks(ctx: CanvasRenderingContext2D, level: Level, camera: number) {
  const theme = level.theme
  const spacing = theme.landmark === 'tower' ? 228 : 148
  const first = Math.max(0, Math.floor((camera - spacing) / spacing))
  const last = Math.min(Math.ceil(level.width / spacing), Math.ceil((camera + VIEW.width + spacing) / spacing))
  for (let i = first; i < last; i++) {
    const x = 76 + i * spacing
    const top = 182 + (i * 29) % 48
    ctx.fillStyle = theme.bark
    if (theme.landmark === 'tower') {
      ctx.fillRect(x - 42, top, 8, GROUND - top)
      ctx.fillRect(x + 35, top, 8, GROUND - top)
      for (let y = top + 17; y < GROUND; y += 24) ctx.fillRect(x - 34, y, 69, 4)
      ctx.fillRect(x - 48, top, 96, 8)
      ctx.fillStyle = '#ffda87'
      ctx.fillRect(x - 5, top + 19, 10, 12)
      continue
    }
    ctx.fillRect(x - 6, top + 37, 12, GROUND - top - 37)
    ctx.fillRect(x - 15, top + 67, 29, 6)
    ctx.fillStyle = theme.trees
    if (theme.landmark === 'wetland') {
      for (let reed = -3; reed <= 3; reed++) {
        const y = top + 52 + Math.abs(reed) * 8
        ctx.fillRect(x + reed * 9, y, 4, GROUND - y)
        ctx.fillRect(x + reed * 9 - 2, y, 8, 13)
      }
    } else {
      ctx.fillRect(x - 22, top, 44, 56)
      ctx.fillRect(x - 36, top + 13, 72, 34)
      if (theme.landmark === 'grove') ctx.fillRect(x + 25, top + 35, 27, 17)
      ctx.fillStyle = theme.hills
      ctx.fillRect(x - 16, top + 11, 23, 6)
      ctx.fillRect(x + 12, top + 21, 14, 6)
    }
  }
}

function drawTerrain(ctx: CanvasRenderingContext2D, level: Level, camera: number) {
  const theme = level.theme
  for (const ledge of level.ledges) {
    if (ledge.x + ledge.width < camera || ledge.x > camera + VIEW.width) continue
    ctx.fillStyle = theme.soil
    ctx.fillRect(ledge.x, ledge.y, ledge.width, ledge.height)
    ctx.fillStyle = theme.grass
    ctx.fillRect(ledge.x, ledge.y, ledge.width, 9)
    ctx.fillStyle = theme.edge
    ctx.fillRect(ledge.x, ledge.y, ledge.width, 3)
    ctx.fillStyle = theme.flecks
    for (let x = 9; x + 7 < ledge.width; x += 16) {
      ctx.fillRect(ledge.x + x, ledge.y + 12, 4, 3)
      if (ledge.height > 38) ctx.fillRect(ledge.x + x + 2, ledge.y + 33 + x % 13, 7, 3)
    }
  }
}

function drawTrailSign(ctx: CanvasRenderingContext2D, x: number, label: string) {
  ctx.fillStyle = '#553a32'
  ctx.fillRect(x + 30, GROUND - 41, 6, 41)
  ctx.fillStyle = '#f5cf74'
  ctx.fillRect(x, GROUND - 63, 84, 26)
  ctx.fillStyle = '#3d3525'
  ctx.font = 'bold 12px system-ui'
  ctx.fillText(label, x + 7, GROUND - 46)
}

function draw(
  ctx: CanvasRenderingContext2D, level: Level, player: ReturnType<typeof runner>, found: Set<number>,
  fruitFound: Set<number>, clearedDrums: Set<number>, ride: Ride | null, boosted: boolean, sprite: HTMLImageElement,
  runSheet: HTMLImageElement, runFrame: number, age: number, time: number,
) {
  const { width, height } = VIEW
  const { water, vine, finish } = level
  const camera = Math.round(Math.max(0, Math.min(level.width - width, player.x - width * 0.36)))
  drawLandscape(ctx, level, camera, age)
  ctx.save()
  ctx.translate(-camera, 0)
  drawLandmarks(ctx, level, camera)
  if (water) {
    ctx.fillStyle = '#438fb7'
    ctx.fillRect(water.start, water.surface, water.end - water.start, height - water.surface)
    ctx.fillStyle = '#79d4de'
    ctx.fillRect(water.start, water.surface, water.end - water.start, 9)
    ctx.fillStyle = '#dbf6ee'
    for (let x = water.start + 8; x + 12 < water.end; x += 23) {
      const wave = Math.round(Math.sin(age * 4 + x) * 3)
      ctx.fillRect(x, water.surface + 4 + wave, 12, 2)
      ctx.fillRect(x + 5, water.surface + 23 + wave * 2, 8, 2)
    }
    for (const x of water.hazards) {
      const y = water.surface - 17
      ctx.fillStyle = '#823e3a'
      ctx.fillRect(x - 12, y + 5, 28, 12)
      ctx.fillStyle = '#fa8750'
      ctx.fillRect(x - 10, y + 3, 22, 10)
      ctx.fillStyle = '#ffda99'
      ctx.fillRect(x - 5, y + 4, 8, 6)
      ctx.fillStyle = '#e2e9e4'
      ctx.fillRect(x + 12, y + 6, 7, 7)
    }
    if (ride?.kind === 'dolphin') {
      const x = Math.round(player.x)
      drawDolphin(ctx, player.x + PLAYER.width / 2, player.y + PLAYER.height + 7)
      if (ride.offset > -4) {
        ctx.fillStyle = '#e1f9ff'
        for (let i = 0; i < 6; i++) {
          ctx.fillRect(x - 17 - i * 7, water.surface + 6 + Math.round(Math.sin(age * 28 + i) * 6), 4, 3)
        }
      }
    } else {
      drawDolphin(ctx, water.start + 47, water.surface + 5 + Math.sin(age * 3) * 3)
    }
  }
  drawTerrain(ctx, level, camera)
  if (water) drawTrailSign(ctx, water.start - 111, 'Delfín →')
  if (vine) {
    const swing = ride?.kind === 'vine' ? ride : null
    const tip = vineTip(vine, swing?.elapsed ?? 0)
    drawTrailSign(ctx, vine.entry - VINE_REACH, 'Liana ↑')
    ctx.strokeStyle = '#486c3c'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(vine.x, vine.y)
    ctx.lineTo(tip.x, tip.y)
    ctx.stroke()
    ctx.fillStyle = swing && tip.x >= vine.landing - 37 ? '#fff1a7' : '#a0bf58'
    ctx.fillRect(tip.x - 7, tip.y - 3, 14, 6)
    ctx.fillStyle = '#dbe580'
    for (let i = 1; i <= 5; i++) {
      const x = Math.round(vine.x + (tip.x - vine.x) * i / 6)
      const y = Math.round(vine.y + (tip.y - vine.y) * i / 6)
      ctx.fillRect(x + (i % 2 ? -9 : 1), y - 2, 9, 4)
    }
    const center = player.x + PLAYER.width / 2
    if (!ride && canGrabVine(vine, player)) {
      const x = Math.round(Math.min(center - 48, vine.entry - 88))
      const y = Math.min(player.y - 33, GROUND - 105)
      ctx.fillStyle = '#214a38'
      ctx.fillRect(x, y, 104, 24)
      ctx.fillStyle = '#fff4b7'
      ctx.font = 'bold 13px system-ui'
      ctx.fillText('↑ Agarrar liana', x + 7, y + 16)
    }
  }
  level.drums.forEach((drum, index) => {
    if (clearedDrums.has(index)) return
    const x = drumX(drum, time, index)
    ctx.save()
    ctx.translate(Math.round(x + DRUM_SIZE / 2), GROUND - DRUM_SIZE / 2)
    ctx.rotate((x - drum.from) / (DRUM_SIZE / 2))
    ctx.fillStyle = '#834a37'
    ctx.fillRect(-12, -16, 24, 32)
    ctx.fillRect(-16, -11, 32, 22)
    ctx.fillStyle = '#bd7147'
    ctx.fillRect(-10, -11, 20, 22)
    ctx.fillStyle = '#f3cc7f'
    ctx.fillRect(-14, -6, 28, 4)
    ctx.fillRect(-14, 5, 28, 4)
    ctx.restore()
  })
  for (const item of level.litter) {
    const y = GROUND - item.height
    ctx.save()
    ctx.translate(item.x, y)
    if (item.kind === 'bag') {
      ctx.fillStyle = '#462f5a'
      ctx.fillRect(6, 8, item.width - 12, item.height - 8)
      ctx.fillRect(2, 14, item.width - 4, item.height - 17)
      ctx.fillRect(item.width / 2 - 4, 2, 8, 8)
      ctx.fillStyle = '#a18abd'
      ctx.fillRect(8, 15, 4, item.height - 20)
    } else {
      ctx.fillStyle = '#943b2a'
      ctx.fillRect(4, 2, item.width - 8, item.height - 2)
      ctx.fillStyle = '#d9ded9'
      ctx.fillRect(4, 2, item.width - 8, 4)
      ctx.fillRect(4, item.height - 4, item.width - 8, 4)
      ctx.fillStyle = '#f8bb7f'
      ctx.fillRect(8, item.height / 2 - 2, item.width - 16, 5)
    }
    ctx.restore()
  }
  level.seeds.forEach((seed, index) => {
    if (found.has(index)) return
    ctx.save()
    ctx.translate(seed.x, seed.y + Math.sin(age * 3 + index) * 4)
    ctx.fillStyle = '#fff1a7'
    ctx.beginPath()
    ctx.arc(0, 0, 14, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#a65f21'
    ctx.beginPath()
    ctx.ellipse(0, 0, 5, 8, .55, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
  level.fruits.forEach((fruit, index) => {
    if (fruitFound.has(index)) return
    const y = Math.round(fruit.y + Math.sin(age * 5 + index) * 3)
    ctx.fillStyle = '#fff1a7'
    ctx.fillRect(fruit.x - 13, y - 14, 26, 28)
    ctx.fillStyle = '#e95d36'
    ctx.fillRect(fruit.x - 8, y - 5, 16, 14)
    ctx.fillStyle = '#f89e4b'
    ctx.fillRect(fruit.x - 5, y - 6, 5, 7)
    ctx.fillStyle = '#418b51'
    ctx.fillRect(fruit.x, y - 11, 7, 5)
  })
  ctx.fillStyle = '#4d372b'
  ctx.fillRect(finish, GROUND - 91, 5, 91)
  ctx.fillStyle = '#f4bf51'
  ctx.beginPath()
  ctx.moveTo(finish + 5, GROUND - 90)
  ctx.lineTo(finish + 56, GROUND - 74)
  ctx.lineTo(finish + 5, GROUND - 56)
  ctx.fill()
  ctx.fillStyle = '#253b25'
  ctx.font = 'bold 14px system-ui'
  ctx.fillText('META', finish + 8, GROUND - 70)
  ctx.save()
  const running = runFrame >= 0
  const sprinting = boosted && running
  if (sprinting) {
    ctx.fillStyle = '#fff4cee0'
    for (let i = 0; i < 3; i++) {
      const trail = 17 + i * 10 + runFrame * 2
      ctx.fillRect(Math.round(player.x + PLAYER.width / 2 - player.direction * trail),
        Math.round(player.y + PLAYER.height - 9 - i * 4), 6 - i, 3)
    }
  }
  ctx.translate(Math.round(player.x + PLAYER.width / 2), Math.round(player.y + PLAYER.height))
  ctx.scale(player.direction, 1)
  ctx.imageSmoothingEnabled = false
  if (running && runSheet.complete && runSheet.naturalWidth) {
    const [sourceX, sourceY] = RUN_FRAMES[runFrame]
    ctx.drawImage(runSheet, sourceX, sourceY, 540, 594, -32, -70, 64, 70)
  } else if (sprite.complete && sprite.naturalWidth) ctx.drawImage(sprite, -36, -72, 72, 72)
  else {
    ctx.fillStyle = '#f4b52b'
    ctx.fillRect(-14, -48, 28, 48)
  }
  ctx.restore()
  ctx.restore()
}

export function PlatformGame() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const area = useRef<HTMLDivElement>(null)
  const player = useRef(runner())
  const keys = useRef(new Set<Control>())
  const collected = useRef(new Set<number>())
  const fruitFound = useRef(new Set<number>())
  const clearedDrums = useRef(new Set<number>())
  const ride = useRef<Ride | null>(null)
  const boost = useRef(0)
  const lives = useRef(MAX_LIVES)
  const checkpoint = useRef(54)
  const mode = useRef<Phase>('ready')
  const currentLevel = useRef(0)
  const levelTime = useRef(0)
  const queuedJump = useRef(false)
  const [levelIndex, setLevelIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('ready')
  const [seedCount, setSeedCount] = useState(0)
  const [lifeCount, setLifeCount] = useState(MAX_LIVES)
  const [boostTime, setBoostTime] = useState(0)
  const level = levels[levelIndex]
  const lastLevel = levelIndex === levels.length - 1
  const [message, setMessage] = useState(levels[0].intro)

  function start(index: number, resetLives: boolean) {
    currentLevel.current = index
    levelTime.current = 0
    setLevelIndex(index)
    player.current = runner()
    keys.current.clear()
    collected.current.clear()
    fruitFound.current.clear()
    clearedDrums.current.clear()
    ride.current = null
    boost.current = 0
    if (resetLives) lives.current = MAX_LIVES
    checkpoint.current = 54
    queuedJump.current = false
    mode.current = 'playing'
    setPhase('playing')
    setSeedCount(0)
    setLifeCount(lives.current)
    setBoostTime(0)
    setMessage(levels[index].intro)
    area.current?.focus()
  }

  function press(key: Control) {
    if (mode.current !== 'playing') return
    if (key === 'ArrowUp' && !keys.current.has(key)) queuedJump.current = true
    keys.current.add(key)
  }

  function onKey(event: KeyboardEvent<HTMLDivElement>, down: boolean) {
    const key = controls.find((control) => control === event.key)
    if (!key || mode.current !== 'playing' || event.ctrlKey || event.altKey || event.metaKey) return
    event.preventDefault()
    if (down) press(key)
    else keys.current.delete(key)
  }

  function pointerDown(event: PointerEvent<HTMLButtonElement>, key: Control) {
    event.currentTarget.setPointerCapture(event.pointerId)
    press(key)
  }

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    const sprite = new Image()
    sprite.src = '/games/jaguarcin-pixel.png'
    const runSheet = new Image()
    runSheet.src = '/games/jaguarcin-carrera.png'
    let nextFrame = 0
    let previous = 0
    let accumulator = 0
    let age = 0
    let runProgress = 0

    function loseLife(hit: 'fall' | 'litter' | 'drum' | 'water') {
      lives.current -= 1
      setLifeCount(lives.current)
      boost.current = 0
      setBoostTime(0)
      ride.current = null
      keys.current.clear()
      queuedJump.current = false
      if (lives.current === 0) {
        mode.current = 'lost'
        setPhase('lost')
        setMessage('Se acabaron las vidas. Puedes volver a intentar el recorrido.')
        return
      }
      player.current = runner(checkpoint.current)
      const cue = hit === 'water' ? '¡Salta sobre la basura flotante!' : hit === 'drum' ? '¡Cuidado con ese bidón!' :
        hit === 'litter' ? '¡Tropiezo con la basura!' : '¡Caíste!'
      setMessage(cue + ' Perdiste una vida y vuelves al último tramo seguro.')
    }

    function collectSeeds(level: Level, p: ReturnType<typeof runner>, announce: boolean) {
      level.seeds.forEach((seed, index) => {
        const nearX = Math.abs(p.x + PLAYER.width / 2 - seed.x) < 25
        const nearY = seed.y > p.y - 10 && seed.y < p.y + PLAYER.height + 10
        if (nearX && nearY && !collected.current.has(index)) {
          collected.current.add(index)
          setSeedCount(collected.current.size)
          if (announce) setMessage('¡Semilla rescatada! Sigue hasta la bandera.')
        }
      })
    }

    function rideDolphin(active: Extract<Ride, { kind: 'dolphin' }>, level: Level, direction: number, jump: boolean, dt: number) {
      const { water } = active
      const p = player.current
      if (jump && active.offset === 0) active.jumpSpeed = -345
      active.jumpSpeed += 1050 * dt
      active.offset = Math.min(0, active.offset + active.jumpSpeed * dt)
      if (active.offset === 0) active.jumpSpeed = 0
      p.x += (direction > 0 ? WATER_FAST : direction < 0 ? WATER_SLOW : WATER_CRUISE) * dt
      p.y = water.surface - PLAYER.height + 2 + active.offset
      const blocked = active.offset > -26 &&
        water.hazards.some((x) => p.x + PLAYER.width - 4 > x - 10 && p.x + 4 < x + 16)
      if (blocked) {
        loseLife('water')
        return
      }
      collectSeeds(level, p, false)
      if (p.x + PLAYER.width / 2 >= water.end - 6) {
        ride.current = null
        player.current = runner(water.end + 24)
        checkpoint.current = Math.max(checkpoint.current, water.end + 24)
        setMessage('¡Cruzaste el agua! Sigue el sendero.')
      }
    }

    function swingVine(active: Extract<Ride, { kind: 'vine' }>, level: Level, jump: boolean, dt: number) {
      const p = player.current
      const landing = active.vine.landing + 20
      if (active.exit) {
        const exit = active.exit
        exit.elapsed += dt
        const progress = Math.min(exit.elapsed / VINE_EXIT_SECONDS, 1)
        p.x = exit.x + (landing - exit.x) * progress
        p.y = exit.y + (GROUND - PLAYER.height - exit.y) * progress - Math.sin(progress * Math.PI) * 20
        collectSeeds(level, p, false)
        if (progress === 1) {
          ride.current = null
          player.current = runner(landing)
          checkpoint.current = Math.max(checkpoint.current, landing)
          setMessage('¡Cruzaste el barranco con la liana!')
        }
        return
      }

      active.elapsed = Math.min(active.elapsed + dt, SWING_SECONDS)
      const tip = vineTip(active.vine, active.elapsed)
      p.x = tip.x - PLAYER.width / 2
      p.y = tip.y - 9
      collectSeeds(level, p, false)
      const nearShore = tip.x >= active.vine.landing - 37
      if ((nearShore && jump) || active.elapsed === SWING_SECONDS) {
        active.exit = { x: p.x, y: p.y, elapsed: 0 }
        setMessage('¡Ahora aterriza en la otra orilla!')
      }
    }

    function step(dt: number) {
      const level = levels[currentLevel.current]
      const { water, vine, ledges } = level
      levelTime.current += dt
      const p = player.current
      const direction = Number(keys.current.has('ArrowRight')) - Number(keys.current.has('ArrowLeft'))
      const wantsJump = queuedJump.current
      queuedJump.current = false
      const previousBoost = Math.ceil(boost.current)
      boost.current = Math.max(0, boost.current - dt)
      if (Math.ceil(boost.current) !== previousBoost) setBoostTime(Math.ceil(boost.current))

      const currentRide = ride.current
      if (currentRide) {
        if (currentRide.kind === 'dolphin') {
          rideDolphin(currentRide, level, direction, wantsJump, dt)
        } else {
          swingVine(currentRide, level, wantsJump, dt)
        }
        return
      }

      if (vine && wantsJump && canGrabVine(vine, p)) {
        ride.current = { kind: 'vine', elapsed: 0, vine }
        p.direction = 1
        p.grounded = false
        setMessage('¡Te agarraste! Pulsa ↑ al acercarte a la otra orilla o deja que la liana complete el cruce.')
        return
      }

      const speed = boost.current > 0 ? 435 : 295
      p.vx += (direction * speed - p.vx) * Math.min(1, dt * 13)
      if (direction) p.direction = direction
      if (wantsJump && p.grounded) p.vy = -510

      const oldX = p.x
      p.x = Math.max(0, Math.min(level.width - PLAYER.width, p.x + p.vx * dt))
      for (const ledge of ledges) {
        if (p.y + PLAYER.height <= ledge.y || p.y >= ledge.y + ledge.height) continue
        if (oldX + PLAYER.width <= ledge.x && p.x + PLAYER.width > ledge.x) p.x = ledge.x - PLAYER.width
        else if (oldX >= ledge.x + ledge.width && p.x < ledge.x + ledge.width) p.x = ledge.x + ledge.width
      }
      if (p.x === oldX) p.vx = 0

      const oldY = p.y
      p.vy += 1220 * dt
      p.y += p.vy * dt
      p.grounded = false
      for (const ledge of ledges) {
        if (p.x + PLAYER.width <= ledge.x || p.x >= ledge.x + ledge.width) continue
        if (p.vy >= 0 && oldY + PLAYER.height <= ledge.y && p.y + PLAYER.height >= ledge.y) {
          p.y = ledge.y - PLAYER.height
          p.vy = 0
          p.grounded = true
          if (ledge.y === GROUND && ledge.x > checkpoint.current) checkpoint.current = ledge.x + 24
        } else if (p.vy < 0 && oldY >= ledge.y + ledge.height && p.y < ledge.y + ledge.height) {
          p.y = ledge.y + ledge.height
          p.vy = 0
        }
      }

      const centerX = p.x + PLAYER.width / 2
      if (vine && p.vy < 0 && p.direction === 1) {
        const grip = vineTip(vine, 0)
        if (Math.abs(centerX - grip.x) < 38 && Math.abs(p.y + 12 - grip.y) < 41) {
          ride.current = { kind: 'vine', elapsed: 0, vine }
          setMessage('¡Te agarraste! Pulsa ↑ al acercarte a la otra orilla o deja que la liana complete el cruce.')
          return
        }
      }
      if (water && centerX > water.start && centerX < water.end && p.y + PLAYER.height >= water.surface && p.vy > 0) {
        ride.current = { kind: 'dolphin', offset: 0, jumpSpeed: 0, water }
        p.direction = 1
        setMessage('¡Al agua con el delfín! ↑ salta la basura, ← frena y → acelera.')
        return
      }

      collectSeeds(level, p, true)
      level.fruits.forEach((fruit, index) => {
        if (fruitFound.current.has(index) || Math.abs(centerX - fruit.x) >= 30 ||
          fruit.y < p.y - 8 || fruit.y > p.y + PLAYER.height + 8) return
        fruitFound.current.add(index)
        boost.current = BOOST_SECONDS
        setBoostTime(BOOST_SECONDS)
        setMessage('¡Fruta mágica! Tienes cinco segundos de velocidad extra.')
      })
      function hits(x: number, width: number, height: number) {
        return p.x + PLAYER.width - 4 > x && p.x + 4 < x + width &&
          p.y + PLAYER.height > GROUND - height + 3 && p.y < GROUND
      }
      const hitLitter = level.litter.some((item) => hits(item.x, item.width, item.height))
      const drum = level.drums.findIndex((item, index) =>
        !clearedDrums.current.has(index) && hits(drumX(item, levelTime.current, index), DRUM_SIZE, DRUM_SIZE))
      const hitDrum = drum >= 0
      if (hitDrum && !hitLitter && p.vy >= 0 && oldY + PLAYER.height <= GROUND - DRUM_SIZE + 4) {
        clearedDrums.current.add(drum)
        p.y = GROUND - DRUM_SIZE - PLAYER.height
        p.vy = -410
        p.grounded = false
        setMessage('¡Rebote! Saltaste sobre el bidón.')
        return
      }
      if (hitLitter || hitDrum || p.y > VIEW.height + 45) {
        loseLife(hitDrum ? 'drum' : hitLitter ? 'litter' : 'fall')
      } else if (p.x >= level.finish && p.grounded) {
        mode.current = 'won'
        keys.current.clear()
        setPhase('won')
        setMessage('Rescataste ' + collected.current.size + ' de ' + level.seeds.length + ' semillas en este nivel.')
      }
    }

    function frame(now: number) {
      const dt = previous ? Math.min((now - previous) / 1000, .05) : 0
      previous = now
      age += dt
      if (mode.current === 'playing') {
        accumulator += dt
        while (accumulator >= 1 / 120 && mode.current === 'playing') {
          step(1 / 120)
          accumulator -= 1 / 120
        }
      } else {
        accumulator = 0
      }
      const p = player.current
      const boosted = boost.current > 0
      const running = mode.current === 'playing' && p.grounded && !ride.current && Math.abs(p.vx) > 18
      runProgress = running ? (runProgress + dt * (boosted ? BOOSTED_RUN_FPS : RUN_FPS)) % RUN_FRAMES.length : 0
      if (ctx) draw(ctx, levels[currentLevel.current], p, collected.current, fruitFound.current, clearedDrums.current, ride.current,
        boosted, sprite, runSheet, running ? Math.floor(runProgress) : -1, age, levelTime.current)
      nextFrame = requestAnimationFrame(frame)
    }

    function clearKeys() {
      keys.current.clear()
      queuedJump.current = false
    }

    window.addEventListener('blur', clearKeys)
    nextFrame = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(nextFrame)
      window.removeEventListener('blur', clearKeys)
    }
  }, [])

  return (
    <section className="game-board platform-board" aria-labelledby="platform-title">
      <div className="game-board-header">
        <h2 id="platform-title">Jaguarcín y el sendero verde</h2>
        <div className="platform-stats">
          <span>Vidas {lifeCount}/{MAX_LIVES}</span>
          <span>Semillas {seedCount}/{level.seeds.length}</span>
          {boostTime > 0 && <span className="platform-boost">Velocidad extra · {boostTime} s</span>}
        </div>
      </div>
      <p className="platform-level">Nivel {levelIndex + 1}/{levels.length} · {level.name} · {level.time}</p>
      <div ref={area} className="platform-stage" tabIndex={0} aria-label="Área de juego de plataformas"
        onKeyDown={(event) => onKey(event, true)} onKeyUp={(event) => onKey(event, false)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            keys.current.clear()
            queuedJump.current = false
          }
        }}>
        <canvas ref={canvas} width={VIEW.width} height={VIEW.height} aria-label={level.name + ', ' + level.time} />
        {phase !== 'playing' && (
          <div className="platform-overlay">
            <strong>{phase === 'won' ? (lastLevel ? '¡Recorrido completo!' : '¡Nivel superado!') :
              phase === 'lost' ? 'Se acabaron las vidas' : level.name}</strong>
            {phase === 'won' && !lastLevel ? (
              <button type="button" className="campus-action" onClick={() => start(levelIndex + 1, false)}>Siguiente nivel</button>
            ) : (
              <button type="button" className="campus-action" onClick={() => start(lastLevel && phase === 'won' ? 0 : levelIndex, true)}>
                {phase === 'ready' ? 'Jugar' : phase === 'lost' ? 'Reintentar nivel' : 'Jugar otra vez'}
              </button>
            )}
          </div>
        )}
        <div className="platform-controls" role="group" aria-label="Controles táctiles">
          {([['ArrowLeft', 'Izquierda', '←'], ['ArrowRight', 'Derecha', '→'], ['ArrowUp', 'Saltar', '↑']] as const).map(([key, label, arrow]) => (
            <button key={key} type="button" aria-label={label} disabled={phase !== 'playing'}
              onPointerDown={(event) => pointerDown(event, key)} onPointerUp={() => keys.current.delete(key)}
              onLostPointerCapture={() => keys.current.delete(key)} onPointerCancel={() => keys.current.delete(key)}
              onKeyDown={(event) => {
                if (event.key !== ' ' && event.key !== 'Enter') return
                event.preventDefault()
                press(key)
              }}
              onKeyUp={(event) => {
                if (event.key !== ' ' && event.key !== 'Enter') return
                event.preventDefault()
                keys.current.delete(key)
              }}>{arrow} <span>{label}</span></button>
          ))}
        </div>
      </div>
      <p className="platform-key-hint"><kbd>←</kbd> <kbd>→</kbd> Mover <span>·</span> <kbd>↑</kbd> Saltar</p>
      <p role="status">{message}</p>
      {phase === 'playing' && <button type="button" className="game-restart" onClick={() => start(levelIndex, false)}>Reiniciar nivel</button>}
    </section>
  )
}
