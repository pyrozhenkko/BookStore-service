import type { Book, User, Order } from '../types';

export const mockBooks: Book[] = [
  {
    id: '1',
    name: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    price: 299,
    description: 'A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.',
    category: 'Classic Literature',
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    isbn: '978-0-7432-7356-5',
    publishedYear: 1925
  },
  {
    id: '2',
    name: '1984',
    author: 'George Orwell',
    price: 349,
    description: 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.',
    category: 'Science Fiction',
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
    isbn: '978-0-452-28423-4',
    publishedYear: 1949
  },
  {
    id: '3',
    name: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    price: 279,
    description: 'A gripping tale of racial injustice and childhood innocence in the American South.',
    category: 'Classic Literature',
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    isbn: '978-0-06-112008-4',
    publishedYear: 1960
  },
  {
    id: '4',
    name: 'Pride and Prejudice',
    author: 'Jane Austen',
    price: 259,
    description: 'A romantic novel of manners that critiques the British landed gentry at the end of the 18th century.',
    category: 'Romance',
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    isbn: '978-0-14-143951-8',
    publishedYear: 1813
  },
  {
    id: '5',
    name: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    price: 399,
    description: 'A fantasy adventure novel that follows the quest of hobbit Bilbo Baggins.',
    category: 'Fantasy',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=600&fit=crop',
    isbn: '978-0-547-92822-7',
    publishedYear: 1937
  },
  {
    id: '6',
    name: 'Harry Potter and the Philosopher\'s Stone',
    author: 'J.K. Rowling',
    price: 449,
    description: 'The first novel in the Harry Potter series, following a young wizard\'s journey.',
    category: 'Fantasy',
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1618883469482-b083aeefb5aa?w=400&h=600&fit=crop',
    isbn: '978-0-7475-3269-9',
    publishedYear: 1997
  },
  {
    id: '7',
    name: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    price: 289,
    description: 'A story about teenage rebellion and alienation narrated by the iconic Holden Caulfield.',
    category: 'Classic Literature',
    stock: 10,
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop',
    isbn: '978-0-316-76948-0',
    publishedYear: 1951
  },
  {
    id: '8',
    name: 'The Da Vinci Code',
    author: 'Dan Brown',
    price: 329,
    description: 'A mystery thriller that follows symbologist Robert Langdon as he investigates a murder.',
    category: 'Mystery',
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop',
    isbn: '978-0-307-47492-1',
    publishedYear: 2003
  }
];

export const mockUsers: User[] = [
  { email: 'admin@example.com', name: 'Admin User', role: 'admin', isBlocked: false },
  { email: 'customer@example.com', name: 'John Customer', role: 'customer', isBlocked: false },
  { email: 'employee@example.com', name: 'Jane Employee', role: 'employee', isBlocked: false },
  { email: 'blocked@example.com', name: 'Blocked User', role: 'customer', isBlocked: true },
  { email: 'alice@example.com', name: 'Alice Smith', role: 'customer', isBlocked: false },
  { email: 'bob@example.com', name: 'Bob Johnson', role: 'customer', isBlocked: false },
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerEmail: 'customer@example.com',
    employeeEmail: 'employee@example.com',
    items: [
      { bookId: '1', bookName: 'The Great Gatsby', quantity: 2, price: 299 },
      { bookId: '3', bookName: 'To Kill a Mockingbird', quantity: 1, price: 279 }
    ],
    totalPrice: 877,
    status: 'confirmed',
    createdAt: '2026-01-10T10:30:00Z'
  },
  {
    id: 'ORD-002',
    customerEmail: 'alice@example.com',
    items: [
      { bookId: '5', bookName: 'The Hobbit', quantity: 1, price: 399 },
      { bookId: '6', bookName: 'Harry Potter and the Philosopher\'s Stone', quantity: 1, price: 449 }
    ],
    totalPrice: 848,
    status: 'pending',
    createdAt: '2026-01-12T14:20:00Z'
  },
  {
    id: 'ORD-003',
    customerEmail: 'customer@example.com',
    items: [
      { bookId: '2', bookName: '1984', quantity: 1, price: 349 }
    ],
    totalPrice: 349,
    status: 'pending',
    createdAt: '2026-01-13T09:15:00Z'
  }
];
