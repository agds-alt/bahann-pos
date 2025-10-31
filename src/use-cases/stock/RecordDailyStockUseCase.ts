import { DailyStock } from '@/domain/entities/DailyStock';
import { DailyStockRepository } from '@/domain/repositories/DailyStockRepository';

export type RecordDailyStockInput = {
  productId: string;
  outletId: string;
  stockDate: string; // ISO string (YYYY-MM-DD)
  stockAwal: number;
  stockIn: number;
  stockOut: number;
  stockAkhir: number;
};

export class RecordDailyStockUseCase {
  constructor(private readonly repo: DailyStockRepository) {}

  async execute(input: RecordDailyStockInput): Promise<void> {
    const { productId, outletId, stockDate, stockAwal, stockIn, stockOut, stockAkhir } = input;

    // Validasi logika bisnis
    if (stockAkhir !== stockAwal + stockIn - stockOut) {
      throw new Error('Stock akhir tidak sesuai dengan perhitungan: awal + masuk - keluar');
    }

    const stock: DailyStock = {
      id: crypto.randomUUID(),
      productId,
      outletId,
      stockDate: new Date(stockDate),
      stockAwal,
      stockIn,
      stockOut,
      stockAkhir,
      createdAt: new Date(),
    };

    await this.repo.save(stock);
  }
}