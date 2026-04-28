'use client';
import {useQuery} from '@tanstack/react-query';
import {apiGet} from '@/lib/api';
import {TableCard} from '@/components/TableCard';

export default function CandidatePlacementsPage() {
    const {data} = useQuery({
        queryKey: ['candidate-placements-page'],
        queryFn: () => apiGet<any[]>('/api/v1/candidates/me/placements', 'candidate')
    });
    return (
        <div className="page-section">
            <TableCard title="Current placements">
                <table>
                    <thead>
                    <tr>
                        <th>Job</th>
                        <th>Client</th>
                        <th>Status</th>
                        <th>Start</th>
                        <th>Pay</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data?.map((placement) => <tr key={placement.id}>
                        <td>{placement.jobTitle}</td>
                        <td>{placement.clientName}</td>
                        <td>{placement.status}</td>
                        <td>{placement.startDate}</td>
                        <td>£{placement.payRate}</td>
                    </tr>)}
                    </tbody>
                </table>
            </TableCard>
        </div>
    );
}
