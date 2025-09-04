import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api';
import type { SesionTrabajo } from '@/lib/types';

const FiltersSchema = z.object({
	desde: z.string().optional(), // ISO yyyy-mm-dd
	hasta: z.string().optional(),
	tareaId: z.string().optional(),
});
type Filters = z.infer<typeof FiltersSchema>;

const sesionesKeys = {
	all: ['sesiones'] as const,
	list: (f: Filters) => [...sesionesKeys.all, f] as const,
};

async function fetchSesiones(f: Filters): Promise<SesionTrabajo[]> {
	const qs = new URLSearchParams();
	if (f.desde) qs.set('desde', new Date(f.desde).toISOString());
	if (f.hasta) qs.set('hasta', new Date(f.hasta).toISOString());
	if (f.tareaId && f.tareaId.trim()) qs.set('tareaId', f.tareaId.trim());
	const url = qs.toString() ? `/api/sesiones?${qs}` : '/api/sesiones';
	return api.get(url);
}

function toLocal(dt: string | Date | null | undefined) {
	if (!dt) return '';
	const d = new Date(dt);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const Sesiones: FC = () => {
	const [desde, setDesde] = useState<string>('');
	const [hasta, setHasta] = useState<string>('');
	const [tareaId, setTareaId] = useState<string>('');

	const filters = useMemo<Filters>(() => ({ desde, hasta, tareaId }), [desde, hasta, tareaId]);

	const {
		data: sesiones = [],
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: sesionesKeys.list(filters),
		queryFn: () => fetchSesiones(filters),
		staleTime: 60_000,
	});

	// ===== NUEVO: cargamos tareas (para mapear tareaId -> proyectoId) y hechas hoy =====
	type TareaLite = {
		id: number;
		proyectoId: number | null;
		modificado?: string | null;
	};

	async function fetchTareasHechas(): Promise<TareaLite[]> {
		// trae tareas con estado=Hecha y filtramos hoy en cliente
		const url = `/api/tareas?state=6`;
		const list = await api.get<TareaLite[]>(url);
		return list;
	}

	// Query extra: tareas hechas (para contar hechas hoy y mapear proyectos)
	const { data: tareasHechas = [] } = useQuery({
		queryKey: ['tareas', 'hechas'],
		queryFn: fetchTareasHechas,
		staleTime: 60_000,
	});

	// Mapa tareaId -> proyectoId
	const tareaProyecto = useMemo(() => {
		const m = new Map<number, number | null>();
		for (const t of tareasHechas) m.set(t.id, t.proyectoId ?? null);
		return m;
	}, [tareasHechas]);

	// Helpers de fecha hoy
	const hoy = new Date();
	hoy.setHours(0, 0, 0, 0);
	const mañana = new Date(hoy);
	mañana.setDate(mañana.getDate() + 1);

	// Quick recap extendido
	const recap = useMemo(() => {
		const isToday = (d: string | Date | null | undefined) => {
			if (!d) return false;
			const x = new Date(d).getTime();
			return x >= hoy.getTime() && x < mañana.getTime();
		};

		// 1) Foco/descanso hoy
		const hoySes = sesiones.filter((s) => isToday(s.inicio));
		const totalFoco = hoySes.reduce((acc, s) => acc + (s.focoMin ?? 0), 0);
		const totalDesc = hoySes.reduce((acc, s) => acc + (s.descansoMin ?? 0), 0);

		// 2) Tareas Hechas hoy
		const hechasHoy = tareasHechas.filter((t) => isToday(t.modificado ?? null)).length;

		// 3) Foco por proyecto
		const byProyecto = new Map<number | 'sin', number>();
		for (const s of hoySes) {
			const tid = s.tareaId ?? null;
			const pid = tid ? tareaProyecto.get(tid) ?? null : null;
			const key: number | 'sin' = pid ?? 'sin';
			byProyecto.set(key, (byProyecto.get(key) ?? 0) + (s.focoMin ?? 0));
		}
		const focoPorProyecto = [...byProyecto.entries()]
			.map(([pid, min]) => ({ proyectoId: pid === 'sin' ? null : (pid as number), minutos: min }))
			.sort((a, b) => b.minutos - a.minutos)
			.slice(0, 10);

		return { totalFoco, totalDesc, hechasHoy, focoPorProyecto };
	}, [sesiones, tareasHechas]);

	const exportUrl = useMemo(() => {
		const qs = new URLSearchParams();
		if (desde) qs.set('desde', new Date(desde).toISOString());
		if (hasta) qs.set('hasta', new Date(hasta).toISOString());
		if (tareaId.trim()) qs.set('tareaId', tareaId.trim());
		return `/api/export/sesiones.csv${qs.toString() ? `?${qs}` : ''}`;
	}, [desde, hasta, tareaId]);

	return (
		<div>
			<h1 className="text-xl font-semibold mb-3">Sesiones</h1>

			{/* Filtros */}
			<section className="mb-4 flex flex-wrap items-end gap-3">
				<label className="text-sm">
					Desde
					<br />
					<input
						type="date"
						value={desde}
						onChange={(e) => setDesde(e.target.value)}
						className="bg-slate-800 rounded px-2 py-1"
					/>
				</label>
				<label className="text-sm">
					Hasta
					<br />
					<input
						type="date"
						value={hasta}
						onChange={(e) => setHasta(e.target.value)}
						className="bg-slate-800 rounded px-2 py-1"
					/>
				</label>
				<label className="text-sm">
					TareaId
					<br />
					<input
						type="number"
						min={1}
						value={tareaId}
						onChange={(e) => setTareaId(e.target.value)}
						placeholder="(opcional)"
						className="bg-slate-800 rounded px-2 py-1 w-32"
					/>
				</label>
				<button
					onClick={() => void refetch()}
					disabled={isLoading}
					className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-60">
					{isLoading ? 'Cargando...' : 'Aplicar'}
				</button>
				<a href={exportUrl} className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600" download>
					⬇ Exportar CSV
				</a>
			</section>

			{/* Quick recap hoy */}
			<section className="mb-4 text-sm text-slate-300">
				<div className="mb-1">
					Hoy: <strong>{recap.totalFoco} min foco</strong> · <strong>{recap.totalDesc} min descanso</strong> ·{' '}
					<strong>{recap.hechasHoy} tareas hechas</strong>
				</div>
				{recap.focoPorProyecto.length > 0 && (
					<div className="text-slate-400">
						Foco por proyecto hoy:&nbsp;
						{recap.focoPorProyecto.map(({ proyectoId, minutos }) => (
							<span key={String(proyectoId ?? 'sin')} className="mr-2">
								{proyectoId ? `P#${proyectoId}` : 'Sin proyecto'} ({minutos}m)
							</span>
						))}
					</div>
				)}
			</section>

			{/* Tabla */}
			<section className="overflow-x-auto">
				{error && <p className="text-rose-400">{error instanceof Error ? error.message : 'Error al cargar sesiones'}</p>}
				{!isLoading && sesiones.length === 0 && <p>Sin sesiones.</p>}

				{sesiones.length > 0 && (
					<table className="w-full border-collapse">
						<thead>
							<tr>
								<th className="text-left border-b border-slate-700 p-2">ID</th>
								<th className="text-left border-b border-slate-700 p-2">Tarea</th>
								<th className="text-left border-b border-slate-700 p-2">Categoría</th>
								<th className="text-left border-b border-slate-700 p-2">Inicio</th>
								<th className="text-left border-b border-slate-700 p-2">Fin</th>
								<th className="text-right border-b border-slate-700 p-2">Foco</th>
								<th className="text-right border-b border-slate-700 p-2">Descanso</th>
								<th className="text-center border-b border-slate-700 p-2">Modo</th>
								<th className="text-left border-b border-slate-700 p-2">Notas</th>
							</tr>
						</thead>
						<tbody>
							{sesiones.map((s) => (
								<tr key={s.id}>
									<td className="border-b border-slate-800 p-2">{s.id}</td>
									<td className="border-b border-slate-800 p-2">{s.tareaId ?? '-'}</td>
									<td className="border-b border-slate-800 p-2">{s.categoria ?? '-'}</td>
									<td className="border-b border-slate-800 p-2">{toLocal(s.inicio)}</td>
									<td className="border-b border-slate-800 p-2">{toLocal(s.fin)}</td>
									<td className="border-b border-slate-800 p-2 text-right">{s.focoMin}</td>
									<td className="border-b border-slate-800 p-2 text-right">{s.descansoMin}</td>
									<td className="border-b border-slate-800 p-2 text-center">{s.modoRollover}</td>
									<td className="border-b border-slate-800 p-2">{s.notas ?? ''}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</section>
		</div>
	);
};

export default Sesiones;
