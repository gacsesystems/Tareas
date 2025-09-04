namespace Dominio.Finanzas
{
    public enum TipoMovto : byte
    {
        Cobro = 1,
        Pago = 2
    }

    public enum StatusMovto : byte
    {
        Pendiente = 1,
        CobradoPagado = 2,
        Vencido = 3
    }
    public class MovtoFinanciero
    {
        public long Id { get; set; }                         // ID_MOV
        public Guid Uid { get; set; }                        // UID
        public long? UsuarioId { get; set; }                 // ID_USUARIO (futuro multiusuario)
        public TipoMovto Tipo { get; set; }                  // ID_TIPO_MOVTO
        public string? Contraparte { get; set; }             // CONTRAPARTE
        public decimal Monto { get; set; }                   // MONTO
        public DateOnly FechaObjetivo { get; set; }          // FECHA_OBJETIVO
        public StatusMovto Status { get; set; } = StatusMovto.Pendiente; // ID_STATUS_MOVTO
        public long? ProyectoId { get; set; }                // ID_PROYECTO
        public long? TareaId { get; set; }                   // ID_TAREA
        public string? NotasMd { get; set; }                 // NOTAS_MD
        public DateTime Creado { get; set; }                 // CREADO
        public DateTime Modificado { get; set; }             // MODIFICADO
    }
}
