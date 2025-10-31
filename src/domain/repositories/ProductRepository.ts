import { Product } from '../entities/Product';

export interface ProductRepository {
  getBySKU(sku: string): Promise<Product | null>;
  listAll(): Promise<Product[]>;
}
