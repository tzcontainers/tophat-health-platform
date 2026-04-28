export type AuthSession = {
    token: string;
    username: string;
    role: string;
    candidateId?: string | null;
    clientId?: string | null;
};

export function saveAuthSession(session: AuthSession) {
    localStorage.setItem('th_token', session.token);
    localStorage.setItem('th_role', session.role);
    localStorage.setItem('th_user', session.username);

    if (session.candidateId) {
        localStorage.setItem('th_candidate_id', session.candidateId);
    }
    if (session.clientId) {
        localStorage.setItem('th_client_id', session.clientId);
    }

    window.dispatchEvent(new Event('th-auth-change'));
}

export function clearAuthSession() {
    localStorage.removeItem('th_token');
    localStorage.removeItem('th_role');
    localStorage.removeItem('th_user');
    localStorage.removeItem('th_candidate_id');
    localStorage.removeItem('th_client_id');
    window.dispatchEvent(new Event('th-auth-change'));
}

export function normalizeRole(role: string | null | undefined) {
    return role?.toUpperCase() ?? '';
}

export function routeForRole(role: string) {
    const normalizedRole = normalizeRole(role);

    if (normalizedRole === 'ADMIN') return '/admin/dashboard';
    if (normalizedRole === 'CLIENT_ADMIN' || normalizedRole === 'CLIENT') return '/client/dashboard';
    if (normalizedRole === 'CANDIDATE') return '/candidate/dashboard';
    return '/';
}
