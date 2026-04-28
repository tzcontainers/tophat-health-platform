'use client';
import Link from 'next/link';
import {useQuery} from '@tanstack/react-query';
import {apiGet} from '@/lib/api';
import {useMemo, useState} from 'react';

export default function JobsPage() {
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (location) params.set('location', location);
        return params.toString() ? `?${params.toString()}` : '';
    }, [search, location]);
    const {data, isLoading, error} = useQuery({
        queryKey: ['jobs', queryString],
        queryFn: () => apiGet<any[]>(`/api/v1/public/jobs${queryString}`)
    });
    return (
        <main className="page-section">
            <div className="card stack page-intro">
                <div className="section-title"><h1 style={{margin: 0}}>Open vacancies</h1><span className="badge">Live roles</span>
                </div>
                <div className="form-grid">
                    <input className="input" placeholder="Search title or description" value={search}
                           onChange={(e) => setSearch(e.target.value)}/>
                    <input className="input" placeholder="Location" value={location}
                           onChange={(e) => setLocation(e.target.value)}/>
                </div>
            </div>
            <div className="grid-3" style={{marginTop: '1rem'}}>
                {isLoading && <div className="card empty-state">Loading jobs...</div>}
                {error instanceof Error && <div className="card empty-state">{error.message}</div>}
                {data?.map((job) => (
                    <div className="card job-card" key={job.id.toString()}>
                        <div className="badge">{job.discipline}</div>
                        <h3>{job.title}</h3>
                        <p className="muted">{job.location} • {job.employmentType}</p>
                        <p><strong>£{job.payRateMin} - £{job.payRateMax}</strong></p>
                        <Link className="btn" href={`/jobs/${job.id}`}>View role</Link>
                    </div>
                ))}
            </div>
        </main>
    );
}
