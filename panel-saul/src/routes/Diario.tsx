import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { EntradaDiario } from '@/lib/types';
import { toast } from 'sonner'; // si sigues con tu toast, cambia estas llamadas
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ===== SDK ligero =====
async function fetchPorFecha(fechaYYYYMMDD: string): Promise<EntradaDiario[]> {
	return api.get(`/api/diario/por-fecha/${fechaYYYYMMDD}`);
}
async function crearEntrada(e: { fecha: string; contenidoMd: string }): Promise<EntradaDiario> {
	// backend permite fecha opcional; mandamos DateOnly de hoy si no
	const payload = {
		fecha: e.fecha ? e.fecha : new Date().toISOString().slice(0, 10), // yyyy-mm-dd
		contenidoMd: e.contenidoMd,
	};
	return api.post('/api/diario', payload);
}
async function actualizarEntrada(id: number, dto: { fecha?: string; contenidoMd: string }): Promise<EntradaDiario> {
	return api.put(`/api/diario/${id}`, dto);
}

// ===== Page =====
const Diario: FC = () => {
	// fecha seleccionada
	const [fecha, setFecha] = useState<string>(new Date().toISOString().slice(0, 10)); // yyyy-mm-dd
	// filtro de texto
	const [q, setQ] = useState<string>('');
	// nueva entrada
	const [nuevo, setNuevo] = useState<string>('');

	const qc = useQueryClient();

	const {
		data: entradas = [],
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ['diario', 'por-fecha', fecha],
		queryFn: () => fetchPorFecha(fecha),
		staleTime: 30_000,
	});

	const mutCrear = useMutation({
		mutationFn: crearEntrada,
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: ['diario', 'por-fecha', fecha] });
			setNuevo('');
			toast.success('Entrada creada');
		},
		onError: () => toast.error('No se pudo crear la entrada'),
	});

	const mutActualizar = useMutation({
		mutationFn: (p: { id: number; contenidoMd: string }) => actualizarEntrada(p.id, { contenidoMd: p.contenidoMd }),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: ['diario', 'por-fecha', fecha] });
			toast.success('Entrada actualizada');
		},
		onError: () => toast.error('No se pudo actualizar'),
	});

	// Filtrado por texto simple en cliente
	const listFiltrada = useMemo(() => {
		if (!q.trim()) return entradas;
		const needle = q.toLowerCase();
		return entradas.filter((e) => e.contenidoMd?.toLowerCase().includes(needle));
	}, [entradas, q]);

	return (
		<div>
			<h1 className="text-xl font-semibold mb-3">Diario</h1>

			{/* Filtros */}
			<section className="mb-4 flex flex-wrap items-end gap-3">
				<label className="text-sm">
					Fecha
					<br />
					<input
						type="date"
						value={fecha}
						onChange={(e) => setFecha(e.target.value)}
						className="bg-slate-800 rounded px-2 py-1"
					/>
				</label>
				<label className="text-sm">
					Buscar
					<br />
					<input
						type="text"
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="texto en el contenido"
						className="bg-slate-800 rounded px-2 py-1 w-64"
					/>
				</label>
				<button
					onClick={() => void refetch()}
					disabled={isLoading}
					className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-60">
					{isLoading ? 'Cargando...' : 'Refrescar'}
				</button>
			</section>

			{/* Crear rápido */}
			<section className="mb-6">
				<h2 className="text-lg font-medium mb-2">Nueva entrada</h2>
				<textarea
					value={nuevo}
					onChange={(e) => setNuevo(e.target.value)}
					rows={4}
					placeholder="Escribe aquí..."
					className="w-full bg-slate-800 rounded p-2"
				/>
				<div className="mt-2">
					<button
						onClick={() => {
							const v = nuevo.trim();
							if (!v) return;
							void mutCrear.mutateAsync({ fecha, contenidoMd: v });
						}}
						disabled={mutCrear.isPending}
						className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60">
						{mutCrear.isPending ? 'Creando...' : 'Crear'}
					</button>
				</div>
			</section>

			{/* Listado / edición inline */}
			<section>
				{error && <p className="text-rose-400">{error instanceof Error ? error.message : 'Error al cargar'}</p>}
				{!isLoading && listFiltrada.length === 0 && <p>No hay entradas para esta fecha / búsqueda.</p>}

				<ul className="space-y-4">
					{listFiltrada.map((e) => (
						<li key={e.id} className="border border-slate-800 rounded p-3 bg-slate-900/40">
							<div className="text-xs text-slate-400 mb-2">
								#{e.id} · {fecha}
							</div>
							<EditorInline
								initialValue={e.contenidoMd ?? ''}
								onSave={(txt) => mutActualizar.mutate({ id: e.id, contenidoMd: txt })}
								saving={mutActualizar.isPending}
							/>
						</li>
					))}
				</ul>
			</section>
		</div>
	);
};

export default Diario;

// ====== Editor inline simple ======
function EditorInline(props: { initialValue: string; onSave: (text: string) => void; saving?: boolean }) {
	const [val, setVal] = useState(props.initialValue);
	const [edit, setEdit] = useState(false);

	return (
		<div>
			{!edit ? (
				<div className="text-sm prose prose-invert max-w-none">
					{val ? (
						<ReactMarkdown remarkPlugins={[remarkGfm]}>{val}</ReactMarkdown>
					) : (
						<span className="text-slate-500">[vacío]</span>
					)}
					<div className="mt-2">
						<button className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600" onClick={() => setEdit(true)}>
							Editar
						</button>
					</div>
				</div>
			) : (
				<div>
					<textarea
						value={val}
						onChange={(e) => setVal(e.target.value)}
						rows={6}
						className="w-full bg-slate-800 rounded p-2"
					/>
					<div className="mt-2 flex gap-2">
						<button
							className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
							onClick={() => {
								props.onSave(val);
								setEdit(false);
							}}
							disabled={props.saving}>
							{props.saving ? 'Guardando...' : 'Guardar'}
						</button>
						<button
							className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600"
							onClick={() => {
								setVal(props.initialValue);
								setEdit(false);
							}}>
							Cancelar
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
