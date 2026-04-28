'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {ReactNode} from 'react';

export function PortalLayout({title, subtitle, links, children}: {
    title: string;
    subtitle: string;
    links: { href: string; label: string }[];
    children: ReactNode
}) {
    const pathname = usePathname();

    return (
        <main className="portal-layout">
            <aside className="card sidebar">
                <div className="sidebar-heading">
                    <h3 style={{margin: 0}}>{title}</h3>
                    <p className="muted" style={{marginBottom: 0}}>{subtitle}</p>
                </div>
                <nav className="sidebar-nav">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={pathname === link.href ? 'active' : ''}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <section>{children}</section>
        </main>
    );
}
