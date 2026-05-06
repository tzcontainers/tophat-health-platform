export type AuthSession = {
    token?: string | null;
    refreshToken?: string | null;
    username: string;
    role: string;
    candidateId?: string | null;
    clientId?: string | null;
};

export function notifyAuthChanged() {
    window.dispatchEvent(new Event('th-auth-change'));
}

export async function fetchAuthSession(): Promise<AuthSession | null> {
    const response = await fetch('/api/v1/auth/session', {
        credentials: 'same-origin',
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error('Could not load session');
    }

    const envelope = await response.json() as { data: AuthSession | null };
    if (envelope.data) {
        return envelope.data;
    }

    const refreshResponse = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });

    if (!refreshResponse.ok) {
        return null;
    }

    const refreshedEnvelope = await responseFromSession();
    return refreshedEnvelope.data;
}

export async function clearAuthSession() {
    await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
    });
    notifyAuthChanged();
}

export function normalizeRole(role: string | null | undefined) {
    return role?.toUpperCase() ?? '';
}

async function responseFromSession() {
    const response = await fetch('/api/v1/auth/session', {
        credentials: 'same-origin',
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error('Could not load session');
    }

    return response.json() as Promise<{ data: AuthSession | null }>;
}

export function routeForRole(role: string) {
    const normalizedRole = normalizeRole(role);

    if (normalizedRole === 'ADMIN') return '/admin/dashboard';
    if (normalizedRole === 'CLIENT_ADMIN' || normalizedRole === 'CLIENT') return '/client/dashboard';
    if (normalizedRole === 'CANDIDATE') return '/candidate/dashboard';
    return '/';
}
