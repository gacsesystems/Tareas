using Dominio.Proyectos;
using Infraestructura.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace API.Endpoints
{
    public static class ProyectosEndpoints
    {
        public static IEndpointRouteBuilder MapProyectos(this IEndpointRouteBuilder app)
        {
            app.MapGet("/api/proyectos", async (AppDbContext db) =>
            {
                var list = await db.Proyectos.OrderByDescending(p => p.Id).ToListAsync();
                return Results.Ok(list);
            });

            app.MapPost("/api/proyectos", async (AppDbContext db, Proyecto p) =>
            {
                p.Creado = DateTime.UtcNow; p.Modificado = p.Creado;
                db.Proyectos.Add(p); 
                await db.SaveChangesAsync();
                return Results.Created($"/api/proyectos/{p.Id}", p);
            });

            app.MapPut("/api/proyectos/{id:long}", async (AppDbContext db, long id, Proyecto dto) =>
            {
                var p = await db.Proyectos.FindAsync(id);
                if (p is null) return Results.NotFound();
                p.Nombre = dto.Nombre; p.Objetivo = dto.Objetivo; p.Area = dto.Area;
                p.Estado = dto.Estado; p.FechaInicio = dto.FechaInicio; p.FechaFinPrevista = dto.FechaFinPrevista;
                p.ProgresoPct = dto.ProgresoPct; p.NotasMd = dto.NotasMd; p.Modificado = DateTime.UtcNow;
                await db.SaveChangesAsync(); 
                return Results.Ok(p);
            });

            app.MapDelete("/api/proyectos/{id:long}", async (AppDbContext db, long id) =>
            {
                var p = await db.Proyectos.FindAsync(id);
                if (p is null) return Results.NotFound();
                db.Proyectos.Remove(p); await db.SaveChangesAsync();
                return Results.NoContent();
            });

            return app;
        }
    }
}
