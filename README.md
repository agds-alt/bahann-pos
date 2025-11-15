# AGDS Corp POS - Warehouse & Point of Sale System

Modern, full-stack warehouse and point-of-sale management system built with **Next.js**, **tRPC**, **JWT authentication**, **Redis**, and **Supabase**.

## 🎯 Features

### Authentication & Security
- ✅ JWT-based authentication with **7-day session** expiry
- ✅ Redis session management for scalability
- ✅ Secure password hashing with bcrypt
- ✅ Protected routes and API endpoints

### Warehouse Management
- ✅ Daily stock movement tracking (stock in/out)
- ✅ Stock validation (awal + in - out = akhir)
- ✅ Multi-outlet inventory monitoring
- ✅ Low stock alerts
- ✅ Real-time stock updates

### Point of Sale (POS)
- ✅ Sales transaction recording
- ✅ Automatic revenue calculation
- ✅ Sales history and analytics
- ✅ Multi-outlet sales tracking
- ✅ Daily sales summaries

### UI/UX Design
- ✅ Minimalist white background
- ✅ 3D shadow effects on buttons and containers
- ✅ **Tablet/iPad optimized layout** (primary target)
- ✅ Responsive design for all screen sizes
- ✅ Intuitive navigation with sidebar
- ✅ Real-time form validation

## 🛠 Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **tRPC** (Type-safe API)
- **React Query** (Data fetching)
- **Recharts** (Data visualization)

### Backend
- **Next.js API Routes**
- **tRPC Server**
- **Supabase** (PostgreSQL)
- **Redis** (Session management)
- **JWT** (Authentication)

### Architecture
- **Domain-Driven Design (DDD)**
- **Clean Architecture**
- **Repository Pattern**
- **Dependency Injection**

## 📦 Installation

### Prerequisites
- Node.js 18+ (or 20+)
- pnpm (recommended) or npm
- Redis server
- Supabase account

### 1. Clone the repository
```bash
git clone <repository-url>
cd bahann-pos
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Setup environment variables
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# JWT Secret (change this!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Next.js
PORT=3000
```

### 4. Setup Supabase database

Run the migration to create the `users` table:

```sql
-- migrations/001_create_users_table.sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_outlet_id ON users(outlet_id);
```

**Note:** Tables `products`, `outlets`, `daily_sales`, and `daily_stock` should already exist in your Supabase project.

### 5. Start Redis server
```bash
# macOS (via Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

### 6. Run development server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
bahann-pos/
├── src/
│   ├── app/                          # Next.js app directory
│   │   ├── (app)/                    # Authenticated app routes
│   │   │   ├── dashboard/            # Dashboard page
│   │   │   ├── warehouse/            # Warehouse pages
│   │   │   │   └── stock/            # Stock management
│   │   │   ├── pos/                  # POS pages
│   │   │   │   └── sales/            # Sales transaction
│   │   │   └── layout.tsx            # App layout with sidebar
│   │   ├── api/trpc/[trpc]/          # tRPC API handler
│   │   ├── login/                    # Login page
│   │   ├── register/                 # Register page
│   │   └── layout.tsx                # Root layout
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # UI components
│   │   │   ├── Button.tsx            # 3D shadow button
│   │   │   ├── Card.tsx              # 3D shadow card
│   │   │   └── Input.tsx             # Form inputs
│   │   └── layout/                   # Layout components
│   │       ├── Sidebar.tsx           # Navigation sidebar
│   │       └── AppLayout.tsx         # Main app layout
│   │
│   ├── domain/                       # Business logic (DDD)
│   │   ├── entities/                 # Domain entities
│   │   │   ├── User.ts
│   │   │   ├── Product.ts
│   │   │   ├── DailySale.ts
│   │   │   └── DailyStock.ts
│   │   └── repositories/             # Repository interfaces
│   │       ├── UserRepository.ts
│   │       ├── DailySaleRepository.ts
│   │       └── DailyStockRepository.ts
│   │
│   ├── use-cases/                    # Application logic
│   │   ├── auth/                     # Auth use cases
│   │   │   ├── RegisterUserUseCase.ts
│   │   │   ├── LoginUserUseCase.ts
│   │   │   └── LogoutUserUseCase.ts
│   │   ├── sale/                     # Sales use cases
│   │   │   └── RecordDailySaleUseCase.ts
│   │   └── stock/                    # Stock use cases
│   │       └── RecordDailyStockUseCase.ts
│   │
│   ├── infra/                        # Infrastructure layer
│   │   ├── supabase/                 # Supabase client
│   │   │   └── client.ts
│   │   ├── repositories/             # Repository implementations
│   │   │   ├── SupabaseUserRepository.ts
│   │   │   ├── SupabaseDailySaleRepository.ts
│   │   │   └── SupabaseDailyStockRepository.ts
│   │   ├── container.ts              # Dependency injection
│   │   └── database.types.ts         # Supabase types
│   │
│   ├── server/                       # tRPC server
│   │   ├── routers/                  # tRPC routers
│   │   │   ├── _app.ts               # Root router
│   │   │   ├── auth.ts               # Auth router
│   │   │   ├── stock.ts              # Stock router
│   │   │   └── sales.ts              # Sales router
│   │   └── trpc.ts                   # tRPC config
│   │
│   ├── lib/                          # Utilities
│   │   ├── trpc/                     # tRPC client setup
│   │   │   ├── client.ts
│   │   │   └── Provider.tsx
│   │   ├── jwt.ts                    # JWT utilities
│   │   └── redis.ts                  # Redis client
│   │
│   └── shared/                       # Shared utilities
│       ├── exceptions/
│       │   └── AppError.ts
│       └── utils/
│           └── validation.ts
│
├── migrations/                       # Database migrations
│   └── 001_create_users_table.sql
├── package.json
├── tsconfig.json
└── README.md
```

## 🗄 Database Schema

### Tables

#### `users`
```sql
- id: UUID (PK)
- email: VARCHAR(255) UNIQUE
- name: VARCHAR(255)
- password_hash: VARCHAR(255)
- outlet_id: UUID (FK → outlets.id)
- role: VARCHAR(50)
- created_at: TIMESTAMP
```

#### `products`
```sql
- id: UUID (PK)
- sku: VARCHAR UNIQUE
- name: VARCHAR
- category: VARCHAR
- price: NUMERIC
- created_at: TIMESTAMP
```

#### `outlets`
```sql
- id: UUID (PK)
- name: VARCHAR
- created_at: TIMESTAMP
```

#### `daily_stock`
```sql
- id: UUID (PK)
- product_id: UUID (FK → products.id)
- outlet_id: UUID (FK → outlets.id)
- stock_date: DATE
- stock_awal: NUMERIC
- stock_in: NUMERIC
- stock_out: NUMERIC
- stock_akhir: NUMERIC
- created_at: TIMESTAMP
```

#### `daily_sales`
```sql
- id: UUID (PK)
- product_id: UUID (FK → products.id)
- outlet_id: UUID (FK → outlets.id)
- sale_date: DATE
- quantity_sold: NUMERIC
- revenue: NUMERIC
- created_at: TIMESTAMP
```

## 🔌 API Routes (tRPC)

### Authentication
```typescript
// Register
trpc.auth.register.useMutation({
  email: string
  password: string
  name: string
  outletId?: string
  role?: string
})

// Login
trpc.auth.login.useMutation({
  email: string
  password: string
})

// Logout
trpc.auth.logout.useMutation()

// Get current user
trpc.auth.me.useQuery()
```

### Stock Management
```typescript
// Record stock
trpc.stock.record.useMutation({
  productId: string
  outletId: string
  stockDate: string (YYYY-MM-DD)
  stockAwal: number
  stockIn: number
  stockOut: number
  stockAkhir: number
})

// Get latest stock
trpc.stock.getLatest.useQuery({
  productId: string
  outletId: string
})

// Get stock by date
trpc.stock.getByDate.useQuery({
  outletId: string
  stockDate: string
})
```

### Sales
```typescript
// Record sale
trpc.sales.record.useMutation({
  productId: string
  outletId: string
  saleDate: string (YYYY-MM-DD)
  quantitySold: number
  unitPrice: number
})

// Get sales by date range
trpc.sales.getByDateRange.useQuery({
  outletId: string
  startDate: string
  endDate: string
})
```

## 🎨 UI Components

### Button
```tsx
<Button variant="primary" size="lg" fullWidth>
  Click Me
</Button>
```
Variants: `primary`, `secondary`, `outline`, `danger`
Sizes: `sm`, `md`, `lg`

### Card
```tsx
<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardBody>
    Content
  </CardBody>
</Card>
```
Variants: `default`, `elevated`, `flat`
Padding: `none`, `sm`, `md`, `lg`

### Input
```tsx
<Input
  label="Email"
  type="email"
  placeholder="Enter email"
  fullWidth
  error="Error message"
/>
```

## 📱 Responsive Design

The UI is **optimized for tablets/iPad** as the primary target:

- **Tablet (768px+)**: Primary optimized layout with sidebar
- **Mobile (< 768px)**: Responsive stacked layout
- **Desktop (1024px+)**: Full multi-column layout

## 🔐 Authentication Flow

1. User registers via `/register` with email, password, and name
2. Password is hashed with bcrypt (10 rounds)
3. User credentials stored in Supabase `users` table
4. User logs in via `/login`
5. JWT token generated with **7-day expiry**
6. Session created in Redis with **7-day TTL**
7. Token stored in `localStorage`
8. Protected routes check for valid token
9. Session refreshed on activity
10. User logs out → session deleted from Redis

## 🚀 Deployment

### Production Deployment (Vercel)

**Quick Deploy:**
```bash
# Run deployment script (includes pre-deployment checks)
./scripts/deploy.sh

# Or deploy manually
vercel --prod
```

### Environment Variables (Production)

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-only)
- `JWT_SECRET` - Strong random secret (32+ characters)
- `REDIS_URL` - Upstash Redis connection URL
- `REDIS_TOKEN` - Upstash Redis token
- `NEXT_PUBLIC_APP_URL` - Production domain URL

**Optional:**
- `NEXT_PUBLIC_SENTRY_DSN` - Error tracking (Sentry)
- `NEXT_PUBLIC_GA_ID` - Google Analytics

See [deployment/ENV_VARIABLES.md](deployment/ENV_VARIABLES.md) for complete list.

### Redis (Production)

**Recommended: Upstash** (optimized for serverless/Vercel)

1. Sign up at [Upstash](https://console.upstash.com)
2. Create database: `agds-pos-production`
3. Copy Redis URL and Token
4. Add to Vercel environment variables

Alternative Upstash Redis client available: `src/lib/redis-upstash.ts`

### Health Checks

After deployment, verify system health:

```bash
# Automated health check
./scripts/health-check.sh https://pos.yourdomain.com

# Or check manually
curl https://pos.yourdomain.com/api/health
curl https://pos.yourdomain.com/api/health/database
curl https://pos.yourdomain.com/api/health/redis
```

### Production Documentation

Comprehensive guides available in `/deployment`:

- **[ENV_VARIABLES.md](deployment/ENV_VARIABLES.md)** - Environment variables reference
- **[PRE_DEPLOYMENT_CHECKLIST.md](deployment/PRE_DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist
- **[MONITORING_SETUP.md](deployment/MONITORING_SETUP.md)** - Monitoring & alerting setup
- **[SECURITY.md](deployment/SECURITY.md)** - Security best practices & audit
- **[RUNBOOK.md](deployment/RUNBOOK.md)** - Operations guide & troubleshooting

### Performance Optimizations

This application includes comprehensive performance optimizations:

- ✅ Code splitting (30-40% bundle size reduction)
- ✅ Lazy loading for heavy components (Recharts, modals, forms)
- ✅ Optimized webpack configuration
- ✅ Security headers enabled
- ✅ Production build optimizations

See [docs/CODE_SPLITTING_OPTIMIZATION.md](docs/CODE_SPLITTING_OPTIMIZATION.md) for details.

### Deployment Workflow

1. **Pre-Deployment Checks**
   - Run `./scripts/deploy.sh` (automated checks)
   - Review [deployment/PRE_DEPLOYMENT_CHECKLIST.md](deployment/PRE_DEPLOYMENT_CHECKLIST.md)

2. **Deploy to Vercel**
   - Automatic deployment from `main` branch
   - Or manual: `vercel --prod`

3. **Post-Deployment**
   - Health checks: `./scripts/health-check.sh`
   - Monitor errors and performance
   - Verify critical features

4. **Rollback (if needed)**
   - Vercel Dashboard → Deployments → Rollback
   - Or CLI: `vercel rollback`

## 📝 Scripts

### Development Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint

# Generate Supabase types
npm run gen:types

# Bundle analysis
npm run analyze
```

### Deployment & Operations Scripts

```bash
# Deploy to production (with pre-deployment checks)
./scripts/deploy.sh

# Health check
./scripts/health-check.sh https://pos.yourdomain.com

# Database backup
./scripts/backup-database.sh
```

## 🧪 Testing

```bash
# TODO: Add testing setup
# - Unit tests (Vitest)
# - Integration tests
# - E2E tests (Playwright)
```

## 📄 License

MIT

## 👨‍💻 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, tRPC, and TypeScript**
