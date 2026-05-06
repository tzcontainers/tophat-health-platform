'use client';
import {apiGet, apiJson} from '@/lib/api';
import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';

export default function AdminPlacementsPage() {
    const [message, setMessage] = useState('');
    const candidates = useQuery({
        queryKey: ['admin-placement-candidates'],
        queryFn: () => apiGet<any[]>('/api/v1/admin/candidates', 'admin')
    });
    const jobs = useQuery({
        queryKey: ['admin-placement-jobs'],
        queryFn: () => apiGet<any>('/api/v1/admin/jobs?page=0&size=100', 'admin')
    });
    const clients = useQuery({
        queryKey: ['admin-placement-clients'],
        queryFn: () => apiGet<any[]>('/api/v1/admin/clients', 'admin')
    });
    const [selectedClientId, setSelectedClientId] = useState('');
    const sites = useQuery({
        queryKey: ['admin-placement-sites', selectedClientId],
        queryFn: () => apiGet<any[]>(`/api/v1/admin/clients/${selectedClientId}/sites`, 'admin'),
        enabled: !!selectedClientId
    });

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const result = await apiJson<any>('/api/v1/admin/placements', 'POST', {
            candidateId: form.get('candidateId'),
            jobId: form.get('jobId'),
            clientId: form.get('clientId'),
            siteId: form.get('siteId'),
            consultantName: form.get('consultantName'),
            startDate: form.get('startDate'),
            endDate: form.get('endDate'),
            status: 'ACTIVE',
            payRate: Number(form.get('payRate') || 30),
            chargeRate: Number(form.get('chargeRate') || 45)
        }, 'admin');
        setMessage(`Placement created: ${result.id}`);
    }

    return (
        <div className="page-section stack">
            <form className="card stack" onSubmit={onSubmit}>
                <div className="section-title"><h1 style={{margin: 0}}>Create placement</h1><span className="badge">Placement setup</span>
                </div>
                <div className="form-grid">
                    <select className="select" name="candidateId" required data-testid="admin-placement-candidate-select">
                        <option value="">Select candidate</option>
                        {candidates.data?.map((candidate) => (
                            <option key={candidate.id} value={candidate.id}>
                                {candidate.name}
                            </option>
                        ))}
                    </select>
                    <select className="select" name="jobId" required data-testid="admin-placement-job-select">
                        <option value="">Select role</option>
                        {jobs.data?.items?.map((job: any) => (
                            <option key={job.id} value={job.id}>
                                {job.title}
                            </option>
                        ))}
                    </select>
                    <select
                        className="select"
                        name="clientId"
                        value={selectedClientId}
                        onChange={(event) => setSelectedClientId(event.target.value)}
                        required
                        data-testid="admin-placement-client-select"
                    >
                        <option value="">Select client</option>
                        {clients.data?.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                            </option>
                        ))}
                    </select>
                    <select className="select" name="siteId" required data-testid="admin-placement-site-select">
                        <option value="">Select site</option>
                        {sites.data?.map((site) => (
                            <option key={site.id} value={site.id}>
                                {site.siteName}
                            </option>
                        ))}
                    </select>
                    <input className="input" name="consultantName" defaultValue="TopHat Consultant"/>
                    <input className="input" type="date" name="startDate" required/>
                    <input className="input" type="date" name="endDate"/>
                    <input className="input" type="number" step="0.5" name="payRate" placeholder="Pay rate"/>
                    <input className="input" type="number" step="0.5" name="chargeRate" placeholder="Charge rate"/>
                </div>
                <button className="btn">Create placement</button>
            </form>
            {message && <div className="notice">{message}</div>}
        </div>
    );
}
