export type Product = {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  category?: string;
  price?: number;
  createdAt: Date;
};
