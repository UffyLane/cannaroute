import { inventoryApi } from './api';
import { Dispensary, Product, PaginatedResponse } from '@/types';

interface GetDispensariesParams {
  latitude?: number;
  longitude?: number;
  radiusMiles?: number;
  page?: number;
  limit?: number;
}

interface GetProductsParams {
  dispensaryId: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const InventoryService = {
  async getDispensaries(params: GetDispensariesParams = {}): Promise<PaginatedResponse<Dispensary>> {
    const { data } = await inventoryApi.get<PaginatedResponse<Dispensary>>('/dispensaries', { params });
    return data;
  },

  async getDispensaryById(id: string): Promise<Dispensary> {
    const { data } = await inventoryApi.get<Dispensary>(`/dispensaries/${id}`);
    return data;
  },

  async getProducts(params: GetProductsParams): Promise<PaginatedResponse<Product>> {
    const { dispensaryId, ...rest } = params;
    const { data } = await inventoryApi.get<PaginatedResponse<Product>>('/products', {
      params: { dispensary_id: dispensaryId, ...rest },
    });
    return data;
  },

  async getProductById(id: string): Promise<Product> {
    const { data } = await inventoryApi.get<Product>(`/products/${id}`);
    return data;
  },
};
