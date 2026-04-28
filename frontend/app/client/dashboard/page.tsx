'use client';
import {useQuery} from '@tanstack/react-query';
import {apiGet} from '@/lib/api';
import {StatCard} from '@/components/StatCard';

export default function ClientDashboardPage() {
    const jobs = useQuery({queryKey: ['client-jobs'], queryFn: () => apiGet<any[]>('/api/v1/client/jobs', 'client')});
    const placements = useQuery({
        queryKey: ['client-placements'],
        queryFn: () => apiGet<any[]>('/api/v1/client/placements', 'client')
    });
    const pending = useQuery({
        queryKey: ['client-pending-timesheets'],
        queryFn: () => apiGet<any[]>('/api/v1/client/timesheets/pending', 'client')
    });
    return (
        <div className="page-section stack">
            <div className="section-title"><h1 style={{margin: 0}}>Client dashboard</h1><span className="badge">Workforce snapshot</span>
            </div>
            <div className="kpi-grid">
                <StatCard label="Live jobs" value={jobs.data?.length || 0}/>
                <StatCard label="Placements" value={placements.data?.length || 0}/>
                <StatCard label="Pending approvals" value={pending.data?.length || 0}
                          tone={(pending.data?.length || 0) > 0 ? 'warning' : 'success'}/>
            </div>
        </div>
    );
}
