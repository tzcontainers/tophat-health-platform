import './globals.css';
import {CookieConsent} from '@/components/CookieConsent';
import {Header} from '@/components/Header';
import {QueryProvider} from '@/components/QueryProvider';
import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'TopHat Health Care Platform',
    description: 'Healthcare staffing operations, compliance, placements, and timesheets.'
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <QueryProvider>
            <Header/>
            {children}
            <footer>TopHat Health Care platform — public roles, candidate profiles, client workspaces, and operations
                tools.
            </footer>
            <CookieConsent/>
        </QueryProvider>
        </body>
        </html>
    );
}
