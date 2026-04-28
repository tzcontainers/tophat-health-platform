'use client';
import {apiGet, apiJson} from '@/lib/api';
import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';

const clientId = '00000000-0000-0000-0000-000000000301';
const siteId = '00000000-0000-0000-0000-000000000302';

export default function AdminJobsPage() {
    const {data, refetch} = useQuery({
        queryKey: ['admin-jobs-page'],
        queryFn: () => apiGet<any[]>('/api/v1/admin/jobs', 'admin')
    });
    const [message, setMessage] = useState('');

    async function createJob(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        await apiJson('/api/v1/admin/jobs', 'POST', {
            clientId,
            siteId,
            title: form.get('title'),
            discipline: form.get('discipline'),
            band: form.get('band'),
            employmentType: form.get('employmentType'),
            description: form.get('description'),
            location: form.get('location'),
            payRateMin: Number(form.get('payRateMin') || 20),
            payRateMax: Number(form.get('payRateMax') || 30),
            status: 'PUBLISHED'
        }, 'admin');
        await refetch();
        setMessage('Job created.');
        event.currentTarget.reset();
    }

    async function publishFirstDraft() {
        const first = data?.[0];
        if (!first) return;
        await apiJson(`/api/v1/admin/jobs/${first.id}`, 'PATCH', {
            status: 'PUBLISHED',
            title: `${first.title}`
        }, 'admin');
        await refetch();
        setMessage('First job updated.');
    }

    return (
        <div className="page-section stack">
            <form className="card stack" onSubmit={createJob}>
                <div className="section-title"><h1 style={{margin: 0}}>Manage jobs</h1><span className="badge">Publishing</span>
                </div>
                <div className="form-grid">
                    <input className="input" name="title" placeholder="Job title" required/>
                    <input className="input" name="discipline" placeholder="Discipline" required/>
                    <input className="input" name="band" placeholder="Band"/>
                    <input className="input" name="employmentType" placeholder="LOCUM / PERM"/>
                    <input className="input" name="location" placeholder="Location"/>
                    <input className="input" type="number" step="0.5" name="payRateMin" placeholder="Pay min"/>
                    <input className="input" type="number" step="0.5" name="payRateMax" placeholder="Pay max"/>
                </div>
                <textarea className="textarea" name="description" placeholder="Role description" required/>
                <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                    <button className="btn">Create job</button>
                    <button type="button" className="btn secondary" onClick={publishFirstDraft}>Patch first job</button>
                </div>
            </form>
            <div className="card table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th>Title</th>
                        <th>Discipline</th>
                        <th>Status</th>
                        <th>Client</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data?.map((job) => <tr key={job.id}>
                        <td>{job.title}</td>
                        <td>{job.discipline}</td>
                        <td>{job.status}</td>
                        <td>{job.clientName}</td>
                    </tr>)}
                    </tbody>
                </table>
            </div>
            {message && <div className="notice">{message}</div>}
        </div>
    );
}
