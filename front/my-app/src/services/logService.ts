import { apiRequest } from './api';

export interface LogRecord {
  id: number;
  category: string;
  level: string;
  message: string;
  username: string | null;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const logService = {
  async getLogs(params: {
    page?: number;
    size?: number;
    keyword?: string;
    category?: string;
    level?: string;
  }): Promise<PageResponse<LogRecord>> {
    const search = new URLSearchParams();
    if (params.page != null) search.set('page', String(params.page));
    if (params.size != null) search.set('size', String(params.size));
    if (params.keyword) search.set('keyword', params.keyword);
    if (params.category) search.set('category', params.category);
    if (params.level) search.set('level', params.level);
    return apiRequest(`/api/admin/logs?${search}`);
  },
};
