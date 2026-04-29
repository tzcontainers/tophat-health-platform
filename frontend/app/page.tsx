import Link from 'next/link';
import {apiGet} from '@/lib/api';
import {ContactRequestForm} from '@/components/ContactRequestForm';
import {PaginatedJobs} from '@/lib/jobs';

type Job = {
    id: string | number;
    discipline: string;
    title: string;
    location: string;
    employmentType: string;
    payRateMin: string | number;
    payRateMax: string | number;
};

async function getFeaturedJobs(): Promise<{jobs: Job[]; error: string | null}> {
    try {
        const jobs = await apiGet<PaginatedJobs>('/api/v1/public/jobs?page=0&size=3');
        return {jobs: jobs.items, error: null};
    } catch {
        return {
            jobs: [],
            error: 'Live jobs are temporarily unavailable. Please check back shortly.'
        };
    }
}

export default async function HomePage() {
    const {jobs: featured, error} = await getFeaturedJobs();

    return (
        <main className="page-section">
            <section className="hero product-hero">
                <div className="hero-copy-block">
                    <div className="eyebrow">TopHat Health Care</div>
                    <h1>Healthcare staffing, compliance, and timesheets in one operating system.</h1>
                    <p>
                        A secure portal for candidates, care providers, and operations teams to move vacancies,
                        placements, documents, and approvals through the same backend workflow.
                    </p>
                    <div className="hero-actions">
                        <Link className="btn" href="/jobs">Browse jobs</Link>
                        <Link className="btn secondary" href="/register">Register as candidate</Link>
                    </div>
                </div>
                <div className="operations-panel card">
                    <div className="panel-header">
                        <span>Live Operations</span>
                        <strong>Today</strong>
                    </div>
                    <div className="ops-list">
                        <div><span>Compliance</span><strong>3 documents in review</strong></div>
                        <div><span>Timesheets</span><strong>1 pending client approval</strong></div>
                        <div><span>Vacancies</span><strong>{featured.length || 3} published roles</strong></div>
                    </div>
                    <div className="progress-track"><span style={{width: '72%'}}/></div>
                </div>
            </section>

            <section className="grid-4">
                <div className="card feature-card"><strong>Candidate portal</strong><p className="muted">Profile, compliance, placements, timesheets, and messages.</p></div>
                <div className="card feature-card"><strong>Client portal</strong><p className="muted">Vacancy requests, placements, approvals, and workforce visibility.</p></div>
                <div className="card feature-card"><strong>Admin operations</strong><p className="muted">Candidate management, job publishing, compliance review, and reporting.</p></div>
                <div className="card feature-card"><strong>Secure backend</strong><p className="muted">JWT authentication, role access, and database-managed platform data.</p></div>
            </section>

            <section className="stack">
                <div className="section-title"><h2 style={{margin: 0}}>Featured live jobs</h2><Link href="/jobs"
                                                                                                    className="btn ghost">See
                    all</Link></div>
                {error && (
                    <div className="notice">
                        {error}
                    </div>
                )}
                <div className="grid-3">
                    {featured.map((job) => (
                        <div className="card" key={job.id.toString()}>
                            <div className="badge">{job.discipline}</div>
                            <h3>{job.title}</h3>
                            <p className="muted">{job.location} • {job.employmentType}</p>
                            <p><strong>£{job.payRateMin} - £{job.payRateMax}</strong></p>
                            <Link className="btn" href={`/jobs/${job.id}`}>View role</Link>
                        </div>
                    ))}
                    {!error && featured.length === 0 && (
                        <div className="card">No live jobs are available right now.</div>
                    )}
                </div>
            </section>
            <section className="stack">
                <ContactRequestForm/>
            </section>
        </main>
    );
}
