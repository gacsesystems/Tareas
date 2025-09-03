using Dominio.Tareas;

namespace Aplicacion.Tareas
{
    public sealed record PrioridadPeso(
        decimal wU = 0.25m, decimal wI = 0.25m, decimal wE = 0.10m, decimal wF = 0.15m, decimal wP = 0.10m,
        decimal wA = 0.05m, decimal wD = 0.10m, decimal wB = 0.10m, decimal wH = 0.05m, decimal wR = 0.05m);

    public interface IServicioPrioridadTareas
    {
        decimal CalcularPrioridad(Tarea t, DateTime ahora, PrioridadPeso pesos, int antiguedadDias=0, int vencimientoProx=0,
                                  int habitoBonus=0, int riesgoOp=0);
        int SiguienteTopRanking(int actualMinRank);
    }
    public sealed class ServicioPrioridadTareas : IServicioPrioridadTareas
    {
        public decimal CalcularPrioridad(Tarea t, DateTime ahora, PrioridadPeso pesos, int antiguedadDias=0, int vencimientoProx=0,
                                       int habitoBonus=0, int riesgoOp=0)
        {
            decimal Urg = t.UrgenteDias is null ? 0 : (31 - Math.Clamp((int)t.UrgenteDias.Value, 0, 31)) / 31m;
            decimal Imp = t.Impacto is null ? 0 : Math.Clamp((int)t.Impacto.Value, 1, 5) / 5m;

            decimal Eis = t.Eisenhower switch
            {
                Eisenhower.IU => 1.0m,
                Eisenhower.InU => 0.7m,
                Eisenhower.nIU => 0.5m,
                Eisenhower.ni => 0.2m,
                null => 0.0m,
                _ => 0.0m
            }; // Asigna valor según la matriz de Eisenhower

            decimal Frog = t.Frog ? 1m : 0m; // Prioriza si es "comer rana"
            decimal Pareto = t.Pareto ? 1m : 0m; // 20% tareas generan 80% valor

            decimal Antig = Math.Clamp(antiguedadDias, 0, 90) / 90m; // Max 3 meses
            decimal Venc = Math.Clamp(vencimientoProx, 0, 14) / 14m; // Max 2 semanas
            decimal Blq = t.Bloqueada ? 1m : 0m; // Penaliza si está bloqueada
            decimal Hab = Math.Clamp(habitoBonus, 0, 1); // 0 o 1
            decimal Ro = Math.Clamp(riesgoOp, -1, 1); // -1, 0, 1

            var score = pesos.wU * Urg +
                        pesos.wI * Imp +
                        pesos.wE * Eis +
                        pesos.wF * Frog +
                        pesos.wP * Pareto +
                        pesos.wA * Antig +
                        pesos.wD * Venc -
                        pesos.wB * Blq +
                        pesos.wH * Hab +
                        pesos.wR * Ro; 
             
            if (t.ScoreBoostUntil.HasValue && t.ScoreBoostUntil > ahora) // Bonus temporal
                score += 0.05m; // Bonus fijo del 5%

            return Math.Round(Math.Clamp(score, 0, 1) * 100m, 4);
        }

        public int SiguienteTopRanking(int actualMinRank) => actualMinRank - 100; // Decrementa el ranking para la siguiente tarea
    }
}
