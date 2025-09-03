import { useTareas } from '../hooks/useTareas';

export default function Hoy() {
	const { tareas, loading, recargar } = useTareas();

	return (
		<div>
			<h1>Hoy</h1>
			{loading && <p>Cargando...</p>}
			<ul>
				{tareas.map((t) => (
					<li key={t.id}>
						{t.titulo} (Score: {t.score})
					</li>
				))}
			</ul>
			<button onClick={recargar}>Recargar</button>
		</div>
	);
}
