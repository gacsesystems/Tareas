import type { FC } from 'react';
import { useMemo, useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api';
import { EstadoTarea, type Tarea, type SesionTrabajo } from '@/lib/types';

/* =========================
   Query Keys
   ========================= */
const hoyKeys = {
	all: ['hoy'] as const,
	lista: () => [...hoyKeys.all, 'lista'] as const,
};

const tareasKeys = {
	all: ['tareas'] as const,
	lists: () => [...tareasKeys.all, 'list'] as const,
};

/* =========================
   API SDK local (ligero)
   ========================= */
async function fetchTareasHoy(): Promise<Tarea[]> {
	return api.get<Tarea[]>('/api/tareas/hoy');
}
async function postEmpujar(id: number): Promise<void> {
	await api.post(`/api/tareas/${id}/empujar`, {});
}
async function postRecalc(id: number): Promise<void> {
	await api.post(`/api/tareas/${id}/recalcular-score`, {});
}
async function postHecha(id: number): Promise<void> {
	await api.post(`/api/tareas/${id}/completas`, {});
}

const IniciarSesionSchema = z.object({
	tareaId: z.number().optional(),
	categoria: z.string().optional(),
	modoRollover: z.number().default(1), // 1: Acumulativo
});
type IniciarSesionInput = z.infer<typeof IniciarSesionSchema>;

async function iniciarSesion(input: IniciarSesionInput): Promise<SesionTrabajo> {
	const payload: any = {
		tareaId: input.tareaId ?? null,
		categoria: input.categoria ?? 'Foco',
		modoRollover: input.modoRollover ?? 1,
		// Inicio lo setea backend si no mandamos
	};
	return api.post<SesionTrabajo>('/api/sesiones/iniciar', payload);
}

async function finalizarSesion(id: number, focoMin: number, descansoMin: number, notas?: string): Promise<void> {
	const qs = new URLSearchParams();
	qs.set('focoMin', String(Math.max(0, Math.round(focoMin))));
	qs.set('descansoMin', String(Math.max(0, Math.round(descansoMin))));
	if (notas) qs.set('notas', notas);
	await api.post(`/api/sesiones/finalizar/${id}?${qs.toString()}`, {});
}

/* =========================
   Component
   ========================= */
const Hoy: FC = () => {
	const qc = useQueryClient();

	// Datos
	const { data: tareas = [], isLoading } = useQuery({
		queryKey: hoyKeys.lista(),
		queryFn: fetchTareasHoy,
		staleTime: 1000 * 60 * 2,
	});

	// Acciones de tarea (con onSettled para refrescar hoy y listas)
	const empujar = useMutation({
		mutationFn: postEmpujar,
		onSettled: () => {
			void qc.invalidateQueries({ queryKey: hoyKeys.lista() });
			void qc.invalidateQueries({ queryKey: tareasKeys.lists() });
		},
	});
	const recalcular = useMutation({
		mutationFn: postRecalc,
		onSettled: () => {
			void qc.invalidateQueries({ queryKey: hoyKeys.lista() });
			void qc.invalidateQueries({ queryKey: tareasKeys.lists() });
		},
	});
	const completar = useMutation({
		mutationFn: postHecha,
		// Optimistic UI mínimo
		onMutate: async (id: number) => {
			await qc.cancelQueries({ queryKey: hoyKeys.lista() });
			const prev = qc.getQueryData<Tarea[]>(hoyKeys.lista());
			if (prev) {
				qc.setQueryData<Tarea[]>(
					hoyKeys.lista(),
					prev.filter((t) => t.id !== id)
				);
			}
			return { prev };
		},
		onError: (_e, _id, ctx) => {
			if (ctx?.prev) qc.setQueryData(hoyKeys.lista(), ctx.prev);
		},
		onSettled: () => {
			void qc.invalidateQueries({ queryKey: hoyKeys.lista() });
			void qc.invalidateQueries({ queryKey: tareasKeys.lists() });
		},
	});

	// Derivados: frog + rocas
	const frog = useMemo(() => {
		const frogs = tareas.filter((t) => t.frog);
		return frogs.sort((a, b) => b.score - a.score)[0];
	}, [tareas]);

	const rocas = useMemo(() => {
		const base = tareas.filter((t) => t.estado !== EstadoTarea.Hecha && (!frog || t.id !== frog.id)).slice();
		base.sort((a, b) => (b.impacto ?? 0) - (a.impacto ?? 0) || b.score - a.score);
		return base.slice(0, 3);
	}, [tareas, frog]);

	// ================= Pomodoro conectado =================
	// Estado del temporizador
	const [tareaSeleccionada, setTareaSeleccionada] = useState<number | ''>('');
	const [fase, setFase] = useState<'foco' | 'descanso'>('foco');
	const [activo, setActivo] = useState(false);
	const [segundos, setSegundos] = useState(25 * 60); // contador regresivo de la fase
	const [acumFoco, setAcumFoco] = useState(0); // segundos totales foco en la sesión
	const [acumDescanso, setAcumDescanso] = useState(0); // segundos totales descanso en la sesión
	const [sesionId, setSesionId] = useState<number | null>(null);

	// Iniciar / finalizar backend
	const mutIniciarSesion = useMutation({
		mutationFn: iniciarSesion,
		onSuccess: (s) => setSesionId(s.id),
	});
	const mutFinalizarSesion = useMutation({
		mutationFn: (p: { id: number; focoMin: number; descansoMin: number; notas?: string }) =>
			finalizarSesion(p.id, p.focoMin, p.descansoMin, p.notas),
		onSettled: () => {
			// refrescar stats y tareas
			void qc.invalidateQueries({ queryKey: hoyKeys.lista() });
			void qc.invalidateQueries({ queryKey: tareasKeys.lists() });
		},
	});

	// Tick
	useEffect(() => {
		if (!activo) return;
		const id = setInterval(() => {
			setSegundos((s) => {
				if (s > 0) return s - 1;
				// cambio de fase al llegar a 0
				setFase((f) => (f === 'foco' ? 'descanso' : 'foco'));
				return (fase === 'foco' ? 5 : 25) * 60; // siguiente fase: 5 min descanso, 25 min foco
			});
			// acumular por fase
			if (fase === 'foco') setAcumFoco((x) => x + 1);
			else setAcumDescanso((x) => x + 1);
		}, 1000);
		return () => clearInterval(id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activo, fase]);

	function fmt(t: number) {
		const m = Math.floor(t / 60);
		const s = t % 60;
		return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}

	async function iniciarPomodoro() {
		if (activo) return;
		// crea sesión en backend
		const payload: IniciarSesionInput = {
			tareaId: tareaSeleccionada === '' ? undefined : Number(tareaSeleccionada),
			categoria: 'Foco',
			modoRollover: 1,
		};
		await mutIniciarSesion.mutateAsync(payload);
		// arranca timer
		setFase('foco');
		setSegundos(25 * 60);
		setAcumFoco(0);
		setAcumDescanso(0);
		setActivo(true);
	}

	async function finalizarPomodoro() {
		setActivo(false);
		if (sesionId) {
			const focoMin = Math.round(acumFoco / 60);
			const descansoMin = Math.round(acumDescanso / 60);
			await mutFinalizarSesion.mutateAsync({ id: sesionId, focoMin, descansoMin });
		}
		setSesionId(null);
	}

	function pausarReanudar() {
		setActivo((v) => !v);
	}

	// ================= Render =================
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Hoy</h1>

			{/* FROG */}
			<section className="p-4 rounded-lg border border-slate-700 bg-slate-900/40">
				<h2 className="text-lg font-medium mb-2">🐸 Frog del día</h2>
				{frog ? (
					<div className="flex items-center justify-between gap-4">
						<div>
							<div className="font-semibold">{frog.titulo}</div>
							<div className="text-sm text-slate-400">
								Impacto {frog.impacto ?? '-'} · Score {frog.score.toFixed(4)} · Rank {frog.ranking}
							</div>
						</div>
						<div className="flex gap-2">
							<button
								className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700"
								onClick={() => completar.mutate(frog.id)}
								disabled={completar.isPending}
								title="Marcar como hecha">
								✔ {completar.isPending ? '...' : 'Hecha'}
							</button>
							<button
								className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-700"
								onClick={() => empujar.mutate(frog.id)}
								disabled={empujar.isPending}
								title="Empujar al tope">
								⤴ {empujar.isPending ? '...' : 'Empujar'}
							</button>
							<button
								className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700"
								onClick={() => recalcular.mutate(frog.id)}
								disabled={recalcular.isPending}
								title="Recalcular score">
								⟳ {recalcular.isPending ? '...' : 'Recalc'}
							</button>
						</div>
					</div>
				) : (
					<p className="text-slate-400">No hay Frog marcada. Marca una tarea como “Frog”.</p>
				)}
			</section>

			{/* ROCAS */}
			<section className="p-4 rounded-lg border border-slate-700 bg-slate-900/40">
				<h2 className="text-lg font-medium mb-3">🪨 3 Rocas</h2>
				{rocas.length === 0 ? (
					<p className="text-slate-400">No hay rocas candidatas.</p>
				) : (
					<ul className="grid md:grid-cols-3 gap-3">
						{rocas.map((r) => (
							<li key={r.id} className="p-3 rounded border border-slate-700">
								<div className="font-medium mb-1">{r.titulo}</div>
								<div className="text-sm text-slate-400 mb-2">
									Impacto {r.impacto ?? '-'} · Score {r.score.toFixed(4)}
								</div>
								<div className="flex gap-2">
									<button
										className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700"
										onClick={() => completar.mutate(r.id)}
										disabled={completar.isPending}>
										✔ Hecha
									</button>
									<button
										className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-700"
										onClick={() => empujar.mutate(r.id)}
										disabled={empujar.isPending}>
										⤴ Empujar
									</button>
									<button
										className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700"
										onClick={() => recalcular.mutate(r.id)}
										disabled={recalcular.isPending}>
										⟳ Recalc
									</button>
								</div>
							</li>
						))}
					</ul>
				)}
			</section>

			{/* COLA HOY */}
			<section>
				<h2 className="text-lg font-medium mb-2">🧾 Cola de hoy</h2>
				{isLoading ? (
					<p>Cargando...</p>
				) : tareas.length === 0 ? (
					<p className="text-slate-400">Sin tareas para hoy.</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="text-left border-b border-slate-700">
									<th className="py-2 pr-3">ID</th>
									<th className="py-2 pr-3">Título</th>
									<th className="py-2 pr-3">Impacto</th>
									<th className="py-2 pr-3">Frog</th>
									<th className="py-2 pr-3">Score</th>
									<th className="py-2 pr-3">Rank</th>
									<th className="py-2 pr-3">Acciones</th>
								</tr>
							</thead>
							<tbody>
								{tareas.map((t) => (
									<tr key={t.id} className="border-b border-slate-800">
										<td className="py-2 pr-3">{t.id}</td>
										<td className="py-2 pr-3">{t.titulo}</td>
										<td className="py-2 pr-3">{t.impacto ?? '-'}</td>
										<td className="py-2 pr-3">{t.frog ? '✓' : ''}</td>
										<td className="py-2 pr-3">{t.score.toFixed(4)}</td>
										<td className="py-2 pr-3">{t.ranking}</td>
										<td className="py-2 pr-3 whitespace-nowrap">
											<button
												className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 mr-1"
												onClick={() => completar.mutate(t.id)}
												disabled={completar.isPending}>
												✔ Hecha
											</button>
											<button
												className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-700 mr-1"
												onClick={() => empujar.mutate(t.id)}
												disabled={empujar.isPending}>
												⤴ Empujar
											</button>
											<button
												className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700"
												onClick={() => recalcular.mutate(t.id)}
												disabled={recalcular.isPending}>
												⟳ Recalc
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>

			{/* POMODORO conectado */}
			<section className="p-4 rounded-lg border border-slate-700 bg-slate-900/40">
				<h2 className="text-lg font-medium mb-3">⏱ Pomodoro</h2>

				<div className="flex items-center gap-3 mb-3">
					<label className="text-sm">
						Tarea asociada:&nbsp;
						<select
							className="bg-slate-800 rounded px-2 py-1"
							value={tareaSeleccionada}
							onChange={(e) => setTareaSeleccionada(e.target.value === '' ? '' : Number(e.target.value))}
							disabled={activo}>
							<option value="">(ninguna)</option>
							{tareas.map((t) => (
								<option key={t.id} value={t.id}>
									{t.titulo}
								</option>
							))}
						</select>
					</label>

					<div className="text-3xl font-mono tabular-nums">{fmt(segundos)}</div>
					<span className="px-2 py-1 rounded bg-slate-800 text-xs">{fase.toUpperCase()}</span>

					{!activo ? (
						<button
							className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700"
							onClick={() => void iniciarPomodoro()}
							disabled={mutIniciarSesion.isPending}>
							▶ Iniciar
						</button>
					) : (
						<>
							<button className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700" onClick={pausarReanudar}>
								{activo ? '⏸ Pausar' : '▶ Reanudar'}
							</button>
							<button
								className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700"
								onClick={() => void finalizarPomodoro()}
								disabled={mutFinalizarSesion.isPending}>
								■ Finalizar
							</button>
						</>
					)}
				</div>

				<p className="text-xs text-slate-400">
					Sesión: {sesionId ?? '—'} · Foco acumulado: {Math.floor(acumFoco / 60)} min · Descanso:{' '}
					{Math.floor(acumDescanso / 60)} min
				</p>
			</section>
		</div>
	);
};

export default Hoy;
