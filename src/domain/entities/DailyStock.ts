export type DailyStock = {
  id: string;
  productId: string;
  outletId: string;
  stockDate: Date;        // Tanggal stok (misal: 2025-09-01)
  stockAwal: number;      // Stok awal hari itu
  stockIn: number;        // Stok masuk hari itu
  stockOut: number;       // Stok keluar (biasanya = penjualan)
  stockAkhir: number;     // Stok akhir = awal + masuk - keluar
  createdAt: Date;
};