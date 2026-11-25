import { House, Map, Trees, Flower2, CloudSun, Lightbulb, Images, CircleHelp, BookOpen } from 'lucide-react'
export const modules = [
  { path: '/', label: 'Inicio', icon: House, description: 'El punto de partida para conocer EcoUAM.' },
  { path: '/mapa', label: 'Mapa del campus', icon: Map, description: 'Explora el campus a partir de un mapa real y ubicaciones verificadas.', pending: 'Pendiente de recibir y digitalizar el mapa real de la UAM.' },
  { path: '/areas-verdes', label: 'Áreas verdes', icon: Trees, description: 'Conoce los espacios verdes y su valor para la comunidad.', pending: 'Pendiente de documentar las zonas y validar sus ubicaciones.' },
  { path: '/biodiversidad', label: 'Biodiversidad', icon: Flower2, description: 'Descubre la vida que forma parte de nuestro entorno.', pending: 'Pendiente de verificar las especies presentes en el campus.' },
  { path: '/clima', label: 'Clima en la UAM', icon: CloudSun, description: 'Acércate a la información meteorológica de la universidad.', pending: 'Pendiente de integrar una fuente verificable, con fecha y hora de actualización. No hay mediciones disponibles aquí todavía.' },
  { path: '/ecoconsejos', label: 'Ecoconsejos', icon: Lightbulb, description: 'Pequeñas acciones para cuidar nuestros espacios compartidos.', pending: 'Contenido educativo pendiente de elaboración y revisión.' },
  { path: '/galeria', label: 'Galería ambiental', icon: Images, description: 'Una mirada a los espacios y la naturaleza del campus.', pending: 'Pendiente de incorporar fotografías reales con permiso y créditos.' },
  { path: '/cuestionario', label: 'Mini cuestionario', icon: CircleHelp, description: 'Un espacio para aprender y poner a prueba tus conocimientos.', pending: 'Preguntas y respuestas pendientes de elaboración y validación.' },
  { path: '/fuentes', label: 'Fuentes y créditos', icon: BookOpen, description: 'Consulta las referencias y conoce el alcance del proyecto.' },
] as const
export type Module = (typeof modules)[number]
