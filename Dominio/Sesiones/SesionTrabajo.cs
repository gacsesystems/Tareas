namespace Dominio.Sesiones
{
    public enum ModoRollover : byte { Acumulativo = 1, Balanceado = 2, Estricto = 3 }
    public sealed class SesionTrabajo
    {
        public long Id { get; set; }                 // ID_SESION
        public Guid Uid { get; set; } = Guid.NewGuid(); // UID
        public long? UsuarioId { get; set; }         // ID_USUARIO
        public long? TareaId { get; set; }           // ID_TAREA
        public string? Categoria { get; set; }       // CATEGORIA
        public DateTime Inicio { get; set; }         // INICIO
        public DateTime? Fin { get; set; }           // FIN
        public short FocoMin { get; set; }           // FOCO_MIN
        public short DescansoMin { get; set; }       // DESCANSO_MIN
        public ModoRollover ModoRollover { get; set; } = ModoRollover.Acumulativo; // ID_MODO_ROLLOVER
        public string? Notas { get; set; }           // NOTAS
        public DateTime Creado { get; set; }         // CREADO
        public DateTime Modificado { get; set; }     // MODIFICADO
    }
}
