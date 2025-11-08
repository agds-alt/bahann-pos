# Code Splitting & Lazy Loading Guide

## Overview

Code splitting is a technique to reduce initial bundle size by splitting code into smaller chunks that are loaded on-demand. This improves initial page load performance and overall user experience.

## Benefits

- **Faster Initial Load**: Smaller initial bundle means faster time-to-interactive
- **Reduced Network Usage**: Users only download code they need
- **Better Caching**: Smaller chunks can be cached more effectively
- **Improved Performance**: Particularly beneficial for mobile users

## Implementation Strategy

### 1. Route-Based Code Splitting

Next.js automatically performs route-based code splitting with the App Router. Each route is split into its own chunk.

```typescript
// Automatic route-based splitting by Next.js App Router
src/app/(app)/dashboard/page.tsx    // Separate chunk
src/app/(app)/products/page.tsx     // Separate chunk
src/app/(app)/outlets/page.tsx      // Separate chunk
```

**Benefits**:
- ✅ No configuration needed
- ✅ Automatic by Next.js
- ✅ Each page loads only what it needs

### 2. Component-Based Code Splitting

For heavy components (e.g., charts, editors, modals), use React.lazy() and Suspense.

#### Heavy Dependencies Identified

The following libraries are heavy and good candidates for lazy loading:

| Library | Approximate Size | Used In | Status |
|---------|-----------------|---------|--------|
| recharts | ~100KB+ | Dashboard, Reports, Revenue | ✅ Optimized |
| react-pdf | ~80KB+ | Not used yet | N/A |
| monaco-editor | ~1MB+ | Not used yet | N/A |

#### Implementation Pattern

**Before (Eager Loading)**:
```typescript
// ❌ Bad: Loads recharts in initial bundle
import { LineChart, Line, XAxis, YAxis } from 'recharts'

export default function Dashboard() {
  return (
    <LineChart data={data}>
      <Line dataKey="revenue" />
    </LineChart>
  )
}
```

**After (Lazy Loading)**:
```typescript
// ✅ Good: Lazy loads chart component
import { RevenueLineChart } from '@/components/charts'

export default function Dashboard() {
  return (
    <RevenueLineChart
      data={data}
      formatCurrency={formatCurrency}
      formatDate={formatDate}
    />
  )
}
```

**Chart Component with Lazy Loading**:
```typescript
// src/components/charts/index.tsx
'use client'

import { lazy, Suspense } from 'react'
import { ChartSkeleton } from './ChartSkeleton'

// Lazy load the actual chart component
const RevenueLineChartLazy = lazy(() =>
  import('./RevenueLineChart').then((mod) => ({ default: mod.RevenueLineChart }))
)

// Export wrapped with Suspense for loading state
export function RevenueLineChart(props) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <RevenueLineChartLazy {...props} />
    </Suspense>
  )
}
```

### 3. Loading States

Always provide meaningful loading states for lazy-loaded components:

**Loading Skeleton**:
```typescript
export function ChartSkeleton() {
  return (
    <div className="h-64 w-full animate-pulse">
      <div className="h-full w-full bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-500">Loading chart...</p>
        </div>
      </div>
    </div>
  )
}
```

## Lazy Loading Patterns

### Pattern 1: Simple Component Lazy Loading

```typescript
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  )
}
```

### Pattern 2: Named Export Lazy Loading

```typescript
const ChartComponent = lazy(() =>
  import('./Chart').then((mod) => ({ default: mod.ChartComponent }))
)
```

### Pattern 3: Conditional Lazy Loading

```typescript
function Page() {
  const [showChart, setShowChart] = useState(false)

  return (
    <div>
      <button onClick={() => setShowChart(true)}>Show Chart</button>
      {showChart && (
        <Suspense fallback={<Loading />}>
          <LazyChart />
        </Suspense>
      )}
    </div>
  )
}
```

## Implementation Checklist

When implementing lazy loading:

- [ ] Identify heavy dependencies (>50KB)
- [ ] Extract component into separate file
- [ ] Wrap with React.lazy()
- [ ] Add Suspense boundary with fallback
- [ ] Create loading skeleton matching component size
- [ ] Test loading state in slow network
- [ ] Verify bundle size reduction

## Current Implementation

### Dashboard Page

**Before**:
- Direct import of recharts components
- ~100KB+ added to initial bundle
- Longer time-to-interactive

**After**:
- Lazy-loaded chart component
- ~100KB+ deferred until needed
- Faster initial render
- Smooth loading with skeleton

**Code Changes**:
```typescript
// Before
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// After
import { RevenueLineChart } from '@/components/charts'
```

**Bundle Impact**:
- Initial bundle: -100KB+ (estimated)
- Chart chunk: +100KB+ (loaded on demand)
- Net improvement: Faster initial load

## Best Practices

### 1. Lazy Load Heavy Libraries

```typescript
// ✅ Good: Lazy load heavy charting library
const Chart = lazy(() => import('@/components/Chart'))

// ❌ Bad: Always load heavy library
import Chart from '@/components/Chart'
```

### 2. Use Loading Boundaries

```typescript
// ✅ Good: Provide loading state
<Suspense fallback={<Skeleton />}>
  <LazyComponent />
</Suspense>

// ❌ Bad: No loading state (shows blank until loaded)
<Suspense>
  <LazyComponent />
</Suspense>
```

### 3. Group Related Imports

```typescript
// ✅ Good: Lazy load entire feature
const Editor = lazy(() => import('@/features/Editor'))

// ❌ Bad: Import parts separately
import EditorToolbar from '@/features/Editor/Toolbar'
import EditorCanvas from '@/features/Editor/Canvas'
```

### 4. Avoid Lazy Loading Critical Content

```typescript
// ✅ Good: Load navigation eagerly (always needed)
import Navigation from '@/components/Navigation'

// ❌ Bad: Don't lazy load critical UI
const Navigation = lazy(() => import('@/components/Navigation'))
```

### 5. Use Meaningful Fallbacks

```typescript
// ✅ Good: Match component shape
<Suspense fallback={<ChartSkeleton className="h-64" />}>
  <Chart />
</Suspense>

// ❌ Bad: Generic loading that doesn't match
<Suspense fallback={<div>Loading...</div>}>
  <Chart />
</Suspense>
```

## Measuring Impact

### Using Next.js Build Analysis

```bash
# Build with bundle analysis
npm run build

# Look for "First Load JS" in output
Route (app)                              First Load JS
┌ ○ /                                   150 kB
├ ○ /dashboard                          180 kB  # Before
└ ○ /dashboard                          80 kB   # After (100KB saved!)
```

### Using Chrome DevTools

1. Open DevTools → Network tab
2. Filter by JavaScript
3. Reload page and compare:
   - Initial bundle size
   - Number of chunks
   - Total download time

### Performance Metrics

Monitor these metrics:

- **Time to Interactive (TTI)**: Should decrease
- **First Contentful Paint (FCP)**: Should improve
- **Total Blocking Time (TBT)**: Should reduce
- **Bundle Size**: Should be smaller

## When NOT to Lazy Load

Avoid lazy loading for:

1. **Above-the-fold content**: Content visible on initial page load
2. **Critical UI components**: Navigation, headers, footers
3. **Small components**: Components <10KB (overhead not worth it)
4. **Frequently used components**: User interaction components
5. **SEO-critical content**: Content needed for search engines

## Future Optimizations

Additional code splitting opportunities:

### 1. Modal Dialogs
```typescript
// Lazy load modals (not always shown)
const ProductModal = lazy(() => import('@/components/modals/ProductModal'))
```

### 2. Third-Party Integrations
```typescript
// Lazy load analytics, chat widgets
const ChatWidget = lazy(() => import('@/integrations/ChatWidget'))
```

### 3. Heavy Form Validators
```typescript
// Lazy load complex validation libraries
const AdvancedValidator = lazy(() => import('@/lib/validation/advanced'))
```

### 4. Data Visualization
```typescript
// Already implemented for recharts
// Can extend to other viz libraries if added
```

## Testing

### Manual Testing

1. **Slow 3G Network**:
   - Open DevTools → Network
   - Throttle to "Slow 3G"
   - Observe loading states

2. **Disable Cache**:
   - Clear browser cache
   - Hard reload (Ctrl+Shift+R)
   - Verify chunks load correctly

3. **Error Handling**:
   - Simulate network errors
   - Ensure graceful fallback

### Automated Testing

```typescript
// Test lazy component loads
test('should load chart component', async () => {
  render(<Dashboard />)

  // Should show loading state
  expect(screen.getByText('Loading chart...')).toBeInTheDocument()

  // Should load chart
  await waitFor(() => {
    expect(screen.getByRole('chart')).toBeInTheDocument()
  })
})
```

## Troubleshooting

### Issue: "Element type is invalid"

**Cause**: Incorrect lazy import syntax

**Solution**:
```typescript
// ✅ Correct
const Component = lazy(() => import('./Component'))

// ❌ Wrong
const Component = lazy(() => import('./Component').then(mod => mod.Component))
```

### Issue: Loading state flashes briefly

**Cause**: Component loads too quickly

**Solution**: Add minimum delay
```typescript
const Component = lazy(() =>
  Promise.all([
    import('./Component'),
    new Promise(resolve => setTimeout(resolve, 300)) // Min 300ms
  ]).then(([mod]) => mod)
)
```

### Issue: Suspense boundary not working

**Cause**: Missing 'use client' directive

**Solution**: Add to component file
```typescript
'use client'  // Required for Suspense in Next.js App Router

import { Suspense } from 'react'
```

## Resources

- [Next.js Code Splitting](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [React Lazy Loading](https://react.dev/reference/react/lazy)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

## Summary

Code splitting is a powerful optimization technique that:

- ✅ Reduces initial bundle size
- ✅ Improves page load performance
- ✅ Enhances user experience
- ✅ Optimizes network usage
- ✅ Works great with Next.js App Router

**Golden Rule**: Lazy load heavy, non-critical components that aren't immediately visible or needed.

**Current Status**:
- ✅ Dashboard chart components optimized
- ⏸️ Reports page (can be optimized similarly)
- ⏸️ Revenue page (can be optimized similarly)
- ✅ Pattern established for future components
