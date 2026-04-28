'use client';
import {useQuery} from '@tanstack/react-query';
import {apiGet} from '@/lib/api';

export default function CandidateMessagesPage() {
    const {data} = useQuery({
        queryKey: ['candidate-messages'],
        queryFn: () => apiGet<any[]>('/api/v1/candidates/me/messages', 'candidate')
    });
    return (
        <div className="page-section stack">
            <div className="section-title"><h1 style={{margin: 0}}>Messages</h1><span
                className="badge">Inbox</span></div>
            {data?.map((message) => (
                <div className="card" key={message.id}>
                    <div className="badge">{message.from}</div>
                    <h3>{message.subject}</h3>
                    <p className="muted">{message.sentAt}</p>
                    <p>{message.body}</p>
                </div>
            ))}
        </div>
    );
}
