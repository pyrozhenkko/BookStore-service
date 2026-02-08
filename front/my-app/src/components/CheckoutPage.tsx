import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  MapPin,
  Package,
  Loader2,
  ArrowLeft,
  Coins
} from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { cart, totalPrice } = useCart();
  const { currentUser, balance, isCustomer } = useAuth();

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

  // Cashback state
  const [useCashback, setUseCashback] = useState(false);

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
          toast.error(t('checkout.errors.citySearch'));
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
          toast.error(t('checkout.errors.warehouseLoading'));
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
      toast.error(t('common.fillRequired'));
      return;
    }

    setIsProcessing(true);

    try {
      const checkoutRequest = {
        deliveryCity: selectedCity?.Description,
        deliveryCityRef: selectedCity?.Ref,
        deliveryBranch: warehouses.find(w => w.Ref === selectedWarehouse)?.Description,
        deliveryBranchRef: selectedWarehouse,
        useBonuses: useCashback,
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
        toast.error(t('checkout.errors.session'));
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(t('checkout.errors.payment'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4 mr-2" />
          {t('checkout.backToCart')}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5" />
                {t('checkout.title')}
              </CardTitle>
              <CardDescription>{t('checkout.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">{t('checkout.recipientName')}</Label>
                    <Input
                      id="recipientName"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder={t('checkout.recipientNamePlaceholder')}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('checkout.phone')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('checkout.phonePlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('checkout.emailPlaceholder')}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="city">{t('checkout.city')}</Label>
                  <div className="relative">
                    <Input
                      id="city"
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                      placeholder={t('checkout.cityPlaceholder')}
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
                      {t('checkout.citySelected')}: {selectedCity.Description}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warehouse">{t('checkout.warehouse')}</Label>
                  <Select
                    value={selectedWarehouse}
                    onValueChange={setSelectedWarehouse}
                    disabled={!selectedCity || loadingWarehouses}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        loadingWarehouses ? t('common.loading') :
                          !selectedCity ? t('checkout.selectCityFirst') :
                            t('checkout.selectWarehouse')
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
              <CardTitle>{t('checkout.orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.book.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">
                      {item.book.name} × {item.quantity}
                    </span>
                    <span className="font-medium whitespace-nowrap">{item.book.price * item.quantity} {t('common.currency')}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('cart.subtotal')}</span>
                  <span>{totalPrice} {t('common.currency')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('checkout.delivery')}</span>
                  <span className="text-green-600 font-medium">{t('checkout.deliveryRates')}</span>
                </div>
              </div>

              <Separator />

              {isCustomer && (
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-1.5 rounded-lg">
                        <Coins className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t('checkout.cashbackTitle')}</p>
                        <p className="text-xs text-muted-foreground">{t('checkout.availableCashback', { amount: balance || 0 })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="use-cashback"
                        checked={useCashback}
                        onCheckedChange={(checked) => setUseCashback(checked as boolean)}
                        disabled={!balance || balance <= 0}
                      />
                      <label
                        htmlFor="use-cashback"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {t('checkout.useCashback') || 'Use Cashback'}
                      </label>
                    </div>
                  </div>
                  {useCashback && balance && balance > 0 && (
                    <div className="flex justify-between text-sm text-primary font-medium">
                      <span>{t('checkout.cashbackDiscount')}</span>
                      <span>-{Math.min(balance, totalPrice - 1)} {t('common.currency')}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex items-center gap-2">
                <div className="bg-green-500/10 p-1 rounded-full">
                  <Package className="size-3.5 text-green-600" />
                </div>
                <p className="text-[11px] text-green-700 font-medium">
                  {t('checkout.potentialCashback', { amount: (totalPrice * 0.05).toFixed(2) })}
                </p>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-lg">{t('cart.total')}</span>
                <span className="text-2xl font-bold text-primary">
                  {useCashback ? Math.max(1, totalPrice - (balance || 0)) : totalPrice} {t('common.currency')}
                </span>
              </div>

              <Button
                form="checkout-form"
                type="submit"
                className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="size-5 mr-2 animate-spin" />
                    {t('checkout.processing')}
                  </>
                ) : (
                  t('checkout.placeOrder')
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
                <Package className="size-3" />
                {t('checkout.securePayment')}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
