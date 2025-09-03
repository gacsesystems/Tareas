using Dominio.Diario;
using Infraestructura.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace API.Endpoints
{
    public static class DiarioEndpoints
    {
        public static IEndpointRouteBuilder MapDiario(this IEndpointRouteBuilder app)
        {
            // Crear entrada del diario
            app.MapPost("/api/diario", async (AppDbContext db, EntradaDiario e) =>
            {
                e.Fecha = e.Fecha == default ? DateOnly.FromDateTime(DateTime.UtcNow) : e.Fecha;
                e.Creado = DateTime.UtcNow;
                e.Modificado = e.Creado;

                db.EntradasDiario.Add(e);
                await db.SaveChangesAsync();
                return Results.Created($"/api/diario/{e.Id}", e);
            });

            // Actualizar entrada
            app.MapPut("/api/diario/{id:long}", async (AppDbContext db, long id, EntradaDiario dto) =>
            {
                var e = await db.EntradasDiario.FindAsync(id);
                if (e is null) return Results.NotFound();

                e.Fecha = dto.Fecha;
                e.ContenidoMd = dto.ContenidoMd;
                e.Modificado = DateTime.UtcNow;

                await db.SaveChangesAsync();
                return Results.Ok(e);
            });

            // Obtener entradas por fecha (YYYY-MM-DD)
            app.MapGet("/api/diario/por-fecha/{fecha}", async (AppDbContext db, string fecha) =>
            {
                if (!DateOnly.TryParse(fecha, out var f))
                    return Results.BadRequest("Fecha inválida (usa YYYY-MM-DD).");

                var list = await db.EntradasDiario
                                   .Where(x => x.Fecha == f)
                                   .OrderBy(x => x.Id)
                                   .ToListAsync();
                return Results.Ok(list);
            });

            // Obtener una entrada por id
            app.MapGet("/api/diario/{id:long}", async (AppDbContext db, long id) =>
            {
                var e = await db.EntradasDiario.FindAsync(id);
                return e is null ? Results.NotFound() : Results.Ok(e);
            });

            // Eliminar entrada
            app.MapDelete("/api/diario/{id:long}", async (AppDbContext db, long id) =>
            {
                var e = await db.EntradasDiario.FindAsync(id);
                if (e is null) return Results.NotFound();
                db.EntradasDiario.Remove(e);
                await db.SaveChangesAsync();
                return Results.NoContent();
            });

            return app;
        }
    }
}
