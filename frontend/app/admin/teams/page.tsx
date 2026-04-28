'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiJson, apiDelete } from '@/lib/api';
import { useState } from 'react';

export default function AdminTeamsPage() {
    const queryClient = useQueryClient();
    const [message, setMessage] = useState('');
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [memberRole, setMemberRole] = useState('MEMBER');

    const { data: teams, isLoading: loadingTeams } = useQuery({
        queryKey: ['admin-teams'],
        queryFn: () => apiGet<any[]>('/api/v1/admin/teams', 'admin')
    });

    const { data: users } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => apiGet<any[]>('/api/v1/admin/users', 'admin')
    });

    const { data: members, isLoading: loadingMembers } = useQuery({
        queryKey: ['admin-team-members', selectedTeamId],
        queryFn: () => apiGet<any[]>(`/api/v1/admin/teams/${selectedTeamId}/members`, 'admin'),
        enabled: !!selectedTeamId
    });

    const createTeamMutation = useMutation({
        mutationFn: ({ name, description }: { name: string; description: string }) =>
            apiJson('/api/v1/admin/teams', 'POST', { name, description }, 'admin'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-teams'] });
            setMessage('Team created successfully.');
            setNewName('');
            setNewDescription('');
        },
        onError: (error: any) => setMessage(`Error: ${error.message}`)
    });

    const deleteTeamMutation = useMutation({
        mutationFn: (teamId: string) => apiDelete(`/api/v1/admin/teams/${teamId}`, 'admin'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-teams'] });
            if (selectedTeamId === deleteTeamMutation.variables) setSelectedTeamId(null);
            setMessage('Team deleted.');
        },
        onError: (error: any) => setMessage(`Error: ${error.message}`)
    });

    const addMemberMutation = useMutation({
        mutationFn: ({ teamId, userId, role }: { teamId: string; userId: string; role: string }) =>
            apiJson(`/api/v1/admin/teams/${teamId}/members`, 'POST', { userId, role }, 'admin'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-team-members', selectedTeamId] });
            queryClient.invalidateQueries({ queryKey: ['admin-teams'] });
            setMessage('Member added to team.');
            setSelectedUserId('');
        },
        onError: (error: any) => setMessage(`Error: ${error.message}`)
    });

    const removeMemberMutation = useMutation({
        mutationFn: (memberId: string) => apiDelete(`/api/v1/admin/teams/members/${memberId}`, 'admin'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-team-members', selectedTeamId] });
            queryClient.invalidateQueries({ queryKey: ['admin-teams'] });
            setMessage('Member removed from team.');
        },
        onError: (error: any) => setMessage(`Error: ${error.message}`)
    });

    if (loadingTeams) return <div className="card">Loading teams...</div>;

    const selectedTeam = teams?.find(t => t.id === selectedTeamId);

    return (
        <div className="stack">
            <div className="section-title">
                <h1 style={{ margin: 0 }}>Team management</h1>
                <span className="badge">Internal teams</span>
            </div>

            {message && <div className="notice">{message}</div>}

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                <div className="stack">
                    <div className="card stack">
                        <div className="section-title">
                            <h2 style={{ margin: 0 }}>Create team</h2>
                        </div>
                        <div className="form-grid">
                            <div>
                                <label htmlFor="teamName">Team Name</label>
                                <input
                                    id="teamName"
                                    className="input"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. Compliance North"
                                />
                            </div>
                            <div>
                                <label htmlFor="teamDesc">Description</label>
                                <input
                                    id="teamDesc"
                                    className="input"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Optional description"
                                />
                            </div>
                        </div>
                        <button
                            className="btn"
                            onClick={() => createTeamMutation.mutate({ name: newName, description: newDescription })}
                            disabled={createTeamMutation.isPending || !newName}
                        >
                            Create team
                        </button>
                    </div>

                    <div className="card table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Members</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams?.map((team) => (
                                    <tr key={team.id} className={selectedTeamId === team.id ? 'active-row' : ''} onClick={() => setSelectedTeamId(team.id)} style={{ cursor: 'pointer' }}>
                                        <td>
                                            <strong>{team.name}</strong>
                                            <div className="muted" style={{ fontSize: '0.8rem' }}>{team.description}</div>
                                        </td>
                                        <td>{team.memberCount}</td>
                                        <td>
                                            <button
                                                className="btn secondary compact"
                                                onClick={(e) => { e.stopPropagation(); deleteTeamMutation.mutate(team.id); }}
                                                disabled={deleteTeamMutation.isPending}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="stack">
                    {selectedTeamId ? (
                        <div className="card stack">
                            <div className="section-title">
                                <h2 style={{ margin: 0 }}>Members: {selectedTeam?.name}</h2>
                                <span className="badge">{members?.length || 0} users</span>
                            </div>

                            <div className="row-actions" style={{ padding: '0.5rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
                                <select 
                                    className="select" 
                                    style={{ flex: 1 }}
                                    value={selectedUserId} 
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                >
                                    <option value="">Select a user...</option>
                                    {users?.map(u => (
                                        <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                                    ))}
                                </select>
                                <select 
                                    className="select compact"
                                    value={memberRole}
                                    onChange={(e) => setMemberRole(e.target.value)}
                                >
                                    <option value="MEMBER">MEMBER</option>
                                    <option value="LEAD">LEAD</option>
                                    <option value="MANAGER">MANAGER</option>
                                </select>
                                <button 
                                    className="btn" 
                                    disabled={!selectedUserId || addMemberMutation.isPending}
                                    onClick={() => addMemberMutation.mutate({ teamId: selectedTeamId, userId: selectedUserId, role: memberRole })}
                                >
                                    Add
                                </button>
                            </div>

                            {loadingMembers ? (
                                <p>Loading members...</p>
                            ) : (
                                <div className="table-wrap">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Username</th>
                                                <th>Role</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {members?.map((m) => (
                                                <tr key={m.id}>
                                                    <td>{m.username}</td>
                                                    <td><span className="badge">{m.role}</span></td>
                                                    <td>
                                                        <button 
                                                            className="btn secondary compact"
                                                            onClick={() => removeMemberMutation.mutate(m.id)}
                                                            disabled={removeMemberMutation.isPending}
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!members || members.length === 0) && (
                                                <tr>
                                                    <td colSpan={3} style={{ textAlign: 'center' }} className="muted">No members in this team yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="card muted" style={{ textAlign: 'center', padding: '3rem' }}>
                            Select a team to manage its members
                        </div>
                    )}
                </div>
            </div>
            <style jsx>{`
                .active-row {
                    background: var(--bg-hover);
                }
            `}</style>
        </div>
    );
}
