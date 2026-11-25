# EcoUAM — Conoce y cuida nuestros espacios verdes

Proyecto académico independiente para la UAM, Managua, Nicaragua. **Fase 1: base del proyecto.** No es una aplicación oficial de la universidad.

## Ejecutar

Requiere Node.js 22.12+ y pnpm. Versiones fijadas en `pnpm-lock.yaml`.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm preview
```

En esta computadora también puedes abrir **Iniciar-EcoUAM.cmd** y visitar la dirección local mostrada. Para compilar desde PowerShell: `./scripts/dev.ps1 build`. El ayudante usa pnpm instalado o el incluido junto al Node de Codex. El servidor permanece abierto mientras la terminal siga ejecutándose.

## Alcance de esta entrega

- React + TypeScript + Vite, Tailwind CSS y Lucide React.
- Navegación responsive con nueve rutas, menú móvil, Escape, foco al navegar y enlace para saltar al contenido.
- Portada base y páginas de espera; no se han desarrollado los módulos funcionales.
- Fuentes iniciales y avisos sobre datos pendientes.
- Manifest PWA en español, iconos locales, service worker y aviso de nueva versión.
- Sin autenticación, base de datos, analítica ni servicios externos de datos.

## Carpetas

- `src/app`: rutas y pruebas de navegación.
- `src/components`: estructura compartida, marca y avisos PWA.
- `src/features`: inicio, fuentes y pantalla compartida para módulos pendientes.
- `src/data`: catálogo de módulos y fuentes; sin datos institucionales simulados.
- `src/styles`: Tailwind, colores y estilos responsive.
- `src/test`: configuración de pruebas.
- `public`: iconos y favicon.
- `scripts`: ayudante local de ejecución.
- `docs`: alcance y verificación por fases.

Los módulos reales se incorporarán como carpetas independientes dentro de `src/features`, cuando comience su fase. No se añaden carpetas vacías ni implementaciones ficticias.

## PWA inicial

Se genera en producción con `pnpm build`; usa `pnpm preview` para comprobarla en localhost. Cachea la interfaz local y permite resolver las rutas a index.html. No se cachean fuentes institucionales ni mediciones remotas. La estrategia completa de uso sin conexión, instalación y pruebas en dispositivos corresponde a la fase 8. No se promete disponibilidad de contenido aún no desarrollado. En producción necesita HTTPS.

## GitHub y Vercel

Repositorio: https://github.com/dmperezri/EcoUAM

Incluye `.gitignore`, lockfile y `vercel.json`. Vercel detectará Vite; salida `dist`, compilación `pnpm build`. Las rutas internas tienen fallback a index.html. No se necesitan variables de entorno. El despliegue público queda para la fase 10.

## Fuentes

- https://www.uam.edu.ni/uam-verde-principal/
- https://www.uam.edu.ni/boletin-meteorologico-uam/
- https://online.fliphtml5.com/ffseqs/wznf/#p=1

Las dos páginas UAM se consultaron el 24/11/2026. El contenido de FlipHTML5 queda pendiente de revisión. No se reproducen fotografías, datos meteorológicos, especies, mapas ni logotipos oficiales. Los iconos vegetales son ilustrativos y los de interfaz proceden de Lucide (ISC).

Referencias técnicas: [Vite](https://vite.dev/guide/), [Tailwind con Vite](https://tailwindcss.com/docs/installation/using-vite), [Vite PWA](https://vite-pwa-org.netlify.app/guide/).
