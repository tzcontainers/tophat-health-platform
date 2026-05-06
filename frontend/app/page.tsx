import Link from 'next/link';
import {ContactRequestForm} from '@/components/ContactRequestForm';

export default function HomePage() {
    return (
        <main className="page-section">
            <section className="hero product-hero">
                <div className="hero-copy-block">
                    <div className="eyebrow">TopHat Health Care</div>
                    <h1>Healthcare staffing operations, organized end to end.</h1>
                    <p>
                        A secure workspace for candidates, care providers, and operations teams to manage roles,
                        placements, compliance documents, approvals, and timesheets in one place.
                    </p>
                    <div className="hero-actions">
                        <Link className="btn" href="/jobs">Explore roles</Link>
                        <Link className="btn secondary" href="/register">Create candidate profile</Link>
                    </div>
                </div>
                <div className="operations-panel card">
                    <div className="panel-header">
                        <span>Operations snapshot</span>
                        <strong>Today</strong>
                    </div>
                    <div className="ops-list">
                        <div><span>Compliance</span><strong>3 documents in review</strong></div>
                        <div><span>Timesheets</span><strong>1 pending client approval</strong></div>
                        <div><span>Roles</span><strong>Role requests ready to publish</strong></div>
                    </div>
                    <div className="progress-track"><span style={{width: '72%'}}/></div>
                </div>
            </section>

            <section className="grid-4">
                <div className="card feature-card"><strong>Candidate workspace</strong><p className="muted">Profiles, compliance, placements, timesheets, and messages.</p></div>
                <div className="card feature-card"><strong>Client workspace</strong><p className="muted">Role requests, placements, approvals, and workforce visibility.</p></div>
                <div className="card feature-card"><strong>Operations console</strong><p className="muted">Candidate management, role publishing, compliance review, and reporting.</p></div>
                <div className="card feature-card"><strong>Secure platform</strong><p className="muted">JWT authentication, role-based access, and database-managed records.</p></div>
            </section>

            <section className="stack">
                <ContactRequestForm/>
            </section>
        </main>
    );
}
