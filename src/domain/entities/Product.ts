export type Product = {
  id: string;
  sku: string;
  name: string;
  category?: string;
  price?: number;
  createdAt: Date;
};
