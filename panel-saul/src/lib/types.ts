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
