using Dominio.Habitos;
using Infraestructura.Persistencia;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace API.Endpoints
{
    public sealed class ResumenHabitoDto
    {
        public long HabitoId { get; init; }
        public string Nombre { get; init; } = "";
        public Dominio.Habitos.PeriodicidadHabito Periodicidad { get; init; }
        public DateOnly Desde { get; init; }
        public DateOnly Hasta { get; init; }
        public int Total { get; init; }
        public int StreakActual { get; init; }
        public int MaxStreak { get; init; }
        public IEnumerable<object> Logs { get; init; } = Array.Empty<object>();
    }

    public static class HabitosEndpoints
    {
        public static IEndpointRouteBuilder MapHabitos(this IEndpointRouteBuilder app)
        {
            var grp = app.MapGroup("/api/habitos").WithTags("Habitos");

            // ========= CRUD básico =========
            grp.MapGet("", async (AppDbContext db, string? categoria, bool? visibleFamiliar) =>
            {
                var q = db.Habitos.AsQueryable();
                if (!string.IsNullOrWhiteSpace(categoria))
                    q = q.Where(h => h.Categoria != null && h.Categoria == categoria);
                if (visibleFamiliar.HasValue)
                    q = q.Where(h => h.VisibleFamiliar == visibleFamiliar.Value);

                var list = await q.OrderBy(h => h.Nombre).Take(2000).ToListAsync();
                return Results.Ok(list);
            });

            grp.MapGet("/{id:long}", async (AppDbContext db, long id) =>
            {
                var h = await db.Habitos.FindAsync(id);
                return h is null ? Results.NotFound() : Results.Ok(h);
            });

            grp.MapPost("", async (AppDbContext db, Habito dto) =>
            {
                dto.Creado = DateTime.UtcNow;
                dto.Modificado = dto.Creado;
                if (dto.Uid == Guid.Empty) dto.Uid = Guid.NewGuid();

                db.Habitos.Add(dto);
                await db.SaveChangesAsync();
                return Results.Created($"/api/habitos/{dto.Id}", dto);
            });

            grp.MapPut("/{id:long}", async (AppDbContext db, long id, Habito dto) =>
            {
                var h = await db.Habitos.FindAsync(id);
                if (h is null) return Results.NotFound();

                h.Nombre = dto.Nombre;
                h.Periodicidad = dto.Periodicidad;
                h.Meta = dto.Meta;
                h.Categoria = dto.Categoria;
                h.VisibleFamiliar = dto.VisibleFamiliar;
                h.Notas = dto.Notas;
                h.Modificado = DateTime.UtcNow;

                await db.SaveChangesAsync();
                return Results.Ok(h);
            });

            grp.MapDelete("/{id:long}", async (AppDbContext db, long id) =>
            {
                var h = await db.Habitos.FindAsync(id);
                if (h is null) return Results.NotFound();
                db.Remove(h);
                await db.SaveChangesAsync();
                return Results.NoContent();
            });

            // ========= LOGS =========

            // Normaliza la fecha de log según periodicidad:
            // - Diario: yyyy-MM-dd (tal cual)
            // - Semanal: lunes de esa semana (ISO, Monday)
            // - Mensual: primer día del mes
            static DateOnly Normalize(DateOnly d, PeriodicidadHabito p)
            {
                return p switch
                {
                    PeriodicidadHabito.Diario => d,
                    PeriodicidadHabito.Semanal => d.AddDays(-(int)(((int)d.DayOfWeek + 6) % 7)), // lunes
                    PeriodicidadHabito.Mensual => new DateOnly(d.Year, d.Month, 1),
                    _ => d
                };
            }

            grp.MapGet("/{id:long}/logs", async (AppDbContext db, long id, DateTime? desde, DateTime? hasta) =>
            {
                var q = db.HabitoLogs.AsQueryable().Where(l => l.HabitoId == id);
                if (desde.HasValue) q = q.Where(l => l.Fecha >= DateOnly.FromDateTime(desde.Value.Date));
                if (hasta.HasValue) q = q.Where(l => l.Fecha <= DateOnly.FromDateTime(hasta.Value.Date));

                var logs = await q.OrderBy(l => l.Fecha).ToListAsync();
                return Results.Ok(logs);
            });

            // Tick (marca cumplimiento) – si ya existe en la unidad de tiempo, lo incrementa (o ignora, MVP)
            grp.MapPost("/{id:long}/tick", async (AppDbContext db, long id, DateTime? fecha, int? valor) =>
            {
                var h = await db.Habitos.FindAsync(id);
                if (h is null) return Results.NotFound();

                var d = DateOnly.FromDateTime((fecha ?? DateTime.UtcNow).Date);
                var key = Normalize(d, h.Periodicidad);

                var log = await db.HabitoLogs.FirstOrDefaultAsync(x => x.HabitoId == id && x.Fecha == key);
                if (log is null)
                {
                    log = new HabitoLog
                    {
                        HabitoId = id,
                        Fecha = key,
                        Valor = valor ?? 1,
                        Creado = DateTime.UtcNow,
                        Modificado = DateTime.UtcNow
                    };
                    db.HabitoLogs.Add(log);
                }
                else
                {
                    log.Valor += valor ?? 1;
                    log.Modificado = DateTime.UtcNow;
                }

                // (opcional) mantener cache simple en Habito.Streak: recalcular streak actual
                var resumen = await BuildResumenAsync(db, h, DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-60)), DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)));
                h.Streak = resumen.StreakActual;
                h.Modificado = DateTime.UtcNow;

                await db.SaveChangesAsync();
                return Results.Ok(new { ok = true, fecha = key, log.Valor, streak = h.Streak });
            });

            // Resumen: streak actual, racha máxima, total en rango
            grp.MapGet("/{id:long}/resumen", async (AppDbContext db, long id, DateTime? desde, DateTime? hasta) =>
            {
                var h = await db.Habitos.FindAsync(id);
                if (h is null) return Results.NotFound();

                var d1 = DateOnly.FromDateTime((desde ?? DateTime.UtcNow.AddDays(-60)).Date);
                var d2 = DateOnly.FromDateTime((hasta ?? DateTime.UtcNow).Date);

                var r = await BuildResumenAsync(db, h, d1, d2);
                return Results.Ok(r);
            });

            return app;
        }

        // ===== Helpers de resumen de streaks =====
        private static async Task<ResumenHabitoDto> BuildResumenAsync(AppDbContext db, Habito h, DateOnly desde, DateOnly hasta)
        {
            // Trae logs en rango
            var logs = await db.HabitoLogs
                .Where(x => x.HabitoId == h.Id && x.Fecha >= desde && x.Fecha <= hasta)
                .OrderBy(x => x.Fecha)
                .ToListAsync();

            // Genera la secuencia de “unidades” según periodicidad para evaluar rachas continuas
            static IEnumerable<DateOnly> Units(DateOnly d1, DateOnly d2, PeriodicidadHabito p)
            {
                var d = d1;
                while (d <= d2)
                {
                    yield return p switch
                    {
                        PeriodicidadHabito.Diario => d,
                        PeriodicidadHabito.Semanal => d.AddDays(-(int)(((int)d.DayOfWeek + 6) % 7)), // lunes
                        PeriodicidadHabito.Mensual => new DateOnly(d.Year, d.Month, 1),
                        _ => d
                    };
                    d = p switch
                    {
                        PeriodicidadHabito.Diario => d.AddDays(1),
                        PeriodicidadHabito.Semanal => d.AddDays(7),
                        PeriodicidadHabito.Mensual => new DateOnly(d.Year, d.Month, 1).AddMonths(1),
                        _ => d.AddDays(1)
                    };
                }
            }

            var keyset = logs.ToDictionary(x => x.Fecha, x => x.Valor);
            int streakActual = 0, maxStreak = 0, total = 0;

            // Para el cálculo, caminamos desde el pasado al presente por unidades normalizadas
            var normDesde = Normalize(desde, h.Periodicidad);
            var normHasta = Normalize(hasta, h.Periodicidad);

            for (var u = normDesde; u <= normHasta;)
            {
                var val = keyset.TryGetValue(u, out var v) ? v : 0;
                if (val > 0)
                {
                    streakActual++;
                    maxStreak = Math.Max(maxStreak, streakActual);
                    total += val;
                }
                else
                {
                    streakActual = 0;
                }

                u = h.Periodicidad switch
                {
                    PeriodicidadHabito.Diario => u.AddDays(1),
                    PeriodicidadHabito.Semanal => u.AddDays(7),
                    PeriodicidadHabito.Mensual => new DateOnly(u.Year, u.Month, 1).AddMonths(1),
                    _ => u.AddDays(1)
                };
            }

            return new ResumenHabitoDto
            {
                HabitoId = h.Id,
                Nombre = h.Nombre,
                Periodicidad = h.Periodicidad,
                Desde = normDesde,
                Hasta = normHasta,
                Total = total,
                StreakActual = streakActual,
                MaxStreak = maxStreak,
                Logs = logs.Select(l => new { l.Fecha, l.Valor }).ToArray()
            };
        }

        // Normalizador reutilizable aquí también
        private static DateOnly Normalize(DateOnly d, PeriodicidadHabito p)
            => p switch
            {
                PeriodicidadHabito.Diario => d,
                PeriodicidadHabito.Semanal => d.AddDays(-(int)(((int)d.DayOfWeek + 6) % 7)), // lunes
                PeriodicidadHabito.Mensual => new DateOnly(d.Year, d.Month, 1),
                _ => d
            };
    }
}
