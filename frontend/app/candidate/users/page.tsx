'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiJson, apiDelete } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function CandidateAdminUsersPage() {
    const queryClient = useQueryClient();
    const [message, setMessage] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('CANDIDATE');
    const [adminRole, setAdminRole] = useState(false);

    useEffect(() => {
        setAdminRole(localStorage.getItem('th_role') === 'ADMIN');
    }, []);

    const { data: users, isLoading, error } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => apiGet<any[]>('/api/v1/admin/users', 'admin'),
        enabled: adminRole
    });

    const createUserMutation = useMutation({
        mutationFn: ({ username, password, role }: { username: string; password: string; role: string }) =>
            apiJson('/api/v1/admin/users', 'POST', { username, password, role }, 'admin'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setMessage('User created successfully.');
            setNewUsername('');
            setNewPassword('');
        },
        onError: (err: any) => setMessage(`Error: ${err.message}`)
    });

    const deleteUserMutation = useMutation({
        mutationFn: (userId: string) => apiDelete(`/api/v1/admin/users/${userId}`, 'admin'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setMessage('User removed.');
        },
        onError: (err: any) => setMessage(`Error: ${err.message}`)
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: string, role: string }) =>
            apiJson(`/api/v1/admin/users/${userId}/role`, 'PATCH', { role }, 'admin'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setMessage('Role updated.');
        },
        onError: (err: any) => setMessage(`Error: ${err.message}`)
    });

    if (!adminRole) return <div className="notice danger">Access Denied: Administrator role required.</div>;
    if (isLoading) return <div className="card">Loading system users...</div>;

    return (
        <div className="stack">
            <div className="section-title">
                <h1 style={{ margin: 0 }}>System User Management</h1>
                <span className="badge">Admin View</span>
            </div>

            {error && <div className="notice error">Failed to load users: {(error as any).message}</div>}
            {message && <div className="notice">{message}</div>}

            <div className="card stack">
                <h3>Create New User</h3>
                <div className="form-grid">
                    <div>
                        <label>Email Address</label>
                        <input className="input" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="email@example.com" />
                    </div>
                    <div>
                        <label>Password</label>
                        <input className="input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    <div>
                        <label>Role</label>
                        <select className="select" value={newRole} onChange={e => setNewRole(e.target.value)}>
                            <option value="CANDIDATE">CANDIDATE</option>
                            <option value="CLIENT_ADMIN">CLIENT_ADMIN</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </div>
                </div>
                <button className="btn" onClick={() => createUserMutation.mutate({ username: newUsername, password: newPassword, role: newRole })} disabled={!newUsername}>
                    Create User
                </button>
            </div>

            <div className="card table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.map((user: any) => (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td><span className={`badge ${user.role === 'ADMIN' ? 'success' : ''}`}>{user.role}</span></td>
                                <td>
                                    <div className="row-actions">
                                        <select className="select compact" value={user.role} onChange={e => updateRoleMutation.mutate({ userId: user.id, role: e.target.value })}>
                                            <option value="CANDIDATE">CANDIDATE</option>
                                            <option value="CLIENT_ADMIN">CLIENT_ADMIN</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                        <button className="btn secondary compact" onClick={() => deleteUserMutation.mutate(user.id)} disabled={user.username === 'admin@tophat.com'}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
