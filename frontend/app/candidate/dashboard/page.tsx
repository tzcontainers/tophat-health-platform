'use client';
import {useQuery} from '@tanstack/react-query';
import {apiGet} from '@/lib/api';
import {StatCard} from '@/components/StatCard';
import {TableCard} from '@/components/TableCard';
import {PaginationControls} from '@/components/PaginationControls';
import {buildJobQuery, emptyJobsPage, PaginatedJobs} from '@/lib/jobs';
import Link from 'next/link';
import {useMemo, useState} from 'react';

export default function CandidateDashboardPage() {
    const [jobSearch, setJobSearch] = useState('');
    const [jobDiscipline, setJobDiscipline] = useState('');
    const [jobBand, setJobBand] = useState('');
    const [jobEmploymentType, setJobEmploymentType] = useState('');
    const [jobLocation, setJobLocation] = useState('');
    const [jobMinPay, setJobMinPay] = useState('');
    const [jobMaxPay, setJobMaxPay] = useState('');
    const [jobPage, setJobPage] = useState(0);
    const jobPageSize = 4;

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
    const matchedJobsQuery = useMemo(() => buildJobQuery({
        search: jobSearch,
        discipline: jobDiscipline,
        band: jobBand,
        employmentType: jobEmploymentType,
        location: jobLocation,
        minPay: jobMinPay,
        maxPay: jobMaxPay
    }, jobPage, jobPageSize), [jobSearch, jobDiscipline, jobBand, jobEmploymentType, jobLocation, jobMinPay, jobMaxPay, jobPage]);
    const matchedJobs = useQuery({
        queryKey: ['candidate-matched-jobs', matchedJobsQuery],
        queryFn: () => apiGet<PaginatedJobs>(`/api/v1/candidates/me/jobs/matches${matchedJobsQuery}`, 'candidate')
    });
    const jobsPage = matchedJobs.data || emptyJobsPage(jobPageSize);

    function updateJobFilter(update: () => void) {
        update();
        setJobPage(0);
    }

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
            <TableCard title="Matched jobs" actions={<span className="badge">{jobsPage.totalItems} matching</span>}>
                <div className="stack">
                    <div className="form-grid">
                        <input className="input" placeholder="Search" value={jobSearch}
                               onChange={(e) => updateJobFilter(() => setJobSearch(e.target.value))}/>
                        <input className="input" placeholder="Discipline" value={jobDiscipline}
                               onChange={(e) => updateJobFilter(() => setJobDiscipline(e.target.value))}/>
                        <input className="input" placeholder="Band" value={jobBand}
                               onChange={(e) => updateJobFilter(() => setJobBand(e.target.value))}/>
                        <input className="input" placeholder="Employment type" value={jobEmploymentType}
                               onChange={(e) => updateJobFilter(() => setJobEmploymentType(e.target.value))}/>
                        <input className="input" placeholder="Location" value={jobLocation}
                               onChange={(e) => updateJobFilter(() => setJobLocation(e.target.value))}/>
                        <input className="input" type="number" placeholder="Min pay" value={jobMinPay}
                               onChange={(e) => updateJobFilter(() => setJobMinPay(e.target.value))}/>
                        <input className="input" type="number" placeholder="Max pay" value={jobMaxPay}
                               onChange={(e) => updateJobFilter(() => setJobMaxPay(e.target.value))}/>
                    </div>
                    <table>
                        <thead>
                        <tr>
                            <th>Role</th>
                            <th>Discipline</th>
                            <th>Band</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Pay</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {jobsPage.items.map((job) => (
                            <tr key={job.id}>
                                <td>{job.title}</td>
                                <td>{job.discipline}</td>
                                <td>{job.band || '—'}</td>
                                <td>{job.employmentType}</td>
                                <td>{job.location || '—'}</td>
                                <td>£{job.payRateMin} - £{job.payRateMax}</td>
                                <td><Link className="btn secondary compact" href={`/jobs/${job.id}`}>View</Link></td>
                            </tr>
                        ))}
                        {!matchedJobs.isLoading && jobsPage.items.length === 0 && (
                            <tr>
                                <td colSpan={7} className="muted" style={{textAlign: 'center'}}>No jobs match the selected filters.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                    <PaginationControls
                        page={jobsPage.page}
                        totalPages={jobsPage.totalPages}
                        hasPrevious={jobsPage.hasPrevious}
                        hasNext={jobsPage.hasNext}
                        onPageChange={setJobPage}
                    />
                </div>
            </TableCard>
        </div>
    );
}
