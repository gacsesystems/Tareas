namespace Dominio.Habitos
{
    public class HabitoLog
    {
        public long Id { get; set; }           // ID_HABITO_LOG
        public long HabitoId { get; set; }     // ID_HABITO FK
        public DateOnly Fecha { get; set; }    // FECHA (normalizada según periodicidad)
        public int Valor { get; set; }         // p.ej. 1 tick; opcional para metas
        public DateTime Creado { get; set; }
        public DateTime Modificado { get; set; }

        public Habito? Habito { get; set; }
    }
}
