export function StatCard({label, value, tone = 'default'}: {
    label: string;
    value: string | number;
    tone?: 'default' | 'success' | 'warning' | 'danger'
}) {
    return (
        <div className="card">
            <div className={`badge ${tone === 'default' ? '' : tone}`.trim()}>{label}</div>
            <div className="stat-value">{value}</div>
        </div>
    );
}
