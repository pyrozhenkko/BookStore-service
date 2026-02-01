import { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { HelpCircle, CreditCard, Package, CheckCircle, XCircle, Shield, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function PaymentHelper() {
  const [open, setOpen] = useState(false);

  const testCards = [
    {
      number: '4242424242424242',
      display: '4242 4242 4242 4242',
      type: 'Успішна оплата',
      icon: CheckCircle,
      color: 'text-green-600',
      description: 'Використовуйте цю картку для успішної оплати'
    },
    {
      number: '4000000000000002',
      display: '4000 0000 0000 0002',
      type: 'Відхилена картка',
      icon: XCircle,
      color: 'text-red-600',
      description: 'Симулює відхилення платежу банком'
    },
    {
      number: '4000002760003184',
      display: '4000 0027 6000 3184',
      type: '3D Secure',
      icon: Shield,
      color: 'text-blue-600',
      description: 'Симулює додаткову аутентифікацію'
    },
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} скопійовано`);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="size-4" />
          Довідка
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Довідка по оплаті та доставці</SheetTitle>
          <SheetDescription>
            Інформація про тестові картки та API Нової Пошти
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Stripe Test Cards */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="size-5 text-blue-600" />
              <h3 className="font-semibold">Тестові картки Stripe</h3>
            </div>
            
            <div className="space-y-3">
              {testCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`size-4 ${card.color}`} />
                        <span className={`font-semibold ${card.color} text-sm`}>
                          {card.type}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(card.number, 'Номер картки')}
                      >
                        <Copy className="size-3" />
                      </Button>
                    </div>
                    <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                      {card.display}
                    </div>
                    <p className="text-xs text-gray-600">{card.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">CVV/CVC:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-2 py-1 rounded">123</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard('123', 'CVV')}
                  >
                    <Copy className="size-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Термін дії:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-2 py-1 rounded">12/26</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard('12/26', 'Термін дії')}
                  >
                    <Copy className="size-3" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Використовуйте будь-які значення для CVV та майбутню дату для терміну дії
              </p>
            </div>
          </div>

          {/* Nova Poshta Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="size-5 text-green-600" />
              <h3 className="font-semibold">Нова Пошта API</h3>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-green-800">
                ✓ Реальний API Нової Пошти
              </p>
              <p className="text-xs text-green-700">
                Використовуються справжні дані з API Нової Пошти для пошуку міст та відділень
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Як користуватися:</h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>Почніть вводити назву міста (мін. 2 символи)</li>
                  <li>Оберіть місто зі списку</li>
                  <li>Відділення завантажаться автоматично</li>
                  <li>Оберіть зручне відділення</li>
                </ol>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold mb-2">Приклади міст:</h4>
                <div className="space-y-1 text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Київ</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        copyToClipboard('Київ', 'Місто');
                        setOpen(false);
                      }}
                    >
                      Використати
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Львів</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        copyToClipboard('Львів', 'Місто');
                        setOpen(false);
                      }}
                    >
                      Використати
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Одеса</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        copyToClipboard('Одеса', 'Місто');
                        setOpen(false);
                      }}
                    >
                      Використати
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="border-t pt-4 space-y-2 text-xs text-gray-500">
            <p>
              <strong>Примітка:</strong> Це демонстраційна версія системи оплати та доставки.
            </p>
            <p>
              Всі платежі здійснюються в тестовому режимі Stripe. Реальні кошти не списуються.
            </p>
            <p>
              API Нової Пошти надає довідкову інформацію про міста та відділення.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
