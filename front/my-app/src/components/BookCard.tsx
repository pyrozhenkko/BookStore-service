import type { Book } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface BookCardProps {
  book: Book;
  onViewDetails: (book: Book) => void;
}

export function BookCard({ book, onViewDetails }: BookCardProps) {
  const { addToCart } = useCart();
  const { isCustomer } = useAuth();

  const handleAddToCart = () => {
    addToCart(book);
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="aspect-[2/3] overflow-hidden rounded-md bg-gray-100 mb-3">
          <img 
            src={book.imageUrl} 
            alt={book.name}
            className="w-full h-full object-cover"
          />
        </div>
        <CardTitle className="line-clamp-2">{book.name}</CardTitle>
        <CardDescription>{book.author}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2">
          <Badge variant="secondary">{book.category}</Badge>
          <p className="text-sm text-gray-600 line-clamp-2">{book.description}</p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-2xl font-semibold">{book.price} ₴</span>
            {book.stock > 0 ? (
              <Badge variant="outline" className="text-green-600">
                В наявності: {book.stock}
              </Badge>
            ) : (
              <Badge variant="destructive">Немає в наявності</Badge>
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
          Деталі
        </Button>
        {isCustomer && book.stock > 0 && (
          <Button
            className="flex-1"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="size-4 mr-2" />
            В кошик
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
