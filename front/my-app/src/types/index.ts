export interface Book {
  id: string | number;
  name: string;
  author: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  imageUrl: string;
  imageUrls?: string[];
  isbn: string;
  publishedYear: number;
  averageRating?: number;
  totalReviews?: number;
}

export interface User {
  id: string | number;
  email: string;
  name: string;
  role: 'customer' | 'employee' | 'admin';
  isBlocked?: boolean;
}

export interface Employee {
  id: string;
  email: string;
  name: string;
  position: string;
  hiredDate: string;
  phone?: string;
  active: boolean;
  isAdmin?: boolean;
  password?: string;
}

export interface Client {
  id: string;
  email: string;
  name: string;
  phone?: string;
  registeredDate: string;
  totalOrders: number;
  isBlocked: boolean;
}

export interface OrderItem {
  bookName: string;
  quantity: number;
  price?: number;
}

export interface Order {
  id: number;
  clientEmail: string;
  clientName?: string;
  clientPhone?: string;
  employeeEmail?: string;
  orderDate: string;
  price: number;
  usedBonuses?: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  bookItems: OrderItem[];
  deliveryCity?: string;
  deliveryBranch?: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}
