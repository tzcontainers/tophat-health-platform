'use client';
import Link from 'next/link';
import {useQuery} from '@tanstack/react-query';
import {apiGet} from '@/lib/api';
import {buildJobQuery, emptyJobsPage, PaginatedJobs} from '@/lib/jobs';
import {PaginationControls} from '@/components/PaginationControls';
import {useMemo, useState} from 'react';

export default function JobsPage() {
    const [search, setSearch] = useState('');
    const [discipline, setDiscipline] = useState('');
    const [band, setBand] = useState('');
    const [employmentType, setEmploymentType] = useState('');
    const [location, setLocation] = useState('');
    const [minPay, setMinPay] = useState('');
    const [maxPay, setMaxPay] = useState('');
    const [page, setPage] = useState(0);
    const pageSize = 6;

    function updateFilter(update: () => void) {
        update();
        setPage(0);
    }

    const queryString = useMemo(() => {
        return buildJobQuery({search, discipline, band, employmentType, location, minPay, maxPay}, page, pageSize);
    }, [search, discipline, band, employmentType, location, minPay, maxPay, page]);
    const {data, isLoading, error} = useQuery({
        queryKey: ['jobs', queryString],
        queryFn: () => apiGet<PaginatedJobs>(`/api/v1/public/jobs${queryString}`)
    });
    const jobsPage = data || emptyJobsPage(pageSize);

    return (
        <main className="page-section">
            <div className="card stack page-intro">
                <div className="section-title"><h1 style={{margin: 0}}>Open vacancies</h1><span className="badge">{jobsPage.totalItems} live roles</span>
                </div>
                <div className="form-grid">
                    <input className="input" placeholder="Search title or description" value={search}
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
                </div>
            </div>
            <div className="grid-3" style={{marginTop: '1rem'}}>
                {isLoading && <div className="card empty-state">Loading jobs...</div>}
                {error instanceof Error && <div className="card empty-state">{error.message}</div>}
                {jobsPage.items.map((job) => (
                    <div className="card job-card" key={job.id.toString()}>
                        <div className="badge">{job.discipline}</div>
                        <h3>{job.title}</h3>
                        <p className="muted">{job.location} • {job.band || 'Band open'} • {job.employmentType}</p>
                        <p><strong>£{job.payRateMin} - £{job.payRateMax}</strong></p>
                        <Link className="btn" href={`/jobs/${job.id}`}>View role</Link>
                    </div>
                ))}
                {!isLoading && !error && jobsPage.items.length === 0 && (
                    <div className="card empty-state">No jobs match the selected filters.</div>
                )}
            </div>
            <div style={{marginTop: '1rem'}}>
                <PaginationControls
                    page={jobsPage.page}
                    totalPages={jobsPage.totalPages}
                    hasPrevious={jobsPage.hasPrevious}
                    hasNext={jobsPage.hasNext}
                    onPageChange={setPage}
                />
            </div>
        </main>
    );
}
