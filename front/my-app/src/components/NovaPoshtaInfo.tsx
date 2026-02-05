import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Package, MapPin, TruckIcon } from 'lucide-react';

export function NovaPoshtaInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Package className="size-4" />
          Інформація про доставку
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <MapPin className="size-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-700">Вибір міста</p>
              <p className="text-gray-600">
                Почніть вводити назву міста для пошуку. API автоматично знайде відповідні населені пункти України.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <TruckIcon className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-700">Відділення</p>
              <p className="text-gray-600">
                Після вибору міста автоматично завантажаться всі відділення Нової Пошти в цьому місті.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t text-xs text-gray-500">
          <p><strong>Терміни доставки:</strong> 1-3 робочі дні</p>
          <p><strong>Вартість:</strong> за тарифами Нової Пошти</p>
          <p><strong>Оплата доставки:</strong> при отриманні на відділенні</p>
        </div>
      </CardContent>
    </Card>
  );
}
