import { ShieldX } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface AccessDeniedProps {
  onGoBack: () => void;
}

export function AccessDenied({ onGoBack }: AccessDeniedProps) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <ShieldX className="size-20 mx-auto text-red-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">403</h1>
          <h2 className="text-xl font-semibold mb-4">{t('common.accessDenied')}</h2>
          <p className="text-gray-600 mb-6">
            {t('common.noPermissions')}
          </p>
          <Button onClick={onGoBack}>
            {t('common.back')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
