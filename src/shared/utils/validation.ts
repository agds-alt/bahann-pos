import { z } from 'zod';

// Validasi input untuk penjualan harian
export const DailySaleInputSchema = z.object({
  productId: z.string().uuid(),
  outletId: z.string().uuid(),
  saleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  quantitySold: z.number().int().min(1),
  unitPrice: z.number().positive(),
});

// Validasi input untuk stok harian
export const DailyStockInputSchema = z.object({
  productId: z.string().uuid(),
  outletId: z.string().uuid(),
  stockDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  stockAwal: z.number().int().nonnegative(),
  stockIn: z.number().int().nonnegative(),
  stockOut: z.number().int().nonnegative(),
  stockAkhir: z.number().int().nonnegative(),
});

export type DailySaleInput = z.infer<typeof DailySaleInputSchema>;
export type DailyStockInput = z.infer<typeof DailyStockInputSchema>;
