'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiJson, apiDelete } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function CandidateAdminTeamsPage() {
    const queryClient = useQueryClient();
    const [message, setMessage] = useState('');
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [memberRole, setMemberRole] = useState('MEMBER');
    const [adminRole, setAdminRole] = useState(false);

    useEffect(() => {
        setAdminRole(localStorage.getItem('th_role') === 'ADMIN');
    }, []);

    const { data: teams, isLoading: loadingTeams } = useQuery({
        queryKey: ['admin-teams'],
        queryFn: () => apiGet<any[]>('/api/v1/admin/teams', 'admin'),
        enabled: adminRole
    });

    const { data: users } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => apiGet<any[]>('/api/v1/admin/users', 'admin'),
        enabled: adminRole
    });

    const { data: members, isLoading: loadingMembers } = useQuery({
        queryKey: ['admin-team-members', selectedTeamId],
        queryFn: () => apiGet<any[]>(`/api/v1/admin/teams/${selectedTeamId}/members`, 'admin'),
        enabled: !!selectedTeamId && adminRole
    });

    const createTeamMutation = useMutation({
        mutationFn: ({ name, description }: { name: string; description: string }) =>
            apiJson('/api/v1/admin/teams', 'POST', { name, description }, 'admin'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-teams'] });
            setMessage('Team created.');
            setNewName('');
            setNewDescription('');
        },
        onError: (err: any) => setMessage(`Error: ${err.message}`)
    });

    const deleteTeamMutation = useMutation({
        mutationFn: (teamId: string) => apiDelete(`/api/v1/admin/teams/${teamId}`, 'admin'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-teams'] });
            if (selectedTeamId === deleteTeamMutation.variables) setSelectedTeamId(null);
            setMessage('Team deleted.');
        },
        onError: (err: any) => setMessage(`Error: ${err.message}`)
    });

    const addMemberMutation = useMutation({
        mutationFn: ({ teamId, userId, role }: { teamId: string; userId: string; role: string }) =>
            apiJson(`/api/v1/admin/teams/${teamId}/members`, 'POST', { userId, role }, 'admin'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-team-members', selectedTeamId] });
            queryClient.invalidateQueries({ queryKey: ['admin-teams'] });
            setMessage('Member added.');
            setSelectedUserId('');
        },
        onError: (err: any) => setMessage(`Error: ${err.message}`)
    });

    const removeMemberMutation = useMutation({
        mutationFn: (memberId: string) => apiDelete(`/api/v1/admin/teams/members/${memberId}`, 'admin'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-team-members', selectedTeamId] });
            queryClient.invalidateQueries({ queryKey: ['admin-teams'] });
            setMessage('Member removed.');
        },
        onError: (err: any) => setMessage(`Error: ${err.message}`)
    });

    if (!adminRole) return <div className="notice danger">Access Denied.</div>;
    if (loadingTeams) return <div className="card">Loading teams...</div>;

    const selectedTeam = teams?.find(t => t.id === selectedTeamId);

    return (
        <div className="stack">
            <div className="section-title">
                <h1 style={{ margin: 0 }}>Team Management</h1>
                <span className="badge">Admin View</span>
            </div>

            {message && <div className="notice">{message}</div>}

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                <div className="stack">
                    <div className="card stack">
                        <h3>Create Team</h3>
                        <input className="input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Team Name" />
                        <input className="input" value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Description" />
                        <button className="btn" onClick={() => createTeamMutation.mutate({ name: newName, description: newDescription })} disabled={!newName}>Create</button>
                    </div>

                    <div className="card table-wrap">
                        <table>
                            <thead><tr><th>Name</th><th>Count</th><th>Action</th></tr></thead>
                            <tbody>
                                {teams?.map(t => (
                                    <tr key={t.id} onClick={() => setSelectedTeamId(t.id)} style={{ cursor: 'pointer', background: selectedTeamId === t.id ? 'var(--bg-hover)' : 'transparent' }}>
                                        <td>{t.name}</td>
                                        <td>{t.memberCount}</td>
                                        <td><button className="btn secondary compact" onClick={e => { e.stopPropagation(); deleteTeamMutation.mutate(t.id); }}>Delete</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="stack">
                    {selectedTeamId ? (
                        <div className="card stack">
                            <h3>Members: {selectedTeam?.name}</h3>
                            <div className="row-actions">
                                <select className="select" style={{ flex: 1 }} value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
                                    <option value="">Add user...</option>
                                    {users?.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                                </select>
                                <button className="btn" disabled={!selectedUserId} onClick={() => addMemberMutation.mutate({ teamId: selectedTeamId, userId: selectedUserId, role: memberRole })}>Add</button>
                            </div>
                            <div className="table-wrap">
                                <table>
                                    <thead><tr><th>User</th><th>Role</th><th>Action</th></tr></thead>
                                    <tbody>
                                        {members?.map(m => (
                                            <tr key={m.id}>
                                                <td>{m.username}</td>
                                                <td>{m.role}</td>
                                                <td><button className="btn secondary compact" onClick={() => removeMemberMutation.mutate(m.id)}>Remove</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : <div className="card muted">Select a team to manage members</div>}
                </div>
            </div>
        </div>
    );
}
