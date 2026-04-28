'use client';
import {useQuery} from '@tanstack/react-query';
import {apiGet} from '@/lib/api';

export default function ClientPlacementsPage() {
    const {data} = useQuery({
        queryKey: ['client-placements-page'],
        queryFn: () => apiGet<any[]>('/api/v1/client/placements', 'client')
    });
    return (
        <div className="page-section card table-wrap">
            <div className="section-title"><h1 style={{margin: 0}}>Client placements</h1><span className="badge">Active work</span>
            </div>
            <table>
                <thead>
                <tr>
                    <th>Candidate</th>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Start</th>
                    <th>Charge rate</th>
                </tr>
                </thead>
                <tbody>
                {data?.map((placement) => <tr key={placement.id}>
                    <td>{placement.candidateName}</td>
                    <td>{placement.jobTitle}</td>
                    <td>{placement.status}</td>
                    <td>{placement.startDate}</td>
                    <td>£{placement.chargeRate}</td>
                </tr>)}
                </tbody>
            </table>
        </div>
    );
}
