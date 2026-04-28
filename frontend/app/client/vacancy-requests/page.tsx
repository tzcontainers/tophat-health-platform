'use client';
import {apiJson} from '@/lib/api';
import {useState} from 'react';

const siteId = '00000000-0000-0000-0000-000000000302';

export default function ClientVacancyRequestsPage() {
    const [message, setMessage] = useState('');

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const result = await apiJson<any>('/api/v1/client/vacancy-requests', 'POST', {
            siteId,
            title: form.get('title'),
            discipline: form.get('discipline'),
            band: form.get('band'),
            shiftPattern: form.get('shiftPattern'),
            notes: form.get('notes')
        }, 'client');
        setMessage(`Vacancy request created with id ${result.id}`);
        event.currentTarget.reset();
    }

    return (
        <div className="page-section stack">
            <form className="card stack" onSubmit={onSubmit}>
                <div className="section-title"><h1 style={{margin: 0}}>Create vacancy request</h1><span
                    className="badge">New request</span></div>
                <div className="form-grid">
                    <input className="input" name="title" placeholder="Role title" required/>
                    <input className="input" name="discipline" placeholder="Discipline" required/>
                    <input className="input" name="band" placeholder="Band"/>
                    <input className="input" name="shiftPattern" placeholder="Shift pattern"/>
                </div>
                <textarea className="textarea" name="notes" placeholder="Context, rota notes, urgent coverage details"/>
                <button className="btn">Submit vacancy request</button>
            </form>
            {message && <div className="notice">{message}</div>}
        </div>
    );
}
