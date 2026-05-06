'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuthSession, fetchAuthSession, normalizeRole } from '@/lib/auth';

export function Header() {
    const [user, setUser] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        async function syncSession() {
            try {
                const session = await fetchAuthSession();
                setUser(session?.username ?? null);
                setRole(session?.role ?? null);
            } catch {
                setUser(null);
                setRole(null);
            }
        }

        void syncSession();
        const sync = () => {
            void syncSession();
        };
        window.addEventListener('th-auth-change', sync);

        return () => {
            window.removeEventListener('th-auth-change', sync);
        };
    }, []);

    useEffect(() => {
        void fetchAuthSession()
            .then((session) => {
                setUser(session?.username ?? null);
                setRole(session?.role ?? null);
            })
            .catch(() => {
                setUser(null);
                setRole(null);
            });
    }, [pathname]);

    const logout = async () => {
        await clearAuthSession();
        setUser(null);
        setRole(null);
        router.push('/');
        router.refresh();
    };

    function linkClass(href: string) {
        const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
        return `nav-link${active ? ' active' : ''}`;
    }

    return (
        <header className="header">
            <div className="header-inner">
                <Link href="/" className="brand-lockup">
                    <Image
                        src="/logo.png"
                        alt="TopHat Health Care"
                        width={360}
                        height={96}
                        className="brand-logo"
                        priority
                    />
                </Link>
                <nav className="nav">
                    <Link href="/jobs" className={linkClass('/jobs')}>Roles</Link>
                    {!user && <Link href="/register" className={linkClass('/register')}>Register</Link>}

                    {normalizeRole(role) === 'CANDIDATE' && <Link href="/candidate/dashboard" className={linkClass('/candidate')}>Dashboard</Link>}
                    {(normalizeRole(role) === 'CLIENT_ADMIN' || normalizeRole(role) === 'CLIENT') && <Link href="/client/dashboard" className={linkClass('/client')}>Dashboard</Link>}
                    {normalizeRole(role) === 'ADMIN' && <Link href="/admin/dashboard" className={linkClass('/admin')}>Admin</Link>}

                    {user ? (
                        <div className="nav-actions">
                            <span className="nav-user"><span>{role?.replace('_', ' ')}</span>{user}</span>
                            <button onClick={logout} className="btn secondary nav-button">Logout</button>
                        </div>
                    ) : (
                        <Link href="/login" className="btn nav-button">Login</Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
