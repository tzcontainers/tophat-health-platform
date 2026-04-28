'use client';
import {apiJson} from '@/lib/api';
import {useState} from 'react';

export default function RegisterPage() {
    const [role, setRole] = useState<'candidate' | 'client'>('candidate');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const form = new FormData(event.currentTarget);
        try {
            if (role === 'candidate') {
                const result = await apiJson<any>('/api/v1/public/candidates/register', 'POST', {
                    firstName: form.get('firstName'),
                    lastName: form.get('lastName'),
                    email: form.get('email'),
                    password: form.get('password'),
                    phone: form.get('phone'),
                    primaryDiscipline: form.get('primaryDiscipline')
                }, 'public');
                setMessage(`Candidate registration successful. Candidate number: ${result.candidateNumber}`);
            } else {
                const result = await apiJson<any>('/api/v1/public/clients/register', 'POST', {
                    name: form.get('name'),
                    email: form.get('email'),
                    password: form.get('password')
                }, 'public');
                setMessage(`Client registration successful. Client code: ${result.clientCode}`);
            }
            event.currentTarget.reset();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Could not complete registration');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page compact">
            <section className="auth-visual">
                <div>
                    <div className="eyebrow">Join TopHat</div>
                    <h1>{role === 'candidate' ? 'Build your healthcare work profile.' : 'Open a client staffing workspace.'}</h1>
                    <p>
                        Registration connects directly to the backend onboarding flow, creating the right account,
                        role, and portal access for your next step.
                    </p>
                </div>
            </section>

            <section className="auth-card card stack">
                <div className="tabs">
                    <button
                        type="button"
                        className={`tab ${role === 'candidate' ? 'active' : ''}`}
                        onClick={() => { setRole('candidate'); setMessage(''); }}
                    >
                        Candidate
                    </button>
                    <button
                        type="button"
                        className={`tab ${role === 'client' ? 'active' : ''}`}
                        onClick={() => { setRole('client'); setMessage(''); }}
                    >
                        Client
                    </button>
                </div>

                <form className="stack" onSubmit={onSubmit}>
                    <div className="section-title">
                        <h1 style={{margin: 0}}>{role === 'candidate' ? 'Candidate' : 'Client'} registration</h1>
                    </div>
                    
                    <div className="form-grid">
                        {role === 'candidate' ? (
                            <>
                                <input className="input" name="firstName" placeholder="First name" required/>
                                <input className="input" name="lastName" placeholder="Last name" required/>
                            </>
                        ) : (
                            <input className="input" name="name" placeholder="Company Name" required style={{gridColumn: '1 / -1'}}/>
                        )}
                        <input className="input" name="email" type="email" placeholder="Email" required/>
                        <input className="input" name="password" type="password" placeholder="Password" required/>
                        
                        {role === 'candidate' && (
                            <>
                                <input className="input" name="phone" placeholder="Phone"/>
                                <input className="input" name="primaryDiscipline" placeholder="Primary discipline"/>
                            </>
                        )}
                    </div>
                    
                    <button className="btn block" disabled={loading}>
                        {loading ? 'Submitting...' : `Register ${role}`}
                    </button>
                    {message && <div className="notice">{message}</div>}
                </form>
            </section>
        </main>
    );
}
