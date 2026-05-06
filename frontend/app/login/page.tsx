'use client';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { apiJson } from '@/lib/api';
import { AuthSession, notifyAuthChanged, routeForRole } from '@/lib/auth';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    function targetPath(role: string) {
        if (typeof window === 'undefined') {
            return routeForRole(role);
        }

        return new URLSearchParams(window.location.search).get('redirect') || routeForRole(role);
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setMessage('');
        const form = new FormData(event.currentTarget);
        const username = form.get('username') as string;
        const password = form.get('password') as string;

        try {
            const result = await apiJson<AuthSession>('/api/v1/auth/login', 'POST', {
                username,
                password
            }, 'public');

            notifyAuthChanged();
            router.push(targetPath(result.role));
            router.refresh();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    const onGoogleSuccess = useCallback((session: AuthSession) => {
        notifyAuthChanged();
        router.push(targetPath(session.role));
        router.refresh();
    }, [router]);

    const onGoogleError = useCallback((errorMessage: string) => {
        setMessage(errorMessage);
    }, []);

    return (
        <main className="auth-page">
            <section className="auth-visual">
                <div>
                    <div className="eyebrow">Secure workspace access</div>
                    <h1>Sign in to your healthcare staffing workspace.</h1>
                    <p>
                        Use one secure account to manage roles, compliance, placements, approvals, and timesheets based on your access level.
                    </p>
                </div>
                <div className="auth-proof-grid">
                    <div><strong>JWT</strong><span>Secure sessions</span></div>
                    <div><strong>RBAC</strong><span>Role-aware access</span></div>
                    <div><strong>OIDC</strong><span>Google identity</span></div>
                </div>
            </section>

            <section className="auth-card card stack">
                <div>
                    <div className="eyebrow">Welcome back</div>
                    <h2>Sign in</h2>
                </div>

                <GoogleSignInButton onSuccess={onGoogleSuccess} onError={onGoogleError} />

                <div className="divider"><span>or use your platform password</span></div>

                <form className="login-form" onSubmit={onSubmit}>
                    <div className="login-field">
                        <label htmlFor="username">Email address</label>
                        <input
                            id="username"
                            className="input"
                            name="username"
                            type="email"
                            placeholder="name@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div className="login-field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            className="input"
                            name="password"
                            type="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button className="btn block" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                {message && <div className="notice danger">{message}</div>}

                <p className="auth-switch">New to TopHat? <a href="/register">Create an account</a></p>
            </section>
        </main>
    );
}
