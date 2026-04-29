import {PortalLayout} from '@/components/PortalLayout';

export default function ClientLayout({children}: { children: React.ReactNode }) {
    return <PortalLayout title="Client workspace" subtitle="Role requests, placements, and approvals" links={[
        {href: '/client/dashboard', label: 'Dashboard'},
        {href: '/client/vacancy-requests', label: 'Role requests'},
        {href: '/client/placements', label: 'Placements'},
        {href: '/client/timesheets', label: 'Timesheets'}
    ]}>{children}</PortalLayout>;
}
