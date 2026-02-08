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
    const data = await await this.searchClients({ size: 1000 });
    return data.content || [];
  },

  // Search clients with backend filtering and pagination
  async searchClients(params: {
    keyword?: string;
    isBlocked?: boolean;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<{ content: Client[]; totalPages: number }> {
    const search = new URLSearchParams();
    if (params.keyword) search.set('keyword', params.keyword);
    if (params.isBlocked !== undefined) search.set('isBlocked', String(params.isBlocked));
    if (params.page !== undefined) search.set('page', String(params.page));
    if (params.size !== undefined) search.set('size', String(params.size));
    if (params.sort) search.set('sort', params.sort);

    const data = await apiRequest<{ content: Client[]; totalPages: number }>(`/api/clients/search?${search}`, {
      method: 'GET',
    });
    return {
      content: data.content || [],
      totalPages: data.totalPages || 0
    };
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
