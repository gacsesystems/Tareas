# Tareas: Monorepo Backend API (.NET) + Frontend (Vite/React) + DB (SQL Server)

Este repositorio contiene una API en C# (.NET 9), un frontend en Vite/React y un script SQL Server para el esquema base. Está pensado para trabajo personal/productividad (tareas, proyectos, sesiones/pomodoro, diario, hábitos, finanzas) con una arquitectura limpia y pragmática.

## Estructura del proyecto

```
Tareas.sln
API/                     # Capa de presentación (Minimal APIs)
  Program.cs             # Bootstrap, DI, Swagger, CORS
  Endpoints/             # Módulos de endpoints por subdominio
  Utils/                 # Utilidades (p.ej. ConfigHelper, Csv)
Aplicacion/              # Lógica de aplicación/orquestación
  Tareas/                # Servicios de dominio aplicados (prioridad, etc.)
Dominio/                 # Entidades y enums (puro dominio)
Infraestructura/         # Persistencia, EF Core, mapeos
  Persistencia/
    AppDbContext.cs
DB/                      # Script de base de datos (SQL Server)
panel-saul/              # Frontend (Vite + React + TS + Tailwind)
```

## Principios y estilo de arquitectura

- Capas claras y acopladas mínimamente:
  - Dominio: modelos y enums del negocio (sin dependencias a frameworks).
  - Aplicación: servicios que aplican reglas (p.ej. `IServicioPrioridadTareas`).
  - Infraestructura: persistencia con EF Core; configuración fluida por entidad.
  - API: Minimal APIs por módulo, registro vía métodos de extensión `app.MapX()`.
- EF Core sin DataAnnotations en entidades: la forma en DB se define en `AppDbContext` (ToTable, columnas, conversiones y precisiones).
- Preferencia por tipos precisos: `DateOnly`/`TimeOnly` con conversiones; `decimal` con precisión explícita.
- Enums convertidos a `byte` en DB para índices compactos.
- Rutas REST simples con filtros query (`state`, `projectId`) y órdenes consistentes.
- CORS abierto solo para dev; documentación con Swagger siempre activa en dev.

## Backend API (.NET 9)

- Framework: .NET 9 (C# 13), Minimal APIs.
- Persistencia: EF Core (SQL Server).
- Documentación: Swagger (AddEndpointsApiExplorer + SwaggerGen).
- CORS: política `CorsDev` para `http://localhost:5173` y `http://127.0.0.1:5173`.
- Inyección de dependencias: servicios en `Program.cs` y servicios de aplicación como singleton cuando son puros.

Ejemplo de registro de módulos en `Program.cs`:

```csharp
app.MapProyectos();
app.MapTareas();
app.MapSesiones();
app.MapDiario();
app.MapExport();
app.MapConfig();
app.MapHabitos();
app.MapFinanzas();
```

Ejemplo de endpoints de tareas (`/api/tareas`):

- GET `/api/tareas/{id}`: obtiene por id.
- GET `/api/tareas?state={EstadoTarea}&projectId={id}`: lista filtrada y ordenada por `Ranking` y `Score` descendente, excluye hechas.
- GET `/api/tareas/hoy`: top 100, mismas reglas de orden.
- POST `/api/tareas`: crea con defaults (`Ranking=1000`, timestamps UTC).
- PUT `/api/tareas/{id}`: actualiza campos principales y `Modificado`.
- POST `/api/tareas/{id}/completas`: marca como `Hecha`.
- POST `/api/tareas/{id}/empujar`: sube al top ajustando `Ranking` y aplica `ScoreBoostUntil` 24h.
- POST `/api/tareas/{id}/recalcular-score`: recalcula `Score` usando pesos de configuración.

## Dominio y reglas (Aplicación)

- Entidades están en `Dominio/` (p.ej. `Tarea`) con propiedades mapeadas 1:1 a columnas; los comportamientos se orquestan desde servicios de aplicación.
- Servicio de prioridad (`Aplicacion/Tareas/ServicioPrioridadTareas.cs`):
  - Calcula un `Score` 0–100 en base a Urgencia, Impacto, Eisenhower, Frog, Pareto, Antigüedad, Vencimiento, Bloqueo y señales adicionales (hábito/risgo), con pesos configurables (`PrioridadPeso`).
  - `SiguienteTopRanking` compacta al top restando 100 sobre el mínimo vigente.

## Persistencia (Infraestructura)

- `AppDbContext` configura nombres de tablas/columnas, conversiones, precisiones e índices.
- Índices diseñados para listas rápidas: por estado/ranking, score/vencimiento, etc.
- Conversiones `DateOnly`↔`date` y enums↔`byte` donde aplica.

## Base de datos (DB/Base.sql)

- SQL Server con catálogos base (áreas, Eisenhower, etc.) y tablas: `USUARIO`, `PROYECTO`, `TAREA`, `SESION_TRABAJO`, `ENTRADA_DIARIO`, `HABITO`, `HABITO_LOG`, `MOVTO_FINANCIERO`, `EVENTO`, `CAPTURA`, `CONFIGURACION`, `ETIQUETA`, etc.
- Restricciones, defaults, checks e índices para consultas de productividad (por próximas fechas, abiertas, etc.).

Pasos sugeridos:

1. Crear DB y ejecutar el script:

- Crear base de datos en SQL Server.
- Ejecutar `DB/Base.sql` completo.

2. Configurar cadena de conexión:

- En `API/appsettings.json` define `ConnectionStrings:Default` a tu servidor/DB.
- Si no existe, la API usa fallback: `Server=LAP_SAUL;Database=PROD_SAUL;Trusted_Connection=True;TrustServerCertificate=True`.

## Frontend (`panel-saul`)

- Stack: Vite 7, React 19, TypeScript, Tailwind 4, TanStack Query 5, React Router 7.
- Scripts:
  - `dev`: servidor de desarrollo Vite.
  - `build`: `tsc -b` + `vite build`.
  - `preview`: vista previa del build.
- Estructura: hooks por dominio (`useTareas`, `useProyectos`, etc.), rutas por vista (Hoy, Tareas, Proyectos, Hábitos, Finanzas, Sesiones, Diario, Reportes) y componentes nuevos en `src/new/components`.

## Cómo ejecutar

Backend (desde `API/`):

```bash
# Windows (CMD/PowerShell)
dotnet restore
dotnet run
# API en http://localhost:5000 o mostrado por Kestrel; Swagger en /swagger
```

Frontend (desde `panel-saul/`):

```bash
npm install
npm run dev
# App en http://localhost:5173
```

Permitir CORS: ya está habilitado para `localhost:5173` en dev (`CorsDev`).

## Estándares de código y convenciones

- Nombres y tipos
  - Propiedades en PascalCase, enums con valores semánticos; `Guid` para `Uid`.
  - Enums almacenados como `byte` en DB; conversiones explícitas en `OnModelCreating`.
  - Fechas: `DateTime` en UTC para timestamps; `DateOnly` para fechas puras.
- Diseño de endpoints
  - Agrupar por módulo en `API/Endpoints` con métodos de extensión `MapX`.
  - Rutas claras bajo `/api/{modulo}`; usar query params para filtros; `Results.*` para respuestas.
  - Ordenación consistente: `Ranking` asc y `Score` desc para listas de tareas.
- Persistencia
  - Configurar tabla/columnas/índices en `AppDbContext` en lugar de anotaciones.
  - Precisión/escala explícitas en `decimal` y `datetime2(n)`.
- Estilo general
  - Servicios de aplicación puros donde sea posible; inyección por interfaz.
  - Evitar lógica de negocio dentro de los endpoints; reusar servicios.
  - Tiempos y fechas en UTC; cálculo de score idempotente.

## Configuración y utilidades

- Swagger siempre activo en dev; root (`/`) redirige a `/swagger`.
- `API/Utils/ConfigHelper.cs`: carga de pesos para prioridad desde `CONFIGURACION` (clave recomendada: `priority.weights`).
- `API/Utils/CsvHelper.cs`: utilidades de exportación CSV para endpoints de export.

## Checklist de aportes (para humanos o IA)

- Antes de codificar
  - ¿El cambio pertenece a Dominio, Aplicación, Infraestructura o API?
  - ¿Se necesita un índice o conversión nueva en `AppDbContext`?
  - ¿Las rutas siguen la convención `/api/{modulo}` y devuelven `Results.*` correctos?
- Al implementar
  - Registra el módulo con `app.MapX()` en `Program.cs`.
  - Mantén UTC y defaults de creación/modificación.
  - Evita romper órdenes e índices usados por el frontend (ranking/score).
- Después de implementar
  - Ejecuta `dotnet run` y verifica Swagger.
  - Frontend: `npm run dev`, valida CORS y llamadas básicas.

## Notas de seguridad y despliegue

- En producción: activar HTTPS redirection, limitar CORS, variables de entorno para cadenas de conexión.
- Recomendado usar migraciones EF Core o ejecutar `DB/Base.sql` controlado por versión.

## Licencia

Uso personal/privado. Ajusta según tus necesidades.
