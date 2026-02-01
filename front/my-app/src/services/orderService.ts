import type { Order } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const orderService = {
  // Отримати всі замовлення (для працівників/адмінів)
  async getAllOrders(): Promise<Order[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Mock data для тестування frontend без бекенду
      return [
        {
          id: 'ORD-001',
          customerEmail: 'customer@example.com',
          customerName: 'John Customer',
          phone: '+380501111111',
          employeeEmail: 'employee@example.com',
          items: [
            { bookId: '1', bookName: 'The Great Gatsby', quantity: 2, price: 299 },
            { bookId: '3', bookName: 'To Kill a Mockingbird', quantity: 1, price: 279 }
          ],
          totalPrice: 877,
          status: 'confirmed',
          createdAt: '2026-01-10T10:30:00Z',
          delivery: {
            city: 'Київ',
            warehouse: 'Відділення №1',
          },
          paymentTransactionId: 'pi_test123456',
        },
        {
          id: 'ORD-002',
          customerEmail: 'alice@example.com',
          customerName: 'Alice Smith',
          phone: '+380502222222',
          items: [
            { bookId: '5', bookName: 'The Hobbit', quantity: 1, price: 399 },
            { bookId: '6', bookName: 'Harry Potter and the Philosopher\'s Stone', quantity: 1, price: 449 }
          ],
          totalPrice: 848,
          status: 'pending',
          createdAt: '2026-01-12T14:20:00Z',
          delivery: {
            city: 'Львів',
            warehouse: 'Відділення №5',
          },
        },
        {
          id: 'ORD-003',
          customerEmail: 'customer@example.com',
          customerName: 'John Customer',
          phone: '+380501111111',
          items: [
            { bookId: '2', bookName: '1984', quantity: 1, price: 349 }
          ],
          totalPrice: 349,
          status: 'pending',
          createdAt: '2026-01-13T09:15:00Z',
          delivery: {
            city: 'Одеса',
            warehouse: 'Відділення №12',
          },
        },
        {
          id: 'ORD-004',
          customerEmail: 'bob@example.com',
          customerName: 'Bob Johnson',
          phone: '+380503333333',
          items: [
            { bookId: '4', bookName: 'Pride and Prejudice', quantity: 3, price: 259 }
          ],
          totalPrice: 777,
          status: 'confirmed',
          createdAt: '2026-01-20T16:45:00Z',
          delivery: {
            city: 'Харків',
            warehouse: 'Відділення №8',
          },
          paymentTransactionId: 'pi_test789012',
        },
      ];
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
