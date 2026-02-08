import type { Employee } from '../types';
import { apiRequest } from './api';

export const employeeService = {
  // Отримати всіх працівників
  async getAllEmployees(): Promise<Employee[]> {
    const data = await this.searchEmployees({ size: 1000 });
    return data.content || [];
  },

  // Пошук працівників з бекенд-фільтрацією та пагінацією
  async searchEmployees(params: {
    keyword?: string;
    active?: boolean;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<{ content: Employee[]; totalPages: number }> {
    const search = new URLSearchParams();
    if (params.keyword) search.set('keyword', params.keyword);
    if (params.active !== undefined) search.set('active', String(params.active));
    if (params.page !== undefined) search.set('page', String(params.page));
    if (params.size !== undefined) search.set('size', String(params.size));
    if (params.sort) search.set('sort', params.sort);

    const data = await apiRequest<{ content: Employee[]; totalPages: number }>(`/api/employees/search?${search}`);
    return {
      content: data.content || [],
      totalPages: data.totalPages || 0
    };
  },

  // Отримати працівника за ID
  async getEmployeeById(id: string): Promise<Employee> {
    return apiRequest<Employee>(`/api/employees/${id}`);
  },

  // Додати нового працівника
  async createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    return apiRequest<Employee>('/api/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
  },

  // Оновити працівника
  async updateEmployee(id: string, employee: Partial<Employee>): Promise<Employee> {
    return apiRequest<Employee>(`/api/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employee),
    });
  },

  // Видалити працівника назавжди
  async deleteEmployee(id: string): Promise<void> {
    return apiRequest<void>(`/api/employees/${id}`, {
      method: 'DELETE',
    });
  },
};
