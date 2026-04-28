'use client';
import {apiGet, apiJson} from '@/lib/api';
import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';

export default function AdminCompliancePage() {
    const {data, refetch} = useQuery({
        queryKey: ['admin-compliance-page'],
        queryFn: () => apiGet<any[]>('/api/v1/admin/reports/compliance', 'admin')
    });
    const [message, setMessage] = useState('');

    async function approveFirstPending() {
        const firstPending = data?.find((row) => row.status === 'PENDING');
        if (!firstPending) {
            setMessage('No pending records to review.');
            return;
        }
        await apiJson('/api/v1/admin/compliance/reviews', 'POST', {
            documentId: firstPending.documentId,
            status: 'APPROVED',
            notes: 'Approved from admin portal'
        }, 'admin');
        await refetch();
        setMessage('Compliance review submitted.');
    }

    return (
        <div className="page-section stack">
            <div className="card table-wrap">
                <div className="section-title"><h1 style={{margin: 0}}>Compliance review</h1>
                    <button className="btn" onClick={approveFirstPending}>Approve first pending</button>
                </div>
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
                    {data?.map((row) => <tr key={row.documentId}>
                        <td>{row.candidateName}</td>
                        <td>{row.requirement}</td>
                        <td>{row.status}</td>
                        <td>{row.expiryDate}</td>
                        <td>{row.reviewNotes}</td>
                    </tr>)}
                    </tbody>
                </table>
            </div>
            {message && <div className="notice">{message}</div>}
        </div>
    );
}
