import { DailySale } from '../entities/DailySale';

export interface DailySaleRepository {
  save(sale: DailySale): Promise<void>;
  getByDateRange(outletId: string, start: Date, end: Date): Promise<DailySale[]>;
}
