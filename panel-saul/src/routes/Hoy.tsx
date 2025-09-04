import type { FC } from 'react';
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { type Tarea, EstadoTarea } from '@/lib/types';
import { usePomodoro, RolloverMode } from '@/hooks/usePomodoro';

/* =========================
   Query Keys
   ========================= */
const tareasKeys = {
	all: ['tareas'] as const,
	hoy: () => [...tareasKeys.all, 'hoy'] as const, // cola de hoy
	allOpen: () => [...tareasKeys.all, 'open'] as const, // para elegir Frog y 3 Rocas
};

/* =========================
   API SDK local (ligero)
   ========================= */
async function fetchTareasHoy(): Promise<Tarea[]> {
	return api.get<Tarea[]>('/api/tareas/hoy');
}
async function fetchTareasAbiertas(): Promise<Tarea[]> {
	// candidatas del día para Frog/Rocas (puedes ajustar si tu endpoint cambia)
	return api.get<Tarea[]>('/api/tareas?state=' + EstadoTarea.Hoy);
}
const completarTarea = async (id: number) => api.post(`/api/tareas/${id}/completas`, {});
const empujarTarea = async (id: number) => api.post(`/api/tareas/${id}/empujar`, {});
const recalcularScore = async (id: number) => api.post(`/api/tareas/${id}/recalcular-score`, {});

/* =========================
   Componente
   ========================= */
const Hoy: FC = () => {
	const qc = useQueryClient();

	// Cola del día (ordenada por score/rank desde el backend)
	const { data: colahoy = [], isLoading: loadingCola } = useQuery({
		queryKey: tareasKeys.hoy(),
		queryFn: fetchTareasHoy,
		staleTime: 60_000,
	});

	// Candidatas para Frog/Rocas
	const { data: abiertas = [] } = useQuery({
		queryKey: tareasKeys.allOpen(),
		queryFn: fetchTareasAbiertas,
		staleTime: 60_000,
	});

	// Selecciones visuales
	const frog = useMemo(() => {
		const frogs = abiertas.filter((t) => t.frog);
		return frogs.sort((a, b) => b.score - a.score)[0] ?? null;
	}, [abiertas]);

	const rocas = useMemo(() => {
		const arr = [...abiertas].sort((a, b) => {
			const ia = a.impacto ?? 0,
				ib = b.impacto ?? 0;
			if (ib !== ia) return ib - ia;
			return b.score - a.score;
		});
		return arr.slice(0, 3);
	}, [abiertas]);

	// Acciones (refrescan Frog/Rocas + Cola)
	const invalidateAll = () => {
		void qc.invalidateQueries({ queryKey: tareasKeys.hoy() });
		void qc.invalidateQueries({ queryKey: tareasKeys.allOpen() });
	};

	const mutDone = useMutation({ mutationFn: completarTarea, onSettled: invalidateAll });
	const mutPush = useMutation({ mutationFn: empujarTarea, onSettled: invalidateAll });
	const mutRecalc = useMutation({ mutationFn: recalcularScore, onSettled: invalidateAll });

	// Pomodoro lateral (al finalizar refresca listas de hoy)
	const pomo = usePomodoro({
		baseFocusMin: 25,
		baseBreakMin: 5,
		mode: RolloverMode.Acumulativo,
		invalidateKeys: [tareasKeys.hoy(), tareasKeys.allOpen()],
	});

	return (
		<div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
			<div>
				<h1 className="text-xl font-semibold mb-3">Hoy</h1>

				{/* ===== Frog ===== */}
				<section className="mb-4 p-4 rounded-lg bg-emerald-900/30 border border-emerald-800">
					<div className="text-sm uppercase tracking-wide text-emerald-300 mb-1">Frog del día</div>
					{frog ? (
						<div className="flex items-start justify-between gap-3">
							<div>
								<div className="text-lg font-medium">{frog.titulo}</div>
								<div className="text-xs text-slate-400">
									Proyecto: {frog.proyectoId ?? '-'} · Impacto: {frog.impacto ?? '-'} · Score: {frog.score.toFixed(2)}
								</div>
							</div>
							<div className="shrink-0 space-x-2">
								<button
									className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700"
									onClick={() => {
										pomo.setTareaId(frog.id);
										if (!pomo.sessionId && !pomo.isActive) void pomo.start();
									}}>
									🎯 Enfocar
								</button>
								<button
									className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600"
									onClick={() => void mutRecalc.mutate(frog.id)}>
									⟳ Recalc
								</button>
								<button
									className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-700"
									onClick={() => void mutPush.mutate(frog.id)}>
									⤴ Empujar
								</button>
								<button
									className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700"
									onClick={() => void mutDone.mutate(frog.id)}>
									✔ Hecha
								</button>
							</div>
						</div>
					) : (
						<div className="text-slate-400">No hay Frog marcada.</div>
					)}
				</section>

				{/* ===== 3 Rocas ===== */}
				<section className="mb-4 p-4 rounded-lg bg-amber-900/20 border border-amber-800">
					<div className="text-sm uppercase tracking-wide text-amber-300 mb-2">3 Rocas</div>
					<ol className="space-y-2 list-decimal pl-5">
						{rocas.map((t) => (
							<li key={t.id} className="flex items-start justify-between gap-3">
								<div>
									<div className="font-medium">{t.titulo}</div>
									<div className="text-xs text-slate-400">
										Impacto {t.impacto ?? '-'} · Score {t.score.toFixed(2)} · P#{t.proyectoId ?? '-'}
									</div>
								</div>
								<div className="shrink-0 space-x-2">
									<button
										className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700"
										onClick={() => {
											pomo.setTareaId(t.id);
											if (!pomo.sessionId && !pomo.isActive) void pomo.start();
										}}>
										🎯 Enfocar
									</button>
									<button
										className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600"
										onClick={() => void mutRecalc.mutate(t.id)}>
										⟳
									</button>
									<button
										className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-700"
										onClick={() => void mutPush.mutate(t.id)}>
										⤴
									</button>
									<button
										className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700"
										onClick={() => void mutDone.mutate(t.id)}>
										✔
									</button>
								</div>
							</li>
						))}
						{rocas.length === 0 && <li className="text-slate-400 list-none">Sin candidatos.</li>}
					</ol>
				</section>

				{/* ===== Cola de Hoy ===== */}
				<section>
					<div className="text-sm uppercase tracking-wide text-slate-300 mb-2">Cola (Hoy)</div>
					{loadingCola ? (
						<div>Cargando…</div>
					) : colahoy.length === 0 ? (
						<div className="text-slate-400">Sin tareas en Hoy.</div>
					) : (
						<table className="w-full border-collapse">
							<thead>
								<tr>
									<th className="text-left border-b border-slate-700 p-2">ID</th>
									<th className="text-left border-b border-slate-700 p-2">Título</th>
									<th className="text-right border-b border-slate-700 p-2">Score</th>
									<th className="text-right border-b border-slate-700 p-2">Rank</th>
									<th className="text-left border-b border-slate-700 p-2">Acciones</th>
								</tr>
							</thead>
							<tbody>
								{colahoy.map((t) => (
									<tr key={t.id}>
										<td className="border-b border-slate-800 p-2">{t.id}</td>
										<td className="border-b border-slate-800 p-2">{t.titulo}</td>
										<td className="border-b border-slate-800 p-2 text-right">{t.score.toFixed(2)}</td>
										<td className="border-b border-slate-800 p-2 text-right">{t.ranking}</td>
										<td className="border-b border-slate-800 p-2 space-x-2">
											<button
												className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700"
												onClick={() => {
													pomo.setTareaId(t.id);
													if (!pomo.sessionId && !pomo.isActive) void pomo.start();
												}}>
												🎯 Enfocar
											</button>
											<button
												className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600"
												onClick={() => void mutRecalc.mutate(t.id)}>
												⟳
											</button>
											<button
												className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-700"
												onClick={() => void mutPush.mutate(t.id)}>
												⤴
											</button>
											<button
												className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700"
												onClick={() => void mutDone.mutate(t.id)}>
												✔
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</section>
			</div>

			{/* ===== Pomodoro lateral ===== */}
			<aside className="border border-slate-800 rounded-lg p-4 bg-slate-900/40">
				<h2 className="text-lg font-medium mb-3">⏱ Pomodoro</h2>
				<div className="text-3xl font-mono tabular-nums mb-2">{pomo.format(pomo.secondsLeft)}</div>
				<div className="text-xs mb-3">
					Fase: <span className="px-2 py-1 rounded bg-slate-800">{pomo.phase.toUpperCase()}</span>
				</div>
				<div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-3">
					<div>Objetivo foco: {pomo.currentFocusMin} min</div>
					<div>Objetivo descanso: {pomo.currentBreakMin} min</div>
					<div>Foco real: {Math.floor(pomo.accFocusSec / 60)} min</div>
					<div>Descanso real: {Math.floor(pomo.accBreakSec / 60)} min</div>
				</div>
				<div className="flex gap-2">
					{!pomo.isActive && !pomo.sessionId && (
						<button className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700" onClick={() => void pomo.start()}>
							▶ Iniciar
						</button>
					)}
					{pomo.sessionId && (
						<>
							<button className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700" onClick={pomo.toggle}>
								{pomo.isActive ? '⏸ Pausar' : '▶ Reanudar'}
							</button>
							<button className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700" onClick={() => void pomo.stop()}>
								■ Finalizar
							</button>
						</>
					)}
				</div>
			</aside>
		</div>
	);
};

export default Hoy;
