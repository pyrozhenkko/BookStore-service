// Backend-proxied Nova Poshta Service
// This service calls our local backend which acts as a proxy to Nova Poshta API

export interface NovaPoshtaCity {
  Ref: string;
  Description: string;
  Area: string;
  DeliveryCity: string; // Used for ref in warehouse search
}

export interface NovaPoshtaWarehouse {
  Ref: string;
  Description: string;
  Number: string;
}

export class NovaPoshtaService {
  private static BASE_URL = '/api/delivery';

  // Пошук міст
  static async searchCities(query: string): Promise<NovaPoshtaCity[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const response = await fetch(`${this.BASE_URL}/cities?name=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to fetch cities');

      const data = await response.json();
      // Map backend CityDTO to frontend NovaPoshtaCity
      const mapped = data.map((city: any) => ({
        Ref: city.ref, // Backend 'ref' is NP's 'DeliveryCity'
        Description: city.description, // Backend 'description' is NP's 'Present'
        Area: city.area || '',
        DeliveryCity: city.ref
      }));

      // Filter duplicates by Ref to avoid React key warnings
      return mapped.filter((city: any, index: number, self: any[]) =>
        index === self.findIndex((t) => t.Ref === city.Ref)
      );
    } catch (error) {
      console.error('Error searching cities:', error);
      return [];
    }
  }

  // Отримання відділень за містом
  static async getWarehouses(cityRef: string): Promise<NovaPoshtaWarehouse[]> {
    if (!cityRef) return [];

    try {
      const response = await fetch(`${this.BASE_URL}/branches?cityRef=${encodeURIComponent(cityRef)}`);
      if (!response.ok) throw new Error('Failed to fetch warehouses');

      const data = await response.json();
      // Map backend BranchDTO to frontend NovaPoshtaWarehouse
      const mapped = data.map((branch: any) => ({
        Ref: branch.ref,
        Description: branch.description,
        Number: branch.number
      }));

      // Filter duplicates by Ref
      return mapped.filter((branch: any, index: number, self: any[]) =>
        index === self.findIndex((t) => t.Ref === branch.Ref)
      );
    } catch (error) {
      console.error('Error loading warehouses:', error);
      return [];
    }
  }

  // Unused in checkout but kept for structure compatibility
  static async getCities(): Promise<NovaPoshtaCity[]> {
    return [];
  }

  static async getAreas(): Promise<{ Ref: string; Description: string }[]> {
    return [];
  }
}
