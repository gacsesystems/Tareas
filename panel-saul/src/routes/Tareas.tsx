import { useTareas } from '../hooks/useTareas';

export default function Tareas() {
	const { tareas, loading } = useTareas();

	return (
		<div>
			<h1>Tareas</h1>
			{loading && <p>Cargando...</p>}
			<ul>
				{tareas.map((t) => (
					<li key={t.id}>
						{t.titulo} - Estado {t.estado}
					</li>
				))}
			</ul>
		</div>
	);
}
