import { createContext, useContext, useMemo, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';
interface IToast {
	id: number;
	type: ToastType;
	message: string;
}
interface IToastContext {
	show: (message: string, type?: ToastType, ms?: number) => void;
}

const ToastCtx = createContext<IToastContext | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<IToast[]>([]);

	const api: IToastContext = useMemo(
		() => ({
			show: (message, type = 'info', ms = 2500) => {
				const id = Date.now() + Math.random();
				setToasts((prev) => [...prev, { id, type, message }]);
				window.setTimeout(() => {
					setToasts((prev) => prev.filter((t) => t.id !== id));
				}, ms);
			},
		}),
		[]
	);

	return (
		<ToastCtx.Provider value={api}>
			{children}
			{/* contenedor flotante */}
			<div className="fixed bottom-4 right-4 z-50 space-y-2">
				{toasts.map((t) => (
					<div
						key={t.id}
						className={[
							'px-3 py-2 rounded shadow text-sm',
							t.type === 'success' && 'bg-emerald-600 text-white',
							t.type === 'error' && 'bg-rose-600 text-white',
							t.type === 'info' && 'bg-slate-700 text-white',
						]
							.filter(Boolean)
							.join(' ')}>
						{t.message}
					</div>
				))}
			</div>
		</ToastCtx.Provider>
	);
}

export function useToast() {
	const ctx = useContext(ToastCtx);
	if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
	return ctx;
}
