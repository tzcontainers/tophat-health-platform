import { redirect } from 'next/navigation';

export default function CandidateTeamsRedirectPage() {
    redirect('/admin/teams');
}
