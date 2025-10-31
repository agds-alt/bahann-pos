'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/infra/supabase/client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import styles from './page.module.css';

type Product = {
  id: string;
  sku: string;
  name: string;
  price: number | null;
};

type DailyStock = {
  id: string;
  product_id: string;
  stock_akhir: number;
  stock_date: string;
};

type DailySale = {
  id: string;
  product_id: string;
  quantity_sold: number;
  revenue: number;
  sale_date: string;
};

type SaleChartData = {
  date: string;
  [productName: string]: number | string;
};

export default function Dashboard() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<Record<string, number>>({});
  const [sales, setSales] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<SaleChartData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Ambil produk
      const { data: productsData } = await supabase
        .from('products')
        .select('id, sku, name, price')
        .order('name', { ascending: true });
      
      if (!productsData) {
        setLoading(false);
        return;
      }

      // Ambil stok & penjualan untuk tanggal terpilih
      const { data: stockData } = await supabase
        .from('daily_stock')
        .select('product_id, stock_akhir')
        .eq('stock_date', selectedDate);

      const { data: saleData } = await supabase
        .from('daily_sales')
        .select('product_id, quantity_sold')
        .eq('sale_date', selectedDate);

      const stockMap = (stockData || []).reduce((acc, s) => {
        acc[s.product_id] = s.stock_akhir;
        return acc;
      }, {} as Record<string, number>);

      const saleMap = (saleData || []).reduce((acc, s) => {
        acc[s.product_id] = s.quantity_sold;
        return acc;
      }, {} as Record<string, number>);

      setProducts(productsData);
      setStocks(stockMap);
      setSales(saleMap);

      // Fetch chart data (7 hari terakhir)
      const endDate = new Date(selectedDate);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);

      const { data: weeklySales } = await supabase
        .from('daily_sales')
        .select('sale_date, product_id, quantity_sold')
        .gte('sale_date', format(startDate, 'yyyy-MM-dd'))
        .lte('sale_date', selectedDate)
        .order('sale_date', { ascending: true });

      // Format data untuk chart
      const dateRange = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(endDate);
        d.setDate(d.getDate() - i);
        dateRange.push(format(d, 'yyyy-MM-dd'));
      }

      const chartMap: Record<string, SaleChartData> = {};
      dateRange.forEach(date => {
        chartMap[date] = { date };
      });

      (weeklySales || []).forEach(sale => {
        const productName = productsData.find(p => p.id === sale.product_id)?.name || 'Unknown';
        if (!chartMap[sale.sale_date]) return;
        chartMap[sale.sale_date][productName] = (chartMap[sale.sale_date][productName] as number || 0) + sale.quantity_sold;
      });

      setChartData(Object.values(chartMap));

      setLoading(false);
    };

    fetchData();
  }, [selectedDate]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📊 Dashboard Monitoring - OTISTA</h1>

      {/* Date Picker */}
      <div className={styles.datePicker}>
        <label className={styles.datePickerLabel}>Pilih Tanggal</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={styles.dateInput}
        />
      </div>

      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : (
        <>
          {/* Chart Penjualan */}
          <div className={styles.card} style={{ marginBottom: '24px' }}>
            <h2 className={styles.cardTitle}>📈 Penjualan 7 Hari Terakhir</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {products
                    .filter(p => p.price !== null)
                    .map(product => (
                      <Line
                        key={product.id}
                        type="monotone"
                        dataKey={product.name}
                        stroke={`#${Math.floor(Math.random()*16777215).toString(16)}`}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid utama */}
          <div className={styles.grid}>
            {/* Stok Hari Ini */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📦 Stok Akhir ({selectedDate})</h2>
              <div className={styles.productList}>
                {products.map((product) => {
                  const stock = stocks[product.id] ?? 0;
                  const isLowStock = stock < 10 && product.price !== null; // Hanya produk jualan
                  return (
                    <div
                      key={product.id}
                      className={`${styles.productItem} ${isLowStock ? styles.productItemLow : ''}`}
                      style={isLowStock ? { backgroundColor: '#fff8e1', borderLeft: '3px solid #ffc107' } : {}}
                    >
                      <span>{product.name}</span>
                      <span className="font-mono">{stock}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Penjualan Hari Ini */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>💰 Penjualan ({selectedDate})</h2>
              <div className={styles.productList}>
                {products.map((product) => (
                  <div key={product.id} className={styles.productItem}>
                    <span>{product.name}</span>
                    <span className="font-mono">{sales[product.id] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Form Input */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>📥 Input Stok Harian</h2>
          <StockForm date={selectedDate} products={products} />
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>🛒 Input Penjualan Harian</h2>
          <SaleForm date={selectedDate} products={products} />
        </div>
      </div>
    </div>
  );
}

// Form Input Stok
function StockForm({ date, products }: { date: string; products: Product[] }) {
  const [productId, setProductId] = useState('');
  const [stockAwal, setStockAwal] = useState(0);
  const [stockIn, setStockIn] = useState(0);
  const [stockOut, setStockOut] = useState(0);
  const [stockAkhir, setStockAkhir] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        outletId: '73ade584-a37e-4188-a113-078b2f95af4e', // GANTI DENGAN UUID OUTLET OTISTA
        stockDate: date,
        stockAwal,
        stockIn,
        stockOut,
        stockAkhir,
      }),
    });
    if (res.ok) {
      alert('Stok berhasil disimpan!');
      setProductId('');
      setStockAwal(0);
      setStockIn(0);
      setStockOut(0);
      setStockAkhir(0);
    } else {
      alert('Gagal menyimpan stok');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <select
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        className={styles.formSelect}
        required
      >
        <option value="">Pilih Produk</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Stok Awal"
        value={stockAwal || ''}
        onChange={(e) => setStockAwal(Number(e.target.value))}
        className={styles.formInput}
        required
      />
      <input
        type="number"
        placeholder="Stok Masuk"
        value={stockIn || ''}
        onChange={(e) => setStockIn(Number(e.target.value))}
        className={styles.formInput}
        required
      />
      <input
        type="number"
        placeholder="Stok Keluar (Penjualan)"
        value={stockOut || ''}
        onChange={(e) => setStockOut(Number(e.target.value))}
        className={styles.formInput}
        required
      />
      <input
        type="number"
        placeholder="Stok Akhir"
        value={stockAkhir || ''}
        onChange={(e) => setStockAkhir(Number(e.target.value))}
        className={styles.formInput}
        required
      />
      <button type="submit" className={styles.button}>
        Simpan Stok
      </button>
    </form>
  );
}

// Form Input Penjualan
function SaleForm({ date, products }: { date: string; products: Product[] }) {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === productId);
    if (!product || !product.price) return;

    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        outletId: '73ade584-a37e-4188-a113-078b2f95af4e', // GANTI DENGAN UUID OUTLET OTISTA
        saleDate: date,
        quantitySold: quantity,
        unitPrice: product.price,
      }),
    });
    if (res.ok) {
      alert('Penjualan berhasil disimpan!');
      setProductId('');
      setQuantity(1);
    } else {
      alert('Gagal menyimpan penjualan');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <select
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        className={styles.formSelect}
        required
      >
        <option value="">Pilih Produk</option>
        {products
          .filter((p) => p.price !== null)
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (Rp{p.price?.toLocaleString()})
            </option>
          ))}
      </select>
      <input
        type="number"
        placeholder="Jumlah Terjual"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className={styles.formInput}
        required
      />
      <button type="submit" className={`${styles.button} ${styles["button--primary"]}`}>
        Simpan Penjualan
      </button>
    </form>
  );
}
