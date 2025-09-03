using System.Text.Json;
using Aplicacion.Tareas;
using Infraestructura.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace API.Utils
{
    public static class ConfigHelper
    {
        /// <summary>
        /// Carga los pesos de prioridad desde la tabla CONFIGURACION.
        /// Si no existe registro devuelve null.
        /// </summary>
        public static async Task<PrioridadPeso?> CargarPesosAsync(AppDbContext db)
        {
            var conn = db.Database.GetDbConnection();
            await conn.OpenAsync();

            await using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT VALOR FROM CONFIGURACION WHERE CLAVE = 'priority.weights' AND ID_USUARIO IS NULL";

            var escalar = await cmd.ExecuteScalarAsync();
            var valor = escalar as string;

            if (string.IsNullOrWhiteSpace(valor)) return null;

            try
            {
                return JsonSerializer.Deserialize<PrioridadPeso>(valor);
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Guarda los pesos en la tabla CONFIGURACION (UPSERT).
        /// </summary>
        public static async Task GuardarPesosAsync(AppDbContext db, PrioridadPeso pesos)
        {
            var json = JsonSerializer.Serialize(pesos);

            await db.Database.ExecuteSqlRawAsync(@"
                              IF EXISTS (SELECT 1 FROM CONFIGURACION WHERE CLAVE='priority.weights' AND ID_USUARIO IS NULL)
                                UPDATE CONFIGURACION 
                                SET VALOR={0}, MODIFICADO=SYSDATETIME()
                                WHERE CLAVE='priority.weights' AND ID_USUARIO IS NULL
                              ELSE
                                INSERT INTO CONFIGURACION (UID, ID_USUARIO, CLAVE, VALOR, CREADO, MODIFICADO)
                                VALUES (NEWSEQUENTIALID(), NULL, 'priority.weights', {0}, GETDATE(), GETDATE())", json);
        }
    }
}
