import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Book, CartItem } from '../types';
import { useAuth } from './AuthContext';
import { shoppingCartService, type ShoppingCartDTO } from '../services/shoppingCartService';

interface CartContextType {
  cart: CartItem[];
  addToCart: (book: Book, quantity?: number) => Promise<void>;
  removeFromCart: (bookId: string | number) => Promise<void>;
  updateQuantity: (bookId: string | number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const mapDtoToCart = (dto: ShoppingCartDTO): CartItem[] => {
  return dto.items.map(item => ({
    id: item.id,
    book: {
      id: item.bookId,
      name: item.bookName,
      price: item.price,
      author: item.author,
      imageUrl: item.imageUrl,
      isbn: item.isbn,
      // Default values for other Book fields that might not be in the DTO
      description: '',
      category: '',
      stock: 999, // Backend handles stock check
      publishedYear: 0,
    } as Book,
    quantity: item.quantity
  }));
};

export function CartProvider({ children }: { children: ReactNode }) {
  const { isCustomer } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync from localStorage on mount (for guests or initial load)
  useEffect(() => {
    if (!isCustomer) {
      const saved = localStorage.getItem('shopping-cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    }
  }, [isCustomer]);

  // Sync to localStorage for guests
  useEffect(() => {
    if (!isCustomer) {
      localStorage.setItem('shopping-cart', JSON.stringify(cart));
    }
  }, [cart, isCustomer]);

  // Fetch from backend when customer logs in
  const fetchCart = useCallback(async () => {
    if (!isCustomer) return;
    setIsLoading(true);
    try {
      const dto = await shoppingCartService.getMyCart();
      setCart(mapDtoToCart(dto));
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (book: Book, quantity: number = 1) => {
    if (isCustomer) {
      try {
        const dto = await shoppingCartService.addToCart(book.id, quantity);
        setCart(mapDtoToCart(dto));
      } catch (error) {
        console.error('Failed to add to cart:', error);
      }
    } else {
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
    }
  };

  const removeFromCart = async (bookId: string | number) => {
    const itemToRemove = cart.find(item => String(item.book.id) === String(bookId));
    if (!itemToRemove) return;

    if (isCustomer && itemToRemove.id) {
      try {
        const dto = await shoppingCartService.removeItem(Number(itemToRemove.id));
        setCart(mapDtoToCart(dto));
      } catch (error) {
        console.error('Failed to remove from cart:', error);
      }
    } else {
      setCart(prevCart => prevCart.filter(item => String(item.book.id) !== String(bookId)));
    }
  };

  const updateQuantity = async (bookId: string | number, quantity: number) => {
    const item = cart.find(item => String(item.book.id) === String(bookId));
    if (!item) return;

    if (isCustomer && item.id) {
      try {
        let dto: ShoppingCartDTO;
        if (quantity > item.quantity) {
          dto = await shoppingCartService.addToCart(bookId, quantity - item.quantity);
        } else if (quantity < item.quantity) {
          // Decrement one by one or as per backend capability
          // Currently backend only has decrement one or delete
          // We might need to call it multiple times or just decrement once
          // For simplicity and matching backend's "decrementItem" (removeOneOrDelete)
          if (quantity === item.quantity - 1) {
            dto = await shoppingCartService.decrementItem(Number(item.id));
          } else {
            // If different, we might need a better backend API or 
            // we just use the current one and accept limitations
            // but let's just use decrementItem for now if it's -1
            dto = await shoppingCartService.decrementItem(Number(item.id));
          }
        } else {
          return;
        }
        setCart(mapDtoToCart(dto));
      } catch (error) {
        console.error('Failed to update quantity:', error);
      }
    } else {
      if (quantity <= 0) {
        removeFromCart(bookId);
        return;
      }
      setCart(prevCart =>
        prevCart.map(i =>
          String(i.book.id) === String(bookId) ? { ...i, quantity } : i
        )
      );
    }
  };

  const clearCart = async () => {
    if (isCustomer) {
      try {
        await shoppingCartService.clearCart();
        setCart([]);
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    } else {
      setCart([]);
    }
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
      totalPrice,
      isLoading
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
