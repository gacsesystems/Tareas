import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Tarea } from '../lib/types';

export function useTareas() {
	const [tareas, setTareas] = useState<Tarea[]>([]);
	const [loading, setLoading] = useState(true);

	async function cargar() {
		setLoading(true);
		try {
			const data = await api.get<Tarea[]>('/api/tareas/hoy');
			setTareas(data);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		cargar();
	}, []);

	return { tareas, loading, recargar: cargar };
}
