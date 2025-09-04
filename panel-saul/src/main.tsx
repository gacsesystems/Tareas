import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/Toast';
import App from './App';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: { refetchOnWindowFocus: false, retry: 1 }, //Esto sirve para que la query se actualice cuando se vuelve a la ventana
	},
});

ReactDOM.createRoot(document.getElementById('root')!).render(
	<BrowserRouter>
		<ToastProvider>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</ToastProvider>
	</BrowserRouter>
);
