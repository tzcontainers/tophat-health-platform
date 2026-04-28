'use client';
import {useQuery} from '@tanstack/react-query';
import {apiGet} from '@/lib/api';
import {StatCard} from '@/components/StatCard';
import {TableCard} from '@/components/TableCard';

export default function CandidateDashboardPage() {
    const me = useQuery({queryKey: ['candidate-me'], queryFn: () => apiGet<any>('/api/v1/candidates/me', 'candidate')});
    const compliance = useQuery({
        queryKey: ['candidate-compliance'],
        queryFn: () => apiGet<any>('/api/v1/candidates/me/compliance', 'candidate')
    });
    const placements = useQuery({
        queryKey: ['candidate-placements'],
        queryFn: () => apiGet<any[]>('/api/v1/candidates/me/placements', 'candidate')
    });
    const timesheets = useQuery({
        queryKey: ['candidate-timesheets'],
        queryFn: () => apiGet<any[]>('/api/v1/candidates/me/timesheets', 'candidate')
    });

    return (
        <div className="page-section stack">
            <div className="section-title"><h1 style={{margin: 0}}>Candidate dashboard</h1><span className="badge">Live workspace</span>
            </div>
            <div className="kpi-grid">
                <StatCard label="Candidate" value={me.data?.candidateNumber || '…'}/>
                <StatCard label="Compliance" value={compliance.data?.overallStatus || '…'}
                          tone={compliance.data?.overallStatus === 'CLEARED' ? 'success' : 'warning'}/>
                <StatCard label="Placements" value={placements.data?.length || 0}/>
                <StatCard label="Timesheets" value={timesheets.data?.length || 0}/>
            </div>
            <div className="grid-2">
                <TableCard title="Profile snapshot">
                    <div className="stack">
                        <div><strong>Name:</strong> {me.data?.firstName} {me.data?.lastName}</div>
                        <div><strong>Email:</strong> {me.data?.email}</div>
                        <div><strong>Date of Birth:</strong> {me.data?.dateOfBirth || '—'}</div>
                        <div><strong>Discipline:</strong> {me.data?.profile?.primaryDiscipline || '—'}</div>
                        <div><strong>Availability:</strong> {me.data?.profile?.availabilityStatus || '—'}</div>
                        <div><strong>Available From:</strong> {me.data?.profile?.availableFrom || '—'}</div>
                    </div>
                </TableCard>
                <TableCard title="Compliance documents">
                    <table>
                        <thead>
                        <tr>
                            <th>Requirement</th>
                            <th>Status</th>
                            <th>Expiry</th>
                        </tr>
                        </thead>
                        <tbody>
                        {compliance.data?.documents?.map((doc: any) => <tr key={doc.id}>
                            <td>{doc.requirementName}</td>
                            <td>{doc.verificationStatus}</td>
                            <td>{doc.expiryDate || '—'}</td>
                        </tr>)}
                        </tbody>
                    </table>
                </TableCard>
            </div>
            <div className="grid-2">
                <TableCard title="Availability History">
                    <table>
                        <thead>
                        <tr>
                            <th>Available From</th>
                            <th>Availability Type</th>
                            <th>Notes</th>
                        </tr>
                        </thead>
                        <tbody>
                        {me.data?.availabilityHistory?.map((entry: any) => <tr key={entry.id}>
                            <td>{entry.availableFrom}</td>
                            <td>{entry.availabilityType}</td>
                            <td>{entry.notes}</td>
                        </tr>)}
                        </tbody>
                    </table>
                </TableCard>
            </div>
        </div>
    );
}
