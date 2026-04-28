'use client';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { apiJson } from '@/lib/api';
import { AuthSession, routeForRole, saveAuthSession } from '@/lib/auth';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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

            saveAuthSession({ ...result, username: result.username || username });
            router.push(routeForRole(result.role));
            router.refresh();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    const onGoogleSuccess = useCallback((session: AuthSession) => {
        saveAuthSession(session);
        router.push(routeForRole(session.role));
        router.refresh();
    }, [router]);

    const onGoogleError = useCallback((errorMessage: string) => {
        setMessage(errorMessage);
    }, []);

    return (
        <main className="auth-page">
            <section className="auth-visual">
                <div>
                    <div className="eyebrow">Secure portal access</div>
                    <h1>Clinical staffing operations with one controlled sign-in.</h1>
                    <p>
                        Candidates, clients, and administrators enter the same platform and land in the workspace that matches their backend role.
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
