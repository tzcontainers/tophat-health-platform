'use client';
import {useQuery} from '@tanstack/react-query';
import {apiGet} from '@/lib/api';
import {StatCard} from '@/components/StatCard';
import {TableCard} from '@/components/TableCard';
import {PaginationControls} from '@/components/PaginationControls';
import {buildJobQuery, emptyJobsPage, PaginatedJobs} from '@/lib/jobs';
import {useMemo, useState} from 'react';

export default function ClientDashboardPage() {
    const [search, setSearch] = useState('');
    const [discipline, setDiscipline] = useState('');
    const [band, setBand] = useState('');
    const [employmentType, setEmploymentType] = useState('');
    const [location, setLocation] = useState('');
    const [minPay, setMinPay] = useState('');
    const [maxPay, setMaxPay] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(0);
    const pageSize = 5;
    const queryString = useMemo(() => buildJobQuery({
        search,
        discipline,
        band,
        employmentType,
        location,
        minPay,
        maxPay,
        status
    }, page, pageSize), [search, discipline, band, employmentType, location, minPay, maxPay, status, page]);
    const jobs = useQuery({queryKey: ['client-jobs', queryString], queryFn: () => apiGet<PaginatedJobs>(`/api/v1/client/jobs${queryString}`, 'client')});
    const placements = useQuery({
        queryKey: ['client-placements'],
        queryFn: () => apiGet<any[]>('/api/v1/client/placements', 'client')
    });
    const pending = useQuery({
        queryKey: ['client-pending-timesheets'],
        queryFn: () => apiGet<any[]>('/api/v1/client/timesheets/pending', 'client')
    });
    const jobsPage = jobs.data || emptyJobsPage(pageSize);

    function updateFilter(update: () => void) {
        update();
        setPage(0);
    }

    return (
        <div className="page-section stack">
            <div className="section-title"><h1 style={{margin: 0}}>Client overview</h1><span className="badge">Workforce snapshot</span>
            </div>
            <div className="kpi-grid">
                <StatCard label="Live roles" value={jobsPage.totalItems || 0}/>
                <StatCard label="Placements" value={placements.data?.length || 0}/>
                <StatCard label="Pending approvals" value={pending.data?.length || 0}
                          tone={(pending.data?.length || 0) > 0 ? 'warning' : 'success'}/>
            </div>
            <TableCard
                title="Roles"
                actions={<span className="badge">{jobsPage.totalItems} matching</span>}
            >
                <div className="stack">
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
                    <table>
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th>Discipline</th>
                            <th>Band</th>
                            <th>Status</th>
                            <th>Location</th>
                        </tr>
                        </thead>
                        <tbody>
                        {jobsPage.items.map((job) => (
                            <tr key={job.id}>
                                <td>{job.title}</td>
                                <td>{job.discipline}</td>
                                <td>{job.band || '—'}</td>
                                <td>{job.status}</td>
                                <td>{job.location || '—'}</td>
                            </tr>
                        ))}
                        {jobsPage.items.length === 0 && (
                            <tr>
                                <td colSpan={5} className="muted" style={{textAlign: 'center'}}>No roles match the selected filters.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                    <PaginationControls
                        page={jobsPage.page}
                        totalPages={jobsPage.totalPages}
                        hasPrevious={jobsPage.hasPrevious}
                        hasNext={jobsPage.hasNext}
                        onPageChange={setPage}
                    />
                </div>
            </TableCard>
        </div>
    );
}
