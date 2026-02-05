import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  MapPin,
  Package,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { NovaPoshtaService, type NovaPoshtaCity, type NovaPoshtaWarehouse } from '../services/novaPoshtaService';
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { apiRequest } from '../services/api';
import { toast } from 'sonner';
import { NovaPoshtaInfo } from './NovaPoshtaInfo';

interface CheckoutPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function CheckoutPage({ onBack }: CheckoutPageProps) {
  const { cart, totalPrice } = useCart();
  const { currentUser } = useAuth();

  // Delivery state
  const [cityQuery, setCityQuery] = useState('');
  const [cities, setCities] = useState<NovaPoshtaCity[]>([]);
  const [selectedCity, setSelectedCity] = useState<NovaPoshtaCity | null>(null);
  const [warehouses, setWarehouses] = useState<NovaPoshtaWarehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  // Contact info
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [recipientName, setRecipientName] = useState(currentUser?.name || '');

  // Process state
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleCitySelect = (cityName: string) => {
    const city = cities.find(c => c.Description === cityName);
    if (city) {
      setSelectedCity(city);
      setCityQuery(city.Description);
      setCities([]);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCity || !selectedWarehouse || !phone || !recipientName) {
      toast.error('Будь ласка, заповніть всі обовʼязкові поля');
      return;
    }

    setIsProcessing(true);

    try {
      const checkoutRequest = {
        deliveryCity: selectedCity?.Description,
        deliveryCityRef: selectedCity?.Ref,
        deliveryBranch: warehouses.find(w => w.Ref === selectedWarehouse)?.Description,
        deliveryBranchRef: selectedWarehouse,
        useBonuses: false,
        items: cart.map(item => ({
          bookId: item.book.id,
          quantity: item.quantity,
          price: item.book.price
        }))
      };

      const result = await apiRequest<{ paymentUrl: string }>('/api/payment/checkout', {
        method: 'POST',
        body: JSON.stringify(checkoutRequest),
      });

      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        toast.error('Не вдалося створити платіжну сесію');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Помилка обробки платежу');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4 mr-2" />
          Назад до кошика
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5" />
                Оформлення замовлення
              </CardTitle>
              <CardDescription>Вкажіть дані для доставки та перейдіть до оплати</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
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
                  <Label htmlFor="city">Місто доставки *</Label>
                  <div className="relative">
                    <Input
                      id="city"
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                      placeholder="Введіть місто..."
                      required
                    />
                    {loadingCities && (
                      <Loader2 className="size-4 animate-spin absolute right-3 top-3 text-gray-400" />
                    )}
                  </div>

                  {cities.length > 0 && (
                    <div className="border rounded-md max-h-48 overflow-y-auto bg-white shadow-sm">
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
                      Місто вибрано: {selectedCity.Description}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warehouse">Відділення Нової Пошти *</Label>
                  <Select
                    value={selectedWarehouse}
                    onValueChange={setSelectedWarehouse}
                    disabled={!selectedCity || loadingWarehouses}
                    required
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
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 space-y-4">
          <NovaPoshtaInfo />

          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Ваше замовлення</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.book.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">
                      {item.book.name} × {item.quantity}
                    </span>
                    <span className="font-medium whitespace-nowrap">{item.book.price * item.quantity} ₴</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Сума</span>
                  <span>{totalPrice} ₴</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Доставка</span>
                  <span className="text-green-600 font-medium">За тарифами НП</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-lg">Всього</span>
                <span className="text-2xl font-bold text-primary">{totalPrice} ₴</span>
              </div>

              <Button
                form="checkout-form"
                type="submit"
                className="w-full h-12 text-lg font-semibold"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="size-5 mr-2 animate-spin" />
                    Обробка...
                  </>
                ) : (
                  'Оплатити замовлення'
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
                <Package className="size-3" />
                Безпечна оплата через Stripe
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
