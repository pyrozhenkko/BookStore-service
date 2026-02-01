import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CreditCard, CheckCircle, XCircle, Shield } from 'lucide-react';

export function StripeTestCards() {
  const testCards = [
    {
      number: '4242 4242 4242 4242',
      type: 'Успішна оплата',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      number: '4000 0000 0000 0002',
      type: 'Відхилена картка',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      number: '4000 0027 6000 3184',
      type: '3D Secure',
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <CreditCard className="size-4" />
          Тестові картки Stripe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {testCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`p-3 rounded-lg ${card.bgColor}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`size-4 ${card.color}`} />
                <span className={`text-xs font-semibold ${card.color}`}>
                  {card.type}
                </span>
              </div>
              <code className="text-xs font-mono">{card.number}</code>
            </div>
          );
        })}
        <div className="text-xs text-gray-500 pt-2 border-t">
          <p><strong>CVV:</strong> будь-які 3 цифри (наприклад: 123)</p>
          <p><strong>Термін дії:</strong> будь-яка майбутня дата (наприклад: 12/26)</p>
        </div>
      </CardContent>
    </Card>
  );
}
