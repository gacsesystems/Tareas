using Aplicacion.Tareas;
using Dominio.Tareas;
using API.Utils;
using Infraestructura.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace API.Endpoints
{
    public static class TareasEndpoints
    {
        public static IEndpointRouteBuilder MapTareas(this IEndpointRouteBuilder app)
        {
            app.MapGet("/api/tareas/{id:long}", async (AppDbContext db, long id) =>
            {
                var t = await db.Tareas.FindAsync(id);
                return t is null ? Results.NotFound() : Results.Ok(t);
            });

            app.MapGet("/api/tareas", async (AppDbContext db, EstadoTarea? state, long? projectId) =>
            {
                var q = db.Tareas.AsQueryable();
                if (state.HasValue) q = q.Where(t => t.Estado == state);
                if (projectId.HasValue) q = q.Where(t => t.ProyectoId == projectId);
                var list = await q.Where(t => t.Estado != EstadoTarea.Hecha)
                                  .OrderBy(t => t.Ranking).ThenByDescending(t => t.Score)
                                  .ToListAsync();
                return Results.Ok(list);
            });

            app.MapGet("/api/tareas/hoy", async (AppDbContext db) =>
            {
                var list = await db.Tareas.Where(t => t.Estado != EstadoTarea.Hecha)
                                          .OrderBy(t => t.Ranking)
                                          .ThenByDescending(t => t.Score)
                                          .Take(100).ToListAsync();
                return Results.Ok(list);
            });

            app.MapPost("/api/tareas", async (AppDbContext db, Tarea t) =>
            {
                t.Creado = DateTime.UtcNow; t.Modificado = t.Creado;
                if (t.Ranking == 0) t.Ranking = 1000;
                db.Tareas.Add(t);
                await db.SaveChangesAsync();
                return Results.Created($"/api/tareas/{t.Id}", t);
            });

            app.MapPut("/api/tareas/{id:long}", async (AppDbContext db, long id, Tarea dto) =>
            {
                var t = await db.Tareas.FindAsync(id);
                if (t is null) return Results.NotFound();

                t.Titulo = dto.Titulo; t.DetalleMd = dto.DetalleMd;
                t.Estado = dto.Estado; t.Area = dto.Area; t.ContextoId = dto.ContextoId;
                t.Eisenhower = dto.Eisenhower; t.Impacto = dto.Impacto; t.UrgenteDias = dto.UrgenteDias;
                t.Frog = dto.Frog; t.Pareto = dto.Pareto; t.Bloqueada = dto.Bloqueada; t.BloqueoMotivo = dto.BloqueoMotivo;
                t.DueDate = dto.DueDate; t.PomosEstimados = dto.PomosEstimados; t.ProyectoId = dto.ProyectoId;

                t.Modificado = DateTime.UtcNow;
                await db.SaveChangesAsync();
                return Results.Ok(t);
            });

            app.MapPost("/api/tareas/{id:long}/completas", async (AppDbContext db, long id) =>
            {
                var t = await db.Tareas.FindAsync(id);
                if (t is null) return Results.NotFound();
                t.Estado = EstadoTarea.Hecha;
                t.Modificado = DateTime.UtcNow;
                await db.SaveChangesAsync();
                return Results.Ok(t);
            });

            app.MapPost("/api/tareas/{id:long}/empujar", async (AppDbContext db, long id, IServicioPrioridadTareas prio) =>
            {
                var t = await db.Tareas.FindAsync(id);
                if (t is null) return Results.NotFound();

                var minRank = await db.Tareas.Where(x => x.Estado != EstadoTarea.Hecha)
                                             .MinAsync(x => (int?)x.Ranking) ?? 1000;

                t.Ranking = prio.SiguienteTopRanking(minRank);
                t.ScoreBoostUntil = DateTime.UtcNow.AddHours(24);
                t.Modificado = DateTime.UtcNow;

                await db.SaveChangesAsync();
                return Results.Ok(t);
            });

            // Recalcular score de una tarea
            app.MapPost("/api/tareas/{id:long}/recalcular-score", async (AppDbContext db, long id, IServicioPrioridadTareas prio) =>
            {
                var t = await db.Tareas.FindAsync(id);
                if (t is null) return Results.NotFound();

                // Antigüedad en días (máx. 90)
                var antig = (int)Math.Clamp((DateTime.UtcNow - t.Creado).TotalDays, 0, 90);

                // Días para vencimiento (máx. 14)
                var venc = t.DueDate.HasValue
                    ? Math.Max(0, (int)(t.DueDate.Value - DateTime.UtcNow).TotalDays)
                    : 0;

                // Cargar pesos (si no hay en CONFIGURACION, usa defaults)
                var pesos = await ConfigHelper.CargarPesosAsync(db) ?? new PrioridadPeso();

                t.Score = prio.CalcularPrioridad(t, DateTime.UtcNow, pesos, antig, venc);
                t.Modificado = DateTime.UtcNow;

                await db.SaveChangesAsync();
                return Results.Ok(t);
            });

            return app;
        }
    }
}
