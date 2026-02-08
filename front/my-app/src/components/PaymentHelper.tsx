import { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { HelpCircle, CreditCard, Package, CheckCircle, XCircle, Shield, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

export function PaymentHelper() {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);

  const testCards = [
    {
      number: '4242424242424242',
      display: '4242 4242 4242 4242',
      type: t('payment.helper.successPayment'),
      icon: CheckCircle,
      color: 'text-green-600',
      description: t('payment.helper.successPaymentDesc')
    },
    {
      number: '4000000000000002',
      display: '4000 0000 0000 0002',
      type: t('payment.helper.declinedCard'),
      icon: XCircle,
      color: 'text-red-600',
      description: t('payment.helper.declinedCardDesc')
    },
    {
      number: '4000002760003184',
      display: '4000 0027 6000 3184',
      type: t('payment.helper.3ds'),
      icon: Shield,
      color: 'text-blue-600',
      description: t('payment.helper.3dsDesc')
    },
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('payment.helper.copied', { label }));
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="size-4" />
          {t('payment.helper.button')}
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('payment.helper.title')}</SheetTitle>
          <SheetDescription>
            {t('payment.helper.description')}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Stripe Test Cards */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="size-5 text-blue-600" />
              <h3 className="font-semibold">{t('payment.helper.stripeCards')}</h3>
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
                        onClick={() => copyToClipboard(card.number, t('payment.helper.cardNumber'))}
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
                    onClick={() => copyToClipboard('123', t('payment.helper.cvv'))}
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
                    onClick={() => copyToClipboard('12/26', t('payment.helper.expiry'))}
                  >
                    <Copy className="size-3" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {t('payment.helper.testCardHint')}
              </p>
            </div>
          </div>

          {/* Nova Poshta Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="size-5 text-green-600" />
              <h3 className="font-semibold">{t('payment.helper.npApi')}</h3>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-green-800">
                {t('payment.helper.realNpApi')}
              </p>
              <p className="text-xs text-green-700">
                {t('payment.helper.realNpApiDesc')}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">{t('payment.helper.howToUse')}</h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>{t('payment.helper.step1')}</li>
                  <li>{t('payment.helper.step2')}</li>
                  <li>{t('payment.helper.step3')}</li>
                  <li>{t('payment.helper.step4')}</li>
                </ol>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold mb-2">Приклади міст:</h4>
                <div className="space-y-1 text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>{language === 'en' ? 'Kyiv' : 'Київ'}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        copyToClipboard(language === 'en' ? 'Kyiv' : 'Київ', t('payment.helper.city'));
                        setOpen(false);
                      }}
                    >
                      {t('payment.helper.use')}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{language === 'en' ? 'Lviv' : 'Львів'}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        copyToClipboard(language === 'en' ? 'Lviv' : 'Львів', t('payment.helper.city'));
                        setOpen(false);
                      }}
                    >
                      {t('payment.helper.use')}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{language === 'en' ? 'Odesa' : 'Одеса'}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        copyToClipboard(language === 'en' ? 'Odesa' : 'Одеса', t('payment.helper.city'));
                        setOpen(false);
                      }}
                    >
                      {t('payment.helper.use')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="border-t pt-4 space-y-2 text-xs text-gray-500">
            <p>
              <strong>{t('payment.helper.note')}</strong> {t('payment.helper.demoNote')}
            </p>
            <p>
              {t('payment.helper.stripeNote')}
            </p>
            <p>
              {t('payment.helper.npNote')}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
