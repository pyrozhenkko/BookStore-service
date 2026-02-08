import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Package, MapPin, TruckIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function NovaPoshtaInfo() {
  const { t } = useLanguage();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Package className="size-4" />
          {t('novaposhta.infoTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <MapPin className="size-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-700">{t('novaposhta.citySelection')}</p>
              <p className="text-gray-600">
                {t('novaposhta.citySelectionDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <TruckIcon className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-700">{t('novaposhta.branch')}</p>
              <p className="text-gray-600">
                {t('novaposhta.branchDesc')}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t text-xs text-gray-500">
          <p><strong>{t('novaposhta.deliveryTerms')}</strong> {t('novaposhta.deliveryTermsValue')}</p>
          <p><strong>{t('novaposhta.cost')}</strong> {t('novaposhta.costValue')}</p>
          <p><strong>{t('novaposhta.paymentAtBranch')}</strong></p>
        </div>
      </CardContent>
    </Card>
  );
}
