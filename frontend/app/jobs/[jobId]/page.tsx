import Link from 'next/link';
import {apiGet} from '@/lib/api';

type Job = {
    id: string | number;
    discipline: string;
    title: string;
    clientName: string;
    siteName?: string | null;
    location: string;
    band?: string | null;
    employmentType: string;
    payRateMin: string | number;
    payRateMax: string | number;
    description: string;
};

export default async function JobDetailPage({params}: { params: Promise<{ jobId: string }> }) {
    const {jobId} = await params;
    let job: Job | null = null;
    let error: string | null = null;

    try {
        job = await apiGet<Job>(`/api/v1/public/jobs/${jobId}`);
    } catch {
        error = 'This vacancy is temporarily unavailable. Please return to the jobs list.';
    }

    if (!job) {
        return (
            <main className="page-section">
                <div className="card stack">
                    <div className="badge">Role unavailable</div>
                    <h1 style={{margin: 0}}>We could not load this vacancy</h1>
                    <p className="muted">{error}</p>
                    <Link className="btn secondary" href="/jobs">Back to jobs</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="page-section">
            <div className="card stack">
                <div className="badge">{job.discipline}</div>
                <h1 style={{margin: 0}}>{job.title}</h1>
                <p className="muted">{job.clientName} • {job.siteName || job.location}</p>
                <div className="grid-3">
                    <div className="card"><strong>Band</strong><p>{job.band || 'TBC'}</p></div>
                    <div className="card"><strong>Employment type</strong><p>{job.employmentType}</p></div>
                    <div className="card"><strong>Pay</strong><p>£{job.payRateMin} - £{job.payRateMax}</p></div>
                </div>
                <p style={{lineHeight: 1.7}}>{job.description}</p>
                <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                    <Link className="btn" href="/register">Register interest</Link>
                    <Link className="btn secondary" href="/jobs">Back to jobs</Link>
                </div>
            </div>
        </main>
    );
}
