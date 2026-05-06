'use client';
import {apiGet, apiJson} from '@/lib/api';
import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';

export default function ClientVacancyRequestsPage() {
    const [message, setMessage] = useState('');
    const sites = useQuery({
        queryKey: ['client-sites'],
        queryFn: () => apiGet<any[]>('/api/v1/client/sites', 'client')
    });

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const result = await apiJson<any>('/api/v1/client/vacancy-requests', 'POST', {
            siteId: form.get('siteId'),
            title: form.get('title'),
            discipline: form.get('discipline'),
            band: form.get('band'),
            shiftPattern: form.get('shiftPattern'),
            notes: form.get('notes')
        }, 'client');
        setMessage(`Role request created with id ${result.id}`);
        event.currentTarget.reset();
    }

    return (
        <div className="page-section stack">
            <form className="card stack" onSubmit={onSubmit}>
                <div className="section-title"><h1 style={{margin: 0}}>Create role request</h1><span
                    className="badge">New request</span></div>
                <div className="form-grid">
                    <select className="select" name="siteId" required data-testid="vacancy-site-select">
                        <option value="">Select site</option>
                        {sites.data?.map((site) => (
                            <option key={site.id} value={site.id}>
                                {site.siteName} {site.city ? `· ${site.city}` : ''}
                            </option>
                        ))}
                    </select>
                    <input className="input" name="title" placeholder="Role title" required/>
                    <input className="input" name="discipline" placeholder="Discipline" required/>
                    <input className="input" name="band" placeholder="Band"/>
                    <input className="input" name="shiftPattern" placeholder="Shift pattern"/>
                </div>
                <textarea className="textarea" name="notes" placeholder="Context, rota notes, urgent coverage details"/>
                <button className="btn">Submit role request</button>
            </form>
            {message && <div className="notice">{message}</div>}
        </div>
    );
}
