import type { Order } from '../types';
import { apiRequest } from './api';

export const orderService = {
  // Get all orders (for admins/employees)
  async getAllOrders(): Promise<Order[]> {
    const data = await this.searchOrders({ size: 1000 });
    return data.content || [];
  },

  // Пошук замовлень з бекенд-фільтрацією та пагінацією
  async searchOrders(params: {
    clientEmail?: string;
    city?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    dateFrom?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<{ content: Order[]; totalPages: number }> {
    const search = new URLSearchParams();
    if (params.clientEmail) search.set('clientEmail', params.clientEmail);
    if (params.city) search.set('city', params.city);
    if (params.status && params.status !== 'all') search.set('status', params.status);
    if (params.minPrice) search.set('minPrice', String(params.minPrice));
    if (params.maxPrice) search.set('maxPrice', String(params.maxPrice));
    if (params.dateFrom) search.set('dateFrom', params.dateFrom);
    if (params.page !== undefined) search.set('page', String(params.page));
    if (params.size !== undefined) search.set('size', String(params.size));
    if (params.sort) search.set('sort', params.sort);

    const data = await apiRequest<{ content: Order[]; totalPages: number }>(`/api/orders/search?${search}`);
    return {
      content: data.content || [],
      totalPages: data.totalPages || 0
    };
  },

  // Get orders by customer email with pagination and sorting
  async getOrdersByCustomer(customerEmail: string, params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<{ content: Order[]; totalPages: number }> {
    const search = new URLSearchParams();
    if (params?.page !== undefined) search.set('page', String(params.page));
    if (params?.size !== undefined) search.set('size', String(params.size));
    if (params?.sort) search.set('sort', params.sort);

    const data = await apiRequest<{ content: Order[]; totalPages: number }>(`/api/orders/client/${customerEmail}?${search}`, {
      method: 'GET',
    });
    return {
      content: data.content || [],
      totalPages: data.totalPages || 0
    };
  },

  // Confirm order
  async confirmOrder(orderId: number | string): Promise<Order> {
    return apiRequest<Order>(`/api/orders/${orderId}/confirm`, {
      method: 'POST',
    });
  },

  // Cancel order
  async cancelOrder(orderId: number | string): Promise<Order> {
    return apiRequest<Order>(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
    });
  },

  // Create order
  async createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    return apiRequest<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },
};
