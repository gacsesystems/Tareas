import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api';

export interface Habito {
	id: number;
	nombre: string;
	periodicidad: number; // 1 diario, 2 semanal, 3 mensual
	meta: number | null;
	categoria: string | null;
	visibleFamiliar: boolean;
	streak: number;
	notas: string | null;
	creado: string;
	modificado: string;
}

export interface HabitoLog {
	id: number;
	habitoId: number;
	fecha: string; // ISO yyyy-MM-dd normalizada
	valor: number;
	creado: string;
	modificado: string;
}

const filtrosSchema = z.object({
	categoria: z.string().optional(),
	visibleFamiliar: z.boolean().optional(),
});
type Filtros = z.infer<typeof filtrosSchema>;

const resumenSchema = z.object({
	habitoId: z.number(),
	nombre: z.string(),
	periodicidad: z.number(),
	desde: z.string(),
	hasta: z.string(),
	total: z.number(),
	streakActual: z.number(),
	maxStreak: z.number(),
	logs: z.array(z.object({ fecha: z.string(), valor: z.number() })),
});
export type ResumenHabito = z.infer<typeof resumenSchema>;

// ===== Keys
const habitosKeys = {
	all: ['habitos'] as const,
	list: (f: Filtros) => [...habitosKeys.all, 'list', f] as const,
	resumen: (id: number, d1?: string, d2?: string) => [...habitosKeys.all, 'resumen', id, d1 ?? '', d2 ?? ''] as const,
};

// ===== API
async function fetchHabitos(f: Filtros): Promise<Habito[]> {
	const qs = new URLSearchParams();
	if (f.categoria) qs.set('categoria', f.categoria);
	if (typeof f.visibleFamiliar === 'boolean') qs.set('visibleFamiliar', String(f.visibleFamiliar));
	const url = qs.toString() ? `/api/habitos?${qs}` : '/api/habitos';
	return api.get(url);
}

async function tickHabito(id: number, fecha?: string, valor?: number) {
	const qs = new URLSearchParams();
	if (fecha) qs.set('fecha', new Date(fecha).toISOString());
	if (typeof valor === 'number') qs.set('valor', String(valor));
	await api.post(`/api/habitos/${id}/tick?${qs}`, {});
}

async function fetchResumen(id: number, desde?: string, hasta?: string): Promise<ResumenHabito> {
	const qs = new URLSearchParams();
	if (desde) qs.set('desde', new Date(desde).toISOString());
	if (hasta) qs.set('hasta', new Date(hasta).toISOString());

	const raw = (await api.get(`/api/habitos/${id}/resumen${qs.toString() ? `?${qs}` : ''}`)) as unknown;
	return resumenSchema.parse(raw); // <— parsea unknown → tipado seguro
}

// ===== Hooks
export function useHabitos(f: Filtros = {}) {
	return useQuery({
		queryKey: habitosKeys.list(f),
		queryFn: () => fetchHabitos(f),
		staleTime: 60_000,
	});
}

export function useTickHabito() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (p: { id: number; fecha?: string; valor?: number }) => tickHabito(p.id, p.fecha, p.valor),
		onSettled: () => {
			void qc.invalidateQueries({ queryKey: habitosKeys.all });
		},
	});
}

export function useResumenHabito(id: number, rango?: { desde?: string; hasta?: string }) {
	return useQuery({
		queryKey: habitosKeys.resumen(id, rango?.desde, rango?.hasta),
		queryFn: () => fetchResumen(id, rango?.desde, rango?.hasta),
		enabled: !!id,
		staleTime: 30_000,
	});
}
