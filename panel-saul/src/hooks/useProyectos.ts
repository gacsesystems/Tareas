import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Proyecto } from '../lib/types';

export function useProyectos() {
	const [proyectos, setProyectos] = useState<Proyecto[]>([]);
	const [loading, setLoading] = useState(true);

	async function cargar() {
		setLoading(true);
		try {
			const data = await api.get<Proyecto[]>('/api/proyectos');
			setProyectos(data);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		cargar();
	}, []);

	return { proyectos, loading, recargar: cargar };
}
