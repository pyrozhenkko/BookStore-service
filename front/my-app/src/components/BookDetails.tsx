import { useState } from 'react';
import type { Book } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface BookDetailsProps {
  book: Book;
  onBack: () => void;
}

export function BookDetails({ book, onBack }: BookDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isCustomer } = useAuth();

  const handleAddToCart = () => {
    addToCart(book, quantity);
    setQuantity(1);
  };

  const incrementQuantity = () => {
    if (quantity < book.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="size-4 mr-2" />
        Назад до каталогу
      </Button>

      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="aspect-[2/3] overflow-hidden rounded-lg bg-gray-100">
              <img 
                src={book.imageUrl} 
                alt={book.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-semibold mb-2">{book.name}</h1>
                <p className="text-xl text-gray-600">{book.author}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {book.category}
                </Badge>
                {book.stock > 0 ? (
                  <Badge variant="outline" className="text-green-600 text-base px-3 py-1">
                    В наявності: {book.stock}
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-base px-3 py-1">
                    Немає в наявності
                  </Badge>
                )}
              </div>

              <div>
                <h2 className="font-semibold mb-2">Опис</h2>
                <p className="text-gray-700 leading-relaxed">{book.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">ISBN</p>
                  <p className="font-semibold">{book.isbn}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Рік видання</p>
                  <p className="font-semibold">{book.publishedYear}</p>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ціна</span>
                  <span className="text-4xl font-semibold">{book.price} ₴</span>
                </div>

                {isCustomer && book.stock > 0 && (
                  <>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">Кількість</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={decrementQuantity}
                          disabled={quantity <= 1}
                        >
                          <Minus className="size-4" />
                        </Button>
                        <span className="w-12 text-center font-semibold">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={incrementQuantity}
                          disabled={quantity >= book.stock}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="size-5 mr-2" />
                      Додати в кошик
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
