import { DailyStock } from '../entities/DailyStock';

export interface DailyStockRepository {
  save(stock: DailyStock): Promise<void>;
  getLatestByProduct(outletId: string, productId: string): Promise<DailyStock | null>;
  getByDate(outletId: string, productId: string, date: Date): Promise<DailyStock | null>;
}