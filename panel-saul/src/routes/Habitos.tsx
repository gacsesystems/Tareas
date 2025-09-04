import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useHabitos, useResumenHabito, useTickHabito } from '@/hooks/useHabitos';

const HoyISO = () => new Date().toISOString().slice(0, 10);

const Habitos: FC = () => {
	const [categoria, setCategoria] = useState('');
	const [visibleFamiliar, setVisibleFamiliar] = useState<string>('');
	const [detalleId, setDetalleId] = useState<number | null>(null);
	const [desde, setDesde] = useState<string>(HoyISO());
	const [hasta, setHasta] = useState<string>(HoyISO());

	const filtros = useMemo(
		() => ({
			categoria: categoria || undefined,
			visibleFamiliar: visibleFamiliar === '' ? undefined : visibleFamiliar === 'true',
		}),
		[categoria, visibleFamiliar]
	);

	const { data: habitos = [], isLoading } = useHabitos(filtros);
	const { mutateAsync: tick, isPending: ticking } = useTickHabito();
	const { data: resumen } = useResumenHabito(detalleId ?? 0, { desde, hasta });

	return (
		<div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
			<div>
				<h1 className="text-xl font-semibold mb-3">Hábitos</h1>

				{/* Filtros */}
				<div className="mb-3 flex flex-wrap items-end gap-3">
					<label className="text-sm">
						Categoría
						<br />
						<input
							className="bg-slate-800 rounded px-2 py-1"
							value={categoria}
							onChange={(e) => setCategoria(e.target.value)}
						/>
					</label>
					<label className="text-sm">
						Visible fam.
						<br />
						<select
							className="bg-slate-800 rounded px-2 py-1"
							value={visibleFamiliar}
							onChange={(e) => setVisibleFamiliar(e.target.value)}>
							<option value="">(todos)</option>
							<option value="true">Sí</option>
							<option value="false">No</option>
						</select>
					</label>
				</div>

				{/* Tabla */}
				{isLoading ? (
					<p>Cargando…</p>
				) : habitos.length === 0 ? (
					<p className="text-slate-400">Sin hábitos.</p>
				) : (
					<table className="w-full border-collapse">
						<thead>
							<tr>
								<th className="text-left border-b border-slate-700 p-2">Nombre</th>
								<th className="text-center border-b border-slate-700 p-2">Per.</th>
								<th className="text-right border-b border-slate-700 p-2">Streak</th>
								<th className="text-left border-b border-slate-700 p-2">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{habitos.map((h) => (
								<tr key={h.id}>
									<td className="border-b border-slate-800 p-2">{h.nombre}</td>
									<td className="border-b border-slate-800 p-2 text-center">{h.periodicidad}</td>
									<td className="border-b border-slate-800 p-2 text-right">{h.streak}</td>
									<td className="border-b border-slate-800 p-2 space-x-2">
										<button
											className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
											disabled={ticking}
											onClick={() => void tick({ id: h.id })}>
											✓ Tick
										</button>
										<button className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600" onClick={() => setDetalleId(h.id)}>
											Ver streak
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			{/* Panel lateral: Resumen/Streak */}
			<aside className="border border-slate-800 rounded-lg p-4 bg-slate-900/40">
				<h2 className="text-lg font-medium mb-3">Resumen</h2>

				<div className="flex items-end gap-2 mb-3">
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
				</div>

				{!detalleId ? (
					<p className="text-slate-400 text-sm">Selecciona “Ver streak” en un hábito.</p>
				) : !resumen ? (
					<p>Cargando…</p>
				) : (
					<div className="text-sm space-y-2">
						<div className="font-medium">{resumen.nombre}</div>
						<div>
							Streak actual: <b>{resumen.streakActual}</b>
						</div>
						<div>
							Racha máxima: <b>{resumen.maxStreak}</b>
						</div>
						<div>
							Total en rango: <b>{resumen.total}</b>
						</div>
						<div className="mt-2">
							<div className="text-slate-400 mb-1">Logs:</div>
							<ul className="max-h-40 overflow-auto space-y-1">
								{resumen.logs.map((l, i) => (
									<li key={i} className="flex justify-between">
										<span>{l.fecha}</span>
										<span className="text-slate-300">{l.valor}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				)}
			</aside>
		</div>
	);
};

export default Habitos;
