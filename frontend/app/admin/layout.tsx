'use client';

import { PortalLayout } from '@/components/PortalLayout';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    
    // Explicitly defining the links array inside the client component
    const adminLinks = [
        { href: '/admin/dashboard', label: 'Dashboard' },
        { href: '/admin/users', label: 'Manage Users' },
        { href: '/admin/teams', label: 'Manage Teams' },
        { href: '/admin/candidates', label: 'Candidates' },
        { href: '/admin/jobs', label: 'Jobs' },
        { href: '/admin/compliance', label: 'Compliance' },
        { href: '/admin/placements', label: 'Placements' },
        { href: '/admin/reports', label: 'Reports' }
    ];

    return (
        <PortalLayout 
            key={pathname} // Force re-render on path change
            title="Admin Operations" 
            subtitle="Back office controls and reporting" 
            links={adminLinks}
        >
            {children}
        </PortalLayout>
    );
}
