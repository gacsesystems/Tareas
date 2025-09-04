using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dominio.Habitos
{
    public enum PeriodicidadHabito : byte
    {
        Diario = 1,
        Semanal = 2,
        Mensual = 3
    }

    public class Habito
    {
        public long Id { get; set; }                 // ID_HABITO
        public Guid Uid { get; set; }                // UID
        public long? UsuarioId { get; set; }         // ID_USUARIO
        public string Nombre { get; set; } = null!;  // NOMBRE
        public PeriodicidadHabito Periodicidad { get; set; } // PERIODICIDAD
        public short? Meta { get; set; }             // META (por semana/mes)
        public string? Categoria { get; set; }       // CATEGORIA
        public bool VisibleFamiliar { get; set; }    // VISIBLE_FAMILIAR
        public int Streak { get; set; }              // STREAK
        public string? Notas { get; set; }           // NOTAS
        public DateTime Creado { get; set; }         // CREADO
        public DateTime Modificado { get; set; }     // MODIFICADO
        public byte[]? RowVersion { get; set; }      // ROW_VERSION
    }
}
