export interface Proyecto {
	id: number;
	nombre: string;
	objetivo?: string;
	area: number;
	estado?: string;
	fechaInicio?: string;
	fechaFinPrevista?: string;
	progresoPct?: number;
	notasMd?: string;
}

export const EstadoTarea = {
	Backlog: 1,
	Siguiente: 2,
	Hoy: 3,
	EnCurso: 4,
	EnRevision: 5,
	Hecha: 6,
} as const;

export type EstadoTarea = (typeof EstadoTarea)[keyof typeof EstadoTarea];

export interface Tarea {
	id: number;
	titulo: string;
	detalleMd?: string;
	estado: EstadoTarea;
	area: number;
	impacto?: number;
	urgenteDias?: number;
	frog: boolean;
	pareto: boolean;
	bloqueada: boolean;
	bloqueoMotivo?: string;
	dueDate?: string;
	score: number;
	ranking: number;
	pomosEstimados?: number;
	pomosRealizados: number;
	tiempoTotalMin: number;
	proyectoId?: number;
	creado: string;
	modificado: string;
}

export interface SesionTrabajo {
	id: number;
	tareaId?: number;
	categoria?: string;
	inicio: string;
	fin?: string;
	focoMin: number;
	descansoMin: number;
	modoRollover: number;
	notas?: string;
}

export interface EntradaDiario {
	id: number;
	fecha: string;
	contenidoMd: string;
}

// --- Finanzas Lite ---
export enum TipoMovimiento {
	Cobro = 1,
	Pago = 2,
}
export enum EstatusMovimiento {
	Pendiente = 1,
	CobradoPagado = 2,
	Vencido = 3,
}

export interface MovimientoFinanciero {
	id: number;
	tipo: TipoMovimiento; // 1=cobro, 2=pago
	contraparte: string;
	monto: number;
	moneda: string; // 'MXN','USD',...
	fechaObjetivo: string; // ISO
	estatus: EstatusMovimiento; // 1,2,3
	proyectoId?: number | null;
	notas?: string | null;
	creado?: string;
	modificado?: string;
}

// --- Hábitos ---
export interface Habito {
	id: number;
	nombre: string;
	periodicidad: 'daily' | 'weekly';
	meta?: number | null; // opcional
	categoria?: string | null;
	visibleFamiliar?: boolean;
	streak?: number;
	ultimoTick?: string | null; // ISO (ultima fecha marcada)
	notas?: string | null;
}
