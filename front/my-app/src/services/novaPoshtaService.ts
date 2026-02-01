// Real Nova Poshta API Integration
// API Documentation: https://developers.novaposhta.ua/

const NOVA_POSHTA_API_KEY = '44a0a81c97d4eadc5d8360d95023c5ac'; // Demo API key
const NOVA_POSHTA_API_URL = 'https://api.novaposhta.ua/v2.0/json/';

export interface NovaPoshtaCity {
  Ref: string;
  Description: string;
  DescriptionRu: string;
  Area: string;
  DeliveryCity: string;
}

export interface NovaPoshtaWarehouse {
  Ref: string;
  Description: string;
  DescriptionRu: string;
  Number: string;
  CityRef: string;
  CityDescription: string;
}

interface NovaPoshtaResponse<T> {
  success: boolean;
  data: T[];
  errors: string[];
  warnings: string[];
  info: {
    totalCount: number;
  };
}

export class NovaPoshtaService {
  private static async makeRequest<T>(
    modelName: string,
    calledMethod: string,
    methodProperties: Record<string, any> = {}
  ): Promise<NovaPoshtaResponse<T>> {
    try {
      const response = await fetch(NOVA_POSHTA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: NOVA_POSHTA_API_KEY,
          modelName,
          calledMethod,
          methodProperties,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Nova Poshta API Error:', error);
      throw error;
    }
  }

  // Пошук міст
  static async searchCities(query: string): Promise<NovaPoshtaCity[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const response = await this.makeRequest<NovaPoshtaCity>(
      'Address',
      'searchSettlements',
      {
        CityName: query,
        Limit: 20,
      }
    );

    if (response.success && response.data.length > 0) {
      // API повертає масив з одним об'єктом, який містить масив Addresses
      const firstResult = response.data[0] as any;
      return firstResult.Addresses || [];
    }

    return [];
  }

  // Отримання відділень за містом
  static async getWarehouses(cityRef: string): Promise<NovaPoshtaWarehouse[]> {
    const response = await this.makeRequest<NovaPoshtaWarehouse>(
      'Address',
      'getWarehouses',
      {
        CityRef: cityRef,
        Limit: 100,
      }
    );

    return response.success ? response.data : [];
  }

  // Отримання всіх міст (для випадаючого списку)
  static async getCities(): Promise<NovaPoshtaCity[]> {
    const response = await this.makeRequest<NovaPoshtaCity>(
      'Address',
      'getCities',
      {
        Limit: 100,
      }
    );

    return response.success ? response.data : [];
  }

  // Отримання областей
  static async getAreas(): Promise<{ Ref: string; Description: string }[]> {
    const response = await this.makeRequest<{ Ref: string; Description: string }>(
      'Address',
      'getAreas',
      {}
    );

    return response.success ? response.data : [];
  }
}
