const areas = [
  {
    id: 'sendero-ecologico',
    name: 'Sendero Ecológico',
    title: 'Flower Steps',
    author: 'Jennifer Letizia Sequeira Verbis',
    page: 6,
    photo: 'sendero',
    bounds: [29, 68, 666, 408, 1466],
    alt: 'Sendero bajo el dosel de árboles, con hojas y flores a los lados.',
    description: 'El álbum registra espino de playa, también llamado michigüiste, en este sendero arbolado.',
    species: 'Pithecellobium dulce',
  },
  {
    id: 'plaza-chilamate',
    name: 'Plaza Chilamate',
    title: 'Raíces del Tiempo: El Abrazo Eterno del Chilamate',
    author: 'Cristian Alberto Robleto Toruño',
    page: 8,
    photo: 'chilamate',
    bounds: [38, 56, 665, 380, 1481],
    alt: 'Fotografía histórica del tronco del chilamate rodeado de hojas de potos.',
    description: 'El chilamate de la foto se cayó. Después se renovó la plaza y se sembraron nuevas plantas.',
    species: 'Ficus crocata y Epipremnum aureum',
    historical: true,
  },
  {
    id: 'jaguar-jungle',
    name: 'Jaguar Jungle',
    title: 'Donde el tiempo se esconde',
    author: 'Bayardo Noel Box Gaitán',
    page: 13,
    photo: 'jaguar-jungle',
    bounds: [764, 54, 665, 379, 1452],
    alt: 'Mesas y bancos bajo árboles en Jaguar Jungle.',
    description: 'Un rincón con mesas bajo los árboles. El álbum identifica un chilamate o matapalo en la fotografía.',
    species: 'Ficus crocata',
  },
  {
    id: 'arboretum-uam',
    name: 'Arboretum UAM',
    title: 'Tesoro escondido',
    author: 'Joselin Andrea Maltez Barrantes',
    page: 23,
    photo: 'arboretum',
    bounds: [761, 35, 665, 407, 1437],
    alt: 'Camino de piedra entre árboles y plantas del arboretum.',
    description: 'El álbum documenta un gavinalcillo, también llamado chiquirín o mamasquillo, en el arboretum.',
    species: 'Albizia adinocephala',
  },
] as const

export function GreenAreaCards() {
  return (
    <section className="green-areas" aria-labelledby="fichas-title">
      <h2 id="fichas-title">Fichas de áreas verdes</h2>
      <nav aria-label="Fichas de áreas verdes" className="green-area-links">
        {areas.map((area) => <a key={area.id} href={'#' + area.id}>{area.name}</a>)}
      </nav>
      <div className="green-area-grid">
        {areas.map((area) => {
          const [x, y, width, height, fullWidth] = area.bounds
          const scale = fullWidth / width * 100
          return (
            <article key={area.id} id={area.id} className="green-area-card">
              <figure>
                <div className="green-area-photo" style={{ aspectRatio: width + '/' + height }}>
                  <img src={`/album-uam/${area.photo}.png`} alt={area.alt} loading="lazy"
                    style={{ width: scale + '%', left: -x / width * 100 + '%', top: -y / height * 100 + '%' }} />
                </div>
                <figcaption>«{area.title}» · {area.author} · Álbum UAM Verde, p. {area.page}</figcaption>
              </figure>
              <div className="green-area-copy">
                <h3>{area.name}</h3>
                {'historical' in area && <p className="green-area-history">Foto histórica</p>}
                <p>{area.description}</p>
                <p>Flora registrada en el álbum <em>{area.species}</em>.</p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
