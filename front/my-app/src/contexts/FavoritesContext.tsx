import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { favoriteService } from '../services/favoriteService';

interface FavoritesContextType {
  favoriteIds: Set<number>;
  addFavorite: (bookId: number) => Promise<void>;
  removeFavorite: (bookId: number) => Promise<void>;
  isFavorite: (bookId: number) => boolean;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isCustomer } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!isCustomer) {
      setFavoriteIds(new Set());
      return;
    }
    setIsLoading(true);
    try {
      const items = await favoriteService.getFavorites();
      setFavoriteIds(new Set(items.map((f) => f.book.id)));
    } catch {
      setFavoriteIds(new Set());
    } finally {
      setIsLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const addFavorite = useCallback(async (bookId: number) => {
    await favoriteService.addFavorite(bookId);
    setFavoriteIds((prev) => new Set([...prev, bookId]));
  }, []);

  const removeFavorite = useCallback(async (bookId: number) => {
    await favoriteService.removeFavorite(bookId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      next.delete(bookId);
      return next;
    });
  }, []);

  const isFavorite = useCallback((bookId: number) => favoriteIds.has(bookId), [favoriteIds]);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, addFavorite, removeFavorite, isFavorite, isLoading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
