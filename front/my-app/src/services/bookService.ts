import type { Book } from '../types';
import { mockBooks } from './mockData';

const STORAGE_KEY = 'bookstore_books';

class BookServiceClass {
  private books: Book[];

  constructor() {
    this.books = this.loadBooks();
  }

  private loadBooks(): Book[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse books from localStorage:', e);
      }
    }
    // Initialize with mock data if nothing in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockBooks));
    return [...mockBooks];
  }

  private saveBooks(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.books));
  }

  // READ operations
  getAllBooks(): Book[] {
    return [...this.books];
  }

  getBookById(id: string): Book | undefined {
    return this.books.find(book => book.id === id);
  }

  getBooksByCategory(category: string): Book[] {
    return this.books.filter(book => book.category === category);
  }

  searchBooks(query: string): Book[] {
    const lowerQuery = query.toLowerCase();
    return this.books.filter(book =>
      book.name.toLowerCase().includes(lowerQuery) ||
      book.author.toLowerCase().includes(lowerQuery) ||
      book.isbn.toLowerCase().includes(lowerQuery) ||
      book.description.toLowerCase().includes(lowerQuery)
    );
  }

  getAvailableBooks(): Book[] {
    return this.books.filter(book => book.stock > 0);
  }

  getLowStockBooks(threshold: number = 10): Book[] {
    return this.books.filter(book => book.stock > 0 && book.stock < threshold);
  }

  getCategories(): string[] {
    return Array.from(new Set(this.books.map(book => book.category))).sort();
  }

  // CREATE operation
  addBook(bookData: Omit<Book, 'id'>): Book {
    const newBook: Book = {
      ...bookData,
      id: this.generateBookId()
    };
    this.books.push(newBook);
    this.saveBooks();
    return newBook;
  }

  // UPDATE operations
  updateBook(id: string, updates: Partial<Omit<Book, 'id'>>): Book | null {
    const index = this.books.findIndex(book => book.id === id);
    if (index === -1) return null;

    this.books[index] = { ...this.books[index], ...updates };
    this.saveBooks();
    return this.books[index];
  }

  updateStock(id: string, quantity: number): boolean {
    const book = this.books.find(b => b.id === id);
    if (!book) return false;

    book.stock = quantity;
    this.saveBooks();
    return true;
  }

  decreaseStock(id: string, quantity: number): boolean {
    const book = this.books.find(b => b.id === id);
    if (!book || book.stock < quantity) return false;

    book.stock -= quantity;
    this.saveBooks();
    return true;
  }

  increaseStock(id: string, quantity: number): boolean {
    const book = this.books.find(b => b.id === id);
    if (!book) return false;

    book.stock += quantity;
    this.saveBooks();
    return true;
  }

  // DELETE operation
  deleteBook(id: string): boolean {
    const index = this.books.findIndex(book => book.id === id);
    if (index === -1) return false;

    this.books.splice(index, 1);
    this.saveBooks();
    return true;
  }

  // Utility methods
  private generateBookId(): string {
    const maxId = this.books.reduce((max, book) => {
      const numId = parseInt(String(book.id), 10);
      return isNaN(numId) ? max : Math.max(max, numId);
    }, 0);
    return String(maxId + 1);
  }

  // Reset to initial data
  resetBooks(): void {
    this.books = [...mockBooks];
    this.saveBooks();
  }
}

// Export singleton instance
export const BookService = new BookServiceClass();
