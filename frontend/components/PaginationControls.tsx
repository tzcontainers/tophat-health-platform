'use client';

export function PaginationControls({page, totalPages, hasPrevious, hasNext, onPageChange}: {
    page: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    onPageChange: (page: number) => void;
}) {
    const displayPage = totalPages === 0 ? 0 : page + 1;

    return (
        <div className="row-actions pagination-controls">
            <button
                className="btn secondary compact"
                disabled={!hasPrevious}
                onClick={() => onPageChange(Math.max(0, page - 1))}
            >
                Previous
            </button>
            <span className="muted">
                Page {displayPage} of {totalPages}
            </span>
            <button
                className="btn secondary compact"
                disabled={!hasNext}
                onClick={() => onPageChange(page + 1)}
            >
                Next
            </button>
        </div>
    );
}
