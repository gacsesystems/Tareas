namespace Dominio.Tareas
{
    public enum EstadoTarea : byte { Backlog=1, Siguiente=2, Hoy=3, EnCurso=4, EnRevision=5, Hecha=6 }
    public enum Area : byte { Trabajo=1, Personal=2 }
    public enum Eisenhower : byte { IU=1, InU=2, nIU=3, ni=4 }
    public sealed class Tarea
    {
        public long Id { get; set; } //ID_TAREA
        public Guid Uid { get; set; } = Guid.NewGuid(); // UID

        public long? UsuarioId { get; set; }            // ID_USUARIO (opcional)
        public long? ProyectoId { get; set; }           // ID_PROYECTO

        public string Titulo { get; set; } = null!;     // TITULO
        public string? DetalleMd { get; set; }          // DETALLE_MD

        public EstadoTarea Estado { get; set; } = EstadoTarea.Backlog; // ID_ESTADO_TAREA
        public Area Area { get; set; } = Area.Trabajo;                 // ID_AREA
        public byte? ContextoId { get; set; }                           // ID_CONTEXTO

        public Eisenhower? Eisenhower { get; set; }     // ID_EISENHOWER
        public byte? Impacto { get; set; }              // IMPACTO (1..5)
        public byte? UrgenteDias { get; set; }          // URGENTE_DIAS (0..31)

        public bool Frog { get; set; }                  // FROG
        public bool Pareto { get; set; }                // PARETO
        public bool Bloqueada { get; set; }             // BLOQUEADA
        public string? BloqueoMotivo { get; set; }      // BLOQUEO_MOTIVO

        public DateTime? DueDate { get; set; }          // DUE_DATE (datetime2(0))
        public decimal Score { get; set; }              // SCORE (decimal(9,4))
        public DateTime? ScoreBoostUntil { get; set; }  // SCORE_BOOST_UNTIL (datetime2(0))
        public int Ranking { get; set; } = 1000;        // RANKING

        public byte? PomosEstimados { get; set; }       // POMOS_ESTIMADOS
        public short PomosRealizados { get; set; }      // POMOS_REALIZADOS
        public int TiempoTotalMin { get; set; }         // TIEMPO_TOTAL_MIN

        public long? ResponsableId { get; set; }        // ID_RESPONSABLE
        public DateOnly? SeguimientoProximo { get; set; } // SEGUIMIENTO_PROXIMO (DATE)

        public DateTime Creado { get; set; }            // CREADO
        public DateTime Modificado { get; set; }        // MODIFICADO
    }
}
