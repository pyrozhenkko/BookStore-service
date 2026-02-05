import type { Client } from '../types';
import { apiRequest } from './api';

export const clientService = {
  // Create client
  async createClient(data: Partial<Client>): Promise<Client> {
    return apiRequest<Client>('/api/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get all clients
  async getAllClients(): Promise<Client[]> {
    const data = await apiRequest<{ content: Client[] }>('/api/clients?size=1000', {
      method: 'GET',
    });
    return data.content || [];
  },

  // Block client
  async blockClient(id: string): Promise<void> {
    await apiRequest(`/api/clients/${id}/block`, {
      method: 'POST',
    });
  },

  // Unblock client
  async unblockClient(id: string): Promise<void> {
    await apiRequest(`/api/clients/${id}/unblock`, {
      method: 'POST',
    });
  },

  // Get client by ID
  async getClientById(id: string): Promise<Client> {
    return apiRequest<Client>(`/api/clients/${id}`, {
      method: 'GET',
    });
  },

  // Update client
  async updateClient(id: string | number, data: Partial<Client>): Promise<Client> {
    return apiRequest<Client>(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete client account
  async deleteClient(id: string | number): Promise<void> {
    await apiRequest(`/api/clients/${id}`, {
      method: 'DELETE',
    });
  },
};
