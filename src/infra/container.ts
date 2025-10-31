import { SupabaseDailySaleRepository } from './repositories/SupabaseDailySaleRepository';
import { SupabaseDailyStockRepository } from './repositories/SupabaseDailyStockRepository';
import { RecordDailySaleUseCase } from '@/use-cases/sale/RecordDailySaleUseCase';
import { RecordDailyStockUseCase } from '@/use-cases/stock/RecordDailyStockUseCase';

// Dependency Injection Container
export const container = {
  saleUseCase: () => {
    const repo = new SupabaseDailySaleRepository();
    return new RecordDailySaleUseCase(repo);
  },
  stockUseCase: () => {
    const repo = new SupabaseDailyStockRepository();
    return new RecordDailyStockUseCase(repo);
  },
};
