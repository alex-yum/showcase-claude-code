# High-Level Technical Architecture

## Document Control
- **Version:** 1.1
- **Last Updated:** May 24, 2026
- **Document Owner:** Technical Architect
- **Status:** Active

---

## Context

This architecture is designed for a B2C e-commerce platform targeting 2,000-10,000 orders/month with aggressive 1-3 month MVP timeline. The business requirements demand:
- **Performance**: <2s page loads, <500ms API response, 99.9% uptime
- **Scalability**: 10,000+ concurrent users, auto-scaling capabilities
- **Security**: PCI-DSS compliance, GDPR/CCPA compliance, enterprise-grade security
- **Intelligence**: AI-powered recommendations and comprehensive chatbot assistance
- **Development Approach**: Full agentic coding with AI code generation

The architecture balances rapid MVP delivery with long-term scalability, leveraging modern cloud-native patterns and managed services to minimize operational overhead.

---

## Recommended Architecture Approach

### **Architecture Style: Cloud-Native Microservices with gRPC & Serverless Components**

**Rationale:**
- Enables independent scaling of components (critical for handling 3x traffic spikes)
- gRPC provides 5-10x performance boost for internal service communication
- AI-generated code eliminates traditional polyglot/gRPC complexity barriers
- Provides clear separation between core e-commerce and AI agentic modules
- Facilitates rapid iteration and deployment within 1-3 month timeline

---

## High-Level System Architecture

### **Frontend Architecture**

#### **Technology Stack**
- **Framework**: **Next.js 14+ (React)** with App Router
  - Server-side rendering (SSR) for performance and SEO
  - Static generation for product catalog pages
  - Built-in API routes for backend integration
  - Excellent TypeScript support
  - Image optimization out-of-the-box
  
- **UI Library**: **Tailwind CSS + shadcn/ui**
  - Rapid UI development with utility-first CSS
  - Pre-built accessible components
  - Consistent design system
  - Small bundle size
  
- **State Management**: **React Context + TanStack Query (React Query)**
  - Server state management with automatic caching
  - Optimistic updates for cart operations
  - Background refetching for real-time data
  
- **Form Handling**: **React Hook Form + Zod**
  - Performant form validation
  - Type-safe schema validation
  - Reduced re-renders
  
- **Additional Libraries**:
  - **Framer Motion**: Animations and transitions
  - **React Hot Toast**: User notifications
  - **date-fns**: Date formatting
  - **recharts**: Dashboard charts and analytics

#### **Frontend Architecture Patterns**

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Next.js Application                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pages/Routes (App Router)                           │  │
│  │  - / (Homepage)                                       │  │
│  │  - /products (Product Listing)                       │  │
│  │  - /products/[id] (Product Detail)                   │  │
│  │  - /cart (Shopping Cart)                             │  │
│  │  - /checkout (Checkout Flow)                         │  │
│  │  - /dashboard (Customer Dashboard)                   │  │
│  │  - /orders (Order History)                           │  │
│  │  - /profile (User Profile)                           │  │
│  │  - /admin/* (Admin Portal)                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Shared Components                                    │  │
│  │  - Header/Navigation                                  │  │
│  │  - ProductCard                                        │  │
│  │  - CartWidget                                         │  │
│  │  - AIChat (floating chatbot interface)              │  │
│  │  - Dashboard widgets                                  │  │
│  │  - Forms (Login, Checkout, etc.)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Data Layer (TanStack Query)                         │  │
│  │  - API client configuration                          │  │
│  │  - Custom hooks (useProducts, useCart, useOrders)   │  │
│  │  - Cache management                                   │  │
│  │  - Optimistic updates                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Context Providers                                    │  │
│  │  - AuthContext (user session)                        │  │
│  │  - CartContext (shopping cart state)                 │  │
│  │  - ThemeContext (UI preferences)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Key Frontend Decisions:**

1. **SSR + Static Generation Hybrid**
   - Product listing pages: Static generation with ISR (Incremental Static Regeneration)
   - Product detail pages: ISR with 60-second revalidation
   - User-specific pages (dashboard, orders): Server-side rendering
   - Target: <2s page load (see Performance Characteristics section for complete targets)

2. **Progressive Web App (PWA)**
   - Service worker for offline capability
   - App manifest for "add to home screen"
   - Push notification support (Phase 2)

3. **Responsive Breakpoints**
   - Mobile: 320px - 767px
   - Tablet: 768px - 1023px
   - Desktop: 1024px+

4. **Code Splitting & Lazy Loading**
   - Route-based code splitting (automatic with Next.js)
   - Lazy load admin components
   - Lazy load AI chatbot on user interaction
   - Dynamic imports for heavy libraries

---

### **Backend Architecture - Polyglot Microservices**

#### **Strategy: Right Technology for Right Workload**

The backend uses a **polyglot microservices architecture**, selecting the optimal technology stack for each service based on its workload characteristics:

- **Java/Spring Boot**: Transaction-heavy, complex business logic, enterprise integration
- **Go**: High-throughput, low-latency, computational workloads
- **NestJS (Node.js/TypeScript)**: I/O-intensive, rapid development, API gateway

#### **Technology Stack by Service**

**Shared Infrastructure:**
- **Database**: PostgreSQL 15+ (AWS RDS)
- **Cache**: Redis (AWS ElastiCache)
- **Search Engine**: Typesense (self-hosted on ECS)
- **Message Queue**: RabbitMQ or AWS SQS
- **API Gateway**: Kong or AWS API Gateway

---

#### **Service-by-Service Technology Decisions**

**1. API Gateway Service - NestJS (Node.js/TypeScript)**
- **Rationale**: Excellent for I/O-bound API routing and aggregation
- **Workload**: High I/O, minimal computation
- **Responsibilities**:
  - Request routing to microservices
  - Authentication/authorization middleware
  - Rate limiting
  - Request/response transformation
  - API composition (aggregating multiple services)
- **Libraries**: Express, Passport, rate-limiter-flexible
- **Database Access**: Redis (session/cache), PostgreSQL (read-only)

**2. Auth Service - Java/Spring Boot**
- **Rationale**: Security-critical, complex token management, enterprise standards
- **Workload**: Mixed I/O and CPU (password hashing)
- **Responsibilities**:
  - User authentication (JWT)
  - Password hashing (BCrypt)
  - Session management
  - OAuth2 integration (Phase 2)
  - Multi-factor authentication (Phase 2)
- **Framework**: Spring Boot 3.x + Spring Security
- **Libraries**: Spring Security, jjwt (JWT), BCrypt
- **Database Access**: PostgreSQL (users table), Redis (sessions, token blacklist)

**3. User Service - NestJS (Node.js/TypeScript)**
- **Rationale**: CRUD-heavy, straightforward business logic, rapid iteration
- **Workload**: I/O-intensive (database reads/writes)
- **Responsibilities**:
  - User profile management
  - Address book CRUD
  - Saved payment methods
  - User preferences
- **ORM**: Prisma (excellent TypeScript integration)
- **Database Access**: PostgreSQL (users, addresses, preferences)

**4. Product Service - Go**
- **Rationale**: High read throughput, fast concurrent requests, inventory management
- **Workload**: High I/O with some computational logic (inventory calculations)
- **Responsibilities**:
  - Product catalog CRUD
  - Inventory management (stock updates)
  - Category hierarchy
  - Image upload coordination
  - Sync to Typesense for search
- **Framework**: Gin or Echo (lightweight HTTP framework)
- **Database Access**: PostgreSQL (products, categories), Redis (product cache), Typesense (search index)
- **Performance**: Goroutines for concurrent inventory updates

**5. Search Service - Go**
- **Rationale**: Low-latency requirements, high concurrency for search queries
- **Workload**: I/O-intensive with computational filtering/ranking
- **Responsibilities**:
  - Product search API
  - Faceted filtering
  - Auto-suggest/autocomplete
  - Search indexing coordination
- **Framework**: Gin + Typesense Go client
- **Database Access**: Typesense (primary), Redis (cache popular searches), PostgreSQL (product metadata)
- **Performance**: Sub-second search response (<500ms)

**6. Cart Service - NestJS (Node.js/TypeScript)**
- **Rationale**: I/O-heavy (Redis operations), frequent updates, simple logic
- **Workload**: High I/O, low computation
- **Responsibilities**:
  - Add/remove cart items
  - Cart persistence (Redis)
  - Inventory validation
  - Price calculation
  - Promotion application
- **Database Access**: Redis (cart storage), PostgreSQL (price/inventory validation)

**7. Order Service - Java/Spring Boot**
- **Rationale**: Complex transactional workflows, ACID requirements, saga pattern
- **Workload**: Transaction-heavy with business logic
- **Responsibilities**:
  - Order creation (multi-step transaction)
  - Order workflow state machine (Pending → Confirmed → Processing → Shipped → Delivered)
  - Payment service integration
  - Inventory reservation/deduction
  - Order history queries
  - Saga orchestration (distributed transactions)
- **Framework**: Spring Boot + Spring Data JPA + Spring State Machine
- **Database Access**: PostgreSQL (orders, order_items), RabbitMQ/SQS (order events)
- **Transactions**: JTA for distributed transactions, Saga pattern for long-running workflows

**8. Payment Service - Java/Spring Boot**
- **Rationale**: Security-critical, PCI compliance, transactional integrity, webhook handling
- **Workload**: I/O with strong consistency requirements
- **Responsibilities**:
  - Stripe integration
  - Payment intent creation
  - PCI-compliant tokenization
  - Webhook handling (async payment confirmations)
  - Refund processing
  - Payment audit logging
- **Framework**: Spring Boot + Stripe Java SDK
- **Database Access**: PostgreSQL (payment_methods, payment audit logs), RabbitMQ (async webhooks)
- **Security**: PCI-DSS SAQ-A compliance, encrypted payment tokens

**9. Promotion Service - Go**
- **Rationale**: High-frequency validation, fast computation of discounts, concurrent rule evaluation
- **Workload**: Computational (rule evaluation) + I/O (database reads)
- **Responsibilities**:
  - Promotion CRUD
  - Promotion validation (eligibility, expiration)
  - Discount calculation
  - Usage tracking
  - Concurrent rule engine for complex promotions
- **Framework**: Gin + rule evaluation engine
- **Database Access**: PostgreSQL (promotions, usage), Redis (active promotions cache)
- **Performance**: Fast rule evaluation (<10ms)

**10. Admin Service - Java/Spring Boot**
- **Rationale**: Complex reporting, batch operations, data aggregation, enterprise features
- **Workload**: Data-intensive with complex queries and batch processing
- **Responsibilities**:
  - User management (admin CRUD)
  - Role-based access control (RBAC)
  - Reporting and analytics
  - Bulk operations (batch updates)
  - Audit logging
  - Export functionality (CSV, PDF)
- **Framework**: Spring Boot + Spring Batch + JasperReports (PDF generation)
- **Database Access**: PostgreSQL (all tables for reporting), Redis (cache)
- **Performance**: Batch processing with Spring Batch for large datasets

**11. Notification Service - NestJS (Node.js/TypeScript)**
- **Rationale**: I/O-bound email sending, queue processing, template rendering
- **Workload**: High I/O, asynchronous processing
- **Responsibilities**:
  - Email queue processing
  - SendGrid/AWS SES integration
  - Template management and rendering
  - Delivery tracking
  - Push notifications (Phase 2)
- **Framework**: NestJS + BullMQ (Redis-based queue)
- **Database Access**: Redis (job queue), PostgreSQL (templates, delivery logs)

**12. Analytics Service - Go**
- **Rationale**: High-throughput event ingestion, computational aggregations, real-time processing
- **Workload**: Computational + high write throughput
- **Responsibilities**:
  - User behavior event tracking
  - Real-time event stream processing
  - Data aggregation for dashboards
  - Metrics calculation
- **Framework**: Go + ClickHouse (for analytics) or TimescaleDB
- **Database Access**: PostgreSQL (user_events), Redis (real-time counters), ClickHouse (analytics queries)
- **Performance**: Handle 10,000+ events/second

---

#### **Backend Architecture Diagram (Polyglot)**

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                         │
│                  (NestJS - Node.js/TypeScript)              │
│                                                              │
│  - Request Routing                                           │
│  - Authentication Middleware                                 │
│  - Rate Limiting                                             │
│  - Response Aggregation                                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                  Microservices Layer                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐│
│  │  Auth Service   │  │ Order Service   │  │   Payment   ││
│  │  (Java/Spring)  │  │ (Java/Spring)   │  │  Service    ││
│  │                 │  │                 │  │(Java/Spring)││
│  │ - JWT Auth      │  │ - Transactions  │  │ - Stripe    ││
│  │ - Sessions      │  │ - Saga Pattern  │  │ - Webhooks  ││
│  │ - BCrypt        │  │ - Workflows     │  │ - PCI       ││
│  └─────────────────┘  └─────────────────┘  └─────────────┘│
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐│
│  │ Product Service │  │ Search Service  │  │ Promotion   ││
│  │     (Go)        │  │     (Go)        │  │  Service    ││
│  │                 │  │                 │  │   (Go)      ││
│  │ - CRUD          │  │ - Typesense     │  │ - Rules     ││
│  │ - Inventory     │  │ - Autocomplete  │  │ - Calc      ││
│  │ - High Reads    │  │ - Low Latency   │  │ - Validate  ││
│  └─────────────────┘  └─────────────────┘  └─────────────┘│
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐│
│  │  User Service   │  │  Cart Service   │  │Notification ││
│  │  (NestJS)       │  │   (NestJS)      │  │  Service    ││
│  │                 │  │                 │  │  (NestJS)   ││
│  │ - Profile       │  │ - Redis Cart    │  │ - Email Q   ││
│  │ - Addresses     │  │ - I/O Heavy     │  │ - SendGrid  ││
│  │ - Prisma ORM    │  │ - Fast Updates  │  │ - BullMQ    ││
│  └─────────────────┘  └─────────────────┘  └─────────────┘│
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  Admin Service  │  │Analytics Service│                  │
│  │  (Java/Spring)  │  │     (Go)        │                  │
│  │                 │  │                 │                  │
│  │ - Reports       │  │ - Event Track   │                  │
│  │ - RBAC          │  │ - Aggregation   │                  │
│  │ - Batch Ops     │  │ - High Writes   │                  │
│  └─────────────────┘  └─────────────────┘                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                  Data Access Layer                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │    Redis     │  │  Typesense   │     │
│  │              │  │              │  │              │     │
│  │ - Users      │  │ - Sessions   │  │ - Products   │     │
│  │ - Products   │  │ - Cache      │  │ - Search     │     │
│  │ - Orders     │  │ - Cart       │  │ - Filters    │     │
│  │ - Payments   │  │ - Limits     │  │ - Suggest    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  RabbitMQ/   │  │  ClickHouse  │                        │
│  │    SQS       │  │ (Analytics)  │                        │
│  │              │  │  (Optional)  │                        │
│  │ - Events     │  │ - Metrics    │                        │
│  │ - Jobs       │  │ - Dashboards │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

#### **Inter-Service Communication**

**External Communication (REST):**
- **Frontend → API Gateway:** REST/JSON for browser compatibility
- Public-facing APIs use REST with OpenAPI/Swagger documentation
- Admin tools and debugging use REST endpoints

**Internal Communication (gRPC):**
- **All service-to-service calls use gRPC** for performance
- Protocol Buffers for strongly-typed contracts across polyglot services
- HTTP/2 multiplexing for reduced connection overhead
- gRPC streaming for Analytics (event ingestion) and Notifications
- Service discovery via AWS ECS Service Discovery or Consul
- Circuit breaker pattern for fault tolerance (Resilience4j, grpc-go middleware)

**Asynchronous Communication (Event-Driven):**
- RabbitMQ or AWS SQS for message queue
- Events: OrderCreated, OrderShipped, PaymentCompleted, InventoryUpdated
- Event-driven workflows (e.g., Order → Payment → Inventory → Notification)

**Data Consistency:**
- Saga pattern for distributed transactions (orchestrated by Order Service via gRPC)
- Eventual consistency for non-critical operations
- ACID transactions within service boundaries (PostgreSQL)

**Protocol Assignment:**
| Service | External Protocol | Internal Protocol |
|---------|-------------------|-------------------|
| API Gateway | REST (to browser) | gRPC (to services) |
| All Backend Services | N/A | gRPC |
| AI Modules | N/A | gRPC + Streaming |

---

#### **Database Access Patterns**

**Java/Spring Boot Services:**
- **ORM**: Spring Data JPA + Hibernate
- **Connection Pool**: HikariCP (high-performance)
- **Transaction Management**: @Transactional annotations
- **Query Optimization**: JPA Criteria API, native queries for complex reports
- **gRPC**: grpc-spring-boot-starter for service communication

**Go Services:**
- **Database Driver**: pgx (PostgreSQL), go-redis (Redis)
- **Query Builder**: sqlx or GORM (lightweight ORM)
- **Connection Pool**: Built-in pgx connection pooling
- **Performance**: Prepared statements, batch operations
- **gRPC**: google.golang.org/grpc (native support)

**NestJS Services:**
- **ORM**: Prisma (type-safe, auto-generated types)
- **Connection Pool**: Prisma built-in pooling
- **Migrations**: Prisma Migrate
- **Query Optimization**: Prisma query optimization, Redis caching
- **gRPC**: @grpc/grpc-js + @nestjs/microservices

---

#### **Performance Characteristics by Technology**

**Overall System Targets:**
- **Page Load Time:** <2s (95th percentile)
- **API Response Time:** <500ms (95th percentile)
- **Search Results:** <1s
- **Uptime:** 99.9% (max 43 min/month downtime)
- **Concurrent Users:** 10,000+
- **Scaling:** Auto-scaling on AWS ECS Fargate

**Service-Level Performance:**

| Service | Technology | Avg Response Time | Throughput | Memory |
|---------|------------|-------------------|------------|--------|
| API Gateway | NestJS | <50ms | 5,000 req/s | 256MB |
| Auth | Java/Spring | <100ms | 2,000 req/s | 512MB |
| User | NestJS | <50ms | 3,000 req/s | 256MB |
| Product | Go | <30ms | 10,000 req/s | 128MB |
| Search | Go | <100ms | 8,000 req/s | 256MB |
| Cart | NestJS | <30ms | 5,000 req/s | 256MB |
| Order | Java/Spring | <200ms | 1,000 req/s | 512MB |
| Payment | Java/Spring | <300ms | 500 req/s | 512MB |
| Promotion | Go | <20ms | 10,000 req/s | 128MB |
| Admin | Java/Spring | <500ms | 500 req/s | 1GB |
| Notification | NestJS | Async | 5,000 jobs/s | 256MB |
| Analytics | Go | <50ms | 10,000 events/s | 256MB |

---

## AI/ML Architecture (Separate Agentic Modules)

### **Technology Stack**
- **AI Platform**: Anthropic Claude API or OpenAI GPT-4
- **Recommendation Engine**: Python FastAPI + scikit-learn
- **Vector Database**: Pinecone or Weaviate

### **AI Services**

**1. AI Chatbot Service (Agentic)**
- Intent Classification (product/order/general)
- Entity Extraction (product names, order IDs)
- Context Manager (conversation history)
- Response Generator (Claude/GPT-4 API)
- Multi-turn conversations with function calling

**2. Recommendation Engine (Agentic)**
- Collaborative Filtering (user-user, item-item)
- Content-Based Filtering (product attributes)
- Matrix Factorization (SVD, ALS)
- Hybrid Model (ensemble)
- APIs for user/product recommendations

---

## Infrastructure & Deployment

### **AWS Infrastructure**
- **Frontend**: Vercel or AWS Amplify (Next.js)
- **Backend**: AWS ECS Fargate (containerized microservices)
- **Database**: AWS RDS PostgreSQL (Multi-AZ)
- **Cache**: AWS ElastiCache Redis
- **Storage**: S3 + CloudFront CDN
- **Queue**: AWS SQS or RabbitMQ on ECS
- **Security**: WAF, Shield, GuardDuty, Secrets Manager

### **CI/CD Pipeline**
- GitHub Actions for automated builds
- Multi-language support (Java, Go, Node.js, Python)
- Automated testing and security scanning
- Blue-green deployment to ECS
- Database migrations with Prisma

---

## Technology Decision Summary

### **Frontend**
- Next.js 14+ (React, TypeScript)
- Tailwind CSS + shadcn/ui
- TanStack Query for state management
- Vercel hosting

### **Backend (Polyglot Microservices)**
- **Java/Spring Boot**: Auth, Order, Payment, Admin
- **Go**: Product, Search, Promotion, Analytics
- **NestJS**: API Gateway, User, Cart, Notification
- PostgreSQL + Redis + Typesense
- RabbitMQ or AWS SQS
- AWS ECS Fargate

### **AI/ML**
- Anthropic Claude or OpenAI GPT-4 (Chatbot)
- Python FastAPI (Recommendations)
- Pinecone/Weaviate (Vector DB)

---

## Agentic Coding Development Approach

### **AI-Powered Development Strategy**

**Code Generation with Claude/GPT-4:**
- Complete service scaffolding from .proto definitions
- Cross-language implementation (Java/Go/NestJS) generated simultaneously
- Test suite generation (unit + integration) with 100% coverage
- Database migrations and schema management
- CI/CD pipeline configuration

**gRPC Implementation:**
- AI generates .proto contracts from business requirements
- Automated code generation for all service stubs and clients
- Polyglot complexity eliminated (AI handles Java/Go/NestJS differences)
- Type-safe service communication maintained automatically

**Quality Assurance:**
- AI-generated code review and security scanning
- Automated refactoring for performance optimization
- Continuous documentation generation
- Integration test scenarios generated from API contracts

---

## Key Architectural Decisions

1. **Polyglot Microservices**: Match technology to workload (Java for transactions, Go for performance, NestJS for I/O)
2. **gRPC for Internal Communication**: 5-10x performance improvement, strongly-typed contracts across polyglot services
3. **Agentic Coding**: AI-generated implementation eliminates traditional complexity barriers
4. **Cloud-Native**: Leverage AWS managed services for operational efficiency
5. **AI-Powered**: Separate agentic modules for recommendations and chatbot
6. **Performance-First**: See Performance Characteristics section for complete targets by service
7. **Security-by-Design**: PCI-DSS, GDPR/CCPA compliance from day one

---

**End of High-Level Technical Architecture Document**
