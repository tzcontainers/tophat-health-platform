export type ApiEnvelope<T> = { data: T; meta: { correlationId: string; timestamp: string } };

const SERVER_API_BASE_URL = process.env.BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const BROWSER_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
type Area = 'public' | 'candidate' | 'client' | 'admin';

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('th_token');
}

function headers(area: Area): HeadersInit {
    const base: HeadersInit = {};
    const token = getAuthToken();
    if (token) {
        base['Authorization'] = `Bearer ${token}`;
    }
    return base;
}

async function parse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let message = response.statusText;
        try {
            const body = await response.json();
            message = body?.data?.error || body?.error || message;
        } catch {
        }
        throw new Error(message);
    }
    const envelope = (await response.json()) as ApiEnvelope<T>;
    return envelope.data;
}

async function apiFetch(path: string, init: RequestInit): Promise<Response> {
    const apiBaseUrl = typeof window === 'undefined' ? SERVER_API_BASE_URL : BROWSER_API_BASE_URL;

    try {
        return await fetch(`${apiBaseUrl}${path}`, init);
    } catch {
        throw new Error(
            `Could not connect to the API at ${apiBaseUrl || 'the frontend API proxy'}. Start the backend or update BACKEND_API_BASE_URL.`
        );
    }
}

export async function apiGet<T>(path: string, area: Area = 'public'): Promise<T> {
    const response = await apiFetch(path, { cache: 'no-store', headers: headers(area) });
    return parse<T>(response);
}

export async function apiJson<T>(path: string, method: 'POST' | 'PUT' | 'PATCH', body: unknown, area: Area): Promise<T> {
    const response = await apiFetch(path, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers(area) },
        body: JSON.stringify(body)
    });
    return parse<T>(response);
}

export async function apiDelete<T>(path: string, area: Area): Promise<T> {
    const response = await apiFetch(path, {
        method: 'DELETE',
        headers: headers(area)
    });
    return parse<T>(response);
}

export async function apiForm<T>(path: string, formData: FormData, area: Area): Promise<T> {
    const response = await apiFetch(path, { method: 'POST', headers: headers(area), body: formData });
    return parse<T>(response);
}
