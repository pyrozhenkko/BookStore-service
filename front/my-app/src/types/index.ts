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
  isActive: boolean;
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
  bookId: string;
  bookName: string;
  quantity: number;
  price: number;
}

export interface DeliveryInfo {
  city?: string;
  warehouse?: string;
}

export interface Order {
  id: string;
  customerEmail: string;
  customerName?: string;
  phone?: string;
  employeeEmail?: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  delivery?: DeliveryInfo;
  paymentTransactionId?: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}
