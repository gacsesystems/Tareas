# panel-saul: Frontend (Vite + React + TypeScript + Tailwind)

Este paquete es el panel web que consume la API del backend. Está construido con Vite, React 19, TypeScript, Tailwind 4 y TanStack Query 5, siguiendo una estructura por dominios (Tareas, Proyectos, Sesiones, Diario, Hábitos, Finanzas).

## Estructura

```
panel-saul/
  src/
    lib/
      api.ts           # Cliente HTTP base (fetch) y helpers
      types.ts         # Tipos/contratos compartidos con el backend
    hooks/             # Hooks por dominio (useTareas, useProyectos, ...)
    routes/            # Rutas/páginas (Hoy, Tareas, Proyectos, ...)
    components/        # Componentes genéricos (UI, Pomodoro, Toast)
    new/components/    # Componentes en desarrollo/experimentales
    App.tsx            # Enrutador principal y layout
    main.tsx           # Bootstrap React + QueryClient + Router
    app.css / index.css# Estilos base utilitarios
  vite.config.ts       # Configuración Vite/Plugins
  eslint.config.js     # Reglas de linting (TS/React)
  tsconfig*.json       # Configuración TS/paths
```

## Principios y convenciones

- Rutas basadas en `react-router-dom` 7 y páginas en `src/routes`.
- Data fetching con TanStack Query; el cliente HTTP vive en `lib/api.ts`.
- Tipos fuertemente tipados en `lib/types.ts` alineados con contratos del backend.
- Hooks por dominio en `src/hooks` para encapsular queries/mutaciones y no repetir lógica en vistas.
- Estilos utilitarios con Tailwind; clases semánticas y composición con `classnames` cuando aplica.
- Estado global mínimo: preferir Query Cache y estado local de componente.
- Convención de imports con alias `@` a `src` (ver `tsconfig.json`/`vite.config.ts`).

## Variables de entorno

- `VITE_API_BASE`: URL base de la API. Por defecto en `lib/api.ts` cae a `https://localhost:44348`.

Ejemplos:

```bash
# Windows (PowerShell)
$env:VITE_API_BASE="http://localhost:5000"
# Linux/Mac
export VITE_API_BASE=http://localhost:5000
```

## Cliente HTTP (`lib/api.ts`)

- Normaliza `BASE_URL` (sin slash final) y expone `api.get/post/put/del`.
- Lanza `Error(text)` si `!res.ok` para que TanStack Query maneje errores.

Uso típico con TanStack Query:

```ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Tarea } from '@/lib/types';

export function useTareas(state?: number) {
	return useQuery({
		queryKey: ['tareas', state],
		queryFn: () => api.get<Tarea[]>(`/api/tareas${state ? `?state=${state}` : ''}`),
	});
}
```

## Tipos (`lib/types.ts`)

- Reflejan entidades clave del backend: `Proyecto`, `Tarea`, `SesionTrabajo`, `EntradaDiario`, `MovimientoFinanciero`, `Habito`, etc.
- `EstadoTarea` se expone como objeto-const para facilitar uso en UI y filtros.

## Routing y layout (`App.tsx`)

- Sidebar con navegación a: `Hoy`, `Tareas`, `Proyectos`, `Sesiones`, `Diario`, `Reportes`, `Finanzas`, `Habitos`.
- Redirección `/` → `/hoy`.

## Estilo y UI

- Tailwind 4 para utilidades; estilos base en `app.css`/`index.css`.
- Componentes reutilizables en `components/` (e.g., `Toast`, `Pomodoro`).
- `sonner` para notificaciones; `classnames` para clases condicionales.

## Scripts

```bash
npm run dev      # Servidor Vite (HMR)
npm run build    # tsc -b && vite build
npm run preview  # Servir build (pre-producción)
npm run lint     # Reglas ESLint/TS/React
```

## Reglas de código

- TypeScript estricto; evita `any` salvo último recurso tipado.
- Componentes funcionales; props tipadas y sin lógica pesada inline.
- Hooks por dominio: `useXxx` para queries y mutaciones; exponer `data`, `isLoading`, `error` y funciones.
- Renderizar listas con `key` estável; memoizar computadas costosas si hay re-render.
- Manejo de errores: mostrar feedback amigable (toast o UI) y log opcional a consola en dev.

## Checklist para contribuir (humano/IA)

- ¿Existe ya un hook para este recurso? Extiéndelo antes de crear uno nuevo.
- ¿El contrato existe en `types.ts`? Reutilízalo o ajusta con cambios controlados.
- ¿La URL respeta `VITE_API_BASE` y rutas del backend? Valida en Swagger.
- ¿La UI mantiene patrones de navegación/estilos (sidebar, rutas, títulos)?
- ¿Hay estados de carga/vacío/error cubiertos? Añade tests/fixtures de datos mock si aplica.

## Ejecución local

1. Configura `VITE_API_BASE` si tu backend no usa el default.
2. Instala dependencias y levanta el dev server:

```bash
npm install
npm run dev
# http://localhost:5173
```

## Notas de producción

- Ajustar `VITE_API_BASE` en el entorno del build.
- Habilitar cache headers y compresión a nivel de hosting/CDN.
- Auditoría de ESLint debe pasar limpia (`npm run lint`).
