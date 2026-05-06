'use client';

import { PortalLayout } from '@/components/PortalLayout';
import { useEffect, useState } from 'react';

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        setRole(localStorage.getItem('th_role'));
    }, []);

    const links = [
        { href: '/candidate/dashboard', label: 'Dashboard' },
        { href: '/candidate/profile', label: 'Profile' },
        { href: '/candidate/compliance', label: 'Compliance' },
        { href: '/candidate/placements', label: 'Placements' },
        { href: '/candidate/timesheets', label: 'Timesheets' },
        { href: '/candidate/messages', label: 'Messages' }
    ];

    // Explicitly add admin-only links UNDER the candidate route
    if (role === 'ADMIN') {
        links.push(
            { href: '/candidate/users', label: 'Users' },
            { href: '/candidate/teams', label: 'Teams' }
        );
    }

    return (
        <PortalLayout 
            title={role === 'ADMIN' ? "Candidate Workspace (Admin)" : "Candidate workspace"} 
            subtitle={role === 'ADMIN' ? "Backend management enabled" : "Profile, compliance, placements, and timesheets"}
            links={links}
        >
            {children}
        </PortalLayout>
    );
}
