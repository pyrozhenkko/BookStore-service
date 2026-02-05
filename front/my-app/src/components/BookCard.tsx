import type { Book } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ShoppingCart, Eye, Heart, Star } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';

interface BookCardProps {
  book: Book;
  onViewDetails: (book: Book) => void;
}

export function BookCard({ book, onViewDetails }: BookCardProps) {
  const { cart, addToCart } = useCart();
  const { isCustomer } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { t } = useLanguage();

  const bookIdNum = typeof book.id === 'number' ? book.id : parseInt(String(book.id), 10);
  const hasNumericId = !isNaN(bookIdNum);
  const isFav = hasNumericId && isFavorite(bookIdNum);
  const isInCart = cart.some(item => String(item.book.id) === String(book.id));

  const handleAddToCart = () => {
    addToCart(book);
  };

  const handleFavorite = async () => {
    if (!hasNumericId) return;
    try {
      if (isFav) await removeFavorite(bookIdNum);
      else await addFavorite(bookIdNum);
    } catch { }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3 relative">
        <div className="aspect-[2/3] overflow-hidden rounded-md bg-gray-100 mb-3 relative">
          <img
            src={book.imageUrl}
            alt={book.name}
            className="w-full h-full object-cover"
          />
          {isCustomer && hasNumericId && (
            <button
              type="button"
              onClick={handleFavorite}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white shadow"
            >
              <Heart className={`size-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          )}
        </div>
        <CardTitle className="line-clamp-2">{book.name}</CardTitle>
        <CardDescription>{book.author}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{book.category}</Badge>
            <div className="flex items-center gap-1">
              <Star className={`size-4 ${book.averageRating && book.averageRating > 0 ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
              <span className="text-xs font-medium text-gray-600">
                {book.averageRating && book.averageRating > 0 ? book.averageRating.toFixed(1) : '-'}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{book.description}</p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-2xl font-semibold">{book.price} ₴</span>
            {book.stock > 0 ? (
              <Badge variant="outline" className="text-green-600">
                {t('stockStatus.inStockWithCount', { count: book.stock })}
              </Badge>
            ) : (
              <Badge variant="destructive">{t('stockStatus.outOfStock')}</Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2 pt-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onViewDetails(book)}
        >
          <Eye className="size-4 mr-2" />
          {t('common.details')}
        </Button>
        {isCustomer && book.stock > 0 && (
          <Button
            className="flex-1"
            onClick={handleAddToCart}
            disabled={isInCart}
          >
            <ShoppingCart className="size-4 mr-2" />
            {isInCart ? t('book.inCart') : t('book.toCart')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
