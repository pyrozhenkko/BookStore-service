import type { Employee } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const employeeService = {
  // Отримати всіх працівників
  async getAllEmployees(): Promise<Employee[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Додайте auth token якщо потрібно
          // 'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Mock data для тестування frontend без бекенду
      return [
        {
          id: '1',
          email: 'employee@example.com',
          name: 'Jane Employee',
          position: 'Менеджер продажів',
          hiredDate: '2024-01-15',
          phone: '+380501234567',
          isActive: true,
        },
        {
          id: '2',
          email: 'john.doe@example.com',
          name: 'John Doe',
          position: 'Старший менеджер',
          hiredDate: '2023-06-10',
          phone: '+380509876543',
          isActive: true,
        },
        {
          id: '3',
          email: 'sarah.smith@example.com',
          name: 'Sarah Smith',
          position: 'Менеджер складу',
          hiredDate: '2025-03-22',
          phone: '+380671234567',
          isActive: false,
        },
      ];
    }
  },

  // Отримати працівника за ID
  async getEmployeeById(id: string): Promise<Employee> {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch employee');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  },

  // Додати нового працівника
  async createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employee),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create employee');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },

  // Оновити працівника
  async updateEmployee(id: string, employee: Partial<Employee>): Promise<Employee> {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employee),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update employee');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  },

  // Звільнити працівника (деактивувати)
  async terminateEmployee(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to terminate employee');
      }
    } catch (error) {
      console.error('Error terminating employee:', error);
      throw error;
    }
  },
};
