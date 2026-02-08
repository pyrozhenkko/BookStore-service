import { Package, CreditCard, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CheckoutProgressProps {
  currentStep: 'delivery' | 'payment' | 'success';
}

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const { t } = useLanguage();
  const steps = [
    { id: 'delivery', label: t('checkout.deliveryStep'), icon: Package },
    { id: 'payment', label: t('checkout.paymentStep'), icon: CreditCard },
    { id: 'success', label: t('checkout.successStep'), icon: CheckCircle },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`
                    size-12 rounded-full flex items-center justify-center border-2 transition-all
                    ${isActive ? 'border-blue-600 bg-blue-600 text-white' : ''}
                    ${isCompleted ? 'border-green-600 bg-green-600 text-white' : ''}
                    ${!isActive && !isCompleted ? 'border-gray-300 bg-white text-gray-400' : ''}
                  `}
                >
                  <Icon className="size-6" />
                </div>
                <span
                  className={`
                    mt-2 text-sm font-medium
                    ${isActive ? 'text-blue-600' : ''}
                    ${isCompleted ? 'text-green-600' : ''}
                    ${!isActive && !isCompleted ? 'text-gray-400' : ''}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-4 transition-all
                    ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
