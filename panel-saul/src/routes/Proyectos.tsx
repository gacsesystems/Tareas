import { useProyectos } from '../hooks/useProyectos';

export default function Proyectos() {
	const { proyectos, loading } = useProyectos();

	return (
		<div>
			<h1>Proyectos</h1>
			{loading && <p>Cargando...</p>}
			<ul>
				{proyectos.map((p) => (
					<li key={p.id}>{p.nombre}</li>
				))}
			</ul>
		</div>
	);
}
