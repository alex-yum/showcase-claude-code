# ShopHub Frontend

Luxury e-commerce platform built with Next.js 15.

## ⚠️ Security Warning

**Current Implementation Uses localStorage for JWT Tokens**

This is a **temporary MVP solution only**. localStorage is vulnerable to XSS attacks - if an attacker injects malicious JavaScript, they can steal tokens.

**Mitigation Timeline:**
- **Current (MVP):** localStorage with input sanitization
- **Next Sprint:** Migrate to HTTP-only cookies when API Gateway is ready
- HTTP-only cookies are immune to XSS token theft

**DO NOT deploy to production without security review and migration to HTTP-only cookies.**

## Test Credentials

For MSW mocked authentication:
- **Email**: test@example.com
- **Password**: Test123!@#

## Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests
npm run test:coverage # Coverage report
```

## Architecture

- **Next.js 15** with App Router
- **React Server Components** by default
- **Client Components** for interactivity
- **MSW** mocks all API calls
- **100% test coverage** enforced
