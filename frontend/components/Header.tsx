'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuthSession } from '@/lib/auth';

export function Header() {
    const [user, setUser] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        function syncSession() {
            const storedUser = localStorage.getItem('th_user');
            const storedRole = localStorage.getItem('th_role');
            setUser(storedUser);
            setRole(storedRole);
        }

        syncSession();
        window.addEventListener('th-auth-change', syncSession);
        window.addEventListener('storage', syncSession);

        return () => {
            window.removeEventListener('th-auth-change', syncSession);
            window.removeEventListener('storage', syncSession);
        };
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem('th_user');
        const storedRole = localStorage.getItem('th_role');
        setUser(storedUser);
        setRole(storedRole);
    }, [pathname]);

    const logout = () => {
        clearAuthSession();
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

                    {role?.toUpperCase() === 'CANDIDATE' && <Link href="/candidate/dashboard" className={linkClass('/candidate')}>Dashboard</Link>}
                    {(role?.toUpperCase() === 'CLIENT_ADMIN' || role?.toUpperCase() === 'CLIENT') && <Link href="/client/dashboard" className={linkClass('/client')}>Dashboard</Link>}
                    {role?.toUpperCase() === 'ADMIN' && <Link href="/admin/dashboard" className={linkClass('/admin')}>Admin</Link>}

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
