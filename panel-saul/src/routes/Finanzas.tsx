import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

enum TipoMovto {
	Cobro = 1,
	Pago = 2,
}
enum StatusMovto {
	Pendiente = 1,
	Cobrado = 2,
	Vencido = 3,
}

interface Mov {
	id: number;
	tipoMovto: TipoMovto;
	statusMovto: StatusMovto;
	fechaObjetivo: string; // yyyy-MM-dd
	contraparte: string | null;
	monto: number;
	proyectoId: number | null;
	tareaId: number | null;
	notasMd: string | null;
}

const finKeys = {
	radar: (dias: number, tipo?: number, estatus?: number) => ['finanzas', 'radar', dias, tipo ?? '', estatus ?? ''] as const,
	list: (query: Record<string, unknown>) => ['finanzas', 'list', query] as const,
};

async function fetchRadar(dias: number, tipo?: number, estatus?: number) {
	const qs = new URLSearchParams();
	qs.set('dias', String(dias));
	if (tipo) qs.set('tipo', String(tipo));
	if (estatus) qs.set('estatus', String(estatus));
	return api.get<{ items: Mov[]; resumen: Array<{ fechaObjetivo: string; tipo: number; total: number; conteo: number }> }>(
		`/api/finanzas/radar?${qs}`
	);
}

async function fetchList(params: {
	desde?: string;
	hasta?: string;
	tipo?: number;
	estatus?: number;
	contraparte?: string;
	proyectoId?: number;
	tareaId?: number;
}) {
	const qs = new URLSearchParams();
	(Object.entries(params) as Array<[string, string | number]>).forEach(([k, v]) => {
		qs.set(k, String(v));
	});
	const url = qs.toString() ? `/api/finanzas?${qs}` : '/api/finanzas';
	return api.get<Mov[]>(url);
}

// === acciones rápidas
async function marcarEstatus(id: number, estatus: StatusMovto) {
	await api.post(`/api/finanzas/${id}/marcar?estatus=${estatus}`, {});
}

async function crearMovimiento(input: {
	tipoMovto: TipoMovto;
	fechaObjetivo: string; // yyyy-MM-dd
	monto: number;
	contraparte?: string;
	proyectoId?: number | null;
	tareaId?: number | null;
	notasMd?: string;
}) {
	return api.post<Mov>('/api/finanzas', input);
}

const Finanzas: FC = () => {
	const qc = useQueryClient();

	// RADAR
	const [horizonte, setHorizonte] = useState(7);
	const [tipo, setTipo] = useState<number | ''>('');
	const [estatus, setEstatus] = useState<number | ''>('');

	const { data: radar } = useQuery({
		queryKey: finKeys.radar(horizonte, tipo || undefined, estatus || undefined),
		queryFn: () => fetchRadar(horizonte, (tipo as number) || undefined, (estatus as number) || undefined),
		staleTime: 60_000,
	});

	// LISTA
	const [desde, setDesde] = useState<string>('');
	const [hasta, setHasta] = useState<string>('');
	const [contraparte, setContraparte] = useState('');
	const listParams = useMemo(() => {
		const p: {
			desde?: string;
			hasta?: string;
			tipo?: number;
			estatus?: number;
			contraparte?: string;
			proyectoId?: number;
			tareaId?: number;
		} = {};
		if (desde) p.desde = desde;
		if (hasta) p.hasta = hasta;
		if (tipo !== '') p.tipo = Number(tipo);
		if (estatus !== '') p.estatus = Number(estatus);
		if (contraparte) p.contraparte = contraparte;
		return p;
	}, [desde, hasta, tipo, estatus, contraparte]);

	const { data: lista = [] } = useQuery({
		queryKey: finKeys.list(listParams),
		queryFn: () => fetchList(listParams),
		staleTime: 60_000,
	});

	// === mutations: marcar rápido (usa listParams ya definido)
	const mutMark = useMutation({
		mutationFn: (p: { id: number; estatus: StatusMovto }) => marcarEstatus(p.id, p.estatus),
		onSettled: () => {
			void qc.invalidateQueries({ queryKey: finKeys.radar(horizonte, tipo || undefined, estatus || undefined) });
			void qc.invalidateQueries({ queryKey: finKeys.list(listParams) });
		},
	});

	// === crear movimiento rápido
	const mutCrear = useMutation({
		mutationFn: crearMovimiento,
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: finKeys.radar(horizonte, tipo || undefined, estatus || undefined) });
			void qc.invalidateQueries({ queryKey: finKeys.list(listParams) });
		},
	});

	const exportUrl = useMemo(() => {
		const qs = new URLSearchParams();
		if (listParams.desde) qs.set('desde', listParams.desde);
		if (listParams.hasta) qs.set('hasta', listParams.hasta);
		if (listParams.tipo) qs.set('tipo', String(listParams.tipo));
		if (listParams.estatus) qs.set('estatus', String(listParams.estatus));
		if (listParams.contraparte) qs.set('contraparte', listParams.contraparte);
		return `/api/finanzas/export.csv${qs.toString() ? `?${qs}` : ''}`;
	}, [listParams]);

	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Finanzas</h1>

			{/* RADAR */}
			<section className="p-4 rounded-lg border border-slate-800 bg-slate-900/40">
				<div className="flex flex-wrap gap-2 items-end mb-3">
					<label className="text-sm">
						Horizonte
						<br />
						<select
							className="bg-slate-800 rounded px-2 py-1"
							value={horizonte}
							onChange={(e) => setHorizonte(Number(e.target.value))}>
							<option value={7}>7 días</option>
							<option value={14}>14 días</option>
							<option value={30}>30 días</option>
						</select>
					</label>
					<label className="text-sm">
						Tipo
						<br />
						<select
							className="bg-slate-800 rounded px-2 py-1"
							value={tipo}
							onChange={(e) => setTipo(e.target.value === '' ? '' : Number(e.target.value))}>
							<option value="">(todos)</option>
							<option value={1}>Cobro</option>
							<option value={2}>Pago</option>
						</select>
					</label>
					<label className="text-sm">
						Estatus
						<br />
						<select
							className="bg-slate-800 rounded px-2 py-1"
							value={estatus}
							onChange={(e) => setEstatus(e.target.value === '' ? '' : Number(e.target.value))}>
							<option value="">(todos)</option>
							<option value={1}>Pendiente</option>
							<option value={2}>Cobrado/Pagado</option>
							<option value={3}>Vencido</option>
						</select>
					</label>
				</div>

				<div className="text-sm">
					{!radar ? (
						<div>Cargando…</div>
					) : radar.items.length === 0 ? (
						<div className="text-slate-400">Sin movimientos en el horizonte.</div>
					) : (
						<>
							<div className="mb-2 font-medium">Resumen</div>
							<ul className="grid md:grid-cols-3 gap-2 mb-3">
								{radar.resumen.map((r, i) => (
									<li key={i} className="p-2 rounded border border-slate-800">
										<div className="text-xs text-slate-400">{r.fechaObjetivo}</div>
										<div>
											{r.tipo === 1 ? 'Cobros' : 'Pagos'}: <b>{r.conteo}</b>
										</div>
										<div>
											Total: <b>{r.total.toLocaleString()}</b>
										</div>
									</li>
								))}
							</ul>

							<div className="mb-2 font-medium">Próximos</div>
							<table className="w-full border-collapse text-sm">
								<thead>
									<tr>
										<th className="text-left border-b border-slate-700 p-2">Fecha</th>
										<th className="text-left border-b border-slate-700 p-2">Tipo</th>
										<th className="text-left border-b border-slate-700 p-2">Estatus</th>
										<th className="text-left border-b border-slate-700 p-2">Contraparte</th>
										<th className="text-right border-b border-slate-700 p-2">Monto</th>
										<th className="text-left border-b border-slate-700 p-2">Acciones</th>
									</tr>
								</thead>
								<tbody>
									{radar.items.map((m) => (
										<tr key={m.id}>
											<td className="border-b border-slate-800 p-2">{m.fechaObjetivo}</td>
											<td className="border-b border-slate-800 p-2">{m.tipoMovto === 1 ? 'Cobro' : 'Pago'}</td>
											<td className="border-b border-slate-800 p-2">
												{m.statusMovto === 1 ? 'Pendiente' : m.statusMovto === 2 ? 'Cobrado/Pagado' : 'Vencido'}
											</td>
											<td className="border-b border-slate-800 p-2">{m.contraparte ?? '-'}</td>
											<td className="border-b border-slate-800 p-2 text-right">{m.monto.toLocaleString()}</td>
											<td className="border-b border-slate-800 p-2 space-x-1">
												<button
													className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-600 text-xs"
													onClick={() => mutMark.mutate({ id: m.id, estatus: StatusMovto.Cobrado })}>
													Cobrado/Pagado
												</button>
												<button
													className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-xs"
													onClick={() => mutMark.mutate({ id: m.id, estatus: StatusMovto.Pendiente })}>
													Pendiente
												</button>
												<button
													className="px-2 py-0.5 rounded bg-rose-700 hover:bg-rose-600 text-xs"
													onClick={() => mutMark.mutate({ id: m.id, estatus: StatusMovto.Vencido })}>
													Vencido
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</>
					)}
				</div>
			</section>

			{/* FORM CREAR RÁPIDO */}
			<section className="p-4 rounded-lg border border-slate-800 bg-slate-900/40">
				<h2 className="text-lg font-medium mb-2">Crear movimiento</h2>
				<form
					className="grid md:grid-cols-5 gap-2 items-end"
					onSubmit={(e) => {
						e.preventDefault();
						const form = e.currentTarget as HTMLFormElement;
						const fd = new FormData(form);

						const tipoMovto = Number(fd.get('tipoMovto')) as TipoMovto;
						const fechaObjetivo = String(fd.get('fechaObjetivo') ?? ''); // yyyy-MM-dd
						const monto = Number(fd.get('monto'));
						const contraparteRaw = fd.get('contraparte');
						const proyectoIdRaw = fd.get('proyectoId');
						const tareaIdRaw = fd.get('tareaId');
						const notasMdRaw = fd.get('notasMd');

						// Construye el payload sin `undefined`
						const payload: {
							tipoMovto: TipoMovto;
							fechaObjetivo: string;
							monto: number;
							contraparte?: string;
							proyectoId?: number; // O quítalo si usas `null` en backend
							tareaId?: number; // idem
							notasMd?: string;
						} = { tipoMovto, fechaObjetivo, monto };

						const contraparte = (contraparteRaw ?? '').toString().trim();
						if (contraparte) payload.contraparte = contraparte;

						const proyectoIdStr = (proyectoIdRaw ?? '').toString().trim();
						if (proyectoIdStr) payload.proyectoId = Number(proyectoIdStr);

						const tareaIdStr = (tareaIdRaw ?? '').toString().trim();
						if (tareaIdStr) payload.tareaId = Number(tareaIdStr);

						const notasMd = (notasMdRaw ?? '').toString().trim();
						if (notasMd) payload.notasMd = notasMd;

						void mutCrear.mutateAsync(payload);
						form.reset();
					}}>
					<label className="text-sm">
						Tipo
						<br />
						<select name="tipoMovto" className="bg-slate-800 rounded px-2 py-1">
							<option value={1}>Cobro</option>
							<option value={2}>Pago</option>
						</select>
					</label>
					<label className="text-sm">
						Fecha
						<br />
						<input type="date" name="fechaObjetivo" required className="bg-slate-800 rounded px-2 py-1" />
					</label>
					<label className="text-sm">
						Monto
						<br />
						<input type="number" step="0.01" name="monto" required className="bg-slate-800 rounded px-2 py-1" />
					</label>
					<label className="text-sm">
						Contraparte
						<br />
						<input name="contraparte" className="bg-slate-800 rounded px-2 py-1" />
					</label>
					<div className="flex gap-2">
						<button
							type="submit"
							className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600"
							disabled={mutCrear.isPending}>
							{mutCrear.isPending ? 'Guardando…' : 'Crear'}
						</button>
						<a href={exportUrl} download className="px-3 py-1 rounded bg-sky-700 hover:bg-sky-600">
							⬇ Export CSV
						</a>
					</div>
					<div className="md:col-span-5 grid grid-cols-3 gap-2">
						<input name="proyectoId" placeholder="ProyectoId" className="bg-slate-800 rounded px-2 py-1" />
						<input name="tareaId" placeholder="TareaId" className="bg-slate-800 rounded px-2 py-1" />
						<input name="notasMd" placeholder="Notas…" className="bg-slate-800 rounded px-2 py-1" />
					</div>
				</form>
			</section>

			{/* LISTA + EXPORT */}
			<section>
				<div className="mb-2 flex flex-wrap gap-2 items-end">
					<label className="text-sm">
						Desde
						<br />
						<input
							className="bg-slate-800 rounded px-2 py-1"
							type="date"
							value={desde}
							onChange={(e) => setDesde(e.target.value)}
						/>
					</label>
					<label className="text-sm">
						Hasta
						<br />
						<input
							className="bg-slate-800 rounded px-2 py-1"
							type="date"
							value={hasta}
							onChange={(e) => setHasta(e.target.value)}
						/>
					</label>
					<label className="text-sm">
						Contraparte
						<br />
						<input
							className="bg-slate-800 rounded px-2 py-1"
							value={contraparte}
							onChange={(e) => setContraparte(e.target.value)}
						/>
					</label>
					<a className="ml-auto px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600" href={exportUrl} download>
						⬇ Exportar CSV
					</a>
				</div>

				<table className="w-full border-collapse text-sm">
					<thead>
						<tr>
							<th className="text-left border-b border-slate-700 p-2">Fecha</th>
							<th className="text-left border-b border-slate-700 p-2">Tipo</th>
							<th className="text-left border-b border-slate-700 p-2">Estatus</th>
							<th className="text-left border-b border-slate-700 p-2">Contraparte</th>
							<th className="text-right border-b border-slate-700 p-2">Monto</th>
							<th className="text-left border-b border-slate-700 p-2">Acciones</th>
						</tr>
					</thead>
					<tbody>
						{lista.map((m) => (
							<tr key={m.id}>
								<td className="border-b border-slate-800 p-2">{m.fechaObjetivo}</td>
								<td className="border-b border-slate-800 p-2">{m.tipoMovto === 1 ? 'Cobro' : 'Pago'}</td>
								<td className="border-b border-slate-800 p-2">
									{m.statusMovto === 1 ? 'Pendiente' : m.statusMovto === 2 ? 'Cobrado/Pagado' : 'Vencido'}
								</td>
								<td className="border-b border-slate-800 p-2">{m.contraparte ?? '-'}</td>
								<td className="border-b border-slate-800 p-2 text-right">{m.monto.toLocaleString()}</td>
								<td className="border-b border-slate-800 p-2 space-x-1">
									<button
										className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-600 text-xs"
										onClick={() => mutMark.mutate({ id: m.id, estatus: StatusMovto.Cobrado })}>
										Cobrado/Pagado
									</button>
									<button
										className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-xs"
										onClick={() => mutMark.mutate({ id: m.id, estatus: StatusMovto.Pendiente })}>
										Pendiente
									</button>
									<button
										className="px-2 py-0.5 rounded bg-rose-700 hover:bg-rose-600 text-xs"
										onClick={() => mutMark.mutate({ id: m.id, estatus: StatusMovto.Vencido })}>
										Vencido
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</section>
		</div>
	);
};

export default Finanzas;
