// using System.ComponentModel.DataAnnotations;
using Infraestructura.Persistencia;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace API.Endpoints
{
    public static class FinanzasContrapartesEndpoints
    {
        public static IEndpointRouteBuilder MapFinanzasContrapartes(this IEndpointRouteBuilder app)
        {
            var grp = app.MapGroup("/api/finanzas").WithTags("Finanzas");

            // Autocomplete de contrapartes
            grp.MapGet("/contrapartes", async (AppDbContext db, string? q, int? top) =>
            {
                var max = Math.Clamp(top ?? 10, 1, 50);

                var query = db.Movimientos
                    .AsNoTracking()
                    .Where(m => m.Contraparte != null && m.Contraparte != "");

                if (!string.IsNullOrWhiteSpace(q))
                {
                    var term = $"%{q.Trim()}%";
                    query = query.Where(m => EF.Functions.Like(m.Contraparte!, term));
                }

                var data = await query
                    .GroupBy(m => m.Contraparte!)
                    .Select(g => new { nombre = g.Key, conteo = g.Count() })
                    .OrderByDescending(x => x.conteo)
                    .ThenBy(x => x.nombre)
                    .Take(max)
                    .ToListAsync();

                return Results.Ok(data);
            });

            return app;
        }
    }
}
