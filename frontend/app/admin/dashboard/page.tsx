'use client';
import {useQuery} from '@tanstack/react-query';
import {apiGet} from '@/lib/api';
import {StatCard} from '@/components/StatCard';
import {PaginatedJobs} from '@/lib/jobs';

export default function AdminDashboardPage() {
    const candidates = useQuery({
        queryKey: ['admin-candidates'],
        queryFn: () => apiGet<any[]>('/api/v1/admin/candidates', 'admin')
    });
    const jobs = useQuery({queryKey: ['admin-jobs'], queryFn: () => apiGet<PaginatedJobs>('/api/v1/admin/jobs?page=0&size=1', 'admin')});
    const report = useQuery({
        queryKey: ['admin-compliance-report'],
        queryFn: () => apiGet<any[]>('/api/v1/admin/reports/compliance', 'admin')
    });
    const timesheets = useQuery({
        queryKey: ['admin-timesheets'],
        queryFn: () => apiGet<any[]>('/api/v1/admin/timesheets', 'admin')
    });
    return (
        <div className="page-section stack">
            <div className="section-title"><h1 style={{margin: 0}}>Admin dashboard</h1><span className="badge">Operations snapshot</span>
            </div>
            <div className="kpi-grid">
                <StatCard label="Candidates" value={candidates.data?.length || 0}/>
                <StatCard label="Jobs" value={jobs.data?.totalItems || 0}/>
                <StatCard label="Compliance items" value={report.data?.length || 0}/>
                <StatCard label="Timesheets" value={timesheets.data?.length || 0}/>
            </div>
        </div>
    );
}
