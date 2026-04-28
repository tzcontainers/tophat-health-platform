'use client';

import {apiJson} from '@/lib/api';
import {useState} from 'react';

export function ContactRequestForm() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setMessage('');

        const form = new FormData(event.currentTarget);

        try {
            const result = await apiJson<{id: string; status: string}>('/api/v1/public/contact-requests', 'POST', {
                name: form.get('name'),
                email: form.get('email'),
                phone: form.get('phone'),
                message: form.get('message')
            }, 'public');

            setMessage(`Request ${result.status.toLowerCase()}. Reference: ${result.id}`);
            event.currentTarget.reset();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Could not send contact request.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="card stack" onSubmit={onSubmit}>
            <div className="section-title">
                <h2 style={{margin: 0}}>Contact requests</h2>
                <span className="badge">Care team</span>
            </div>
            <div className="form-grid">
                <input className="input" name="name" placeholder="Name" required/>
                <input className="input" name="email" type="email" placeholder="Email" required/>
                <input className="input" name="phone" placeholder="Phone"/>
            </div>
            <textarea className="textarea" name="message" placeholder="Message"/>
            <button className="btn" disabled={loading}>{loading ? 'Sending...' : 'Send request'}</button>
            {message && <div className="notice">{message}</div>}
        </form>
    );
}
