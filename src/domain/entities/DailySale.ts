export type DailySale = {
  id: string;
  productId: string;
  outletId: string;
  saleDate: Date;
  quantitySold: number;
  revenue: number;
  createdAt: Date;
};
