import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CreditCard, 
  MapPin, 
  Package, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { NovaPoshtaService,type NovaPoshtaCity, type NovaPoshtaWarehouse } from '../services/novaPoshtaService';
import { StripeService, type PaymentResult } from '../services/stripeService';
import { toast } from 'sonner';
import { StripeTestCards } from './StripeTestCards';
import { NovaPoshtaInfo } from './NovaPoshtaInfo';
import { PaymentHelper } from './PaymentHelper';

interface CheckoutPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function CheckoutPage({ onBack, onSuccess }: CheckoutPageProps) {
  const { cart, totalPrice, clearCart } = useCart();
  const { currentUser } = useAuth();

  // Delivery state
  const [cityQuery, setCityQuery] = useState('');
  const [cities, setCities] = useState<NovaPoshtaCity[]>([]);
  const [selectedCity, setSelectedCity] = useState<NovaPoshtaCity | null>(null);
  const [warehouses, setWarehouses] = useState<NovaPoshtaWarehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  // Payment state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState(currentUser?.name || '');

  // Contact info
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [recipientName, setRecipientName] = useState(currentUser?.name || '');

  // Process state
  const [step, setStep] = useState<'delivery' | 'payment' | 'success'>('delivery');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [orderId, setOrderId] = useState<string>('');

  // Search cities with debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (cityQuery.length >= 2) {
        setLoadingCities(true);
        try {
          const results = await NovaPoshtaService.searchCities(cityQuery);
          setCities(results);
        } catch (error) {
          console.error('Error searching cities:', error);
          toast.error('Помилка пошуку міста');
        } finally {
          setLoadingCities(false);
        }
      } else {
        setCities([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cityQuery]);

  // Load warehouses when city is selected
  useEffect(() => {
    const loadWarehouses = async () => {
      if (selectedCity) {
        setLoadingWarehouses(true);
        try {
          const results = await NovaPoshtaService.getWarehouses(selectedCity.DeliveryCity);
          setWarehouses(results);
          setSelectedWarehouse('');
        } catch (error) {
          console.error('Error loading warehouses:', error);
          toast.error('Помилка завантаження відділень');
        } finally {
          setLoadingWarehouses(false);
        }
      } else {
        setWarehouses([]);
        setSelectedWarehouse('');
      }
    };

    loadWarehouses();
  }, [selectedCity]);

  const handleCitySelect = (cityDescription: string) => {
    const city = cities.find(c => c.Description === cityDescription);
    if (city) {
      setSelectedCity(city);
      setCityQuery(city.Description);
      setCities([]);
    }
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity || !selectedWarehouse || !phone || !recipientName) {
      toast.error('Будь ласка, заповніть всі поля');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
      toast.error('Будь ласка, заповніть всі дані картки');
      return;
    }

    setIsProcessing(true);

    try {
      // Process payment
      const result = await StripeService.processPayment(
        cardNumber,
        cardExpiry,
        cardCvc,
        cardName,
        totalPrice
      );

      setPaymentResult(result);

      if (result.success) {
        // Generate order ID
        const newOrderId = `ORD-${Date.now()}`;
        setOrderId(newOrderId);

        // Save order to localStorage (in production, save to backend)
        const order = {
          id: newOrderId,
          customerEmail: email,
          customerName: recipientName,
          phone,
          delivery: {
            city: selectedCity?.Description,
            warehouse: warehouses.find(w => w.Ref === selectedWarehouse)?.Description,
          },
          items: cart.map(item => ({
            bookId: item.book.id,
            bookName: item.book.name,
            quantity: item.quantity,
            price: item.book.price,
          })),
          totalPrice,
          paymentTransactionId: result.transactionId,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        };

        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        localStorage.setItem('orders', JSON.stringify([...existingOrders, order]));

        toast.success('Оплата успішна! Замовлення оформлено');
        setStep('success');
        
        setTimeout(() => {
          clearCart();
          onSuccess();
        }, 3000);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Помилка обробки платежу');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardType = StripeService.getCardType(cardNumber);

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card>
          <CardContent className="pt-12 pb-8 text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="size-24 text-green-500" />
            </div>
            <div>
              <h2 className="text-3xl font-semibold mb-2">Замовлення оформлено!</h2>
              <p className="text-gray-600">
                Номер замовлення: <span className="font-semibold">{orderId}</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-600">Інформація про доставку надіслана на:</p>
              <p className="font-semibold">{email}</p>
              <p className="font-semibold">{phone}</p>
            </div>
            <div className="text-sm text-gray-500">
              <p>Очікуйте дзвінок від курʼєра для підтвердження</p>
              <p>Відстежити замовлення можна в розділі "Мої замовлення"</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4 mr-2" />
          Назад до кошика
        </Button>
        <PaymentHelper />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5" />
                Інформація про доставку
              </CardTitle>
              <CardDescription>Виберіть відділення Нової Пошти</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeliverySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Прізвище та імʼя отримувача *</Label>
                  <Input
                    id="recipientName"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Іванов Іван"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+380XXXXXXXXX"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="city">Місто *</Label>
                  <div className="relative">
                    <Input
                      id="city"
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                      placeholder="Почніть вводити назву міста..."
                      required
                    />
                    {loadingCities && (
                      <Loader2 className="size-4 animate-spin absolute right-3 top-3 text-gray-400" />
                    )}
                  </div>
                  
                  {cities.length > 0 && (
                    <div className="border rounded-md max-h-48 overflow-y-auto">
                      {cities.map((city) => (
                        <button
                          key={city.Ref}
                          type="button"
                          onClick={() => handleCitySelect(city.Description)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <div className="font-medium">{city.Description}</div>
                          <div className="text-sm text-gray-500">{city.Area}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedCity && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <MapPin className="size-4" />
                      Обрано: {selectedCity.Description}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warehouse">Відділення *</Label>
                  <Select
                    value={selectedWarehouse}
                    onValueChange={setSelectedWarehouse}
                    disabled={!selectedCity || loadingWarehouses}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        loadingWarehouses ? 'Завантаження...' : 
                        !selectedCity ? 'Спочатку оберіть місто' : 
                        'Оберіть відділення'
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.Ref} value={warehouse.Ref}>
                          {warehouse.Description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {step === 'delivery' && (
                  <Button type="submit" className="w-full">
                    Продовжити до оплати
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {step === 'payment' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="size-5" />
                  Оплата карткою
                </CardTitle>
                <CardDescription>Безпечна оплата через Stripe (Тестовий режим)</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Номер картки *</Label>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(StripeService.formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                      />
                      {cardType !== 'unknown' && (
                        <span className="absolute right-3 top-3 text-xs font-semibold text-gray-500 uppercase">
                          {cardType}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardExpiry">Термін дії *</Label>
                      <Input
                        id="cardExpiry"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(StripeService.formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardCvc">CVV/CVC *</Label>
                      <Input
                        id="cardCvc"
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Імʼя власника картки *</Label>
                    <Input
                      id="cardName"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="IVAN IVANOV"
                      required
                    />
                  </div>

                  {paymentResult && !paymentResult.success && (
                    <Alert variant="destructive">
                      <AlertCircle className="size-4" />
                      <AlertDescription>{paymentResult.message}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('delivery')}
                      className="flex-1"
                    >
                      Назад
                    </Button>
                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Обробка...
                        </>
                      ) : (
                        `Оплатити ${totalPrice} ₴`
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 space-y-4">
          {step === 'delivery' && <NovaPoshtaInfo />}
          {step === 'payment' && <StripeTestCards />}
          
          <Card className={step === 'success' ? '' : 'sticky top-24'}>
            <CardHeader>
              <CardTitle>Ваше замовлення</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.book.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.book.name} × {item.quantity}
                    </span>
                    <span className="font-medium">{item.book.price * item.quantity} ₴</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Проміжний підсумок</span>
                  <span>{totalPrice} ₴</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Доставка Нова Пошта</span>
                  <span className="text-green-600">За тарифами перевізника</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="font-semibold">До сплати</span>
                <span className="text-2xl font-semibold">{totalPrice} ₴</span>
              </div>

              {selectedCity && selectedWarehouse && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                  <div className="font-medium">Доставка:</div>
                  <div className="text-gray-600">{selectedCity.Description}</div>
                  <div className="text-gray-600">
                    {warehouses.find(w => w.Ref === selectedWarehouse)?.Description}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
