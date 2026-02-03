import { apiRequest } from './api';

export interface CommentResponse {
  id: number;
  username: string;
  comment: string;
  createdAt: string;
  userRating?: number;
  isVerifiedPurchase: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

export const reviewService = {
  getComments: (bookId: number, page = 0) =>
    apiRequest<PageResponse<CommentResponse>>(`/api/reviews/book/${bookId}?page=${page}&size=5`),
  rateBook: (bookId: number, rating: number) =>
    apiRequest(`/api/reviews/book/${bookId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    }),
  addComment: (bookId: number, comment: string) =>
    apiRequest(`/api/reviews/book/${bookId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),
};
