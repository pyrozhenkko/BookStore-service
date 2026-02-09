import type { Book } from '../types';
import { apiRequest, getApiBaseUrl } from './api';

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
  language?: string;
  ageGroup?: string;
  averageRating?: number;
  totalReviews?: number;
}

function resolveImageUrl(url: string | undefined): string {
  if (!url) return 'https://placehold.co/300x450?text=Book';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) {
    return `${getApiBaseUrl()}${url}`;
  }
  return url;
}

function stripApiBaseUrl(url: string): string {
  const baseUrl = getApiBaseUrl();
  if (url.startsWith(baseUrl)) {
    return url.replace(baseUrl, '');
  }
  return url;
}

function mapBackendToBook(dto: BackendBookDTO): Book {
  const rawImageUrls = dto.imageUrls?.length ? dto.imageUrls : ['https://placehold.co/300x450?text=Book'];
  const imageUrls = rawImageUrls.map(resolveImageUrl);

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
    publishedYear: dto.publicationDate ? parseInt(dto.publicationDate.split('-')[0]) : 0,
    language: dto.language,
    ageGroup: dto.ageGroup,
    averageRating: dto.averageRating ?? 0,
    totalReviews: dto.totalReviews ?? 0,
  };
}

export const bookApiService = {
  async getAllBooks(): Promise<Book[]> {
    const res = await apiRequest<{ content: BackendBookDTO[]; totalPages: number }>('/api/books?size=1000');
    const list = (res as any).content || (Array.isArray(res) ? res : []);
    return list.map(mapBackendToBook);
  },

  async searchBooks(params: {
    keyword?: string;
    genre?: string;
    stockStatus?: string;
    page?: number;
    size?: number;
    sort?: string;
    language?: string;
    ageGroup?: string;
  }): Promise<{ content: Book[]; totalPages: number }> {
    const search = new URLSearchParams();
    if (params.keyword) search.set('keyword', params.keyword);
    if (params.genre && params.genre !== 'all') search.set('genre', params.genre);
    if (params.stockStatus && params.stockStatus !== 'all') search.set('stockStatus', params.stockStatus);
    if (params.language && params.language !== 'all') search.set('language', params.language);
    if (params.ageGroup && params.ageGroup !== 'all') search.set('ageGroup', params.ageGroup);
    if (params.page != null) search.set('page', String(params.page));
    if (params.size != null) search.set('size', String(params.size));
    if (params.sort) search.set('sort', params.sort);
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

  async addBook(book: Partial<Book>): Promise<Book> {
    const dto = {
      name: book.name,
      author: book.author,
      price: book.price,
      description: book.description,
      genre: book.category,
      quantity: book.stock,
      isbn: book.isbn,
      publicationDate: `${book.publishedYear}-01-01`,
      language: book.language,
      ageGroup: book.ageGroup,
      imageUrls: book.imageUrls?.map(stripApiBaseUrl)
    };
    const response = await apiRequest<BackendBookDTO>('/api/books', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return mapBackendToBook(response);
  },

  async updateBook(oldName: string, book: Partial<Book>): Promise<Book> {
    const dto = {
      name: book.name,
      author: book.author,
      price: book.price,
      description: book.description,
      genre: book.category,
      quantity: book.stock,
      isbn: book.isbn,
      publicationDate: `${book.publishedYear}-01-01`,
      language: book.language,
      ageGroup: book.ageGroup,
      imageUrls: book.imageUrls?.map(stripApiBaseUrl)
    };
    const response = await apiRequest<BackendBookDTO>(`/api/books/${encodeURIComponent(oldName)}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
    return mapBackendToBook(response);
  },

  async deleteBook(name: string): Promise<void> {
    await apiRequest(`/api/books/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  },

  async uploadImage(name: string, file: File): Promise<Book> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiRequest<BackendBookDTO>(`/api/books/${encodeURIComponent(name)}/images`, {
      method: 'POST',
      body: formData,
      headers: {}
    });
    return mapBackendToBook(response);
  },

  async deleteImage(name: string, imageUrl: string): Promise<Book> {
    const response = await apiRequest<BackendBookDTO>(
      `/api/books/${encodeURIComponent(name)}/images?imageUrl=${encodeURIComponent(imageUrl)}`,
      { method: 'DELETE' }
    );
    return mapBackendToBook(response);
  }
};
