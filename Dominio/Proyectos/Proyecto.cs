using Dominio.Tareas;

namespace Dominio.Proyectos
{
    public sealed class Proyecto
    {
        public long Id { get; set; }                    // ID_PROYECTO
        public Guid Uid { get; set; } = Guid.NewGuid(); // UID
        public long? UsuarioId { get; set; }            // ID_USUARIO

        public string Nombre { get; set; } = null!;     // NOMBRE
        public string? Objetivo { get; set; }           // OBJETIVO
        public Area Area { get; set; } = Area.Trabajo;  // ID_AREA
        public string? Estado { get; set; }             // ESTADO

        public DateOnly? FechaInicio { get; set; }      // FEC_INICIO
        public DateOnly? FechaFinPrevista { get; set; } // FEC_FIN_PREVISTA
        public decimal? ProgresoPct { get; set; }       // PROGRESO_PCT

        public string? NotasMd { get; set; }            // NOTAS_MD

        public DateTime Creado { get; set; }            // CREADO
        public DateTime Modificado { get; set; }        // MODIFICADO
    }
}
