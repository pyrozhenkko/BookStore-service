import { useState, useEffect } from 'react';
import type { Book } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeft, ShoppingCart, Plus, Minus, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { reviewService, type CommentResponse } from '../services/reviewService';

interface BookDetailsProps {
  book: Book;
  onBack: () => void;
}

export function BookDetails({ book, onBack }: BookDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const { addToCart } = useCart();
  const { isCustomer } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const images = book.imageUrls?.length ? book.imageUrls : [book.imageUrl];
  const bookIdNum = typeof book.id === 'number' ? book.id : parseInt(String(book.id), 10);
  const hasNumericId = !isNaN(bookIdNum);
  const isFav = hasNumericId && isFavorite(bookIdNum);
  const avgRating = book.averageRating ?? 0;
  const totalReviews = book.totalReviews ?? 0;

  const handleAddToCart = () => {
    addToCart(book, quantity);
    setQuantity(1);
  };

  const incrementQuantity = () => {
    if (quantity < book.stock) setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleFavorite = async () => {
    if (!hasNumericId) return;
    try {
      if (isFav) await removeFavorite(bookIdNum);
      else await addFavorite(bookIdNum);
    } catch {}
  };

  const handleRate = async (rating: number) => {
    if (!hasNumericId || !isCustomer) return;
    try {
      await reviewService.rateBook(bookIdNum, rating);
      setUserRating(rating);
    } catch {}
  };

  const handleAddComment = async () => {
    if (!hasNumericId || !isCustomer || !commentText.trim()) return;
    try {
      await reviewService.addComment(bookIdNum, commentText.trim());
      setCommentText('');
      const res = await reviewService.getComments(bookIdNum);
      setComments(res.content);
    } catch {}
  };

  useEffect(() => {
    if (!hasNumericId) return;
    reviewService.getComments(bookIdNum).then((res) => setComments(res.content)).catch(() => {});
  }, [bookIdNum, hasNumericId]);

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="size-4 mr-2" />
        Назад до каталогу
      </Button>

      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image gallery - smaller */}
            <div className="space-y-3">
              <div className="aspect-[2/3] max-w-[280px] overflow-hidden rounded-lg bg-gray-100 relative">
                <img
                  src={images[selectedImageIndex]}
                  alt={book.name}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex((i) => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImageIndex(i)}
                      className={`w-14 h-14 rounded overflow-hidden border-2 ${
                        selectedImageIndex === i ? 'border-blue-600' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold mb-1">{book.name}</h1>
                  <p className="text-lg text-gray-600">{book.author}</p>
                </div>
                {isCustomer && hasNumericId && (
                  <button
                    type="button"
                    onClick={handleFavorite}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <Heart className={`size-6 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => isCustomer && handleRate(r)}
                      className={`p-1 ${isCustomer ? 'hover:scale-110' : ''}`}
                    >
                      <Star
                        className={`size-5 ${
                          r <= (userRating || avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {avgRating > 0 ? avgRating.toFixed(1) : '-'} ({totalReviews} відгуків)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary">{book.category}</Badge>
                {book.stock > 0 ? (
                  <Badge variant="outline" className="text-green-600">
                    В наявності: {book.stock}
                  </Badge>
                ) : (
                  <Badge variant="destructive">Немає в наявності</Badge>
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
                  <span className="text-3xl font-semibold">{book.price} ₴</span>
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
                    <Button className="w-full" size="lg" onClick={handleAddToCart}>
                      <ShoppingCart className="size-5 mr-2" />
                      Додати в кошик
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="mt-8 pt-8 border-t">
            <h2 className="text-xl font-semibold mb-4">Відгуки</h2>
            {isCustomer && (
              <div className="space-y-2 mb-6">
                <Label>Додати відгук</Label>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Напишіть ваш відгук..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    className="flex-1"
                  />
                  <Button onClick={handleAddComment} disabled={!commentText.trim()}>
                    Надіслати
                  </Button>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500">Поки немає відгуків</p>
              ) : (
                comments.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{c.username}</span>
                        {c.userRating != null && (
                          <span className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((r) => (
                              <Star
                                key={r}
                                className={`size-4 ${
                                  r <= c.userRating! ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{c.comment}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
