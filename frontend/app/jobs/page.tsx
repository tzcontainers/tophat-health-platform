'use client';
import Link from 'next/link';
import {useQuery} from '@tanstack/react-query';
import {apiGet} from '@/lib/api';
import {buildJobQuery, emptyJobsPage, PaginatedJobs} from '@/lib/jobs';
import {PaginationControls} from '@/components/PaginationControls';
import {useMemo, useState} from 'react';

const roleUseCases = [
    {
        label: 'Urgent cover',
        title: 'Same-week ward rota gap',
        description: 'Shortlist compliant clinicians by discipline, band, location, and pay before a shift window closes.',
        tags: ['Locum', 'Fast compliance', 'Client approval']
    },
    {
        label: 'Planned placement',
        title: 'Four-week community care block',
        description: 'Compare available candidates for a planned placement with clear rates, start dates, and site expectations.',
        tags: ['Block booking', 'Availability', 'Placement-ready']
    },
    {
        label: 'Specialist support',
        title: 'High-compliance theatre role',
        description: 'Filter for specialist experience and required documents before progressing candidates to operational review.',
        tags: ['Specialist', 'Documents', 'Review workflow']
    }
];

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
                <div className="section-title"><h1 style={{margin: 0}}>Open healthcare roles</h1><span className="badge">{jobsPage.totalItems} live roles</span>
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

            <section className="stack role-cases">
                <div className="section-title">
                    <h2 style={{margin: 0}}>Common staffing cases</h2>
                    <span className="badge">Role examples</span>
                </div>
                <div className="grid-3">
                    {roleUseCases.map((useCase) => (
                        <article className="card case-card" key={useCase.title}>
                            <span className="badge">{useCase.label}</span>
                            <h3>{useCase.title}</h3>
                            <p className="muted">{useCase.description}</p>
                            <div className="case-tags">
                                {useCase.tags.map((tag) => (
                                    <span key={tag}>{tag}</span>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <div className="grid-3" style={{marginTop: '1rem'}}>
                {isLoading && <div className="card empty-state">Loading roles...</div>}
                {error instanceof Error && <div className="card empty-state">{error.message}</div>}
                {jobsPage.items.map((job) => (
                    <div className="card job-card" key={job.id.toString()}>
                        <div className="badge">{job.discipline}</div>
                        <h3>{job.title}</h3>
                        <p className="muted">{job.location} • {job.band || 'Band flexible'} • {job.employmentType}</p>
                        <p><strong>£{job.payRateMin} - £{job.payRateMax}</strong></p>
                        <Link className="btn" href={`/jobs/${job.id}`}>View role</Link>
                    </div>
                ))}
                {!isLoading && !error && jobsPage.items.length === 0 && (
                    <div className="card empty-state">No roles match the selected filters.</div>
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
