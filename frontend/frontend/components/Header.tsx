'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function Header() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('th_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('th_token');
        localStorage.removeItem('th_user');
        setUser(null);
        router.push('/');
        router.refresh();
    };

    return (
        <header className="header">
            <div className="header-inner">
                <Link href="/" style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                    <Image src="/logo.svg" alt="TopHat Health Care" width={220} height={48} priority/>
                </Link>
                <nav className="nav">
                    <Link href="/jobs">Jobs</Link>
                    {!user && <Link href="/register">Register</Link>}
                    
                    {user?.role === 'CANDIDATE' && <Link href="/candidate/dashboard">Candidate Portal</Link>}
                    {user?.role === 'CLIENT_ADMIN' && <Link href="/client/dashboard">Client Portal</Link>}
                    {user?.role === 'ADMIN' && <Link href="/admin/dashboard">Admin</Link>}

                    {user ? (
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem'}}>
                            <span style={{fontSize: '0.875rem', color: '#666'}}>{user.username}</span>
                            <button 
                                onClick={handleLogout}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.375rem',
                                    backgroundColor: '#f3f4f6',
                                    fontSize: '0.875rem',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link 
                            href="/login"
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.375rem',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                fontSize: '0.875rem'
                            }}
                        >
                            Login
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
