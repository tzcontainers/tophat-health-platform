import { redirect } from 'next/navigation';

export default function CandidateUsersRedirectPage() {
    redirect('/admin/users');
}
