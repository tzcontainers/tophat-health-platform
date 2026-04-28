'use client';
import {apiGet, apiJson} from '@/lib/api';
import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';

export default function AdminReportsPage() {
    const compliance = useQuery({
        queryKey: ['admin-reports-compliance'],
        queryFn: () => apiGet<any[]>('/api/v1/admin/reports/compliance', 'admin')
    });
    const timesheets = useQuery({
        queryKey: ['admin-reports-timesheets'],
        queryFn: () => apiGet<any[]>('/api/v1/admin/timesheets', 'admin')
    });
    const [message, setMessage] = useState('');

    async function sendNotification() {
        const result = await apiJson<any>('/api/v1/admin/notifications/send', 'POST', {
            audience: 'CANDIDATES',
            subject: 'Compliance reminder',
            body: 'Please check expiring documents.'
        }, 'admin');
        setMessage(`Notification ${result.status.toLowerCase()} for ${result.audience}.`);
    }

    return (
        <div className="page-section stack">
            <div className="section-title"><h1 style={{margin: 0}}>Reports and notifications</h1>
                <button className="btn" onClick={sendNotification}>Send notification</button>
            </div>
            <div className="grid-2">
                <div className="card table-wrap">
                    <h3>Compliance report</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>Candidate</th>
                            <th>Requirement</th>
                            <th>Status</th>
                            <th>Expiry</th>
                            <th>Notes</th>
                        </tr>
                        </thead>
                        <tbody>
                        {compliance.data?.map((row) => <tr key={row.documentId}>
                            <td>{row.candidateName}</td>
                            <td>{row.requirement}</td>
                            <td>{row.status}</td>
                            <td>{row.expiryDate}</td>
                            <td>{row.reviewNotes}</td>
                        </tr>)}
                        </tbody>
                    </table>
                </div>
                <div className="card table-wrap">
                    <h3>Timesheet report</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>Candidate</th>
                            <th>Client</th>
                            <th>Week</th>
                            <th>Hours</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {timesheets.data?.map((row) => <tr key={row.id}>
                            <td>{row.candidateName}</td>
                            <td>{row.clientName}</td>
                            <td>{row.weekCommencing}</td>
                            <td>{row.totalHours}</td>
                            <td>{row.status}</td>
                        </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
            {message && <div className="notice">{message}</div>}
        </div>
    );
}
