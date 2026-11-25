export const GROUND = 327

type Point = { x: number; y: number }
type Platform = Point & { width: number; height: number }
type Litter = { x: number; width: number; height: number; kind: 'bag' | 'can' }
type RollingDrum = { from: number; to: number; speed: number }
type Theme = {
  sky: [string, string, string]
  distant: string
  hills: string
  trees: string
  bark: string
  grass: string
  edge: string
  soil: string
  flecks: string
  light: string
  landmark: 'canopy' | 'wetland' | 'tower' | 'grove'
}
export type Level = {
  name: string
  time: string
  intro: string
  width: number
  finish: number
  ledges: Platform[]
  seeds: Point[]
  fruits: Point[]
  litter: Litter[]
  drums: RollingDrum[]
  water?: { start: number; end: number; surface: number; hazards: number[] }
  vine?: Point & { length: number; entry: number; landing: number }
  theme: Theme
}

const land = (...ranges: [number, number][]): Platform[] =>
  ranges.map(([start, end]) => ({ x: start, y: GROUND, width: end - start, height: 63 }))
const shelf = (x: number, y: number, width: number, height = 18): Platform => ({ x, y, width, height })
const items = (...positions: [number, number][]): Point[] => positions.map(([x, y]) => ({ x, y }))
const can = (x: number): Litter => ({ x, width: 28, height: 28, kind: 'can' })
const bag = (x: number): Litter => ({ x, width: 33, height: 30, kind: 'bag' })
const water = (start: number, end: number) => ({ start, end, surface: 343, hazards: [] as number[] })
const vine = (x: number) => ({ x, y: 110, length: 150, entry: 0, landing: 0 })

const layouts: Level[] = [
  {
    name: 'Sendero del Chilamate', time: 'Día',
    intro: 'Recoge semillas y fruta mágica. Si caes al agua, el delfín te ayuda a cruzar.',
    width: 2480, finish: 2370,
    ledges: [
      ...land([0, 386], [492, 828], [937, 1359], [1473, 1874], [1992, 2480]),
      shelf(235, 264, 78, 63), shelf(558, 268, 84), shelf(698, 223, 84),
      shelf(1080, 257, 92, 70), shelf(1240, 214, 80), shelf(1550, 259, 90),
      shelf(1750, 269, 76, 58), shelf(2070, 257, 84), shelf(2290, 259, 58),
    ],
    seeds: items([273, 231], [739, 190], [1280, 180], [1595, 223], [2112, 225]),
    fruits: items([522, 300], [2024, 298]),
    litter: [can(149), bag(664), can(1021), bag(1686), bag(2212)],
    drums: [],
    water: water(828, 937), vine: vine(1417),
    theme: {
      sky: ['#65bbe0', '#9edcda', '#e8f5c5'], distant: '#8fbc8c', hills: '#539567',
      trees: '#3a784c', bark: '#60603c', grass: '#68ab38', edge: '#b6d550',
      soil: '#8b583c', flecks: '#a66f48', light: '#fff1ad', landmark: 'canopy',
    },
  },
  {
    name: 'Humedal dorado', time: 'Atardecer',
    intro: 'Monta al delfín para recorrer el humedal y salta sobre la basura que encuentres en el agua.',
    width: 2940, finish: 2830,
    ledges: [
      ...land([0, 372], [474, 904], [1040, 1450], [1560, 1976], [2088, 2485], [2590, 2940]),
      shelf(242, 270, 76, 57), shelf(560, 253, 86), shelf(750, 255, 74), shelf(1110, 265, 82, 62),
      shelf(1306, 226, 73), shelf(1658, 258, 94), shelf(1842, 276, 78),
      shelf(2180, 260, 96, 67), shelf(2356, 218, 76), shelf(2700, 260, 82),
    ],
    seeds: items([270, 237], [602, 224], [1150, 234], [1690, 228], [1880, 243], [2390, 187], [2740, 228]),
    fruits: items([518, 298], [1598, 298], [2640, 298]),
    litter: [bag(158), can(698), bag(1260), can(1782), bag(2298), can(2790)],
    drums: [{ from: 610, to: 657, speed: 61 }, { from: 1865, to: 1935, speed: 73 }, { from: 2680, to: 2740, speed: 70 }],
    water: water(904, 1040), vine: vine(1506),
    theme: {
      sky: ['#855a9c', '#e68790', '#ffe09b'], distant: '#a96d83', hills: '#746276',
      trees: '#575854', bark: '#6a493f', grass: '#809650', edge: '#d7b36b',
      soil: '#805453', flecks: '#a27059', light: '#ffe3a3', landmark: 'wetland',
    },
  },
  {
    name: 'Torres del vivero', time: 'Noche',
    intro: 'Sigue las luces entre las torres y calcula el salto cuando se acerquen los bidones.',
    width: 3420, finish: 3310,
    ledges: [
      ...land([0, 415], [521, 935], [1048, 1490], [1610, 2030], [2140, 2560], [2672, 3020], [3130, 3420]),
      shelf(225, 275, 86, 52), shelf(405, 244, 62), shelf(620, 256, 82, 71), shelf(773, 209, 90),
      shelf(1138, 268, 85), shelf(1270, 246, 82, 81), shelf(1410, 229, 63),
      shelf(1704, 255, 60, 72), shelf(1843, 214, 74), shelf(2040, 245, 55),
      shelf(2250, 257, 93, 70), shelf(2446, 219, 77), shelf(2725, 252, 77),
      shelf(2862, 269, 64, 58), shelf(3190, 244, 71),
    ],
    seeds: items([262, 245], [431, 217], [812, 179], [1178, 236], [1440, 197], [1878, 183], [2480, 188], [2756, 223], [3224, 211]),
    fruits: items([565, 299], [1645, 298], [2710, 300], [3165, 298]),
    litter: [can(132), bag(730), can(1110), bag(1956), can(2194), bag(2505), can(2960)],
    drums: [{ from: 330, to: 376, speed: 80 }, { from: 803, to: 875, speed: 89 }, { from: 1363, to: 1405, speed: 75 },
      { from: 1779, to: 1840, speed: 87 }, { from: 2365, to: 2425, speed: 91 }, { from: 3240, to: 3275, speed: 80 }],
    water: water(935, 1048), vine: vine(1550),
    theme: {
      sky: ['#15284c', '#293960', '#585477'], distant: '#474b75', hills: '#313f66',
      trees: '#2e4d61', bark: '#3d3d55', grass: '#4e9a83', edge: '#97d0ae',
      soil: '#4b4b69', flecks: '#646885', light: '#e4eeff', landmark: 'tower',
    },
  },
  {
    name: 'Corredor de semillas', time: 'Amanecer',
    intro: 'Combina lo que aprendiste: atraviesa el agua, toma la liana y esquiva los bidones hasta la meta final.',
    width: 3990, finish: 3880,
    ledges: [
      ...land([0, 408], [520, 948], [1071, 1522], [1642, 2075], [2193, 2610], [2730, 3170], [3284, 3655], [3770, 3990]),
      shelf(245, 265, 72, 62), shelf(598, 251, 74), shelf(781, 264, 90, 63),
      shelf(1160, 257, 75, 70), shelf(1368, 217, 72), shelf(1720, 262, 81, 65),
      shelf(1900, 229, 76), shelf(2120, 245, 53), shelf(2270, 258, 72, 69),
      shelf(2430, 211, 85), shelf(2808, 254, 94), shelf(2980, 259, 68, 68),
      shelf(3325, 254, 70), shelf(3496, 226, 80), shelf(3808, 250, 67),
    ],
    seeds: items([279, 228], [630, 222], [824, 232], [1192, 227], [1403, 186], [1934, 199], [2143, 218],
      [2472, 181], [2857, 221], [3015, 230], [3537, 195], [3840, 219]),
    fruits: items([553, 300], [1105, 298], [1674, 296], [2764, 298], [3315, 298]),
    litter: [bag(148), can(710), bag(1290), can(1850), bag(2390), can(2927), bag(3434), can(3830)],
    drums: [{ from: 327, to: 369, speed: 77 }, { from: 877, to: 915, speed: 83 }, { from: 1437, to: 1480, speed: 90 },
      { from: 1960, to: 2021, speed: 100 }, { from: 2500, to: 2559, speed: 96 },
      { from: 3060, to: 3127, speed: 97 }, { from: 3560, to: 3612, speed: 92 }],
    water: water(948, 1071), vine: vine(1582),
    theme: {
      sky: ['#7b87cb', '#dcaabb', '#ffe2a4'], distant: '#a186aa', hills: '#698d83',
      trees: '#49745d', bark: '#685750', grass: '#6f9d58', edge: '#c7d47e',
      soil: '#765348', flecks: '#a1745a', light: '#fff1b0', landmark: 'grove',
    },
  },
]

export const levels = layouts.map((level, index): Level => {
  const water = level.water!
  const vine = level.vine!
  const waterLength = [660, 1040, 740, 920][index]
  const vineLeft = level.ledges.filter((ledge) => ledge.y === GROUND && ledge.x < vine.x).at(-1)!
  const vineRight = level.ledges.find((ledge) => ledge.y === GROUND && ledge.x > vine.x)!
  const ravineStart = vineLeft.x + vineLeft.width
  const ravineLength = 398 + index * 8
  const waterExtra = waterLength - (water.end - water.start)
  const ravineExtra = ravineLength - (vineRight.x - ravineStart)
  const shift = (x: number) => x + (x >= water.end ? waterExtra : 0) + (x >= vineRight.x ? ravineExtra : 0)
  const shiftPoint = <T extends { x: number }>(item: T) => ({ ...item, x: shift(item.x) })
  const hazards = [162, 311, 464, 607, 756, 905].filter((distance) => distance < waterLength - 78)
    .map((distance) => water.start + distance)
  const waterSeeds = hazards.flatMap((x) => items([x - 19, 257], [x + 12, 248]))
  const ravine = shift(ravineStart)
  return {
    ...level,
    width: shift(level.width),
    finish: shift(level.finish),
    ledges: level.ledges.map(shiftPoint),
    seeds: [...level.seeds.map(shiftPoint), ...waterSeeds, ...items([ravine + 119, 255], [ravine + 230, 263], [ravine + 337, 245])],
    fruits: level.fruits.map(shiftPoint),
    litter: level.litter.map(shiftPoint),
    drums: level.drums.map((drum) => ({ ...drum, from: shift(drum.from), to: shift(drum.to) })),
    water: { ...water, end: water.start + waterLength, hazards },
    vine: {
      x: ravine + ravineLength / 2, y: 12, length: 269 + index * 5,
      entry: ravine, landing: ravine + ravineLength,
    },
  }
})

export function drumX(drum: RollingDrum, elapsed: number, index: number) {
  const distance = drum.to - drum.from
  const progress = (elapsed * drum.speed + index * 31) % (distance * 2)
  return drum.from + (progress <= distance ? progress : distance * 2 - progress)
}
