# Frontend Part C: Dashboard + Tests (OUTLINE)

> **Status:** Outline only - detailed plan will be created after Part B completion

**Dependencies:** 
- Part A (Infrastructure + Auth System) must be complete
- Part B (Login Page) must be complete

**Goal:** Implement protected luxury dashboard with mock data and full test coverage

**Deliverables:**
- Dashboard layout with header and footer
- Dashboard page with welcome section
- OrderCard component (recent orders)
- QuickActions component (4 action cards)
- StatsCard component (orders, spending, points)
- ProductCard component (recommendations)
- Route protection (redirect to login if not authenticated)
- Mock data for orders, products, stats
- Complete test suite (unit, integration, E2E, visual)

---

## Planned Tasks (Summary)

**Shared Components:**
1. Create Header component (logo, search, cart, notifications, user menu)
2. Create Footer component (links, copyright)
3. Add mock data handlers to MSW (orders, products, stats)

**Dashboard Layout:**
4. Create dashboard layout (`app/(dashboard)/layout.tsx`) - Server Component with Header/Footer
5. Add glassmorphism styling to header
6. Make header sticky on scroll

**Dashboard Page:**
7. Create dashboard page wrapper (`app/(dashboard)/dashboard/page.tsx`) - Server Component
8. Fetch mock data (orders, products, stats)
9. Add welcome section with user name
10. Create responsive grid layout (2 columns on desktop, 1 on mobile)
11. Add route protection (useProtectedRoute hook)

**OrderCard Component:**
12. Create OrderCard component - Client Component
13. Display order number, date, status badge, items, total
14. Add status-specific gradient badges (shipped, delivered, pending)
15. Add action buttons (Track, Details, Buy Again)
16. Implement hover lift animation

**QuickActions Component:**
17. Create QuickActions component - Client Component
18. Create 4 action cards (Shop Now, Track Orders, Wishlist, Sale Items)
19. Add gradient icons with rotation effect
20. Implement hover scale animation

**StatsCard Component:**
21. Create StatsCard component - Client Component
22. Display stats (orders this month, total spent, loyalty points)
23. Add gradient backgrounds for each stat
24. Add icons

**ProductCard Component:**
25. Create ProductCard component - Client Component
26. Display product image, name, price, rating
27. Add heart icon (wishlist toggle)
28. Add "Add to cart" button
29. Implement hover lift animation with shadow

**Unit Tests:**
30. Header component renders logo, search, icons
31. Footer component renders links
32. OrderCard displays order data correctly
33. OrderCard status badges show correct colors
34. QuickActions renders 4 cards
35. StatsCard displays stats correctly
36. ProductCard renders product data
37. ProductCard heart icon toggles

**Integration Tests:**
38. Authenticated user sees dashboard
39. Unauthenticated user redirects to /login
40. After login, user redirects back to dashboard
41. Dashboard loads mock orders/products/stats
42. Dashboard displays user name

**E2E Tests:**
43. Dashboard displays after login
44. Dashboard shows recent orders
45. Dashboard shows product recommendations
46. Dashboard shows stats
47. Quick actions are clickable
48. Order card buttons work
49. Logout button works
50. Animations play correctly

**Visual Regression Tests:**
51. Dashboard (desktop 1920x1080)
52. Dashboard (mobile 375x667)
53. Dashboard (tablet 768x1024)
54. Order card hover state
55. Quick actions hover state
56. Product card hover state
57. Responsive breakpoints (320px, 768px, 1024px, 1440px)

**Accessibility:**
58. Dashboard keyboard navigation
59. Dashboard screen reader support
60. All buttons have proper labels
61. Focus indicators visible
62. Color contrast meets WCAG AA

---

## File Structure

**To be created:**
- `frontend/components/shared/Header.tsx`
- `frontend/components/shared/Footer.tsx`
- `frontend/app/(dashboard)/layout.tsx`
- `frontend/app/(dashboard)/dashboard/page.tsx`
- `frontend/app/(dashboard)/dashboard/OrderCard.tsx`
- `frontend/app/(dashboard)/dashboard/QuickActions.tsx`
- `frontend/app/(dashboard)/dashboard/StatsCard.tsx`
- `frontend/app/(dashboard)/dashboard/ProductCard.tsx`
- `frontend/__tests__/components/Header.test.tsx`
- `frontend/__tests__/components/Footer.test.tsx`
- `frontend/__tests__/components/OrderCard.test.tsx`
- `frontend/__tests__/components/QuickActions.test.tsx`
- `frontend/__tests__/components/StatsCard.test.tsx`
- `frontend/__tests__/components/ProductCard.test.tsx`
- `frontend/__tests__/integration/dashboard-access.test.tsx`
- `frontend/e2e/dashboard.spec.ts`
- `frontend/e2e/visual/dashboard.visual.spec.ts`
- `frontend/e2e/visual/responsive.visual.spec.ts`

**To be modified:**
- `frontend/mocks/handlers.ts` - Add order, product, stats endpoints

---

## Verification

Before marking Part C complete:
- [ ] `npm run test` passes (100% coverage maintained)
- [ ] `npm run test:e2e` passes (dashboard flow)
- [ ] `npm run test:visual` passes (all views)
- [ ] Dashboard redirects to login when not authenticated
- [ ] Dashboard displays after successful login
- [ ] Dashboard shows mock orders
- [ ] Dashboard shows product recommendations
- [ ] Dashboard shows stats
- [ ] All hover animations work
- [ ] All buttons are clickable
- [ ] Header search bar visible
- [ ] Cart icon shows count
- [ ] User menu dropdown works
- [ ] Responsive at all breakpoints (320px, 768px, 1024px, 1440px)
- [ ] Keyboard navigation works
- [ ] Screen reader support works
- [ ] Luxury aesthetic matches HTML prototype
- [ ] Animations run at 60fps
- [ ] Page loads in <2s

---

## Final Deliverable

After Part C completion, the frontend will have:
- Complete login + dashboard functionality
- 100% test coverage (unit, integration, E2E, visual)
- Luxury aesthetic with full animations
- WCAG 2.1 AA accessibility compliance
- <2s page load performance
- Ready for production deployment (with mocked backend)

**Future:** API Gateway integration (swap MSW for real backend)
