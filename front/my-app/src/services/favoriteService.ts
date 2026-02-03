import { apiRequest } from './api';

export interface FavoriteItem {
  id: number;
  book: { id: number; name: string; imageUrls?: string[] };
  note?: string;
  addedAt: string;
}

export const favoriteService = {
  getFavorites: () => apiRequest<FavoriteItem[]>('/api/clients/favorites'),
  addFavorite: (bookId: number, note?: string) =>
    apiRequest('/api/clients/favorites', {
      method: 'POST',
      body: JSON.stringify({ bookId, note: note || '' }),
    }),
  removeFavorite: (bookId: number) =>
    apiRequest(`/api/clients/favorites/${bookId}`, { method: 'DELETE' }),
};
