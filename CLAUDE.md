# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

**Last Updated:** May 24, 2026  
**Version:** 1.1 (Condensed navigation format)

**Always check `design/High Level Technical Design.md` for authoritative architecture decisions.**
