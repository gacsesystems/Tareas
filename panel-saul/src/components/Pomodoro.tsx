import { useState, useEffect } from 'react';

interface Props {
	minutosFoco?: number;
	minutosDescanso?: number;
}

export default function Pomodoro({ minutosFoco = 25, minutosDescanso = 5 }: Props) {
	const [minutos, setMinutos] = useState(minutosFoco);
	const [segundos, setSegundos] = useState(0);
	const [enFoco, setEnFoco] = useState(true);
	const [activo, setActivo] = useState(false);

	useEffect(() => {
		if (!activo) return;
		const id = setInterval(() => {
			setSegundos((prevSegundos) => {
				if (prevSegundos === 0) {
					setMinutos((prevMinutos) => {
						if (prevMinutos === 0) {
							setEnFoco((prevEnFoco) => {
								const nuevoEnFoco = !prevEnFoco;
								setMinutos(nuevoEnFoco ? minutosDescanso : minutosFoco);
								return nuevoEnFoco;
							});
							return 0;
						} else {
							return prevMinutos - 1;
						}
					});
					return 59;
				} else {
					return prevSegundos - 1;
				}
			});
		}, 1000);
		return () => clearInterval(id);
	}, [activo, minutosDescanso, minutosFoco]);

	return (
		<div className="p-4 border rounded">
			<h2>{enFoco ? 'Foco' : 'Descanso'}</h2>
			<p className="text-3xl">
				{minutos.toString().padStart(2, '0')}:{segundos.toString().padStart(2, '0')}
			</p>
			<button onClick={() => setActivo(!activo)}>{activo ? 'Pausar' : 'Iniciar'}</button>
			<button
				onClick={() => {
					setActivo(false);
					setEnFoco(true);
					setMinutos(minutosFoco);
					setSegundos(0);
				}}>
				Reiniciar
			</button>
		</div>
	);
}
