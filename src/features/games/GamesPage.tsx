import { NatureSectionHeader } from '../../components/NatureSectionHeader'
import { useState } from 'react'
import { Gamepad2, Leaf, RotateCcw, Trash2 } from 'lucide-react'
import { PlatformGame } from './PlatformGame'
import './games.css'

const bins = [
  { id: 'recyclable', label: 'Reciclables' },
  { id: 'organic', label: 'Orgánicos' },
  { id: 'other', label: 'No aprovechables' },
] as const

const waste = [
  { id: 'bottle', name: 'Botella plástica vacía y limpia', icon: '🧴', bin: 'recyclable' },
  { id: 'banana', name: 'Cáscara de banano', icon: '🍌', bin: 'organic' },
  { id: 'tissue', name: 'Pañuelo usado', icon: '🧻', bin: 'other' },
  { id: 'paper', name: 'Papel limpio y seco', icon: '📄', bin: 'recyclable' },
  { id: 'leaves', name: 'Hojas secas', icon: '🍂', bin: 'organic' },
  { id: 'sponge', name: 'Esponja de cocina deteriorada', icon: '🧽', bin: 'other' },
] as const

const pairs = [
  { terms: ['Cerrar la llave', 'Ahorrar agua'], icons: ['🚰', '💧'] },
  { terms: ['Respetar el sendero', 'Proteger las plantas'], icons: ['🥾', '🌱'] },
  { terms: ['Usar termo', 'Evitar botellas desechables'], icons: ['🫗', '♻️'] },
  { terms: ['Plantar especies nativas', 'Apoyar la biodiversidad local'], icons: ['🌳', '🦋'] },
]

const cards = pairs.flatMap((pair, group) => pair.terms.map((term, index) => ({
  id: group * 2 + index,
  group,
  term,
  icon: pair.icons[index],
})))

function shuffledCards() {
  const deck = [...cards]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

type Reaction = 'ready' | 'cheer' | 'retry' | 'win'

function Guide({ message, reaction, step }: { message: string; reaction: Reaction; step: number }) {
  return (
    <aside className="jaguar-guide" aria-label="Jaguarcín, guía del juego">
      <div className="jaguar-stage">
        <img key={step} className={'jaguar-sprite jaguar-' + reaction} src="/games/jaguarcin.png"
          width="1280" height="1280" alt="Jaguarcín, mascota de la UAM" />
      </div>
      <div className="jaguar-message"><strong>Jaguarcín</strong><p role="status">{message}</p></div>
    </aside>
  )
}

function Restart({ onClick }: { onClick: () => void }) {
  return <button type="button" className="game-restart" onClick={onClick}><RotateCcw size={17} aria-hidden="true" /> Reiniciar juego</button>
}

function WasteGame() {
  const [round, setRound] = useState(0)
  const [feedback, setFeedback] = useState({ message: 'Clasifica el residuo: toca un contenedor o arrastra la tarjeta hasta él.', reaction: 'ready' as Reaction, step: 0 })
  const item = waste[round]

  function classify(id: (typeof bins)[number]['id']) {
    if (!item) return
    const correct = id === item.bin
    const finished = correct && round === waste.length - 1
    if (correct) setRound(round + 1)
    setFeedback({
      message: finished ? '¡Misión cumplida! Clasificaste los seis residuos.' :
        correct ? '¡Bien hecho! Vamos con el siguiente residuo.' : 'Prueba con otro contenedor. El mismo residuo sigue en juego.',
      reaction: finished ? 'win' : correct ? 'cheer' : 'retry',
      step: feedback.step + 1,
    })
  }

  function restart() {
    setRound(0)
    setFeedback({ message: '¡Otra ronda! Elige el contenedor del primer residuo.', reaction: 'ready', step: feedback.step + 1 })
  }

  return (
    <div className="game-layout">
      <Guide {...feedback} />
      <section className="game-board" aria-labelledby="waste-title">
        <div className="game-board-header"><h2 id="waste-title">Separa los residuos</h2><span>{round}/{waste.length} clasificados</span></div>
        {item ? (
          <>
            <p>Selecciona un contenedor para clasificar el residuo.</p>
            <div className="waste-item" draggable onDragStart={(event) => {
              event.dataTransfer.setData('text/plain', item.id)
              event.dataTransfer.effectAllowed = 'move'
            }}><span aria-hidden="true">{item.icon}</span>{item.name}</div>
            <div className="waste-bins">
              {bins.map((bin) => (
                <button type="button" key={bin.id} className={'waste-bin bin-' + bin.id}
                  onClick={() => classify(bin.id)} onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    if (event.dataTransfer.getData('text/plain') === item.id) classify(bin.id)
                  }}>
                  <Trash2 size={23} aria-hidden="true" /> {bin.label}
                </button>
              ))}
            </div>
          </>
        ) : <p className="game-win">Separaste todos los residuos.</p>}
        <Restart onClick={restart} />
      </section>
    </div>
  )
}

function MemoryGame() {
  const [deck, setDeck] = useState(shuffledCards)
  const [first, setFirst] = useState<number | null>(null)
  const [miss, setMiss] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [feedback, setFeedback] = useState({ message: 'Voltea dos cartas y une cada acción con su beneficio ambiental.', reaction: 'ready' as Reaction, step: 0 })

  function reveal(id: number) {
    if (matched.includes(id) || first === id) return
    setMiss([])
    if (first === null) {
      setFirst(id)
      return
    }
    setFirst(null)
    const correct = cards[id].group === cards[first].group
    const finished = correct && matched.length + 2 === deck.length
    if (correct) setMatched([...matched, first, id])
    else setMiss([first, id])
    setFeedback({
      message: finished ? '¡Encontraste todas las parejas! Ya tienes cuatro ideas para cuidar el campus.' :
        correct ? '¡Esa acción y su beneficio van juntos!' : 'Estas dos cartas no forman pareja. Toca otra carta para seguir.',
      reaction: finished ? 'win' : correct ? 'cheer' : 'retry',
      step: feedback.step + 1,
    })
  }

  function restart() {
    setDeck(shuffledCards())
    setFirst(null)
    setMiss([])
    setMatched([])
    setFeedback({ message: 'Mezclé las cartas. ¡Encuentra las parejas!', reaction: 'ready', step: feedback.step + 1 })
  }

  return (
    <div className="game-layout">
      <Guide {...feedback} />
      <section className="game-board" aria-labelledby="memory-title">
        <div className="game-board-header"><h2 id="memory-title">Memoria verde</h2><span>{matched.length / 2}/{pairs.length} parejas</span></div>
        <p>Une cada acción con su beneficio para el ambiente.</p>
        <div className="memory-grid">
          {deck.map((card, index) => {
            const found = matched.includes(card.id)
            const visible = found || first === card.id || miss.includes(card.id)
            return (
              <button key={card.id} type="button" onClick={() => reveal(card.id)}
                aria-disabled={found || first === card.id} data-revealed={visible} data-matched={found}
                className="memory-card" aria-label={visible ? card.term + (found ? ', pareja encontrada' : '') : 'Voltear carta ' + (index + 1)}>
                {visible ? <><span aria-hidden="true">{card.icon}</span>{card.term}</> : <Leaf size={28} aria-hidden="true" />}
              </button>
            )
          })}
        </div>
        {matched.length === deck.length && <p className="game-win">Completaste todas las parejas.</p>}
        <Restart onClick={restart} />
      </section>
    </div>
  )
}

export function GamesPage() {
  const [game, setGame] = useState<'platform' | 'waste' | 'memory'>('platform')
  return (
    <div className="page-container">
      <section className="campus-section games-section">
        <NatureSectionHeader title="Minijuegos ambientales" icon={Gamepad2}
          description="Juega con Jaguarcín y practica cómo cuidar el campus."
          artwork={<img className="game-header-mascot" src="/games/jaguarcin-pixel.png" alt="" />} />
        <div className="game-choices" role="group" aria-label="Elegir minijuego">
          <button type="button" aria-pressed={game === 'platform'} onClick={() => setGame('platform')}><Leaf size={19} aria-hidden="true" /> Sendero verde</button>
          <button type="button" aria-pressed={game === 'waste'} onClick={() => setGame('waste')}><Trash2 size={19} aria-hidden="true" /> Separa los residuos</button>
          <button type="button" aria-pressed={game === 'memory'} onClick={() => setGame('memory')}><Leaf size={19} aria-hidden="true" /> Memoria verde</button>
        </div>
        {game === 'platform' && <PlatformGame />}
        {game === 'waste' && <WasteGame />}
        {game === 'memory' && <MemoryGame />}
      </section>
    </div>
  )
}
