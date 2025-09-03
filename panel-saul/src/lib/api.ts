const RAW_BASE = import.meta.env.VITE_API_BASE ?? 'https://localhost:44348';
const BASE_URL = RAW_BASE.replace(/\/+$/, ''); // sin / al final

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
	const res = await fetch(`${BASE_URL}${url}`, {
		headers: { 'Content-Type': 'application/json' },
		...options,
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json() as Promise<T>;
}

export const api = {
	get: <T>(url: string) => request<T>(url),
	post: <T>(url: string, body: unknown) => request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
	put: <T>(url: string, body: unknown) => request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
	del: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};
