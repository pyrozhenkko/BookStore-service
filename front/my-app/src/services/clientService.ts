import type { Client } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const clientService = {
  // Отримати всіх клієнтів
  async getAllClients(): Promise<Client[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients?size=1000`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }

      const data = await response.json();
      return data.content || [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
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
