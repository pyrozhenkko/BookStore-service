import type { Client } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const clientService = {
  // Отримати всіх клієнтів
  async getAllClients(): Promise<Client[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching clients:', error);
      // Mock data для тестування frontend без бекенду
      return [
        {
          id: '1',
          email: 'customer@example.com',
          name: 'John Customer',
          phone: '+380501111111',
          registeredDate: '2025-01-05',
          totalOrders: 5,
          isBlocked: false,
        },
        {
          id: '2',
          email: 'alice@example.com',
          name: 'Alice Smith',
          phone: '+380502222222',
          registeredDate: '2025-03-10',
          totalOrders: 3,
          isBlocked: false,
        },
        {
          id: '3',
          email: 'bob@example.com',
          name: 'Bob Johnson',
          phone: '+380503333333',
          registeredDate: '2025-06-15',
          totalOrders: 8,
          isBlocked: false,
        },
        {
          id: '4',
          email: 'blocked@example.com',
          name: 'Blocked User',
          phone: '+380504444444',
          registeredDate: '2024-12-01',
          totalOrders: 1,
          isBlocked: true,
        },
      ];
    }
  },

  // Заблокувати клієнта
  async blockClient(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to block client');
      }
    } catch (error) {
      console.error('Error blocking client:', error);
      throw error;
    }
  },

  // Розблокувати клієнта
  async unblockClient(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}/unblock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to unblock client');
      }
    } catch (error) {
      console.error('Error unblocking client:', error);
      throw error;
    }
  },

  // Отримати клієнта за ID
  async getClientById(id: string): Promise<Client> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch client');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  },
};
