using Microsoft.EntityFrameworkCore;
using Dominio.Tareas;
using Dominio.Proyectos;
using Dominio.Sesiones;
using Dominio.Diario;

namespace Infraestructura.Persistencia
{
    public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<Tarea> Tareas => Set<Tarea>();
        public DbSet<Proyecto> Proyectos => Set<Proyecto>();
        public DbSet<SesionTrabajo> Sesiones => Set<SesionTrabajo>();
        public DbSet<EntradaDiario> EntradasDiario => Set<EntradaDiario>();

        protected override void OnModelCreating(ModelBuilder b)
        {
            // ===== PROYECTO → PROYECTO =====
            b.Entity<Proyecto>(e =>
            {
                e.ToTable("PROYECTO");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).HasColumnName("ID_PROYECTO").ValueGeneratedOnAdd();
                e.Property(x => x.Uid).HasColumnName("UID").HasDefaultValueSql("NEWSEQUENTIALID()");
                e.Property(x => x.UsuarioId).HasColumnName("ID_USUARIO");

                e.Property(x => x.Nombre).HasColumnName("NOMBRE").HasMaxLength(200).IsRequired();
                e.Property(x => x.Objetivo).HasColumnName("OBJETIVO").HasMaxLength(400);
                e.Property(x => x.Area).HasColumnName("ID_AREA").HasConversion<byte>();
                e.Property(x => x.Estado).HasColumnName("ESTADO").HasMaxLength(40);

                e.Property(x => x.FechaInicio).HasColumnName("FEC_INICIO");
                e.Property(x => x.FechaFinPrevista).HasColumnName("FEC_FIN_PREVISTA");
                e.Property(x => x.ProgresoPct).HasColumnName("PROGRESO_PCT").HasPrecision(5, 2);

                e.Property(x => x.NotasMd).HasColumnName("NOTAS_MD");

                e.Property(x => x.Creado).HasColumnName("CREADO").HasColumnType("datetime2(3)");
                e.Property(x => x.Modificado).HasColumnName("MODIFICADO").HasColumnType("datetime2(3)");
            });

            // ===== TAREA → TAREA =====
            b.Entity<Tarea>(e =>
            {
                e.ToTable("TAREA");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).HasColumnName("ID_TAREA").ValueGeneratedOnAdd();
                e.Property(x => x.Uid).HasColumnName("UID").HasDefaultValueSql("NEWSEQUENTIALID()");
                e.Property(x => x.UsuarioId).HasColumnName("ID_USUARIO");
                e.Property(x => x.ProyectoId).HasColumnName("ID_PROYECTO");

                e.Property(x => x.Titulo).HasColumnName("TITULO").HasMaxLength(300).IsRequired();
                e.Property(x => x.DetalleMd).HasColumnName("DETALLE_MD");

                e.Property(x => x.Estado).HasColumnName("ID_ESTADO_TAREA").HasConversion<byte>();
                e.Property(x => x.Area).HasColumnName("ID_AREA").HasConversion<byte>();
                e.Property(x => x.ContextoId).HasColumnName("ID_CONTEXTO");

                e.Property(x => x.Eisenhower).HasColumnName("ID_EISENHOWER").HasConversion<byte?>();
                e.Property(x => x.Impacto).HasColumnName("IMPACTO");
                e.Property(x => x.UrgenteDias).HasColumnName("URGENTE_DIAS");

                e.Property(x => x.Frog).HasColumnName("FROG");
                e.Property(x => x.Pareto).HasColumnName("PARETO");
                e.Property(x => x.Bloqueada).HasColumnName("BLOQUEADA");
                e.Property(x => x.BloqueoMotivo).HasColumnName("BLOQUEO_MOTIVO").HasMaxLength(300);

                e.Property(x => x.DueDate).HasColumnName("DUE_DATE").HasColumnType("datetime2(0)");
                e.Property(x => x.Score).HasColumnName("SCORE").HasPrecision(9, 4).HasDefaultValue(0);
                e.Property(x => x.ScoreBoostUntil).HasColumnName("SCORE_BOOST_UNTIL").HasColumnType("datetime2(0)");
                e.Property(x => x.Ranking).HasColumnName("RANKING").HasDefaultValue(1000);

                e.Property(x => x.PomosEstimados).HasColumnName("POMOS_ESTIMADOS");
                e.Property(x => x.PomosRealizados).HasColumnName("POMOS_REALIZADOS");
                e.Property(x => x.TiempoTotalMin).HasColumnName("TIEMPO_TOTAL_MIN");

                e.Property(x => x.ResponsableId).HasColumnName("ID_RESPONSABLE");
                e.Property(x => x.SeguimientoProximo).HasColumnName("SEGUIMIENTO_PROXIMO");

                e.Property(x => x.Creado).HasColumnName("CREADO").HasColumnType("datetime2(3)");
                e.Property(x => x.Modificado).HasColumnName("MODIFICADO").HasColumnType("datetime2(3)");

                e.HasIndex(x => new { x.Estado, x.Ranking }).HasDatabaseName("IX_Tarea_Estado_Rank");
                e.HasIndex(x => new { x.Score, x.DueDate }).HasDatabaseName("IX_Tarea_Score_Due");
                e.HasIndex(x => x.ProyectoId).HasDatabaseName("IX_Tarea_Proyecto");
            });

            // ===== SESION DE TRABAJO → SESION DE TRABAJO =====
            b.Entity<SesionTrabajo>(e =>
            {
                e.ToTable("SESION_TRABAJO");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).HasColumnName("ID_SESION").ValueGeneratedOnAdd();
                e.Property(x => x.Uid).HasColumnName("UID").HasDefaultValueSql("NEWSEQUENTIALID()");
                e.Property(x => x.UsuarioId).HasColumnName("ID_USUARIO");
                e.Property(x => x.TareaId).HasColumnName("ID_TAREA");
                e.Property(x => x.Categoria).HasColumnName("CATEGORIA").HasMaxLength(60);
                e.Property(x => x.Inicio).HasColumnName("INICIO").HasColumnType("datetime2(3)");
                e.Property(x => x.Fin).HasColumnName("FIN").HasColumnType("datetime2(3)");
                e.Property(x => x.FocoMin).HasColumnName("FOCO_MIN");
                e.Property(x => x.DescansoMin).HasColumnName("DESCANSO_MIN");
                e.Property(x => x.ModoRollover).HasColumnName("ID_MODO_ROLLOVER").HasConversion<byte>();
                e.Property(x => x.Notas).HasColumnName("NOTAS");
                e.Property(x => x.Creado).HasColumnName("CREADO").HasColumnType("datetime2(3)");
                e.Property(x => x.Modificado).HasColumnName("MODIFICADO").HasColumnType("datetime2(3)");
                e.HasIndex(x => new { x.TareaId, x.Inicio }).HasDatabaseName("IX_Sesion_Tarea_Inicio");
            });

            // ===== ENTRADA DE DIARIO → ENTRADA DE DIARIO =====
            b.Entity<EntradaDiario>(e =>
            {
                e.ToTable("ENTRADA_DIARIO");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).HasColumnName("ID_ENTRADA").ValueGeneratedOnAdd();
                e.Property(x => x.Uid).HasColumnName("UID").HasDefaultValueSql("NEWSEQUENTIALID()");
                e.Property(x => x.UsuarioId).HasColumnName("ID_USUARIO");
                e.Property(x => x.Fecha).HasColumnName("FECHA");
                e.Property(x => x.ContenidoMd).HasColumnName("CONTENIDO_MD");
                e.Property(x => x.Creado).HasColumnName("CREADO").HasColumnType("datetime2(3)");
                e.Property(x => x.Modificado).HasColumnName("MODIFICADO").HasColumnType("datetime2(3)");
            });
        }
    }
}