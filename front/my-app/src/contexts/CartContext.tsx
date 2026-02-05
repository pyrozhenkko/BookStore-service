import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Book, CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (book: Book, quantity?: number) => void;
  removeFromCart: (bookId: string | number) => void;
  updateQuantity: (bookId: string | number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('shopping-cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('shopping-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (book: Book, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => String(item.book.id) === String(book.id));

      if (existingItem) {
        return prevCart.map(item =>
          String(item.book.id) === String(book.id)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevCart, { book, quantity }];
    });
  };

  const removeFromCart = (bookId: string | number) => {
    setCart(prevCart => prevCart.filter(item => String(item.book.id) !== String(bookId)));
  };

  const updateQuantity = (bookId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        String(item.book.id) === String(bookId) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
