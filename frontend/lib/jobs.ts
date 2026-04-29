export type JobSummary = {
    id: string | number;
    title: string;
    discipline: string;
    band: string;
    employmentType: string;
    location: string;
    payRateMin: string | number;
    payRateMax: string | number;
    status: string;
    clientName: string;
    siteName?: string;
};

export type PaginatedJobs = {
    items: JobSummary[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
};

export function emptyJobsPage(size = 0): PaginatedJobs {
    return {
        items: [],
        page: 0,
        size,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
    };
}

export function buildJobQuery(filters: Record<string, string>, page: number, size: number) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value.trim()) params.set(key, value.trim());
    });
    params.set('page', String(page));
    params.set('size', String(size));
    return `?${params.toString()}`;
}
