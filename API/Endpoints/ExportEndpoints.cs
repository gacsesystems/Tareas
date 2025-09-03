using System.Text;
using API.Utils;
using Dominio.Tareas;
using Infraestructura.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace API.Endpoints
{
    public static class ExportEndpoints
    {
        public static IEndpointRouteBuilder MapExport(this IEndpointRouteBuilder app)
        {
            // Exportar tareas hechas (rango opcional)
            app.MapGet("/api/export/tareas-hechas.csv", async (AppDbContext db, DateTime? desde, DateTime? hasta) =>
            {
                var q = db.Tareas.Where(t => t.Estado == EstadoTarea.Hecha);
                if (desde.HasValue) q = q.Where(t => t.Modificado >= desde.Value);
                if (hasta.HasValue) q = q.Where(t => t.Modificado < hasta.Value);

                var list = await q.OrderByDescending(t => t.Modificado).ToListAsync();

                var sb = new StringBuilder();
                sb.AppendLine("Id,Titulo,ProyectoId,Score,Ranking,Modificado,TiempoTotalMin,PomosRealizados");
                foreach (var t in list)
                {
                    var titulo = (t.Titulo ?? string.Empty).Replace("\"", "\"\"");
                    sb.AppendLine($"{t.Id},\"{titulo}\",{t.ProyectoId},{t.Score},{t.Ranking},{t.Modificado:yyyy-MM-dd HH:mm:ss},{t.TiempoTotalMin},{t.PomosRealizados}");
                }

                return CsvHelper.FileCsv("tareas-hechas.csv", sb.ToString());
            });

            // Exportar sesiones (filtros opcionales)
            app.MapGet("/api/export/sesiones.csv", async (AppDbContext db, DateTime? desde, DateTime? hasta, long? tareaId) =>
            {
                var q = db.Sesiones.AsQueryable();
                if (desde.HasValue) q = q.Where(s => s.Inicio >= desde.Value);
                if (hasta.HasValue) q = q.Where(s => s.Inicio < hasta.Value);
                if (tareaId.HasValue) q = q.Where(s => s.TareaId == tareaId.Value);

                var list = await q.OrderByDescending(s => s.Inicio).Take(5000).ToListAsync();

                var sb = new StringBuilder();
                sb.AppendLine("Id,TareaId,Categoria,Inicio,Fin,FocoMin,DescansoMin,Modo,Notas");
                foreach (var s in list)
                {
                    var categoria = (s.Categoria ?? string.Empty).Replace("\"", "\"\"");
                    var notas = (s.Notas ?? string.Empty).Replace("\"", "\"\"");
                    var fin = s.Fin.HasValue ? s.Fin.Value.ToString("yyyy-MM-dd HH:mm:ss") : "";
                    sb.AppendLine($"{s.Id},{s.TareaId},\"{categoria}\",{s.Inicio:yyyy-MM-dd HH:mm:ss},{fin},{s.FocoMin},{s.DescansoMin},{(byte)s.ModoRollover},\"{notas}\"");
                }

                return CsvHelper.FileCsv("sesiones.csv", sb.ToString());
            });

            return app;
        }
    }
}
