import {ReactNode} from 'react';

export function TableCard({title, children, actions}: { title: string; children: ReactNode; actions?: ReactNode }) {
    return (
        <div className="card table-wrap">
            <div className="section-title">
                <h3 style={{margin: 0}}>{title}</h3>
                {actions}
            </div>
            {children}
        </div>
    );
}
