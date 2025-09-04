import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api';
import type { SesionTrabajo } from '@/lib/types';

/* ===============================
   Tipos y constantes
   =============================== */
export enum RolloverMode {
	Acumulativo = 1,
	Balanceado = 2,
	Estricto = 3,
}

const DEFAULTS = {
	baseFocusMin: 25,
	baseBreakMin: 5,
	minFocus: 15,
	maxFocus: 90,
	minBreak: 1,
	maxBreak: 30,
} as const;

type Phase = 'foco' | 'descanso';

const IniciarSesionSchema = z.object({
	tareaId: z.number().optional(),
	categoria: z.string().optional(),
	modoRollover: z.nativeEnum(RolloverMode).default(RolloverMode.Acumulativo),
});
type IniciarSesionInput = z.infer<typeof IniciarSesionSchema>;

/* ===============================
   SDK de sesiones (ligero)
   =============================== */
async function iniciarSesion(input: IniciarSesionInput): Promise<SesionTrabajo> {
	const payload: any = {
		tareaId: input.tareaId ?? null,
		categoria: input.categoria ?? 'Foco',
		modoRollover: input.modoRollover ?? RolloverMode.Acumulativo,
	};
	return api.post<SesionTrabajo>('/api/sesiones/iniciar', payload);
}

async function finalizarSesion(id: number, focoMin: number, descansoMin: number, notas?: string): Promise<void> {
	const qs = new URLSearchParams();
	qs.set('focoMin', String(Math.max(0, Math.round(focoMin))));
	qs.set('descansoMin', String(Math.max(0, Math.round(descansoMin))));
	if (notas) qs.set('notas', notas);
	await api.post(`/api/sesiones/finalizar/${id}?${qs.toString()}`, {});
}

/* ===============================
   Helpers matemáticos
   =============================== */
function clamp(n: number, min: number, max: number) {
	return Math.max(min, Math.min(max, n));
}

/**
 * Regla de “Rollover” para determinar los minutos de la próxima fase.
 *  - Estricto: siempre vuelve a base.
 *  - Acumulativo: suma faltantes de la fase anterior a la siguiente MISMA fase.
 *  - Balanceado: el exceso/defecto de descanso compensa el siguiente foco y viceversa,
 *    para tender a la proporción 5:25. (Heurística simétrica estable)
 */
function computeNextDurations(
	mode: RolloverMode,
	baseFocus: number,
	baseBreak: number,
	lastFocus: number,
	lastBreak: number
): { nextFocus: number; nextBreak: number } {
	switch (mode) {
		case RolloverMode.Estricto:
			return { nextFocus: baseFocus, nextBreak: baseBreak };

		case RolloverMode.Acumulativo: {
			const faltaFoco = Math.max(0, baseFocus - lastFocus);
			const faltaDesc = Math.max(0, baseBreak - lastBreak);
			return {
				nextFocus: baseFocus + faltaFoco,
				nextBreak: baseBreak + faltaDesc,
			};
		}

		case RolloverMode.Balanceado: {
			// Heurística simétrica:
			// - Si descansaste menos (lastBreak < baseBreak), sube próximo foco.
			// - Si descansaste más, baja próximo foco.
			// - Si enfocaste menos, sube próximo descanso. Si enfocaste más, baja próximo descanso.
			const deltaBreak = lastBreak - baseBreak; // +exceso, -defecto
			const deltaFocus = lastFocus - baseFocus; // +exceso, -defecto

			const nextFocus = clamp(baseFocus - deltaBreak, DEFAULTS.minFocus, DEFAULTS.maxFocus);
			const nextBreak = clamp(baseBreak - deltaFocus, DEFAULTS.minBreak, DEFAULTS.maxBreak);
			return { nextFocus, nextBreak };
		}

		default:
			return { nextFocus: baseFocus, nextBreak: baseBreak };
	}
}

/* ===============================
   Hook principal
   =============================== */
export interface UsePomodoroOptions {
	baseFocusMin?: number; // default 25
	baseBreakMin?: number; // default 5
	mode?: RolloverMode; // default Acumulativo
	tareaId?: number | null; // opcional, para ligar la sesión a una tarea
	categoria?: string; // opcional, ej. "Foco"
	notas?: string; // opcional, se enviará al finalizar
	invalidateKeys?: ReadonlyArray<unknown>[]; // queries a invalidar al finalizar
}

export interface UsePomodoro {
	// estado
	phase: Phase;
	isActive: boolean;
	secondsLeft: number;
	sessionId: number | null;
	currentFocusMin: number; // objetivos actuales (con rollover aplicado)
	currentBreakMin: number;
	accFocusSec: number; // acumulados reales de esta sesión
	accBreakSec: number;

	mode: RolloverMode;

	// control
	start: () => Promise<void>;
	pause: () => void;
	resume: () => void;
	stop: () => Promise<void>;
	toggle: () => void;

	// setters
	setMode: (m: RolloverMode) => void;
	setTareaId: (id: number | null) => void;
	setNotas: (n: string) => void;

	// util
	format: (sec: number) => string;
}

export function usePomodoro(opts?: UsePomodoroOptions): UsePomodoro {
	const qc = useQueryClient();

	const baseFocusMin = opts?.baseFocusMin ?? DEFAULTS.baseFocusMin;
	const baseBreakMin = opts?.baseBreakMin ?? DEFAULTS.baseBreakMin;

	const [mode, setMode] = useState<RolloverMode>(opts?.mode ?? RolloverMode.Acumulativo);
	const [phase, setPhase] = useState<Phase>('foco');
	const [isActive, setIsActive] = useState(false);

	const [sessionId, setSessionId] = useState<number | null>(null);
	const [tareaId, setTareaId] = useState<number | null>(opts?.tareaId ?? null);
	const [notas, setNotas] = useState<string>(opts?.notas ?? '');

	// Objetivos actuales (minutos) y acumulados reales (segundos)
	const [currentFocusMin, setCurrentFocusMin] = useState<number>(baseFocusMin);
	const [currentBreakMin, setCurrentBreakMin] = useState<number>(baseBreakMin);
	const [accFocusSec, setAccFocusSec] = useState<number>(0);
	const [accBreakSec, setAccBreakSec] = useState<number>(0);

	// Para el rollover: guardamos cuánto se logró en la fase inmediatamente anterior
	const lastFocusDoneMinRef = useRef<number>(baseFocusMin);
	const lastBreakDoneMinRef = useRef<number>(baseBreakMin);

	// Timer
	const [secondsLeft, setSecondsLeft] = useState<number>(baseFocusMin * 60);
	const intervalRef = useRef<number | null>(null);

	// Mutations de backend
	const mutStart = useMutation({
		mutationFn: (input: IniciarSesionInput) => iniciarSesion(input),
		onSuccess: (s) => setSessionId(s.id),
	});

	const mutStop = useMutation({
		mutationFn: (p: { id: number; focoMin: number; descansoMin: number; notas?: string }) =>
			finalizarSesion(p.id, p.focoMin, p.descansoMin, p.notas),
		onSettled: () => {
			// invalidar queries que te interesen (Hoy, listas, etc.)
			(opts?.invalidateKeys ?? []).forEach((key) => {
				void qc.invalidateQueries({ queryKey: key });
			});
		},
	});

	// Ticking del temporizador
	useEffect(() => {
		if (!isActive) return;

		const id = window.setInterval(() => {
			setSecondsLeft((s) => {
				if (s > 0) return s - 1;

				// Se acabó la fase; calcular rollover y cambiar fase
				if (phase === 'foco') {
					const focusDoneMin = Math.round((currentFocusMin * 60 - s) / 60); // s es 0 aquí; usar acumulado real
					lastFocusDoneMinRef.current = Math.round(accFocusSec / 60);
					// Próximos objetivos
					const { nextFocus, nextBreak } = computeNextDurations(
						mode,
						baseFocusMin,
						baseBreakMin,
						lastFocusDoneMinRef.current,
						lastBreakDoneMinRef.current
					);
					setCurrentFocusMin(nextFocus);
					setCurrentBreakMin(nextBreak);
					setPhase('descanso');
					return nextBreak * 60;
				} else {
					lastBreakDoneMinRef.current = Math.round(accBreakSec / 60);
					const { nextFocus, nextBreak } = computeNextDurations(
						mode,
						baseFocusMin,
						baseBreakMin,
						lastFocusDoneMinRef.current,
						lastBreakDoneMinRef.current
					);
					setCurrentFocusMin(nextFocus);
					setCurrentBreakMin(nextBreak);
					setPhase('foco');
					return nextFocus * 60;
				}
			});

			// acumular por fase
			if (phase === 'foco') setAccFocusSec((x) => x + 1);
			else setAccBreakSec((x) => x + 1);
		}, 1000);

		intervalRef.current = id;
		return () => {
			if (intervalRef.current) window.clearInterval(intervalRef.current);
			intervalRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isActive, phase, mode, baseFocusMin, baseBreakMin, currentFocusMin, currentBreakMin]);

	// Al cambiar el modo, reestablecer los objetivos a base sin romper lo actual
	useEffect(() => {
		if (!isActive) {
			setCurrentFocusMin(baseFocusMin);
			setCurrentBreakMin(baseBreakMin);
			setSecondsLeft((phase === 'foco' ? baseFocusMin : baseBreakMin) * 60);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode, baseFocusMin, baseBreakMin]);

	/* ===============================
     API pública
     =============================== */
	async function start() {
		if (isActive || sessionId) return;

		const payload: IniciarSesionInput = {
			tareaId: tareaId ?? undefined,
			categoria: opts?.categoria ?? 'Foco',
			modoRollover: mode,
		};

		const parsed = IniciarSesionSchema.safeParse(payload);
		if (!parsed.success) throw new Error('Parámetros inválidos al iniciar sesión');

		await mutStart.mutateAsync(parsed.data);

		// reset de contadores para la nueva sesión
		setPhase('foco');
		setCurrentFocusMin(baseFocusMin);
		setCurrentBreakMin(baseBreakMin);
		setAccFocusSec(0);
		setAccBreakSec(0);
		setSecondsLeft(baseFocusMin * 60);
		setIsActive(true);
	}

	function pause() {
		setIsActive(false);
	}

	function resume() {
		if (!sessionId) return; // no reanudar si no hay sesión
		setIsActive(true);
	}

	async function stop() {
		setIsActive(false);
		if (sessionId) {
			const focoMin = Math.round(accFocusSec / 60);
			const descansoMin = Math.round(accBreakSec / 60);

			// arma el payload SIN 'notas' cuando no hay
			const payload =
				notas && notas.trim().length > 0
					? { id: sessionId, focoMin, descansoMin, notas }
					: { id: sessionId, focoMin, descansoMin };

			await mutStop.mutateAsync(payload);
		}
		// limpiar
		setSessionId(null);
		setAccFocusSec(0);
		setAccBreakSec(0);
		setPhase('foco');
		setCurrentFocusMin(baseFocusMin);
		setCurrentBreakMin(baseBreakMin);
		setSecondsLeft(baseFocusMin * 60);
	}

	function toggle() {
		if (!sessionId) {
			void start();
			return;
		}
		setIsActive((v) => !v);
	}

	function format(sec: number) {
		const m = Math.floor(sec / 60);
		const s = sec % 60;
		return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}

	return useMemo<UsePomodoro>(
		() => ({
			phase,
			isActive,
			secondsLeft,
			sessionId,
			currentFocusMin,
			currentBreakMin,
			accFocusSec,
			accBreakSec,
			mode,
			start,
			pause,
			resume,
			stop,
			toggle,
			setMode,
			setTareaId,
			setNotas,
			format,
		}),
		[
			phase,
			isActive,
			secondsLeft,
			sessionId,
			currentFocusMin,
			currentBreakMin,
			accFocusSec,
			accBreakSec,
			mode,
			start,
			pause,
			resume,
			stop,
			toggle,
		]
	);
}
