import './globals.css';
import {Header} from '@/components/Header';
import {QueryProvider} from '@/components/QueryProvider';
import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'TopHat Health Care Platform',
    description: 'Healthcare recruitment, compliance, staffing and timesheets.'
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <QueryProvider>
            <Header/>
            {children}
            <footer>TopHat Health Care starter platform — public site, candidate portal, client portal, and admin back
                office.
            </footer>
        </QueryProvider>
        </body>
        </html>
    );
}
