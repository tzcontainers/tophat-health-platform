import { PortalLayout } from '@/components/PortalLayout';

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
    return (
        <PortalLayout
            title="Candidate workspace"
            subtitle="Profile, compliance, placements, and timesheets"
            links={[
                { href: '/candidate/dashboard', label: 'Dashboard' },
                { href: '/candidate/profile', label: 'Profile' },
                { href: '/candidate/compliance', label: 'Compliance' },
                { href: '/candidate/placements', label: 'Placements' },
                { href: '/candidate/timesheets', label: 'Timesheets' },
                { href: '/candidate/messages', label: 'Messages' }
            ]}
        >
            {children}
        </PortalLayout>
    );
}
