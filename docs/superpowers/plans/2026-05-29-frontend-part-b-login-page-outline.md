# Frontend Part B: Login Page + Tests (OUTLINE)

> **Status:** Outline only - detailed plan will be created after Part A completion

**Dependencies:** Part A (Infrastructure + Auth System) must be complete

**Goal:** Implement luxury login page with full test coverage (unit, E2E, visual regression)

**Deliverables:**
- Auth layout with floating gradient orbs
- Login page wrapper (Server Component)
- LoginForm component with React Hook Form + Zod
- Error handling (inline validation, 401 banner, 423 modal)
- Password visibility toggle
- "Remember me" functionality
- Complete test suite (unit, E2E, visual)

---

## Planned Tasks (Summary)

**Layout & Structure:**
1. Create auth layout (`app/(auth)/layout.tsx`) - luxury gradient background, animated orbs, skip-to-content link
2. Create login page wrapper (`app/(auth)/login/page.tsx`) - two-column responsive grid, branding section

**LoginForm Component:**
3. Create LoginForm component (`app/(auth)/login/LoginForm.tsx`) - Client Component with React Hook Form
4. Implement form fields (email, password, rememberMe) with Zod validation
5. Add password visibility toggle
6. Implement smart validation (blur first, then real-time after submit)
7. Add error display (inline for validation, banner for 401, modal for 423)
8. Add loading state during submission
9. Implement redirect logic (returnTo URL or /dashboard fallback)

**Unit Tests:**
10. LoginForm renders all fields
11. LoginForm validation on blur
12. LoginForm real-time validation after submit attempt
13. LoginForm displays 401 error banner
14. LoginForm shows 423 lockout modal
15. LoginForm password visibility toggle
16. LoginForm submits correct data to authApi
17. LoginForm redirects after successful login

**E2E Tests:**
18. User can log in with valid credentials
19. User sees error with invalid credentials
20. User is redirected to dashboard after login
21. Password visibility toggle works
22. Remember me checkbox persists preference
23. Keyboard navigation works (Tab through form)
24. Screen reader announces errors

**Visual Regression Tests:**
25. Login page (desktop 1920x1080)
26. Login page (mobile 375x667)
27. Login page with validation errors
28. Login page with 401 error banner
29. Login page with loading state
30. Login page with 423 lockout modal

**Accessibility:**
31. Skip-to-content link works
32. Focus indicators visible
33. Error messages announced to screen readers
34. Color contrast meets WCAG AA

---

## File Structure

**To be created:**
- `frontend/app/(auth)/layout.tsx`
- `frontend/app/(auth)/login/page.tsx`
- `frontend/app/(auth)/login/LoginForm.tsx`
- `frontend/__tests__/components/LoginForm.test.tsx`
- `frontend/e2e/auth.spec.ts`
- `frontend/e2e/visual/login.visual.spec.ts`
- `frontend/e2e/accessibility.spec.ts` (partial - login page only)

---

## Verification

Before marking Part B complete:
- [ ] `npm run test` passes (100% coverage maintained)
- [ ] `npm run test:e2e` passes (login flow)
- [ ] `npm run test:visual` passes (or baselines created)
- [ ] Login with test@example.com / Test123!@# works
- [ ] Login with invalid credentials shows error
- [ ] Password toggle works
- [ ] Remember me checkbox works
- [ ] Redirect to saved URL after login works
- [ ] Keyboard navigation works
- [ ] Screen reader announces errors
- [ ] Luxury aesthetic matches HTML prototype

**Next:** Part C - Dashboard + Tests
