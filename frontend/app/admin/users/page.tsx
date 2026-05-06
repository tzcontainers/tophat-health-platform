'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiJson, apiDelete } from '@/lib/api';
import { useState, useEffect } from 'react';

type AdminUser = {
    id: string;
    username: string;
    role: string;
    candidateId?: string;
    candidateName?: string;
    clientName?: string;
    authProvider?: string;
    emailVerified?: boolean;
    preferences?: Record<string, unknown>;
};

type PreferenceForm = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    summary: string;
    primaryDiscipline: string;
    band: string;
    yearsExperience: string;
    currentLocation: string;
    preferredRadiusMiles: string;
    availabilityStatus: string;
    availabilityNotes: string;
    availableFrom: string;
};

const roles = ['CANDIDATE', 'CLIENT_ADMIN', 'ADMIN'];

function text(value: unknown) {
    return value === null || value === undefined ? '' : String(value);
}

function preferencesFromUser(user?: AdminUser): PreferenceForm {
    const preferences = user?.preferences || {};
    return {
        firstName: text(preferences.firstName),
        lastName: text(preferences.lastName),
        email: text(preferences.email),
        phone: text(preferences.phone),
        dateOfBirth: text(preferences.dateOfBirth),
        summary: text(preferences.summary),
        primaryDiscipline: text(preferences.primaryDiscipline),
        band: text(preferences.band),
        yearsExperience: text(preferences.yearsExperience),
        currentLocation: text(preferences.currentLocation),
        preferredRadiusMiles: text(preferences.preferredRadiusMiles),
        availabilityStatus: text(preferences.availabilityStatus),
        availabilityNotes: text(preferences.availabilityNotes),
        availableFrom: text(preferences.availableFrom)
    };
}

export default function AdminUsersPage() {
    const queryClient = useQueryClient();
    const [message, setMessage] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('CANDIDATE');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [preferenceForm, setPreferenceForm] = useState<PreferenceForm>(preferencesFromUser());

    const { data: users, isLoading, error } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => apiGet<AdminUser[]>('/api/v1/admin/users', 'admin')
    });

    const selectedUser = users?.find((user) => user.id === selectedUserId) || users?.[0];

    useEffect(() => {
        if (users?.length && (!selectedUserId || !users.some((user) => user.id === selectedUserId))) {
            setSelectedUserId(users[0].id);
        }
    }, [selectedUserId, users]);

    useEffect(() => {
        setPreferenceForm(preferencesFromUser(selectedUser));
    }, [selectedUser]);

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

    const updatePreferencesMutation = useMutation({
        mutationFn: ({ userId, preferences }: { userId: string; preferences: PreferenceForm }) =>
            apiJson(`/api/v1/admin/users/${userId}/preferences`, 'PATCH', preferences, 'admin'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setMessage('Preferences updated.');
        },
        onError: (err: any) => setMessage(`Error: ${err.message}`)
    });

    function updatePreference<K extends keyof PreferenceForm>(key: K, value: PreferenceForm[K]) {
        setPreferenceForm((current) => ({ ...current, [key]: value }));
    }

    function savePreferences(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!selectedUser?.candidateId) return;
        updatePreferencesMutation.mutate({ userId: selectedUser.id, preferences: preferenceForm });
    }

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
                <h3 style={{ margin: 0 }}>Add New User</h3>
                <div className="form-grid">
                    <div className="field-group">
                        <label>Username (Email)</label>
                        <input className="input" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="email@example.com" />
                    </div>
                    <div className="field-group">
                        <label>Password</label>
                        <input className="input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Temporary password" />
                    </div>
                    <div className="field-group">
                        <label>Initial Role</label>
                        <select className="select" value={newRole} onChange={e => setNewRole(e.target.value)}>
                            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
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

            {users && users.length > 0 ? (
                <div className="grid-2" style={{ alignItems: 'start' }}>
                    <div className="card table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Preferences</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        onClick={() => setSelectedUserId(user.id)}
                                        style={{
                                            cursor: 'pointer',
                                            background: selectedUser?.id === user.id ? 'var(--brand-soft)' : undefined
                                        }}
                                    >
                                        <td>
                                            <div style={{ fontWeight: 'bold' }}>{user.username}</div>
                                            <div className="muted" style={{ fontSize: '0.75rem' }}>
                                                {user.candidateName || user.clientName || 'Platform account'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${user.role === 'ADMIN' ? 'success' : ''}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            {user.candidateId ? (
                                                <div className="muted" style={{ fontSize: '0.8rem' }}>
                                                    {text(user.preferences?.primaryDiscipline) || 'No discipline'}<br />
                                                    {text(user.preferences?.availabilityStatus) || 'No availability'}
                                                </div>
                                            ) : (
                                                <span className="muted">No candidate profile</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="row-actions">
                                                <button className="btn secondary compact" type="button">
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn secondary compact"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        deleteUserMutation.mutate(user.id);
                                                    }}
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
                    </div>

                    <div className="card stack">
                        <div className="section-title">
                            <h2 style={{ margin: 0 }}>{selectedUser?.username}</h2>
                            <span className="badge">{selectedUser?.authProvider || 'LOCAL'}</span>
                        </div>
                        <div className="form-grid">
                            <div className="field-group">
                                <label>Role</label>
                                <select
                                    className="select"
                                    value={selectedUser?.role || 'CANDIDATE'}
                                    onChange={e => selectedUser && updateRoleMutation.mutate({ userId: selectedUser.id, role: e.target.value })}
                                    disabled={!selectedUser || updateRoleMutation.isPending}
                                >
                                    {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                                </select>
                            </div>
                            <div className="field-group">
                                <label>Linked record</label>
                                <input
                                    className="input"
                                    value={selectedUser?.candidateName || selectedUser?.clientName || 'No linked record'}
                                    readOnly
                                />
                            </div>
                        </div>

                        {selectedUser?.candidateId ? (
                            <form className="stack" onSubmit={savePreferences}>
                                <div className="section-title">
                                    <h3 style={{ margin: 0 }}>Candidate Preferences</h3>
                                    <span className="badge">{selectedUser.emailVerified ? 'Verified' : 'Unverified'}</span>
                                </div>
                                <div className="form-grid">
                                    <div className="field-group">
                                        <label>First Name</label>
                                        <input className="input" value={preferenceForm.firstName} onChange={e => updatePreference('firstName', e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label>Last Name</label>
                                        <input className="input" value={preferenceForm.lastName} onChange={e => updatePreference('lastName', e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label>Email</label>
                                        <input className="input" value={preferenceForm.email} onChange={e => updatePreference('email', e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label>Phone</label>
                                        <input className="input" value={preferenceForm.phone} onChange={e => updatePreference('phone', e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label>Date of Birth</label>
                                        <input className="input" type="date" value={preferenceForm.dateOfBirth} onChange={e => updatePreference('dateOfBirth', e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label>Primary Discipline</label>
                                        <input className="input" value={preferenceForm.primaryDiscipline} onChange={e => updatePreference('primaryDiscipline', e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label>Band</label>
                                        <input className="input" value={preferenceForm.band} onChange={e => updatePreference('band', e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label>Years Experience</label>
                                        <input className="input" type="number" min="0" value={preferenceForm.yearsExperience} onChange={e => updatePreference('yearsExperience', e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label>Current Location</label>
                                        <input className="input" value={preferenceForm.currentLocation} onChange={e => updatePreference('currentLocation', e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label>Preferred Radius Miles</label>
                                        <input className="input" type="number" min="0" value={preferenceForm.preferredRadiusMiles} onChange={e => updatePreference('preferredRadiusMiles', e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label>Availability Status</label>
                                        <input className="input" value={preferenceForm.availabilityStatus} onChange={e => updatePreference('availabilityStatus', e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label>Available From</label>
                                        <input className="input" type="date" value={preferenceForm.availableFrom} onChange={e => updatePreference('availableFrom', e.target.value)} />
                                    </div>
                                </div>
                                <div className="field-group">
                                    <label>Summary</label>
                                    <textarea className="textarea" value={preferenceForm.summary} onChange={e => updatePreference('summary', e.target.value)} />
                                </div>
                                <div className="field-group">
                                    <label>Availability Notes</label>
                                    <textarea className="textarea" value={preferenceForm.availabilityNotes} onChange={e => updatePreference('availabilityNotes', e.target.value)} />
                                </div>
                                <button className="btn" disabled={updatePreferencesMutation.isPending}>
                                    Save Preferences
                                </button>
                            </form>
                        ) : (
                            <div className="empty-state">
                                This user is not linked to a candidate profile, so there are no work preferences to edit.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="card empty-state">No users found in the system.</div>
            )}
        </div>
    );
}
