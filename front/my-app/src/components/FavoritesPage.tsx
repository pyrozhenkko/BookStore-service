import { useState, useEffect } from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import { bookApiService } from '../services/bookApiService';
import { BookCard } from './BookCard';
import { Card, CardContent } from './ui/card';
import { Heart } from 'lucide-react';
import type { Book } from '../types';

interface FavoritesPageProps {
    onViewDetails: (book: Book) => void;
}

export function FavoritesPage({ onViewDetails }: FavoritesPageProps) {
    const { favoriteIds, isLoading: favLoading } = useFavorites();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFavoriteBooks = async () => {
            if (favoriteIds.size === 0) {
                setBooks([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const allBooks = await bookApiService.getAllBooks();
                const favoriteBooks = allBooks.filter(book =>
                    favoriteIds.has(typeof book.id === 'number' ? book.id : parseInt(String(book.id), 10))
                );
                setBooks(favoriteBooks);
            } catch (err) {
                console.error('Error loading favorites:', err);
            } finally {
                setLoading(false);
            }
        };

        if (!favLoading) {
            loadFavoriteBooks();
        }
    }, [favoriteIds, favLoading]);

    if (loading || favLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (books.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <Heart className="size-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">У вас ще немає улюблених книг</h2>
                    <p className="text-gray-600">
                        Додавайте книги до улюблених, натискаючи на іконку серця
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Heart className="size-8 text-red-500 fill-red-500" />
                <h1 className="text-2xl font-semibold">Улюблені книги</h1>
                <span className="text-gray-500">({books.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {books.map(book => (
                    <BookCard
                        key={book.id}
                        book={book}
                        onViewDetails={() => onViewDetails(book)}
                    />
                ))}
            </div>
        </div>
    );
}
