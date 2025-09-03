import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api';
import { EstadoTarea, type Tarea } from '@/lib/types';

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

// ===== API FUNCTIONS =====
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

// ===== CUSTOM HOOKS =====
const useTareas = (filters: TareaFilters) => {
	return useQuery({
		queryKey: tareasKeys.list(filters),
		queryFn: () => fetchTareas(filters),
		staleTime: 1000 * 60 * 5, // 5 minutos
		gcTime: 1000 * 60 * 10, // 10 minutos
	});
};

const useCreateTarea = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createTarea,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: tareasKeys.lists() });
		},
		onError: (error) => {
			const message = error instanceof Error ? error.message : 'Error al crear tarea';
			alert(message);
		},
	});
};

const useTareaMutations = () => {
	const queryClient = useQueryClient();

	const completar = useMutation({
		mutationFn: completarTarea,
		onMutate: async (id: number) => {
			// 1) cancela re-fetches en curso
			await queryClient.cancelQueries({ queryKey: tareasKeys.lists() });

			// 2) snapshot del estado actual
			const prev = queryClient.getQueriesData<Tarea[]>({ queryKey: tareasKeys.lists() });

			// 3) parchea cache: quita o cambia estado de la tarea en todas las listas
			prev.forEach(([key, list]) => {
				if (!list) return;
				queryClient.setQueryData<Tarea[]>(
					key,
					list.map((t) => (t.id === id ? { ...t, estado: EstadoTarea.Hecha } : t))
				);
			});

			// 4) devuelve el snapshot para revertir
			return { prev };
		},
		onError: (_err, _vars, ctx) => {
			// 5) si falló, revertir a snapshot
			ctx?.prev?.forEach(([key, list]) => {
				queryClient.setQueryData(key, list);
			});
		},
		// 	onError: (error) => {
		// 		const message = error instanceof Error ? error.message : 'Error al completar';
		// 		alert(message);
		// 	},
		onSettled: () => {
			// 6) al final, refrescar definitivo desde el servidor
			void queryClient.invalidateQueries({ queryKey: tareasKeys.lists() });
		},
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

	const [busy, setBusy] = useState<{ id: number | null; action: 'done' | 'push' | 'recalc' | null }>({
		id: null,
		action: null,
	});

	// Form
	const { formData, setFormData, resetForm, getCreateInput } = useCreateTareaForm();

	// Construir filtros para la query
	const filters = useMemo<TareaFilters>(
		() => ({
			state: filtroEstado === '' ? undefined : filtroEstado,
			projectId: filtroProyectoId === '' ? undefined : filtroProyectoId,
		}),
		[filtroEstado, filtroProyectoId]
	);

	// React Query hooks
	const { data: tareas = [], isLoading, error, refetch } = useTareas(filters);
	const createTareaMutation = useCreateTarea();
	const { completar, empujar, recalcular } = useTareaMutations();

	// Estados para UI
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

	const estadoTexto = (e: number): string => {
		const found = estados.find((x) => x.v === e);
		return found?.t ?? String(e);
	};

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
		} catch {
			// Los errores de la API ya se manejan en la mutation onError
		}
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

	// ===== RENDER =====
	return (
		<div>
			<h1>Tareas</h1>

			{/* Filtros */}
			<section style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
				<label>
					Estado:&nbsp;
					<select
						value={filtroEstado}
						onChange={(e) => setFiltroEstado(e.target.value === '' ? '' : Number(e.target.value))}>
						{estados.map((s) => (
							<option key={String(s.v)} value={String(s.v)}>
								{s.t}
							</option>
						))}
					</select>
				</label>

				<label>
					ProyectoId:&nbsp;
					<input
						type="number"
						min={1}
						value={filtroProyectoId}
						onChange={(e) => setFiltroProyectoId(e.target.value === '' ? '' : Number(e.target.value))}
						placeholder="(opcional)"
						style={{ width: 120 }}
					/>
				</label>

				<button onClick={() => void refetch()} disabled={isLoading}>
					{isLoading ? 'Cargando...' : 'Refrescar'}
				</button>
			</section>

			{/* Tabla */}
			<section style={{ overflowX: 'auto' }}>
				{isLoading && <p>Cargando...</p>}
				{error && <p style={{ color: 'salmon' }}>{error instanceof Error ? error.message : 'Error al cargar tareas'}</p>}

				{!isLoading && tareas.length === 0 && <p>Sin tareas con los filtros actuales.</p>}

				{tareas.length > 0 && (
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
									<td style={td} align="center">
										{t.impacto ?? '-'}
									</td>
									<td style={td} align="center">
										{t.urgenteDias ?? '-'}
									</td>
									<td style={td} align="center">
										{t.frog ? '✓' : ''}
									</td>
									<td style={td} align="center">
										{t.pareto ? '✓' : ''}
									</td>
									<td style={td}>{toLocalInput(t.dueDate)?.replace('T', ' ') ?? '-'}</td>
									<td style={td} align="right">
										{t.score.toFixed(4)}
									</td>
									<td style={td} align="right">
										{t.ranking}
									</td>
									<td className="whitespace-nowrap" style={td}>
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
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</section>

			{/* Crear tarea */}
			<section style={{ marginTop: 32 }}>
				<h2>Nueva tarea</h2>
				<form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 680 }}>
					<label>
						Título
						<br />
						<input
							value={formData.titulo}
							onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
							placeholder="Escribe el título"
							required
							style={{ width: '100%' }}
						/>
					</label>

					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
						<label>
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
							/>
						</label>

						<label>
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
							/>
						</label>

						<label>
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
							/>
						</label>

						<label>
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
							/>
						</label>
					</div>

					<div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
						<label>
							<input
								type="checkbox"
								checked={formData.frog}
								onChange={(e) => setFormData((prev) => ({ ...prev, frog: e.target.checked }))}
							/>{' '}
							Frog
						</label>
						<label>
							<input
								type="checkbox"
								checked={formData.pareto}
								onChange={(e) => setFormData((prev) => ({ ...prev, pareto: e.target.checked }))}
							/>{' '}
							Pareto
						</label>

						<label>
							Due date (opcional)&nbsp;
							<input
								type="datetime-local"
								value={formData.dueDate}
								onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
							/>
						</label>
					</div>

					<div>
						<button type="submit" disabled={createTareaMutation.isPending}>
							{createTareaMutation.isPending ? 'Creando...' : 'Crear'}
						</button>
					</div>
				</form>
			</section>
		</div>
	);
};

export default Tareas;

// estilos
const th: React.CSSProperties = { textAlign: 'left', borderBottom: '1px solid #333', padding: '8px' };
const td: React.CSSProperties = { borderBottom: '1px solid #222', padding: '8px' };
