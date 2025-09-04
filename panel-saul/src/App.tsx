import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import Hoy from './routes/Hoy';
import Tareas from './routes/Tareas';
import Proyectos from './routes/Proyectos';
import Sesiones from './routes/Sesiones';
import Diario from './routes/Diario';
import Reportes from './routes/Reportes';
import Finanzas from '@/routes/Finanzas';
import Habitos from '@/routes/Habitos';
import './app.css'; // opcional, ver estilos abajo

export default function App() {
	return (
		<div className="app">
			<aside className="sidebar">
				<div className="brand">Panel Saúl</div>
				<nav>
					<NavLink to="/hoy" className={({ isActive }) => (isActive ? 'link active' : 'link')}>
						Hoy
					</NavLink>
					<NavLink to="/tareas" className={({ isActive }) => (isActive ? 'link active' : 'link')}>
						Tareas
					</NavLink>
					<NavLink to="/proyectos" className={({ isActive }) => (isActive ? 'link active' : 'link')}>
						Proyectos
					</NavLink>
					<NavLink to="/sesiones" className={({ isActive }) => (isActive ? 'link active' : 'link')}>
						Sesiones
					</NavLink>
					<NavLink to="/diario" className={({ isActive }) => (isActive ? 'link active' : 'link')}>
						Diario
					</NavLink>
				</nav>
			</aside>

			<main className="content">
				<Routes>
					<Route path="/" element={<Navigate to="/hoy" replace />} />
					<Route path="/hoy" element={<Hoy />} />
					<Route path="/tareas" element={<Tareas />} />
					<Route path="/proyectos" element={<Proyectos />} />
					<Route path="/sesiones" element={<Sesiones />} />
					<Route path="/diario" element={<Diario />} />
					<Route path="/reportes" element={<Reportes />} />
					<Route path="/finanzas" element={<Finanzas />} />
					<Route path="/habitos" element={<Habitos />} />
					{/* 404 simple */}
					<Route
						path="*"
						element={
							<div>
								<h1>404</h1>
								<p>Página no encontrada.</p>
							</div>
						}
					/>
				</Routes>
			</main>
		</div>
	);
}
