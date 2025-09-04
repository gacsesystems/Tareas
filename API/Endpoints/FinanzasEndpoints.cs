using System.Globalization;
using System.Net.NetworkInformation;
using System.Text;
using Dominio.Finanzas;
using Infraestructura.Persistencia;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace API.Endpoints
{
    public static class FinanzasEndpoints
    {
        public static IEndpointRouteBuilder MapFinanzas(this IEndpointRouteBuilder app)
        {
            var grp = app.MapGroup("/api/finanzas").WithTags("Finanzas");

            // Listar con filtros
            // /api/finanzas?desde=...&hasta=...&tipo=1|2&estatus=1|2|3&contraparte=..&proyectoId=..&tareaId=..
            grp.MapGet("", async (
                AppDbContext db, DateOnly? desde, DateOnly? hasta, TipoMovto? tipo, StatusMovto? estatus,
                string? contraparte, long? proyectoId, long? tareaId) =>
            {
                //var q = db.Set<MovtoFinanciero>().AsQueryable();
                var q = db.Movimientos.AsQueryable();

                if (desde.HasValue) q = q.Where(m => m.FechaObjetivo >= desde.Value);
                if (hasta.HasValue) q = q.Where(m => m.FechaObjetivo <= hasta.Value);
                if (tipo.HasValue) q = q.Where(m => m.Tipo == tipo.Value);
                if (estatus.HasValue) q = q.Where(m => m.Status == estatus.Value);
                if (!string.IsNullOrWhiteSpace(contraparte))
                    q = q.Where(m => m.Contraparte != null && m.Contraparte.Contains(contraparte));
                if (proyectoId.HasValue) q = q.Where(m => m.ProyectoId == proyectoId.Value);
                if (tareaId.HasValue) q = q.Where(m => m.TareaId == tareaId.Value);

                var list = await q.OrderBy(m => m.FechaObjetivo).ThenBy(m => m.Id).Take(5000).ToListAsync();
                return Results.Ok(list);
            });

            // ====== GET por id ======
            grp.MapGet("/{id:long}", async (AppDbContext db, long id) =>
            {
                var m = await db.Movimientos.FindAsync(id);
                return m is null ? Results.NotFound() : Results.Ok(m);
            });

            // ====== Crear ======
            grp.MapPost("", async (AppDbContext db, MovtoFinanciero dto) =>
            {
                dto.Id = 0;
                dto.Uid = dto.Uid == Guid.Empty ? Guid.NewGuid() : dto.Uid;
                dto.Status = dto.Status == 0 ? StatusMovto.Pendiente : dto.Status;
                dto.Creado = DateTime.UtcNow;
                dto.Modificado = dto.Creado;

                db.Movimientos.Add(dto);
                await db.SaveChangesAsync();
                return Results.Created($"/api/finanzas/{dto.Id}", dto);
            });

            // ====== Editar ======
            grp.MapPut("/{id:long}", async (AppDbContext db, long id, MovtoFinanciero dto) =>
            {
                var m = await db.Movimientos.FindAsync(id);
                if (m is null) return Results.NotFound();

                m.Tipo = dto.Tipo;
                m.Contraparte = dto.Contraparte;
                m.Monto = dto.Monto;
                m.FechaObjetivo = dto.FechaObjetivo;
                m.Status = dto.Status;
                m.ProyectoId = dto.ProyectoId;
                m.TareaId = dto.TareaId;
                m.NotasMd = dto.NotasMd;
                m.Modificado = DateTime.UtcNow;

                await db.SaveChangesAsync();
                return Results.Ok(m);
            });

            // ====== Borrar ======
            grp.MapDelete("/{id:long}", async (AppDbContext db, long id) =>
            {
                var m = await db.Movimientos.FindAsync(id);
                if (m is null) return Results.NotFound();
                db.Remove(m);
                await db.SaveChangesAsync();
                return Results.NoContent();
            });

            // ====== Marcar estatus rápido ======
            // /api/finanzas/{id}/marcar?estatus=2  (2=Cobrado/Pagado, 1=Pendiente, 3=Vencido)
            grp.MapPost("/{id:long}/marcar", async (AppDbContext db, long id, StatusMovto estatus) =>
            {
                var m = await db.Movimientos.FindAsync(id);
                if (m is null) return Results.NotFound();
                m.Status = estatus;
                m.Modificado = DateTime.UtcNow;
                await db.SaveChangesAsync();
                return Results.Ok(m);
            });

            // ====== Radar: próximos N días ======
            // /api/finanzas/radar?dias=7|14|30&tipo=1|2&estatus=1
            grp.MapGet("/radar", async (AppDbContext db, int dias = 7, TipoMovto? tipo = null, StatusMovto? estatus = null) =>
            {
                dias = Math.Clamp(dias, 1, 60);
                var hoy = DateOnly.FromDateTime(DateTime.UtcNow.Date);
                var hasta = hoy.AddDays(dias);

                var q = db.Movimientos.Where(m => m.FechaObjetivo >= hoy && m.FechaObjetivo <= hasta);
                if (tipo.HasValue) q = q.Where(m => m.Tipo == tipo.Value);
                if (estatus.HasValue) q = q.Where(m => m.Status == estatus.Value);

                var list = await q.OrderBy(m => m.FechaObjetivo).ThenBy(m => m.Tipo).ToListAsync();

                // Resumen por día/tipo
                var resumen = list
                    .GroupBy(m => new { m.FechaObjetivo, m.Tipo })
                    .Select(g => new
                    {
                        g.Key.FechaObjetivo,
                        Tipo = g.Key.Tipo,
                        Total = g.Sum(x => x.Monto),
                        Conteo = g.Count()
                    })
                    .OrderBy(x => x.FechaObjetivo)
                    .ThenBy(x => x.Tipo)
                    .ToList();

                return Results.Ok(new { items = list, resumen });
            });

            // ====== Export CSV ======
            grp.MapGet("/export.csv", async (AppDbContext db,
                DateOnly? desde, DateOnly? hasta, TipoMovto? tipo, StatusMovto? status, string? contraparte) =>
            {
                var q = db.Movimientos.AsQueryable();
                if (desde.HasValue) q = q.Where(m => m.FechaObjetivo >= desde.Value);
                if (hasta.HasValue) q = q.Where(m => m.FechaObjetivo <= hasta.Value);
                if (tipo.HasValue) q = q.Where(m => m.Tipo == tipo.Value);
                if (status.HasValue) q = q.Where(m => m.Status == status.Value);
                if (!string.IsNullOrWhiteSpace(contraparte))
                    q = q.Where(m => m.Contraparte != null && m.Contraparte.Contains(contraparte));

                var list = await q.OrderBy(m => m.FechaObjetivo).ThenBy(m => m.Id).ToListAsync();

                var sb = new StringBuilder();
                sb.AppendLine("Id,Tipo,Estatus,Fecha,Contraparte,Monto,ProyectoId,TareaId,Notas");
                foreach (var m in list)
                {
                    var tipoTxt = m.Tipo.ToString();
                    var estTxt = m.Status.ToString();
                    var notas = (m.NotasMd ?? "").Replace('\n', ' ').Replace('\r', ' ');
                    sb.AppendLine($"{m.Id},{tipoTxt},{estTxt},{m.FechaObjetivo:yyyy-MM-dd},\"{m.Contraparte}\",{m.Monto.ToString(CultureInfo.InvariantCulture)},{m.ProyectoId?.ToString() ?? ""},{m.TareaId?.ToString() ?? ""},\"{notas}\"");
                }

                return Results.Text(sb.ToString(), "text/csv", Encoding.UTF8);
            });

            return app;
        }
    }
}
