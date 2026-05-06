'use client';
import {apiGet, apiJson} from '@/lib/api';
import {useQuery} from '@tanstack/react-query';
import {buildJobQuery, emptyJobsPage, PaginatedJobs} from '@/lib/jobs';
import {PaginationControls} from '@/components/PaginationControls';
import {useMemo, useState} from 'react';

export default function AdminJobsPage() {
    const [search, setSearch] = useState('');
    const [discipline, setDiscipline] = useState('');
    const [band, setBand] = useState('');
    const [employmentType, setEmploymentType] = useState('');
    const [location, setLocation] = useState('');
    const [minPay, setMinPay] = useState('');
    const [maxPay, setMaxPay] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(0);
    const pageSize = 10;
    const queryString = useMemo(() => {
        return buildJobQuery({search, discipline, band, employmentType, location, minPay, maxPay, status}, page, pageSize);
    }, [search, discipline, band, employmentType, location, minPay, maxPay, status, page]);

    const {data, refetch} = useQuery({
        queryKey: ['admin-jobs-page', queryString],
        queryFn: () => apiGet<PaginatedJobs>(`/api/v1/admin/jobs${queryString}`, 'admin')
    });
    const clients = useQuery({
        queryKey: ['admin-job-clients'],
        queryFn: () => apiGet<any[]>('/api/v1/admin/clients', 'admin')
    });
    const [selectedClientId, setSelectedClientId] = useState('');
    const sites = useQuery({
        queryKey: ['admin-job-sites', selectedClientId],
        queryFn: () => apiGet<any[]>(`/api/v1/admin/clients/${selectedClientId}/sites`, 'admin'),
        enabled: !!selectedClientId
    });
    const [message, setMessage] = useState('');
    const jobsPage = data || emptyJobsPage(pageSize);

    function updateFilter(update: () => void) {
        update();
        setPage(0);
    }

    async function createJob(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        await apiJson('/api/v1/admin/jobs', 'POST', {
            clientId: form.get('clientId'),
            siteId: form.get('siteId'),
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
        setMessage('Role created.');
        event.currentTarget.reset();
    }

    async function publishFirstDraft() {
        const first = jobsPage.items[0];
        if (!first) return;
        await apiJson(`/api/v1/admin/jobs/${first.id}`, 'PATCH', {
            status: 'PUBLISHED',
            title: `${first.title}`
        }, 'admin');
        await refetch();
        setMessage('First role updated.');
    }

    return (
        <div className="page-section stack">
            <form className="card stack" onSubmit={createJob}>
                <div className="section-title"><h1 style={{margin: 0}}>Manage roles</h1><span className="badge">{jobsPage.totalItems} roles</span>
                </div>
                <div className="form-grid">
                    <select
                        className="select"
                        name="clientId"
                        value={selectedClientId}
                        onChange={(event) => setSelectedClientId(event.target.value)}
                        required
                        data-testid="admin-job-client-select"
                    >
                        <option value="">Select client</option>
                        {clients.data?.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                            </option>
                        ))}
                    </select>
                    <select className="select" name="siteId" required data-testid="admin-job-site-select">
                        <option value="">Select site</option>
                        {sites.data?.map((site) => (
                            <option key={site.id} value={site.id}>
                                {site.siteName}
                            </option>
                        ))}
                    </select>
                    <input className="input" name="title" placeholder="Role title" required/>
                    <input className="input" name="discipline" placeholder="Discipline" required/>
                    <input className="input" name="band" placeholder="Band"/>
                    <input className="input" name="employmentType" placeholder="LOCUM / PERM"/>
                    <input className="input" name="location" placeholder="Location"/>
                    <input className="input" type="number" step="0.5" name="payRateMin" placeholder="Pay min"/>
                    <input className="input" type="number" step="0.5" name="payRateMax" placeholder="Pay max"/>
                </div>
                <textarea className="textarea" name="description" placeholder="Role description" required/>
                <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                    <button className="btn">Create role</button>
                    <button type="button" className="btn secondary" onClick={publishFirstDraft}>Update first role</button>
                </div>
            </form>

            <div className="card stack">
                <div className="section-title">
                    <h3 style={{margin: 0}}>Filter roles</h3>
                    <span className="badge">All statuses</span>
                </div>
                <div className="form-grid">
                    <input className="input" placeholder="Search" value={search}
                           onChange={(e) => updateFilter(() => setSearch(e.target.value))}/>
                    <input className="input" placeholder="Discipline" value={discipline}
                           onChange={(e) => updateFilter(() => setDiscipline(e.target.value))}/>
                    <input className="input" placeholder="Band" value={band}
                           onChange={(e) => updateFilter(() => setBand(e.target.value))}/>
                    <input className="input" placeholder="Employment type" value={employmentType}
                           onChange={(e) => updateFilter(() => setEmploymentType(e.target.value))}/>
                    <input className="input" placeholder="Location" value={location}
                           onChange={(e) => updateFilter(() => setLocation(e.target.value))}/>
                    <input className="input" type="number" placeholder="Min pay" value={minPay}
                           onChange={(e) => updateFilter(() => setMinPay(e.target.value))}/>
                    <input className="input" type="number" placeholder="Max pay" value={maxPay}
                           onChange={(e) => updateFilter(() => setMaxPay(e.target.value))}/>
                    <select className="select" value={status} onChange={(e) => updateFilter(() => setStatus(e.target.value))}>
                        <option value="">Any status</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="CLOSED">CLOSED</option>
                    </select>
                </div>
            </div>

            <div className="card table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th>Title</th>
                        <th>Discipline</th>
                        <th>Band</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Client</th>
                    </tr>
                    </thead>
                    <tbody>
                    {jobsPage.items.map((job) => <tr key={job.id}>
                        <td>{job.title}</td>
                        <td>{job.discipline}</td>
                        <td>{job.band || '—'}</td>
                        <td>{job.employmentType}</td>
                        <td>{job.location || '—'}</td>
                        <td>{job.status}</td>
                        <td>{job.clientName}</td>
                    </tr>)}
                    {jobsPage.items.length === 0 && (
                        <tr>
                            <td colSpan={7} className="muted" style={{textAlign: 'center'}}>No roles match the selected filters.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
            <PaginationControls
                page={jobsPage.page}
                totalPages={jobsPage.totalPages}
                hasPrevious={jobsPage.hasPrevious}
                hasNext={jobsPage.hasNext}
                onPageChange={setPage}
            />
            {message && <div className="notice">{message}</div>}
        </div>
    );
}
