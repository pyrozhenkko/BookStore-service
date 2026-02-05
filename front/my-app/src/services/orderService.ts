import type { Order } from '../types';
import { apiRequest } from './api';

export const orderService = {
  // Get all orders (for admins/employees)
  async getAllOrders(): Promise<Order[]> {
    // Using /search endpoint accessible to ADMIN/EMPLOYEE
    const data = await apiRequest<{ content: Order[] }>('/api/orders/search?size=1000', {
      method: 'GET',
    });
    return data.content || [];
  },

  // Get orders by customer email
  async getOrdersByCustomer(customerEmail: string): Promise<Order[]> {
    const data = await apiRequest<{ content: Order[] }>(`/api/orders/client/${customerEmail}`, {
      method: 'GET',
    });
    return data.content || [];
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
