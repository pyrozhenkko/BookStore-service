import { apiRequest } from './api';

export interface LogRecord {
    id: number;
    category: string;
    level: string;
    message: string;
    username: string;
    timestamp: string;
}

export interface LogStats {
    categoryDistribution: Record<string, number>;
    levelDistribution: Record<string, number>;
    timeline: Array<{
        date: string;
        count: number;
    }>;
}

export const logApiService = {
    async getLogs(params: {
        keyword?: string;
        category?: string;
        level?: string;
        page?: number;
        size?: number;
    }): Promise<{ content: LogRecord[]; totalPages: number }> {
        const search = new URLSearchParams();
        if (params.keyword) search.set('keyword', params.keyword);
        if (params.category) search.set('category', params.category);
        if (params.level) search.set('level', params.level);
        if (params.page != null) search.set('page', String(params.page));
        if (params.size != null) search.set('size', String(params.size));

        return apiRequest<{ content: LogRecord[]; totalPages: number }>(
            `/api/admin/logs?${search}`
        );
    },

    async getStats(): Promise<LogStats> {
        return apiRequest<LogStats>('/api/admin/logs/stats');
    }
};
