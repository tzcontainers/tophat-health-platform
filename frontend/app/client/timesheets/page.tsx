'use client';
import {apiGet, apiJson} from '@/lib/api';
import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';

export default function ClientTimesheetsPage() {
    const {data, refetch} = useQuery({
        queryKey: ['client-timesheets-page'],
        queryFn: () => apiGet<any[]>('/api/v1/client/timesheets/pending', 'client')
    });
    const [message, setMessage] = useState('');

    async function act(id: string, action: 'approve' | 'reject') {
        await apiJson(`/api/v1/client/timesheets/${id}/${action}`, 'POST', {comment: action === 'approve' ? 'Approved in portal' : 'Needs correction'}, 'client');
        await refetch();
        setMessage(`Timesheet ${action}d.`);
    }

    return (
        <div className="page-section stack">
            <div className="card table-wrap">
                <div className="section-title"><h1 style={{margin: 0}}>Pending timesheets</h1><span className="badge">Approve / reject</span>
                </div>
                <table>
                    <thead>
                    <tr>
                        <th>Candidate</th>
                        <th>Week</th>
                        <th>Total hours</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data?.map((timesheet) => <tr key={timesheet.id}>
                        <td>{timesheet.candidateName}</td>
                        <td>{timesheet.weekCommencing}</td>
                        <td>{timesheet.totalHours}</td>
                        <td style={{display: 'flex', gap: '0.5rem'}}>
                            <button className="btn ghost" onClick={() => act(timesheet.id, 'approve')}>Approve</button>
                            <button className="btn secondary" onClick={() => act(timesheet.id, 'reject')}>Reject
                            </button>
                        </td>
                    </tr>)}
                    </tbody>
                </table>
            </div>
            {message && <div className="notice">{message}</div>}
        </div>
    );
}
