import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { SesionTrabajo } from '../lib/types';

export function useSesiones() {
	const [sesiones, setSesiones] = useState<SesionTrabajo[]>([]);
	const [loading, setLoading] = useState(true);

	async function cargar() {
		setLoading(true);
		try {
			const data = await api.get<SesionTrabajo[]>('/api/sesiones');
			setSesiones(data);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		cargar();
	}, []);

	return { sesiones, loading, recargar: cargar };
}
