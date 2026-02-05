import type { Book } from '../types';
import { apiRequest } from './api';

interface BackendBookDTO {
  id: number;
  name: string;
  genre?: string;
  price: number;
  publicationDate?: string;
  author?: string;
  quantity?: number;
  description?: string;
  imageUrls?: string[];
  isbn?: string;
  averageRating?: number;
  totalReviews?: number;
}

function mapBackendToBook(dto: BackendBookDTO): Book {
  const imageUrls = dto.imageUrls?.length ? dto.imageUrls : ['https://placehold.co/300x450?text=Book'];
  return {
    id: dto.id,
    name: dto.name,
    author: dto.author ?? '',
    price: Number(dto.price),
    description: dto.description ?? '',
    category: dto.genre ?? 'Інше',
    stock: dto.quantity ?? 0,
    imageUrl: imageUrls[0],
    imageUrls,
    isbn: dto.isbn ?? '',
    publishedYear: dto.publicationDate ? new Date(dto.publicationDate).getFullYear() : 0,
    averageRating: dto.averageRating ?? 0,
    totalReviews: dto.totalReviews ?? 0,
  };
}

export const bookApiService = {
  async getAllBooks(): Promise<Book[]> {
    const res = await apiRequest<{ content: BackendBookDTO[]; totalPages: number }>('/api/books?size=1000');
    // Handle both Page response and direct Array response (just in case)
    const list = (res as any).content || (Array.isArray(res) ? res : []);
    return list.map(mapBackendToBook);
  },

  async searchBooks(params: {
    keyword?: string;
    genre?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: Book[]; totalPages: number }> {
    const search = new URLSearchParams();
    if (params.keyword) search.set('keyword', params.keyword);
    if (params.genre) search.set('genre', params.genre);
    if (params.page != null) search.set('page', String(params.page));
    if (params.size != null) search.set('size', String(params.size));
    const res = await apiRequest<{ content: BackendBookDTO[]; totalPages: number }>(
      `/api/books/search?${search}`
    );
    return {
      content: (res.content ?? []).map(mapBackendToBook),
      totalPages: res.totalPages ?? 0,
    };
  },

  async getBookByName(name: string): Promise<Book | null> {
    try {
      const dto = await apiRequest<BackendBookDTO>(`/api/books/${encodeURIComponent(name)}`);
      return mapBackendToBook(dto);
    } catch {
      return null;
    }
  },

  async getGenres(): Promise<string[]> {
    try {
      return apiRequest<string[]>('/api/books/genres');
    } catch {
      return [];
    }
  },
};
