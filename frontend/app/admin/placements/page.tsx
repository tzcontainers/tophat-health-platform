'use client';
import {apiJson} from '@/lib/api';
import {useState} from 'react';

export default function AdminPlacementsPage() {
    const [message, setMessage] = useState('');

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const result = await apiJson<any>('/api/v1/admin/placements', 'POST', {
            candidateId: form.get('candidateId'),
            jobId: form.get('jobId'),
            clientId: form.get('clientId'),
            siteId: form.get('siteId'),
            consultantName: form.get('consultantName'),
            startDate: form.get('startDate'),
            endDate: form.get('endDate'),
            status: 'ACTIVE',
            payRate: Number(form.get('payRate') || 30),
            chargeRate: Number(form.get('chargeRate') || 45)
        }, 'admin');
        setMessage(`Placement created: ${result.id}`);
    }

    return (
        <div className="page-section stack">
            <form className="card stack" onSubmit={onSubmit}>
                <div className="section-title"><h1 style={{margin: 0}}>Create placement</h1><span className="badge">Placement setup</span>
                </div>
                <div className="form-grid">
                    <input className="input" name="candidateId" defaultValue="00000000-0000-0000-0000-000000000201"/>
                    <input className="input" name="jobId" defaultValue="00000000-0000-0000-0000-000000000101"/>
                    <input className="input" name="clientId" defaultValue="00000000-0000-0000-0000-000000000301"/>
                    <input className="input" name="siteId" defaultValue="00000000-0000-0000-0000-000000000302"/>
                    <input className="input" name="consultantName" defaultValue="TopHat Consultant"/>
                    <input className="input" type="date" name="startDate" required/>
                    <input className="input" type="date" name="endDate"/>
                    <input className="input" type="number" step="0.5" name="payRate" placeholder="Pay rate"/>
                    <input className="input" type="number" step="0.5" name="chargeRate" placeholder="Charge rate"/>
                </div>
                <button className="btn">Create placement</button>
            </form>
            {message && <div className="notice">{message}</div>}
        </div>
    );
}
