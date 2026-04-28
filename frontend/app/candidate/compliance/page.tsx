'use client';
import {apiForm, apiGet} from '@/lib/api';
import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';

export default function CandidateCompliancePage() {
    const {data, refetch} = useQuery({
        queryKey: ['candidate-compliance-page'],
        queryFn: () => apiGet<any>('/api/v1/candidates/me/compliance', 'candidate')
    });
    const [message, setMessage] = useState('');

    async function onUpload(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        try {
            await apiForm('/api/v1/candidates/me/documents', form, 'candidate');
            await refetch();
            setMessage('Document uploaded.');
            event.currentTarget.reset();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Upload failed');
        }
    }

    return (
        <div className="page-section stack">
            <div className="section-title"><h1 style={{margin: 0}}>Compliance</h1><span className="badge">Document review</span>
            </div>
            <div className="notice">Overall status: {data?.overallStatus || 'Loading…'}</div>
            <form className="card stack" onSubmit={onUpload}>
                <h3 style={{margin: 0}}>Upload supporting document</h3>
                <div className="form-grid">
                    <select className="select" name="requirementId" required>
                        <option value="">Select requirement</option>
                        {data?.requirements?.map((requirement: any) => <option key={requirement.id}
                                                                               value={requirement.id}>{requirement.name}</option>)}
                    </select>
                    <input className="input" type="date" name="expiryDate"/>
                    <input className="input" type="file" name="file" required/>
                </div>
                <button className="btn">Upload document</button>
            </form>
            <div className="card table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th>Requirement</th>
                        <th>File</th>
                        <th>Status</th>
                        <th>Notes</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data?.documents?.map((doc: any) => <tr key={doc.id}>
                        <td>{doc.requirementName}</td>
                        <td>{doc.filename}</td>
                        <td>{doc.verificationStatus}</td>
                        <td>{doc.reviewNotes}</td>
                    </tr>)}
                    </tbody>
                </table>
            </div>
            {message && <div className="notice">{message}</div>}
        </div>
    );
}
