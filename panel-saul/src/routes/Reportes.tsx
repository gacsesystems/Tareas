import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

type TareaLite = { id: number; proyectoId: number | null; modificado?: string | null; titulo?: string };
type SesionLite = { id: number; tareaId: number | null; inicio: string; focoMin: number | null; categoria?: string };

// function iso(d: Date) {
// 	return d.toISOString();
// }
function ymd(d: Date) {
	return d.toISOString().slice(0, 10);
}

function startOfWeek(d = new Date()) {
	const x = new Date(d);
	const day = x.getDay(); // 0=Dom..6=Sab
	const diff = (day + 6) % 7; // Lunes
	x.setDate(x.getDate() - diff);
	x.setHours(0, 0, 0, 0);
	return x;
}
function endOfWeek(d = new Date()) {
	const s = startOfWeek(d);
	const e = new Date(s);
	e.setDate(e.getDate() + 7);
	e.setMilliseconds(-1);
	return e;
}

// APIs
async function fetchTareasHechas(): Promise<TareaLite[]> {
	return api.get('/api/tareas?state=6');
}
async function fetchSesiones(desde?: string, hasta?: string): Promise<SesionLite[]> {
	const qs = new URLSearchParams();
	if (desde) qs.set('desde', new Date(desde).toISOString());
	if (hasta) qs.set('hasta', new Date(hasta).toISOString());
	const url = qs.toString() ? `/api/sesiones?${qs}` : '/api/sesiones';
	return api.get(url);
}

const Reportes: FC = () => {
	const s = startOfWeek(new Date());
	const e = endOfWeek(new Date());
	const [desde, setDesde] = useState<string>(ymd(s));
	const [hasta, setHasta] = useState<string>(ymd(e));

	const { data: tareasHechas = [] } = useQuery({
		queryKey: ['reps', 'tareas-hechas'],
		queryFn: fetchTareasHechas,
		staleTime: 60_000,
	});

	const {
		data: sesiones = [],
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ['reps', 'sesiones', desde, hasta],
		queryFn: () => fetchSesiones(desde, hasta),
		staleTime: 60_000,
	});

	const rangoIni = useMemo(() => new Date(desde), [desde]);
	const rangoFin = useMemo(() => {
		const d = new Date(hasta);
		d.setHours(23, 59, 59, 999);
		return d;
	}, [hasta]);

	const report = useMemo(() => {
		const inRange = (d: string | null | undefined) => {
			if (!d) return false;
			const x = new Date(d).getTime();
			return x >= rangoIni.getTime() && x <= rangoFin.getTime();
		};

		// tareas hechas en rango
		const hechas = tareasHechas.filter((t) => inRange(t.modificado ?? null));
		const hechasPorDia = new Map<string, number>();
		for (const t of hechas) {
			const k = t.modificado ? t.modificado.slice(0, 10) : 'sin';
			hechasPorDia.set(k, (hechasPorDia.get(k) ?? 0) + 1);
		}

		// mapa tarea -> proyecto
		const tareaProyecto = new Map<number, number | null>();
		tareasHechas.forEach((t) => tareaProyecto.set(t.id, t.proyectoId ?? null));

		// sesiones en rango (ya vienen filtradas del backend)
		const byProyecto = new Map<number | 'sin', number>();
		let totalFoco = 0;
		for (const s of sesiones) {
			const foco = s.focoMin ?? 0;
			totalFoco += foco;
			const pid = s.tareaId ? tareaProyecto.get(s.tareaId) ?? null : null;
			const key: number | 'sin' = pid ?? 'sin';
			byProyecto.set(key, (byProyecto.get(key) ?? 0) + foco);
		}
		const focoPorProyecto = [...byProyecto.entries()]
			.map(([pid, min]) => ({ proyectoId: pid === 'sin' ? null : (pid as number), minutos: min }))
			.sort((a, b) => b.minutos - a.minutos);

		return {
			totalHechas: hechas.length,
			hechasPorDia: [...hechasPorDia.entries()].sort(([a], [b]) => a.localeCompare(b)),
			totalFoco,
			focoPorProyecto,
		};
	}, [tareasHechas, sesiones, rangoIni, rangoFin]);

	return (
		<div>
			<h1 className="text-xl font-semibold mb-3">Reportes (semanal)</h1>

			<section className="mb-4 flex gap-3 items-end">
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
				<button
					onClick={() => void refetch()}
					disabled={isLoading}
					className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-60">
					{isLoading ? 'Cargando...' : 'Aplicar'}
				</button>
			</section>

			{error && <p className="text-rose-400">No se pudo cargar.</p>}

			<section className="mb-6 text-sm">
				<div className="mb-1">
					Tareas hechas: <strong>{report.totalHechas}</strong> · Foco: <strong>{report.totalFoco} min</strong>
				</div>
			</section>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<section>
					<h2 className="font-medium mb-2">Hechas por día</h2>
					<table className="w-full border-collapse">
						<thead>
							<tr>
								<th className="text-left border-b border-slate-700 p-2">Fecha</th>
								<th className="text-right border-b border-slate-700 p-2"># Hechas</th>
							</tr>
						</thead>
						<tbody>
							{report.hechasPorDia.map(([dia, n]) => (
								<tr key={dia}>
									<td className="border-b border-slate-800 p-2">{dia}</td>
									<td className="border-b border-slate-800 p-2 text-right">{n}</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>

				<section>
					<h2 className="font-medium mb-2">Foco por proyecto</h2>
					<table className="w-full border-collapse">
						<thead>
							<tr>
								<th className="text-left border-b border-slate-700 p-2">Proyecto</th>
								<th className="text-right border-b border-slate-700 p-2">Minutos</th>
							</tr>
						</thead>
						<tbody>
							{report.focoPorProyecto.map((r) => (
								<tr key={String(r.proyectoId ?? 'sin')}>
									<td className="border-b border-slate-800 p-2">{r.proyectoId ?? 'Sin proyecto'}</td>
									<td className="border-b border-slate-800 p-2 text-right">{r.minutos}</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>
			</div>
		</div>
	);
};

export default Reportes;
