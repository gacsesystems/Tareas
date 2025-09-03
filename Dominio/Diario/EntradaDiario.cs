namespace Dominio.Diario
{
    public sealed class EntradaDiario
    {
        public long Id { get; set; }                 // ID_ENTRADA
        public Guid Uid { get; set; } = Guid.NewGuid(); // UID
        public long? UsuarioId { get; set; }         // ID_USUARIO
        public DateOnly Fecha { get; set; }          // FECHA
        public string ContenidoMd { get; set; } = ""; // CONTENIDO_MD
        public DateTime Creado { get; set; }         // CREADO
        public DateTime Modificado { get; set; }     // MODIFICADO
    }
}
