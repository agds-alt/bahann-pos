# 🚀 Bahann POS - Deployment Guide

Complete guide for deploying Bahann POS to Vercel.

## 📋 Prerequisites

Before deploying, ensure you have:
- [Supabase](https://supabase.com) account and project
- [Vercel](https://vercel.com) account
- (Optional) [Upstash Redis](https://upstash.com) for persistent sessions

## 🔧 Step 1: Setup Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Run the database migrations:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  outlet_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create outlets table
CREATE TABLE IF NOT EXISTS outlets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create daily_stock table
CREATE TABLE IF NOT EXISTS daily_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  stock_date DATE NOT NULL,
  stock_awal INTEGER DEFAULT 0,
  stock_in INTEGER DEFAULT 0,
  stock_out INTEGER DEFAULT 0,
  stock_akhir INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, outlet_id, stock_date)
);

-- Create daily_sales table
CREATE TABLE IF NOT EXISTS daily_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  sale_date DATE NOT NULL,
  quantity_sold INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  revenue DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_daily_stock_date ON daily_stock(stock_date);
CREATE INDEX idx_daily_stock_product ON daily_stock(product_id);
CREATE INDEX idx_daily_stock_outlet ON daily_stock(outlet_id);
CREATE INDEX idx_daily_sales_date ON daily_sales(sale_date);
CREATE INDEX idx_daily_sales_product ON daily_sales(product_id);
CREATE INDEX idx_daily_sales_outlet ON daily_sales(outlet_id);
```

4. Get your API credentials:
   - Go to **Project Settings** > **API**
   - Copy **Project URL** (looks like: `https://xxx.supabase.co`)
   - Copy **anon public** key

## 🔑 Step 2: Generate JWT Secret

Generate a secure JWT secret using OpenSSL:

```bash
openssl rand -base64 32
```

Copy the output - you'll need it for Vercel environment variables.

## ☁️ Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm run build`
   - **Install Command**: `pnpm install`

### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## 🌍 Step 4: Set Environment Variables

In Vercel Dashboard, go to:
**Project Settings** > **Environment Variables**

Add the following variables for **Production, Preview, and Development**:

### Required Variables

| Variable | Value | Example |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |
| `JWT_SECRET` | Generated secret from Step 2 | `xK8fN2mP9vL3qR7wY1tH5jB6nC4...` |

### Optional Variables (Recommended for Production)

| Variable | Value | Description |
|----------|-------|-------------|
| `REDIS_URL` | Redis connection URL | For persistent sessions (use Upstash) |

### Upstash Redis Setup (Optional)

1. Go to [Upstash Console](https://console.upstash.com)
2. Create new Redis database
3. Select region closest to your users
4. Copy **UPSTASH_REDIS_REST_URL**
5. Add to Vercel as `REDIS_URL`

**Note**: If you don't set up Redis, the app will work with JWT-only sessions (which is fine for most use cases).

## 🔄 Step 5: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** button
4. Check deployment logs for any errors

## ✅ Step 6: Verify Deployment

1. Visit your deployed URL (e.g., `https://your-app.vercel.app`)
2. You should be redirected to `/login`
3. Register a new user at `/register`
4. Login and verify dashboard loads

## 🧪 Testing

Create test data:

1. Register a user via `/register`
2. Create outlets via `/outlets`
3. Create products via `/products`
4. Test stock management via `/warehouse/stock`
5. Test POS sales via `/pos/sales`

## 🐛 Troubleshooting

### Build Fails

**Error**: `Module not found`
- **Solution**: Check if all dependencies are in `package.json`
- Run `pnpm install` locally first

**Error**: `TypeScript errors`
- **Solution**: Run `pnpm run build` locally to catch errors
- Fix TypeScript errors before deploying

### Runtime Errors

**Error**: 401 Unauthorized on API calls
- **Solution**: Check if JWT_SECRET is set
- Verify Supabase credentials are correct

**Error**: 500 Internal Server Error on login
- **Solution**: Check Vercel logs
- Verify database tables are created
- Check JWT_SECRET environment variable

**Error**: Redis connection failed
- **Solution**: This is okay if REDIS_URL is not set
- App will fall back to JWT-only sessions
- Set up Upstash Redis for persistent sessions

### Check Vercel Logs

```bash
# Install Vercel CLI
npm i -g vercel

# View logs
vercel logs
```

Or view in Vercel Dashboard:
**Project** > **Deployments** > Click deployment > **Logs**

## 📊 Environment Variables Summary

### Minimal Setup (Works without Redis)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
JWT_SECRET=your-generated-secret-here
```

### Production Setup (With Redis)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
JWT_SECRET=your-generated-secret-here
REDIS_URL=redis://default:xxx@xxx.upstash.io:6379
```

## 🔒 Security Checklist

- [ ] JWT_SECRET is set and unique (not the default)
- [ ] Supabase RLS (Row Level Security) policies are configured
- [ ] Environment variables are set for Production environment
- [ ] .env files are in .gitignore (never commit secrets)
- [ ] Test user registration and login flow
- [ ] Verify protected routes require authentication

## 📱 Next Steps

After successful deployment:

1. Set up your first outlet
2. Add products to inventory
3. Configure user roles (admin/manager/user)
4. Train staff on POS system
5. Monitor analytics dashboard

## 🆘 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Check Supabase database tables
4. Review browser console for client-side errors

---

**Deployment successful? 🎉**

Your Bahann POS is now live and ready for production use!
