# Performance Optimization Plan

**Created:** 2026-05-25
**Status:** Active
**Priority:** High

---

## Executive Summary

This document outlines a comprehensive performance optimization strategy for GestaltView v2.0, targeting build times, runtime performance, bundle size, and API response latency. The optimizations are grounded in the platform's architecture: React 19 + Vite client, Vercel serverless APIs, and shared TypeScript infrastructure.

---

## Current State Assessment

### Architecture Overview
- **Client:** React 19 + Vite + TypeScript in `client/`
- **Server:** Vercel serverless functions in `api/` (158+ TS files)
- **Shared:** Common types and utilities in `shared/`
- **Build System:** Vite 7.3.2 with TailwindCSS 4.x
- **Components:** 100+ components in `client/src/components/`
- **Hooks:** 20+ custom hooks in `client/src/hooks/`
- **Libraries:** Major dependencies include Babylon.js, Three.js, Framer Motion, Radix UI

### Identified Performance Bottlenecks

1. **Build Configuration Issues** (`vite.config.ts`)
   - Minification disabled in production builds (`minify: false`)
   - Source maps set to "hidden" only when Sentry is configured
   - No chunk splitting strategy for large component trees
   - Meticulous recorder script injected synchronously in dev

2. **Large Bundle Risk**
   - Heavy 3D libraries (Babylon.js, Three.js, React Three Fiber)
   - Multiple animation libraries (Framer Motion, postprocessing)
   - 100+ components potentially bundled together
   - No lazy loading strategy visible in main App.tsx

3. **API Layer Concerns**
   - 158+ serverless function files without apparent code sharing optimization
   - Large utility files (e.g., `supabase.ts` at 43KB, `llmRouter.ts` at 22KB)
   - No visible caching layer for repeated API calls
   - Rate limiting implemented but may add latency

4. **Runtime Performance**
   - Large components (Billy.tsx: 32KB, BillyLive.tsx: 34KB, BillyGreeter.tsx: 20KB)
   - Complex hooks (useSEO.ts: 18KB, embodimentHeartbeat.ts: 21KB)
   - No visible memoization strategy documentation
   - Heavy real-time features (voice chat, biofeedback, binaural beats)

---

## Optimization Strategy

### Phase 1: Build Performance (Week 1)

#### 1.1 Enable Production Minification
**File:** `vite.config.ts`
**Current:** `minify: false`
**Target:** Enable Terser/esbuild minification with safe options

```typescript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: process.env.NODE_ENV === 'production',
      drop_debugger: true,
    },
  },
}
```

**Expected Impact:** 30-40% bundle size reduction

#### 1.2 Implement Code Splitting
**Files:** `vite.config.ts`, `client/src/App.tsx`
**Strategy:** 
- Route-based lazy loading with `React.lazy()` + Suspense
- Vendor chunk separation for large dependencies
- Dynamic imports for heavy 3D components

```typescript
// Manual chunks configuration
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-core': ['react', 'react-dom'],
        'vendor-3d': ['@babylonjs/core', '@babylonjs/loaders', '@react-three/fiber', '@react-three/drei', 'three'],
        'vendor-animation': ['framer-motion'],
        'vendor-ui': ['@radix-ui/*', 'lucide-react'],
      },
    },
  },
}
```

**Expected Impact:** 50-60% faster initial page load, improved caching

#### 1.3 Optimize Dependency Loading
**Strategy:**
- Tree-shake unused Radix UI components
- Lazy load Babylon.js only when 3D features are accessed
- Defer non-critical scripts (analytics, Meticulous in prod)

**Expected Impact:** 20-25% initial bundle reduction

---

### Phase 2: Runtime Performance (Week 2)

#### 2.1 Component Memoization Audit
**Target Files:** All components >10KB
**Actions:**
- Add `React.memo()` to pure components
- Implement `useMemo()` for expensive computations
- Use `useCallback()` for stable function references
- Profile with React DevTools Profiler

**Priority Components:**
- Billy.tsx (32KB)
- BillyLive.tsx (34KB)
- BlueprintGenerativeWorkbench.tsx (22KB)
- ADHDPowerUpStation.tsx (19KB)

**Expected Impact:** 30-50% reduction in unnecessary re-renders

#### 2.2 Hook Optimization
**Target Files:**
- useSEO.ts (18KB) - debounce expensive operations
- embodimentHeartbeat.ts (21KB) - optimize interval timers
- useBiofeedback.ts (9KB) - throttle sensor readings
- useBinauralBeats.ts (9KB) - optimize audio context

**Expected Impact:** Reduced CPU usage, smoother animations

#### 2.3 Image & Asset Optimization
**Actions:**
- Convert large images to WebP/AVIF
- Implement responsive image loading with `srcset`
- Lazy load below-fold images
- Compress SVG assets

**Expected Impact:** 40-60% image payload reduction

---

### Phase 3: API Performance (Week 3)

#### 3.1 Serverless Function Optimization
**Target Files:** Large API handlers in `api/_lib/`
**Actions:**
- Extract shared utilities to reduce duplication
- Implement edge caching for static responses
- Add Redis/Memory cache for frequently accessed data
- Optimize Supabase queries with proper indexing

**Expected Impact:** 30-40% API response time improvement

#### 3.2 Request Deduplication
**File:** `client/src/lib/appFetch.ts`
**Actions:**
- Implement request deduplication for concurrent identical requests
- Add intelligent retry logic with exponential backoff
- Cache GET requests with configurable TTL

**Expected Impact:** 50% reduction in redundant API calls

#### 3.3 Database Query Optimization
**Actions:**
- Audit slow Supabase queries
- Add database indexes for common query patterns
- Implement connection pooling where applicable
- Use prepared statements for repeated queries

**Expected Impact:** 40-60% database query improvement

---

### Phase 4: Advanced Optimizations (Week 4)

#### 4.1 Service Worker Implementation
**Strategy:**
- Cache static assets for offline support
- Implement stale-while-revalidate for API responses
- Pre-cache critical routes

**Expected Impact:** Instant repeat visits, offline capability

#### 4.2 Virtual Scrolling for Large Lists
**Target:** Any list rendering >50 items
**Library:** Consider `react-virtual` or similar
**Expected Impact:** Smooth scrolling regardless of list size

#### 4.3 Web Workers for Heavy Computation
**Candidates:**
- Embedding generation
- Large file processing
- Complex 3D calculations

**Expected Impact:** Non-blocking UI during heavy operations

---

## Measurement & Monitoring

### Key Performance Indicators (KPIs)

| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| First Contentful Paint (FCP) | TBD | <1.5s | Critical |
| Largest Contentful Paint (LCP) | TBD | <2.5s | Critical |
| Time to Interactive (TTI) | TBD | <3.5s | High |
| Cumulative Layout Shift (CLS) | TBD | <0.1 | High |
| Total Blocking Time (TBT) | TBD | <200ms | High |
| Bundle Size (main chunk) | TBD | <200KB | Medium |
| API p95 Latency | TBD | <300ms | High |

### Monitoring Tools

1. **Sentry Performance** (already integrated)
   - Enable performance monitoring
   - Set up custom transactions for key user flows
   - Configure alerts for performance regressions

2. **Vercel Analytics** (already integrated)
   - Monitor Core Web Vitals in production
   - Track geographic performance distribution

3. **Lighthouse CI**
   - Add automated Lighthouse runs to CI/CD
   - Set performance budgets with failure thresholds

4. **Bundle Analyzer**
   - Add `rollup-plugin-visualizer` to analyze bundle composition
   - Run weekly to catch bundle creep

---

## Implementation Checklist

### Phase 1: Build Performance
- [ ] Enable minification in vite.config.ts
- [ ] Configure manual chunks for vendor libraries
- [ ] Implement route-based code splitting
- [ ] Add bundle analyzer to build process
- [ ] Test source map upload to Sentry

### Phase 2: Runtime Performance
- [ ] Profile app with React DevTools
- [ ] Add React.memo to pure components
- [ ] Optimize expensive hooks
- [ ] Implement image optimization pipeline
- [ ] Add performance monitoring to key components

### Phase 3: API Performance
- [ ] Audit and optimize large API handlers
- [ ] Implement request deduplication
- [ ] Add caching layer for frequent queries
- [ ] Optimize Supabase queries and indexes
- [ ] Set up API performance monitoring

### Phase 4: Advanced Optimizations
- [ ] Implement service worker
- [ ] Add virtual scrolling where needed
- [ ] Move heavy computation to web workers
- [ ] Set up performance regression testing
- [ ] Document performance best practices

---

## Risk Mitigation

### Potential Risks

1. **Over-optimization**
   - Risk: Premature optimization complicates code
   - Mitigation: Measure first, optimize bottlenecks only

2. **Code Splitting Complexity**
   - Risk: Too many chunks increase HTTP overhead
   - Mitigation: Monitor chunk count, use HTTP/2

3. **Caching Staleness**
   - Risk: Users see outdated data
   - Mitigation: Implement proper cache invalidation

4. **Third-party Script Impact**
   - Risk: Analytics/tracking scripts block rendering
   - Mitigation: Load non-critical scripts asynchronously

### Rollback Plan

Each optimization phase includes:
- Feature flags for gradual rollout
- Performance baselines before changes
- Automated tests to catch regressions
- Clear rollback procedures documented

---

## Success Criteria

Optimization efforts are successful when:

1. ✅ All Core Web Vitals meet "Good" thresholds
2. ✅ Production bundle size reduced by 40%+
3. ✅ API p95 latency under 300ms
4. ✅ No performance-related user complaints
5. ✅ Lighthouse score >90 across all categories
6. ✅ Build time reduced by 30%+

---

## Next Steps

1. **Immediate (This Week):**
   - Run Lighthouse audit on production deployment
   - Set up bundle analyzer
   - Profile app with React DevTools
   - Create baseline performance metrics

2. **Short-term (Next 2 Weeks):**
   - Implement Phase 1 optimizations
   - Begin Phase 2 component audit
   - Set up performance monitoring dashboards

3. **Long-term (Next Month):**
   - Complete all four phases
   - Document learnings and best practices
   - Establish ongoing performance review cadence

---

## References

- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [React Performance Best Practices](https://react.dev/learn/render-and-commit)
- [Web Vitals Documentation](https://web.dev/vitals/)
- [Vercel Performance Guidelines](https://vercel.com/docs/edge-network/caching)
- Internal: `.agents/skills/context-optimization/SKILL.md`

---

**Owner:** Performance Optimization Initiative
**Review Cadence:** Weekly
**Last Updated:** 2026-05-25
