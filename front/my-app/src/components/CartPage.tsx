import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CartPageProps {
  onCheckout: () => void;
}

export function CartPage({ onCheckout }: CartPageProps) {
  const { t } = useTranslation();
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const { currentUser } = useAuth();

  const handleCheckout = () => {
    onCheckout();
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <ShoppingBag className="size-24 text-gray-300" />
        <h2 className="text-2xl font-semibold text-gray-700">{t('cart.empty.title')}</h2>
        <p className="text-gray-500">{t('cart.empty.description')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">{t('cart.title')}</h1>
        <p className="text-gray-600">
          {totalItems} {totalItems === 1 ? t('cart.item') : t('cart.items')} {t('book.inCart')}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <Card key={item.book.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-32 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                    <img
                      src={item.book.imageUrl}
                      alt={item.book.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="font-semibold">{item.book.name}</h3>
                      <p className="text-sm text-gray-600">{item.book.author}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() => updateQuantity(String(item.book.id), item.quantity - 1)}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() => updateQuantity(String(item.book.id), item.quantity + 1)}
                          disabled={item.quantity >= item.book.stock}
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">{item.book.price * item.quantity} {t('common.currency')}</p>
                        <p className="text-xs text-gray-500">{item.book.price} {t('common.currency')} {t('cart.perItem')}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(String(item.book.id))}
                  >
                    <Trash2 className="size-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>{t('checkout.orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('cart.items')}</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('cart.subtotal')}</span>
                  <span>{totalPrice} {t('common.currency')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('checkout.delivery')}</span>
                  <span className="text-green-600">{t('cart.free')}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="font-semibold">{t('cart.total')}</span>
                <span className="text-2xl font-semibold">{totalPrice} {t('common.currency')}</span>
              </div>

              {currentUser && (
                <div className="text-sm text-gray-600">
                  <p>{t('cart.customer')}: {currentUser.name}</p>
                  <p className="text-xs">{currentUser.email}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                {t('cart.checkout')}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => clearCart()}
              >
                {t('cart.clearCart')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
