'use client';
import {apiGet, apiJson} from '@/lib/api';
import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';

export default function CandidateProfilePage() {
    const {data, refetch} = useQuery({
        queryKey: ['candidate-profile'],
        queryFn: () => apiGet<any>('/api/v1/candidates/me', 'candidate')
    });
    const [message, setMessage] = useState('');

    async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        await apiJson('/api/v1/candidates/me/profile', 'PUT', {
            firstName: form.get('firstName'),
            lastName: form.get('lastName'),
            email: form.get('email'),
            phone: form.get('phone'),
            dateOfBirth: form.get('dateOfBirth'),
            summary: form.get('summary'),
            primaryDiscipline: form.get('primaryDiscipline'),
            band: form.get('band'),
            currentLocation: form.get('currentLocation'),
            availabilityStatus: form.get('availabilityStatus'),
            availabilityNotes: form.get('availabilityNotes')
        }, 'candidate');
        await refetch();
        setMessage('Profile updated.');
    }

    async function addAvailability(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        await apiJson('/api/v1/candidates/me/availability', 'POST', {
            availableFrom: form.get('availableFrom'),
            availabilityType: form.get('availabilityType'),
            notes: form.get('notes')
        }, 'candidate');
        await refetch();
        setMessage('Availability saved.');
        event.currentTarget.reset();
    }

    return (
        <div className="page-section stack">
            <div className="section-title"><h1 style={{margin: 0}}>Candidate profile</h1><span className="badge">Profile and availability</span>
            </div>
            <form className="card stack" onSubmit={saveProfile}>
                <div className="form-grid">
                    <input className="input" name="firstName" defaultValue={data?.firstName} placeholder="First name"/>
                    <input className="input" name="lastName" defaultValue={data?.lastName} placeholder="Last name"/>
                    <input className="input" name="email" defaultValue={data?.email} placeholder="Email"/>
                    <input className="input" name="phone" defaultValue={data?.phone} placeholder="Phone"/>
                    <input className="input" type="date" name="dateOfBirth" defaultValue={data?.dateOfBirth} placeholder="Date of Birth"/>
                    <input className="input" name="primaryDiscipline" defaultValue={data?.profile?.primaryDiscipline}
                           placeholder="Primary discipline"/>
                    <input className="input" name="band" defaultValue={data?.profile?.band} placeholder="Band"/>
                    <input className="input" name="currentLocation" defaultValue={data?.profile?.currentLocation}
                           placeholder="Current location"/>
                    <input className="input" name="availabilityStatus" defaultValue={data?.profile?.availabilityStatus}
                           placeholder="Availability status"/>
                </div>
                <textarea className="textarea" name="summary" defaultValue={data?.profile?.summary}
                          placeholder="Professional summary"/>
                <textarea className="textarea" name="availabilityNotes" defaultValue={data?.profile?.availabilityNotes}
                          placeholder="Availability notes"/>
                <button className="btn">Save profile</button>
            </form>
            <form className="card stack" onSubmit={addAvailability}>
                <h3 style={{margin: 0}}>Add availability update</h3>
                <div className="form-grid">
                    <input className="input" type="date" name="availableFrom" required/>
                    <input className="input" name="availabilityType" placeholder="LOCUM / PERM / NIGHTS" required/>
                    <input className="input" name="notes" placeholder="Notes"/>
                </div>
                <button className="btn secondary">Save availability</button>
            </form>
            {message && <div className="notice">{message}</div>}
        </div>
    );
}
