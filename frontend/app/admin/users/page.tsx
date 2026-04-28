'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiJson, apiDelete } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminUsersPage() {
    const queryClient = useQueryClient();
    const [message, setMessage] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('CANDIDATE');

    const { data: users, isLoading, error } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => apiGet<any[]>('/api/v1/admin/users', 'admin')
    });

    useEffect(() => {
        if (users) {
            console.log('AdminUsersPage - Loaded users:', users);
        }
        if (error) {
            console.error('AdminUsersPage - Error:', error);
        }
    }, [users, error]);

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

    if (isLoading) return <div className="card">Loading system users...</div>;

    return (
        <div className="stack">
            <div className="section-title">
                <h1 style={{ margin: 0 }}>User Management</h1>
                <span className="badge">Total: {users?.length || 0}</span>
            </div>

            {error && <div className="notice error">Failed to load users: {(error as any).message}</div>}
            {message && <div className="notice">{message}</div>}

            <div className="card stack">
                <h3>Add New User</h3>
                <div className="form-grid">
                    <div>
                        <label>Username (Email)</label>
                        <input className="input" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="email@example.com" />
                    </div>
                    <div>
                        <label>Password</label>
                        <input className="input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Temporary password" />
                    </div>
                    <div>
                        <label>Initial Role</label>
                        <select className="select" value={newRole} onChange={e => setNewRole(e.target.value)}>
                            <option value="CANDIDATE">CANDIDATE</option>
                            <option value="CLIENT_ADMIN">CLIENT_ADMIN</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </div>
                </div>
                <button 
                    className="btn" 
                    onClick={() => createUserMutation.mutate({ username: newUsername, password: newPassword, role: newRole })}
                    disabled={!newUsername || createUserMutation.isPending}
                >
                    Create User
                </button>
            </div>

            <div className="card table-wrap">
                {users && users.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user: any) => (
                                <tr key={user.id}>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>{user.username}</div>
                                        <div className="muted" style={{ fontSize: '0.75rem' }}>ID: {user.id}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${user.role === 'ADMIN' ? 'success' : ''}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="row-actions">
                                            <select 
                                                className="select compact" 
                                                value={user.role} 
                                                onChange={e => updateRoleMutation.mutate({ userId: user.id, role: e.target.value })}
                                                disabled={updateRoleMutation.isPending}
                                            >
                                                <option value="CANDIDATE">CANDIDATE</option>
                                                <option value="CLIENT_ADMIN">CLIENT_ADMIN</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                            <button 
                                                className="btn secondary compact" 
                                                onClick={() => deleteUserMutation.mutate(user.id)}
                                                disabled={deleteUserMutation.isPending || user.username === 'admin@tophat.com'}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center' }} className="muted">
                        No users found in the system.
                        <pre style={{ textAlign: 'left', fontSize: '0.7rem', marginTop: '1rem', background: '#f5f5f5', padding: '0.5rem' }}>
                            Debug info: {JSON.stringify({ users, loading: isLoading, error: !!error }, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
