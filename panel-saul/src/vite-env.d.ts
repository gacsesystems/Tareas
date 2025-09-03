/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL: string;
	readonly VITE_APP_TITLE: string;
	// Agrega más variables de entorno aquí
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
