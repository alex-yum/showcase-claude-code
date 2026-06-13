# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this repository.

## Project Overview

**B2C e-commerce platform** with AI-powered recommendations and chatbot assistance.

**Target:** 2,000-10,000 orders/month | **Timeline:** 1-3 month MVP  
**Status:** Pre-implementation - architecture defined, no code written yet  
**Development:** Full agentic coding with AI code generation

## Architecture at a Glance

**Polyglot microservices** (12 services) with gRPC internal communication:
- **Java/Spring Boot:** Auth, Order, Payment, Admin (4 services)
- **Go:** Product, Search, Promotion, Analytics (4 services)
- **NestJS:** API Gateway, User, Cart, Notification (4 services)
- **Frontend:** Next.js 14+ (React/TypeScript) + Tailwind + shadcn/ui
- **AI Modules:** Python FastAPI (chatbot + recommendations)

**Data:** PostgreSQL + Redis + Typesense + RabbitMQ/SQS  
**Cloud:** AWS (ECS Fargate, RDS, ElastiCache, S3/CloudFront)

## Critical Constraints

- **Performance:** <2s page loads, <500ms API response, 99.9% uptime (see HLTD for complete targets)
- **Scale:** 10,000+ concurrent users, auto-scaling
- **Security:** PCI-DSS compliance (Stripe only), GDPR/CCPA, JWT + BCrypt (cost 12)
- **Communication:** REST (browser→gateway), gRPC (service-to-service)
- **Quality:** 100% test coverage, code quality tools (see `CONTRIBUTING.md`)

## Non-Negotiable Rules

1. **Never handle raw card data** - use Stripe Elements/tokenization only
2. **gRPC for all internal service calls** - REST only at API Gateway edge
3. **API versioning from day 1** - all endpoints start with `/api/v1/`
4. **Database migrations only** - never manual schema changes (use Flyway/Prisma Migrate)
5. **Independent deployability** - each microservice must deploy independently

## Test Execution Requirements (NON-NEGOTIABLE)

**ALL code changes MUST have passing tests before commit. NO EXCEPTIONS.**

### Enforcement Rules

1. **TDD Cycle (Red-Green-Refactor):**
   - Write failing test first
   - **RUN THE TEST** - verify it fails for the right reason
   - Implement minimum code to pass
   - **RUN THE TEST** - verify it passes
   - Refactor if needed
   - **RUN THE TEST** - verify it still passes

2. **Refactoring:**
   - **RUN ALL TESTS** before refactoring
   - Make changes
   - **RUN ALL TESTS** after refactoring
   - If tests fail, fix immediately or revert

3. **Missing Test Infrastructure:**
   - Missing test infrastructure (Maven wrapper, package.json, etc.) is a **BLOCKER**
   - **STOP IMMEDIATELY** and set up test infrastructure first
   - Never proceed with "structure only" - tests must be executable

### Blocking Verification Checklist

Before ANY commit, verify:
- [ ] Test infrastructure exists and is executable
- [ ] All tests run successfully
- [ ] No tests were skipped or bypassed
- [ ] Test output was reviewed for warnings/errors

### Test Commands by Service

**Java/Spring Boot Services (auth-service, order-service, payment-service, admin-service):**
```bash
cd backend/services/{service-name}
./mvnw test
```

**Go Services (product-service, search-service, promotion-service, analytics-service):**
```bash
cd backend/services/{service-name}
go test ./...
```

**NestJS Services (api-gateway, user-service, cart-service, notification-service):**
```bash
cd backend/services/{service-name}
npm test
```

**Frontend:**
```bash
cd frontend
npm test
```

**AI Modules:**
```bash
cd ai-modules/{module-name}
pytest
```

### NO BYPASSES

- "I'll run tests later" ❌
- "Tests are too slow" ❌
- "Just a small change" ❌
- "Following TDD structure without running tests" ❌
- **Missing test infrastructure is a blocker, not an excuse to skip verification** ❌

**If you cannot run tests, you cannot proceed. Period.**

## Documentation Map

**Start here based on your task:**

| What you need | Where to find it |
|--------------|------------------|
| Business context, KPIs, market requirements | `requirement/Business Requirement.md` |
| Complete architecture, tech stack, service details | `design/High Level Technical Design.md` ⭐ |
| Service implementation specs | `docs/superpowers/specs/` |
| MVP feature scope | `requirement/Business Requirement.md` → Functional Requirements |
| Development standards, testing, code quality | `CONTRIBUTING.md` |

⭐ **Most important:** Read `design/High Level Technical Design.md` for comprehensive architecture decisions, polyglot strategy rationale, performance characteristics, and service-by-service technology choices.

## Single Source of Truth

| Information | Canonical Location |
|-------------|-------------------|
| Technology stack & rationale | `design/High Level Technical Design.md` |
| Performance targets | `design/High Level Technical Design.md` → Performance Characteristics |
| Infrastructure (AWS) | `design/High Level Technical Design.md` |
| Inter-service communication | `design/High Level Technical Design.md` |
| Development standards & testing | `CONTRIBUTING.md` |
| Service-specific implementation | `docs/superpowers/specs/{service}-design.md` |
| Business requirements | `requirement/Business Requirement.md` |

## Quick Reference

**Project structure (planned):**
```
/frontend/           # Next.js
/backend/services/   # Microservices (Java/Go/NestJS)
/ai-modules/         # Python (chatbot + recommendations)
/infrastructure/     # Terraform, Docker, K8s
/shared/             # .proto files, database schemas
```

**Common commands:** See individual service READMEs when implemented.

---

**Last Updated:** June 13, 2026  
**Version:** 1.2 (AI-agnostic version)

**Always check `design/High Level Technical Design.md` for authoritative architecture decisions.**
