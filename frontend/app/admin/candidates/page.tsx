'use client';
import {apiGet} from '@/lib/api';
import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';

export default function AdminCandidatesPage() {
    const {data} = useQuery({
        queryKey: ['admin-candidates-page'],
        queryFn: () => apiGet<any[]>('/api/v1/admin/candidates', 'admin')
    });
    const [selected, setSelected] = useState<string>('00000000-0000-0000-0000-000000000201');
    const detail = useQuery({
        queryKey: ['admin-candidate-detail', selected],
        queryFn: () => apiGet<any>(`/api/v1/admin/candidates/${selected}`, 'admin')
    });
    return (
        <div className="page-section grid-2">
            <div className="card table-wrap">
                <div className="section-title"><h1 style={{margin: 0}}>Candidates</h1><span className="badge">Talent records</span>
                </div>
                <table>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data?.map((candidate) => <tr key={candidate.id} onClick={() => setSelected(candidate.id)}
                                                  style={{cursor: 'pointer'}}>
                        <td>{candidate.name}</td>
                        <td>{candidate.status}</td>
                    </tr>)}
                    </tbody>
                </table>
            </div>
            <div className="card table-wrap">
                <div className="section-title"><h3 style={{margin: 0}}>Selected candidate</h3><span className="badge">Profile detail</span>
                </div>
                <div className="stack">
                    <div><strong>Name:</strong> {detail.data?.name}</div>
                    <div><strong>Email:</strong> {detail.data?.email}</div>
                    <table>
                        <thead>
                        <tr>
                            <th>Requirement</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {detail.data?.documents?.map((doc: any) => <tr key={doc.id}>
                            <td>{doc.requirementName}</td>
                            <td>{doc.verificationStatus}</td>
                        </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
