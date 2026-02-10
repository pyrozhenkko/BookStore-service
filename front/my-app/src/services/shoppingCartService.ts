import { apiRequest } from './api';

export interface CartItemDTO {
    id: number;
    bookId: number;
    bookName: string;
    isbn: string;
    price: number;
    quantity: number;
    author: string;
    imageUrl: string;
}

export interface ShoppingCartDTO {
    id: number;
    totalPrice: number;
    items: CartItemDTO[];
}

export const shoppingCartService = {
    getMyCart: () =>
        apiRequest<ShoppingCartDTO>('/api/cart'),

    addToCart: (bookId: number | string, quantity: number = 1) =>
        apiRequest<ShoppingCartDTO>(`/api/cart/add?bookId=${bookId}&quantity=${quantity}`, {
            method: 'POST',
        }),

    decrementItem: (itemId: number) =>
        apiRequest<ShoppingCartDTO>(`/api/cart/item/${itemId}/decrement`, {
            method: 'POST',
        }),

    removeItem: (itemId: number) =>
        apiRequest<ShoppingCartDTO>(`/api/cart/item/${itemId}`, {
            method: 'DELETE',
        }),

    clearCart: () =>
        apiRequest<void>('/api/cart', {
            method: 'DELETE',
        }),
};
