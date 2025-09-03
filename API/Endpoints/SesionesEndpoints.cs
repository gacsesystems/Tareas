using Dominio.Sesiones;
using Infraestructura.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace API.Endpoints
{
    public static class SesionesEndpoints
    {
        public static IEndpointRouteBuilder MapSesiones(this IEndpointRouteBuilder app)
        {
            // Iniciar sesión (start)
            app.MapPost("/api/sesiones/iniciar", async (AppDbContext db, SesionTrabajo s) =>
            {
                // Se aceptan: TareaId (opcional), Categoria (opcional), ModoRollover (enum), Notas (opcional).
                s.Inicio = s.Inicio == default ? DateTime.UtcNow : s.Inicio;
                s.Creado = DateTime.UtcNow;
                s.Modificado = s.Creado;

                db.Sesiones.Add(s);
                await db.SaveChangesAsync();
                return Results.Created($"/api/sesiones/{s.Id}", s);
            });

            // Finalizar sesión (stop)
            app.MapPost("/api/sesiones/finalizar/{id:long}", async (AppDbContext db, long id, short? focoMin, short? descansoMin, string? notas) =>
            {
                var s = await db.Sesiones.FindAsync(id);
                if (s is null) return Results.NotFound();

                s.Fin = DateTime.UtcNow;
                if (focoMin.HasValue) s.FocoMin = focoMin.Value;
                if (descansoMin.HasValue) s.DescansoMin = descansoMin.Value;
                if (!string.IsNullOrWhiteSpace(notas)) s.Notas = notas;
                s.Modificado = DateTime.UtcNow;

                // Sumar al tiempo total de la tarea (si aplica)
                if (s.TareaId is long tareaId)
                {
                    var t = await db.Tareas.FindAsync(tareaId);
                    if (t is not null)
                    {
                        t.TiempoTotalMin += s.FocoMin;
                        t.PomosRealizados += (short)Math.Max(1, s.FocoMin / 25); // regla simple; ajusta si usas bloques
                        t.Modificado = DateTime.UtcNow;
                    }
                }

                await db.SaveChangesAsync();
                return Results.Ok(s);
            });

            // Listar sesiones por tarea o por rango
            app.MapGet("/api/sesiones", async (AppDbContext db, long? tareaId, DateTime? desde, DateTime? hasta) =>
            {
                var q = db.Sesiones.AsQueryable();
                if (tareaId.HasValue) q = q.Where(x => x.TareaId == tareaId);
                if (desde.HasValue) q = q.Where(x => x.Inicio >= desde.Value);
                if (hasta.HasValue) q = q.Where(x => x.Inicio < hasta.Value);
                var list = await q.OrderByDescending(x => x.Inicio).Take(500).ToListAsync();
                return Results.Ok(list);
            });

            // Obtener una sesión por id
            app.MapGet("/api/sesiones/{id:long}", async (AppDbContext db, long id) =>
            {
                var s = await db.Sesiones.FindAsync(id);
                return s is null ? Results.NotFound() : Results.Ok(s);
            });

            // Eliminar sesión
            app.MapDelete("/api/sesiones/{id:long}", async (AppDbContext db, long id) =>
            {
                var s = await db.Sesiones.FindAsync(id);
                if (s is null) return Results.NotFound();
                db.Sesiones.Remove(s);
                await db.SaveChangesAsync();
                return Results.NoContent();
            });

            return app;
        }
    }
}
