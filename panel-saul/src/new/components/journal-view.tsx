'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PenTool, Plus, Search, ArrowRight, Calendar } from 'lucide-react';

export function JournalView() {
	const [entries, setEntries] = useState([
		{
			id: 1,
			date: '2025-09-03',
			content:
				'Hoy fue un día productivo. Completé la propuesta para el cliente ABC y tuve una excelente reunión con el equipo. Aprendí que es importante dedicar más tiempo a la planificación inicial de los proyectos.',
			tags: ['productividad', 'trabajo', 'aprendizaje'],
			improvements: ['Mejorar planificación inicial de proyectos'],
		},
		{
			id: 2,
			date: '2025-09-02',
			content:
				'Día desafiante con algunos bloqueos técnicos. Sin embargo, logré resolver el problema del sistema CRM. La clave fue tomarme un descanso y volver con mente fresca.',
			tags: ['desafíos', 'técnico', 'perseverancia'],
			improvements: ['Implementar descansos regulares durante problemas complejos'],
		},
		{
			id: 3,
			date: '2025-09-01',
			content:
				'Inicio de mes con buena energía. Establecí las metas para septiembre y organicé mi espacio de trabajo. El ejercicio matutino realmente marca la diferencia en mi nivel de energía.',
			tags: ['metas', 'organización', 'ejercicio'],
			improvements: [],
		},
	]);

	const [newEntry, setNewEntry] = useState('');
	const [newTags, setNewTags] = useState('');
	const [showNewEntry, setShowNewEntry] = useState(false);

	const addEntry = () => {
		if (newEntry.trim()) {
			const entry = {
				id: Date.now(),
				date: new Date().toISOString().split('T')[0],
				content: newEntry,
				tags: newTags
					.split(',')
					.map((tag) => tag.trim())
					.filter((tag) => tag),
				improvements: [],
			};
			setEntries([entry, ...entries]);
			setNewEntry('');
			setNewTags('');
			setShowNewEntry(false);
		}
	};

	const createTaskFromImprovement = (improvement: string) => {
		// Aquí se podría integrar con el sistema de tareas
		console.log('Crear tarea:', improvement);
	};

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-balance">Diario Reflexivo</h1>
					<p className="text-muted-foreground">Reflexiona, aprende y mejora cada día</p>
				</div>
				<Button onClick={() => setShowNewEntry(true)}>
					<Plus className="h-4 w-4 mr-2" />
					Nueva Entrada
				</Button>
			</div>

			{/* Estadísticas */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<PenTool className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Entradas totales</span>
						</div>
						<p className="text-2xl font-bold">{entries.length}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Este mes</span>
						</div>
						<p className="text-2xl font-bold">{entries.filter((e) => e.date.startsWith('2025-09')).length}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<ArrowRight className="h-4 w-4 text-chart-1" />
							<span className="text-sm text-muted-foreground">Mejoras identificadas</span>
						</div>
						<p className="text-2xl font-bold text-chart-1">{entries.reduce((acc, e) => acc + e.improvements.length, 0)}</p>
					</CardContent>
				</Card>
			</div>

			{/* Formulario nueva entrada */}
			{showNewEntry && (
				<Card>
					<CardHeader>
						<CardTitle>Nueva Entrada del Diario</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="text-sm font-medium mb-2 block">¿Qué pasó hoy? ¿Qué aprendiste?</label>
							<Textarea
								placeholder="Reflexiona sobre tu día: logros, desafíos, aprendizajes, emociones..."
								value={newEntry}
								onChange={(e) => setNewEntry(e.target.value)}
								className="min-h-[120px]"
							/>
						</div>
						<div>
							<label className="text-sm font-medium mb-2 block">Etiquetas (separadas por comas)</label>
							<Input
								placeholder="productividad, trabajo, aprendizaje..."
								value={newTags}
								onChange={(e) => setNewTags(e.target.value)}
							/>
						</div>
						<div className="flex gap-2">
							<Button onClick={addEntry}>Guardar Entrada</Button>
							<Button variant="outline" onClick={() => setShowNewEntry(false)}>
								Cancelar
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Búsqueda */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center gap-2">
						<Search className="h-4 w-4 text-muted-foreground" />
						<Input placeholder="Buscar en entradas..." className="border-0 focus-visible:ring-0" />
					</div>
				</CardContent>
			</Card>

			{/* Entradas del diario */}
			<div className="space-y-4">
				{entries.map((entry) => (
					<Card key={entry.id}>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg">
									{new Date(entry.date).toLocaleDateString('es-ES', {
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									})}
								</CardTitle>
								<div className="flex gap-1">
									{entry.tags.map((tag, index) => (
										<Badge key={index} variant="secondary" className="text-xs">
											{tag}
										</Badge>
									))}
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-muted-foreground leading-relaxed">{entry.content}</p>

							{entry.improvements.length > 0 && (
								<div className="p-3 bg-chart-1/10 rounded-lg">
									<h4 className="font-medium text-chart-1 mb-2 flex items-center gap-1">
										<ArrowRight className="h-3 w-3" />
										Mejoras Identificadas
									</h4>
									<div className="space-y-2">
										{entry.improvements.map((improvement, index) => (
											<div key={index} className="flex items-center justify-between">
												<span className="text-sm">{improvement}</span>
												<Button size="sm" variant="outline" onClick={() => createTaskFromImprovement(improvement)}>
													Crear Tarea
												</Button>
											</div>
										))}
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
