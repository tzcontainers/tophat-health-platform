'use client';
import {apiGet, apiJson} from '@/lib/api';
import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';

export default function CandidateTimesheetsPage() {
    const {data, refetch} = useQuery({
        queryKey: ['candidate-timesheets-page'],
        queryFn: () => apiGet<any[]>('/api/v1/candidates/me/timesheets', 'candidate')
    });
    const placements = useQuery({
        queryKey: ['candidate-timesheet-placements'],
        queryFn: () => apiGet<any[]>('/api/v1/candidates/me/placements', 'candidate')
    });
    const [message, setMessage] = useState('');

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const placementId = form.get('placementId');
        await apiJson('/api/v1/candidates/me/timesheets', 'POST', {
            placementId,
            weekCommencing: form.get('weekCommencing'),
            lines: [
                {
                    shiftDate: form.get('shiftDate'),
                    startTime: form.get('startTime'),
                    endTime: form.get('endTime'),
                    breakMinutes: Number(form.get('breakMinutes') || 0),
                    hoursWorked: Number(form.get('hoursWorked') || 0)
                }
            ]
        }, 'candidate');
        await refetch();
        setMessage('Timesheet submitted.');
        event.currentTarget.reset();
    }

    return (
        <div className="page-section stack">
            <form className="card stack" onSubmit={onSubmit}>
                <div className="section-title"><h1 style={{margin: 0}}>Timesheets</h1><span
                    className="badge">Shift submission</span></div>
                <div className="form-grid">
                    <select className="select" name="placementId" required data-testid="timesheet-placement-select">
                        <option value="">Select placement</option>
                        {placements.data?.map((placement) => (
                            <option key={placement.id} value={placement.id}>
                                {placement.jobTitle} · {placement.clientName}
                            </option>
                        ))}
                    </select>
                    <input className="input" type="date" name="weekCommencing" required/>
                    <input className="input" type="date" name="shiftDate" required/>
                    <input className="input" type="time" name="startTime" required/>
                    <input className="input" type="time" name="endTime" required/>
                    <input className="input" type="number" name="breakMinutes" placeholder="Break minutes"/>
                    <input className="input" type="number" step="0.5" name="hoursWorked" placeholder="Hours worked"
                           required/>
                </div>
                <button className="btn">Submit timesheet</button>
            </form>
            <div className="card table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th>Week</th>
                        <th>Status</th>
                        <th>Total hours</th>
                        <th>Comment</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data?.map((timesheet) => <tr key={timesheet.id}>
                        <td>{timesheet.weekCommencing}</td>
                        <td>{timesheet.status}</td>
                        <td>{timesheet.totalHours}</td>
                        <td>{timesheet.approvalComment}</td>
                    </tr>)}
                    </tbody>
                </table>
            </div>
            {message && <div className="notice">{message}</div>}
        </div>
    );
}
