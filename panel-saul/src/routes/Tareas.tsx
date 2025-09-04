import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api';
import { EstadoTarea, type Tarea } from '@/lib/types';
import { usePomodoro, RolloverMode } from '@/hooks/usePomodoro';
import { useToast } from '@/components/Toast';

// ===== SCHEMAS ZOD =====
const TareaFiltersSchema = z.object({
	state: z.number().optional(),
	projectId: z.number().optional(),
});

const CreateTareaSchema = z.object({
	titulo: z.string().min(1, 'El título es requerido').trim(),
	proyectoId: z.number().nullable(),
	impacto: z.number().min(1).max(5).nullable(),
	urgenteDias: z.number().min(0).max(31).nullable(),
	frog: z.boolean(),
	pareto: z.boolean(),
	dueDate: z.string().nullable(),
	pomosEstimados: z.number().min(0).max(200).nullable(),
});

type TareaFilters = z.infer<typeof TareaFiltersSchema>;
type CreateTareaInput = z.infer<typeof CreateTareaSchema>;

// ===== QUERY KEYS =====
const tareasKeys = {
	all: ['tareas'] as const,
	lists: () => [...tareasKeys.all, 'list'] as const,
	list: (filters: TareaFilters) => [...tareasKeys.lists(), filters] as const,
};

// ===== API =====
const fetchTareas = async (filters: TareaFilters): Promise<Tarea[]> => {
	const params = new URLSearchParams();
	if (filters.state !== undefined) params.append('state', String(filters.state));
	if (filters.projectId !== undefined) params.append('projectId', String(filters.projectId));
	const url = params.toString() ? `/api/tareas?${params}` : '/api/tareas';
	return api.get<Tarea[]>(url);
};

const createTarea = async (input: CreateTareaInput): Promise<Tarea> => {
	const validationResult = CreateTareaSchema.safeParse({
		...input,
		dueDate: input.dueDate ? new Date(input.dueDate).toISOString() : null,
	});
	if (!validationResult.success) {
		const firstError = validationResult.error.issues[0];
		throw new Error(`Datos inválidos: ${firstError?.message ?? 'Error de validación'}`);
	}
	return api.post<Tarea>('/api/tareas', validationResult.data);
};

const completarTarea = async (id: number): Promise<void> => {
	await api.post(`/api/tareas/${id}/completas`, {});
};
const empujarTarea = async (id: number): Promise<void> => {
	await api.post(`/api/tareas/${id}/empujar`, {});
};
const recalcularScore = async (id: number): Promise<void> => {
	await api.post(`/api/tareas/${id}/recalcular-score`, {});
};

// ===== HOOKS =====
const useTareas = (filters: TareaFilters) =>
	useQuery({
		queryKey: tareasKeys.list(filters),
		queryFn: () => fetchTareas(filters),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
	});

const useCreateTarea = () => {
	const queryClient = useQueryClient();
	const { show } = useToast();
	return useMutation({
		mutationFn: createTarea,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: tareasKeys.lists() });
			show('Tarea creada', 'success');
		},
		onError: (error) => {
			const message = error instanceof Error ? error.message : 'Error al crear tarea';
			show(message, 'error');
		},
	});
};

const useTareaMutations = () => {
	const queryClient = useQueryClient();

	const { show } = useToast();

	const completar = useMutation({
		mutationFn: completarTarea,
		onMutate: async (id: number) => {
			await queryClient.cancelQueries({ queryKey: tareasKeys.lists() });
			const prev = queryClient.getQueriesData<Tarea[]>({ queryKey: tareasKeys.lists() });
			prev.forEach(([key, list]) => {
				if (!list) return;
				queryClient.setQueryData<Tarea[]>(
					key,
					list.map((t) => (t.id === id ? { ...t, estado: EstadoTarea.Hecha } : t))
				);
			});
			return { prev };
		},
		onError: (_err, _vars, ctx) => {
			ctx?.prev?.forEach(([key, list]) => {
				queryClient.setQueryData(key, list);
			});
			show('No se pudo completar la tarea', 'error');
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: tareasKeys.lists() });
			show('Tarea empujada', 'success');
		},
		onSuccess: () => show('Tarea completada', 'success'),
	});

	const empujar = useMutation({
		mutationFn: empujarTarea,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: tareasKeys.lists() });
		},
		onError: (error) => {
			const message = error instanceof Error ? error.message : 'Error al empujar';
			alert(message);
		},
	});

	const recalcular = useMutation({
		mutationFn: recalcularScore,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: tareasKeys.lists() });
		},
		onError: (error) => {
			const message = error instanceof Error ? error.message : 'Error al recalcular';
			alert(message);
		},
	});

	return { completar, empujar, recalcular };
};

// ===== FORM HOOK =====
const useCreateTareaForm = () => {
	const [formData, setFormData] = useState({
		titulo: '',
		proyectoId: '' as string | number,
		impacto: '' as string | number,
		urgenteDias: '' as string | number,
		frog: false,
		pareto: false,
		dueDate: '',
		pomosEstimados: '' as string | number,
	});

	const resetForm = () => {
		setFormData({
			titulo: '',
			proyectoId: '',
			impacto: '',
			urgenteDias: '',
			frog: false,
			pareto: false,
			dueDate: '',
			pomosEstimados: '',
		});
	};

	const getCreateInput = (): CreateTareaInput => ({
		titulo: formData.titulo,
		proyectoId: formData.proyectoId === '' ? null : Number(formData.proyectoId),
		impacto: formData.impacto === '' ? null : Number(formData.impacto),
		urgenteDias: formData.urgenteDias === '' ? null : Number(formData.urgenteDias),
		frog: formData.frog,
		pareto: formData.pareto,
		dueDate: formData.dueDate || null,
		pomosEstimados: formData.pomosEstimados === '' ? null : Number(formData.pomosEstimados),
	});

	return { formData, setFormData, resetForm, getCreateInput };
};

// ===== UTILS =====
function toLocalInput(dt?: string | null): string {
	if (!dt) return '';
	const d = new Date(dt);
	const pad = (n: number): string => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ===== MAIN COMPONENT =====
const Tareas: FC = () => {
	// Filtros
	const [filtroEstado, setFiltroEstado] = useState<number | ''>('');
	const [filtroProyectoId, setFiltroProyectoId] = useState<number | ''>('');

	// Busy row state
	const [busy, setBusy] = useState<{ id: number | null; action: 'done' | 'push' | 'recalc' | null }>({
		id: null,
		action: null,
	});

	// Form
	const { formData, setFormData, resetForm, getCreateInput } = useCreateTareaForm();

	// Query filters
	const filters = useMemo<TareaFilters>(
		() => ({
			state: filtroEstado === '' ? undefined : filtroEstado,
			projectId: filtroProyectoId === '' ? undefined : filtroProyectoId,
		}),
		[filtroEstado, filtroProyectoId]
	);

	// Data
	const { data: tareas = [], isLoading, error, refetch } = useTareas(filters);
	const createTareaMutation = useCreateTarea();
	const { completar, empujar, recalcular } = useTareaMutations();

	// Estados catálogo
	const estados = useMemo(
		() => [
			{ v: '', t: 'Todos' },
			{ v: EstadoTarea.Backlog, t: 'Backlog' },
			{ v: EstadoTarea.Siguiente, t: 'Siguiente' },
			{ v: EstadoTarea.Hoy, t: 'Hoy' },
			{ v: EstadoTarea.EnCurso, t: 'En curso' },
			{ v: EstadoTarea.EnRevision, t: 'En revisión' },
			{ v: EstadoTarea.Hecha, t: 'Hecha' },
		],
		[]
	);

	const estadoTexto = (e: number): string => estados.find((x) => x.v === e)?.t ?? String(e);

	// POMODORO LATERAL (reutilizable)
	const pomo = usePomodoro({
		baseFocusMin: 25,
		baseBreakMin: 5,
		mode: RolloverMode.Acumulativo,
		tareaId: null,
		categoria: 'Foco',
		invalidateKeys: [tareasKeys.lists()], // refresca listas al terminar
	});

	// Handlers
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const input = getCreateInput();
		const validationResult = CreateTareaSchema.safeParse(input);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			alert(`Error de validación: ${firstError?.message ?? 'Datos inválidos'}`);
			return;
		}
		try {
			await createTareaMutation.mutateAsync(validationResult.data);
			resetForm();
		} catch {}
	};

	const handleCompletarClick = async (id: number) => {
		if (!confirm('¿Marcar como hecha?')) return;
		try {
			setBusy({ id, action: 'done' });
			await completar.mutateAsync(id);
		} finally {
			setBusy({ id: null, action: null });
		}
	};
	const handleEmpujarClick = async (id: number) => {
		try {
			setBusy({ id, action: 'push' });
			await empujar.mutateAsync(id);
		} finally {
			setBusy({ id: null, action: null });
		}
	};
	const handleRecalcClick = async (id: number) => {
		try {
			setBusy({ id, action: 'recalc' });
			await recalcular.mutateAsync(id);
		} finally {
			setBusy({ id: null, action: null });
		}
	};

	// Render
	return (
		<div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
			{/* ===== LISTA Y FORM ===== */}
			<div>
				<h1 className="text-xl font-semibold mb-2">Tareas</h1>

				{/* Filtros */}
				<section className="mb-4 flex flex-wrap gap-2">
					<label className="text-sm">
						Estado:&nbsp;
						<select
							value={filtroEstado}
							onChange={(e) => setFiltroEstado(e.target.value === '' ? '' : Number(e.target.value))}
							className="bg-slate-800 rounded px-2 py-1">
							{estados.map((s) => (
								<option key={String(s.v)} value={String(s.v)}>
									{s.t}
								</option>
							))}
						</select>
					</label>

					<label className="text-sm">
						ProyectoId:&nbsp;
						<input
							type="number"
							min={1}
							value={filtroProyectoId}
							onChange={(e) => setFiltroProyectoId(e.target.value === '' ? '' : Number(e.target.value))}
							placeholder="(opcional)"
							className="bg-slate-800 rounded px-2 py-1 w-32"
						/>
					</label>

					<button
						onClick={() => void refetch()}
						disabled={isLoading}
						className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-60">
						{isLoading ? 'Cargando...' : 'Refrescar'}
					</button>
				</section>

				{/* Tabla */}
				<section className="overflow-x-auto">
					{isLoading && <p>Cargando...</p>}
					{error && <p className="text-rose-400">{error instanceof Error ? error.message : 'Error al cargar tareas'}</p>}
					{!isLoading && tareas.length === 0 && <p>Sin tareas con los filtros actuales.</p>}

					{tareas.length > 0 && (
						<table className="w-full border-collapse">
							<thead>
								<tr>
									<th style={th}>ID</th>
									<th style={th}>Título</th>
									<th style={th}>Estado</th>
									<th style={th}>Proyecto</th>
									<th style={th}>Impacto</th>
									<th style={th}>Urg.</th>
									<th style={th}>Frog</th>
									<th style={th}>Pareto</th>
									<th style={th}>Due</th>
									<th style={th}>Score</th>
									<th style={th}>Rank</th>
									<th style={th}>Acciones</th>
								</tr>
							</thead>
							<tbody>
								{tareas.map((t) => (
									<tr key={t.id}>
										<td style={td}>{t.id}</td>
										<td style={td}>{t.titulo}</td>
										<td style={td}>{estadoTexto(t.estado)}</td>
										<td style={td}>{t.proyectoId ?? '-'}</td>
										<td style={{ ...td, textAlign: 'center' }}>{t.impacto ?? '-'}</td>
										<td style={{ ...td, textAlign: 'center' }}>{t.urgenteDias ?? '-'}</td>
										<td style={{ ...td, textAlign: 'center' }}>{t.frog ? '✓' : ''}</td>
										<td style={{ ...td, textAlign: 'center' }}>{t.pareto ? '✓' : ''}</td>
										<td style={td}>{toLocalInput(t.dueDate)?.replace('T', ' ') ?? '-'}</td>
										<td style={{ ...td, textAlign: 'right' }}>{t.score.toFixed(4)}</td>
										<td style={{ ...td, textAlign: 'right' }}>{t.ranking}</td>
										<td style={{ ...td, whiteSpace: 'nowrap' }} className="whitespace-nowrap">
											<button
												onClick={() => void handleCompletarClick(t.id)}
												disabled={busy.id === t.id}
												title="Marcar como hecha"
												className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60">
												✔ {busy.id === t.id && busy.action === 'done' ? '...' : 'Hecha'}
											</button>{' '}
											<button
												onClick={() => void handleEmpujarClick(t.id)}
												disabled={busy.id === t.id}
												title="Empujar al tope"
												className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-700 disabled:opacity-60">
												⤴ {busy.id === t.id && busy.action === 'push' ? '...' : 'Empujar'}
											</button>{' '}
											<button
												onClick={() => void handleRecalcClick(t.id)}
												disabled={busy.id === t.id}
												title="Recalcular score"
												className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60">
												⟳ {busy.id === t.id && busy.action === 'recalc' ? '...' : 'Recalc'}
											</button>{' '}
											{/* === ENFOCAR === */}
											<button
												onClick={() => {
													pomo.setTareaId(t.id);
													// si quieres auto-iniciar si no hay sesión
													if (!pomo.sessionId && !pomo.isActive) void pomo.start();
												}}
												title="Enfocar con Pomodoro"
												className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 disabled:opacity-60">
												🎯 Enfocar
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</section>

				{/* Crear tarea */}
				<section className="mt-8">
					<h2 className="text-lg font-semibold mb-2">Nueva tarea</h2>
					<form onSubmit={handleSubmit} className="grid gap-2 max-w-[680px]">
						<label className="text-sm">
							Título
							<br />
							<input
								value={formData.titulo}
								onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
								placeholder="Escribe el título"
								required
								className="w-full bg-slate-800 rounded px-2 py-1"
							/>
						</label>

						<div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
							<label className="text-sm">
								ProyectoId
								<br />
								<input
									type="number"
									min={1}
									value={formData.proyectoId}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											proyectoId: e.target.value === '' ? '' : Number(e.target.value),
										}))
									}
									placeholder="Opcional"
									className="bg-slate-800 rounded px-2 py-1"
								/>
							</label>

							<label className="text-sm">
								Impacto (1-5)
								<br />
								<input
									type="number"
									min={1}
									max={5}
									value={formData.impacto}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											impacto: e.target.value === '' ? '' : Number(e.target.value),
										}))
									}
									className="bg-slate-800 rounded px-2 py-1"
								/>
							</label>

							<label className="text-sm">
								Urgente (días 0-31)
								<br />
								<input
									type="number"
									min={0}
									max={31}
									value={formData.urgenteDias}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											urgenteDias: e.target.value === '' ? '' : Number(e.target.value),
										}))
									}
									className="bg-slate-800 rounded px-2 py-1"
								/>
							</label>

							<label className="text-sm">
								Pomos estimados
								<br />
								<input
									type="number"
									min={0}
									max={200}
									value={formData.pomosEstimados}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											pomosEstimados: e.target.value === '' ? '' : Number(e.target.value),
										}))
									}
									className="bg-slate-800 rounded px-2 py-1"
								/>
							</label>
						</div>

						<div className="flex items-center gap-4 mt-1">
							<label className="text-sm inline-flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.frog}
									onChange={(e) => setFormData((prev) => ({ ...prev, frog: e.target.checked }))}
								/>
								Frog
							</label>
							<label className="text-sm inline-flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.pareto}
									onChange={(e) => setFormData((prev) => ({ ...prev, pareto: e.target.checked }))}
								/>
								Pareto
							</label>

							<label className="text-sm ml-auto">
								Due date (opcional)&nbsp;
								<input
									type="datetime-local"
									value={formData.dueDate}
									onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
									className="bg-slate-800 rounded px-2 py-1"
								/>
							</label>
						</div>

						<div className="mt-2">
							<button
								type="submit"
								disabled={createTareaMutation.isPending}
								className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60">
								{createTareaMutation.isPending ? 'Creando...' : 'Crear'}
							</button>
						</div>
					</form>
				</section>
			</div>

			{/* ===== POMODORO LATERAL ===== */}
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

				<div className="flex items-center gap-2 mb-3">
					<label className="text-sm">Modo:&nbsp;</label>
					<select
						className="bg-slate-800 rounded px-2 py-1"
						value={pomo.mode}
						onChange={(e) => pomo.setMode(Number(e.target.value) as RolloverMode)}
						disabled={pomo.isActive}>
						<option value="Acumulativo">Acumulativo</option>
						<option value="Balanceado">Balanceado</option>
						<option value="Estricto">Estricto</option>
					</select>
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

export default Tareas;

// estilos tabla
const th: React.CSSProperties = { textAlign: 'left', borderBottom: '1px solid #333', padding: '8px' };
const td: React.CSSProperties = { borderBottom: '1px solid #222', padding: '8px' };
