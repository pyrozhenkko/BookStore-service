import type { Employee } from '../types';
import { apiRequest } from './api';

export const employeeService = {
  // Отримати всіх працівників
  async getAllEmployees(): Promise<Employee[]> {
    const response = await apiRequest<{ content: Employee[] }>('/api/employees?size=1000');
    return response.content || [];
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
