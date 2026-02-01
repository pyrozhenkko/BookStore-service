// Stripe Payment Integration (Sandbox/Test Mode)
// This is a client-side implementation for demo purposes
// In production, payment processing should be done server-side

export interface StripePaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
}

export interface PaymentResult {
  success: boolean;
  message: string;
  transactionId?: string;
  error?: string;
}

// Test card numbers for Stripe:
// Success: 4242 4242 4242 4242
// Requires authentication: 4000 0027 6000 3184
// Declined: 4000 0000 0000 0002

export class StripeService {
  private static readonly STRIPE_PUBLISHABLE_KEY = 'pk_test_51234567890'; // Demo key
  
  // Симуляція створення Payment Intent
  static async createPaymentIntent(amount: number, currency: string = 'UAH'): Promise<StripePaymentIntent> {
    // В реальному додатку це має бути виклик до вашого backend
    // який створить Payment Intent через Stripe API
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          clientSecret: `pi_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`,
          amount,
          currency: currency.toLowerCase(),
          status: 'requires_payment_method',
        });
      }, 500);
    });
  }

  // Симуляція обробки платежу
  static async processPayment(
    cardNumber: string,
    cardExpiry: string,
    cardCvc: string,
    cardName: string,
    amount: number
  ): Promise<PaymentResult> {
    // Валідація номера картки (базова перевірка)
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    
    if (cleanCardNumber.length !== 16) {
      return {
        success: false,
        message: 'Невірний номер картки',
        error: 'INVALID_CARD_NUMBER',
      };
    }

    // Перевірка терміну дії
    const expiryParts = cardExpiry.split('/');
    if (expiryParts.length !== 2) {
      return {
        success: false,
        message: 'Невірний термін дії картки',
        error: 'INVALID_EXPIRY',
      };
    }

    const [month, year] = expiryParts.map(p => parseInt(p.trim()));
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (month < 1 || month > 12 || year < currentYear || (year === currentYear && month < currentMonth)) {
      return {
        success: false,
        message: 'Термін дії картки минув',
        error: 'CARD_EXPIRED',
      };
    }

    // Перевірка CVC
    if (cardCvc.length !== 3 && cardCvc.length !== 4) {
      return {
        success: false,
        message: 'Невірний CVC код',
        error: 'INVALID_CVC',
      };
    }

    // Симуляція обробки платежу
    return new Promise((resolve) => {
      setTimeout(() => {
        // Тестові картки Stripe
        if (cleanCardNumber === '4242424242424242') {
          // Успішна оплата
          resolve({
            success: true,
            message: 'Оплата успішно здійснена',
            transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
          });
        } else if (cleanCardNumber === '4000000000000002') {
          // Відхилена картка
          resolve({
            success: false,
            message: 'Картку відхилено. Спробуйте іншу картку',
            error: 'CARD_DECLINED',
          });
        } else if (cleanCardNumber === '4000002760003184') {
          // Потрібна аутентифікація (3D Secure)
          resolve({
            success: true,
            message: 'Оплата успішно здійснена (з 3D Secure)',
            transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
          });
        } else {
          // Будь-яка інша картка - успішна оплата для demo
          resolve({
            success: true,
            message: 'Оплата успішно здійснена',
            transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
          });
        }
      }, 1500);
    });
  }

  // Форматування номера картки
  static formatCardNumber(value: string): string {
    const cleaned = value.replace(/\s/g, '');
    const matches = cleaned.match(/.{1,4}/g);
    return matches ? matches.join(' ') : cleaned;
  }

  // Форматування терміну дії
  static formatExpiry(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  }

  // Визначення типу картки за номером
  static getCardType(cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'unknown' {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    return 'unknown';
  }
}
