import { useSesiones } from '../hooks/useSesiones';

export default function Sesiones() {
	const { sesiones, loading } = useSesiones();

	return (
		<div>
			<h1>Sesiones</h1>
			{loading && <p>Cargando...</p>}
			<ul>
				{sesiones.map((s) => (
					<li key={s.id}>
						{s.categoria ?? 'Sin categoría'} - {s.focoMin} min
					</li>
				))}
			</ul>
		</div>
	);
}
