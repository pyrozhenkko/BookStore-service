import type { Order } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const orderService = {
  // Отримати всі замовлення (для працівників/адмінів)
  async getAllOrders(): Promise<Order[]> {
    try {
      // Використовуємо /search endpoint, який доступний для ADMIN/EMPLOYEE
      const response = await fetch(`${API_BASE_URL}/orders/search?size=1000`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      return data.content || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Отримати замовлення конкретного клієнта
  async getOrdersByCustomer(customerEmail: string): Promise<Order[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/customer/${customerEmail}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customer orders');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  },

  // Підтвердити замовлення
  async confirmOrder(orderId: string): Promise<Order> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to confirm order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error confirming order:', error);
      throw error;
    }
  },

  // Скасувати замовлення
  async cancelOrder(orderId: string): Promise<Order> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  },

  // Створити замовлення
  async createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
};
