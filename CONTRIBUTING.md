# Contributing Guidelines

This document outlines development standards, tooling, and best practices for contributing to this e-commerce platform.

## Development Standards

### Code Quality Tools

**Java/Spring Boot:**
- **Linter:** Checkstyle
- **Static Analysis:** SpotBugs
- **Formatter:** Google Java Format or Spring conventions
- **Build:** Maven 3.9+

**Go:**
- **Linter:** golangci-lint (runs multiple linters)
- **Formatter:** gofmt
- **Build:** Go 1.21+

**Node.js/TypeScript:**
- **Linter:** ESLint
- **Formatter:** Prettier
- **Build:** npm/pnpm

**Python:**
- **Formatter:** Black
- **Linter:** Flake8
- **Type Checking:** mypy
- **Build:** Poetry or pip

### Testing Requirements

**Minimum Coverage:** 100% for all services

**Why 100%?**
- **Agentic coding:** AI generates comprehensive test suites efficiently
- **High-risk domain:** E-commerce + payments requires exhaustive testing
- **Small team:** Comprehensive automated testing is critical safety net
- **Confidence:** 100% coverage enables safer refactoring and changes

**Exclusions from coverage (if truly untestable):**
- Auto-generated code (gRPC stubs, ORM models)
- Framework configuration classes (with no logic)
- Must document why coverage is excluded

**Test Levels:**
- **Unit Tests:** 
  - Java: JUnit 5 + Mockito
  - Go: `go test` + testify
  - Node.js: Jest
  - Python: pytest
- **Integration Tests:** 
  - Use Testcontainers for database/Redis dependencies
  - Test service-to-service gRPC communication
- **E2E Tests:** 
  - Playwright or Cypress for critical user flows
  - Focus on happy path and edge cases
- **Performance Tests:** 
  - k6 or Gatling
  - Test at 3x expected capacity

### gRPC Protocol Buffers

**Location:** `/shared/proto/` directory (when implemented)

**Conventions:**
- Service names: PascalCase (e.g., `AuthService`, `OrderService`)
- RPC methods: PascalCase (e.g., `CreateOrder`, `ValidateToken`)
- Message names: PascalCase (e.g., `LoginRequest`, `OrderResponse`)
- Field names: snake_case (e.g., `user_id`, `access_token`)
- Use `v1`, `v2` package naming for versioning (e.g., `auth.v1`)

**Code Generation:**
- Java: `protobuf-maven-plugin`
- Go: `protoc-gen-go` + `protoc-gen-go-grpc`
- Node.js: `@grpc/proto-loader` or `grpc-tools`
- Python: `grpcio-tools`

### Git Workflow

**Branch Naming:**
- Feature: `feature/short-description`
- Bug fix: `fix/short-description`
- Hotfix: `hotfix/short-description`

**Commit Messages:**
- Use conventional commits format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- Examples:
  - `feat(auth): add JWT token refresh endpoint`
  - `fix(order): resolve saga rollback timing issue`
  - `docs(api): update OpenAPI specs for payment service`

**Pull Requests:**
- Title: Clear, concise description of change
- Description: Include context, testing done, related issues
- Required checks: All tests pass, code coverage ≥100%, linter passes
- Reviews: At least 1 approval (for larger teams; N/A for solo/AI-assisted development)

### Code Review Checklist

- [ ] Code follows language-specific style guide
- [ ] Tests added/updated with ≥100% coverage
- [ ] gRPC .proto files updated if service contract changed
- [ ] Database migrations included if schema changed
- [ ] No secrets/credentials in code (use environment variables)
- [ ] Error handling implemented properly
- [ ] Logging added for important operations
- [ ] Performance implications considered

## Security Guidelines

### Authentication & Authorization
- Use JWT tokens with proper expiration
- Never commit secrets - use environment variables
- BCrypt cost factor: minimum 12
- Session management via Redis for immediate revocation

### PCI-DSS Compliance
- **NEVER handle raw credit card data**
- Use Stripe Elements or tokenization exclusively
- No card numbers in logs, databases, or error messages
- Ensure HTTPS/TLS 1.3 for all external communication

### Input Validation
- Server-side validation for all inputs
- Parameterized queries (ORM-based to prevent SQL injection)
- XSS prevention: sanitize user inputs
- Rate limiting on authentication endpoints

### Data Protection
- Encryption at rest: AES-256
- Encryption in transit: TLS 1.3
- GDPR/CCPA compliance: data retention policies, right to deletion

## Database Guidelines

### Migrations
- **Always use migration tools:**
  - Java: Flyway
  - Node.js: Prisma Migrate
  - Go: go-migrate or golang-migrate
- **Never manually modify production schemas**
- Migrations must be reversible (include down migrations)
- Test migrations on staging before production

### Schema Design
- Use appropriate indexes for query performance
- Foreign key constraints for referential integrity
- Timestamps: `created_at`, `updated_at` on all tables
- Soft deletes where applicable (use `deleted_at`)

## API Design

### Versioning
- All APIs start with `/api/v1/`
- Version in URL path, not headers
- Maintain backward compatibility within major version

### gRPC Services (Internal)
- Use Protocol Buffers for all service-to-service communication
- Implement proper error handling with gRPC status codes
- Use streaming RPCs for high-throughput scenarios (Analytics, Notifications)
- Add health check endpoints

### REST APIs (External - via API Gateway)
- Follow RESTful conventions
- Use appropriate HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Return meaningful HTTP status codes
- Provide OpenAPI/Swagger documentation

### Response Formats
- Consistent JSON structure
- Include error details in error responses
- Use camelCase for JSON fields (REST), snake_case for proto fields (gRPC)

## Observability

### Logging
- Use structured logging (JSON format)
- Log levels: ERROR, WARN, INFO, DEBUG
- Include correlation IDs for request tracing
- Never log sensitive data (passwords, tokens, card numbers)

### Metrics
- Expose Prometheus-compatible metrics
- Key metrics: request rate, error rate, latency percentiles
- Service-specific metrics: queue depth, cache hit rate, etc.

### Tracing
- Implement distributed tracing (OpenTelemetry compatible)
- Trace saga workflows across services
- Include trace context in gRPC metadata

### Health Checks
- `/health` endpoint for basic liveness
- `/ready` endpoint for readiness (includes dependencies)
- Kubernetes probes configured properly

## Development Environment

### Local Setup
- Docker Desktop with Kubernetes enabled (for MVP)
- Required tools: Docker, kubectl, language-specific toolchains
- Use docker-compose for local dependencies (PostgreSQL, Redis)

### IDE Configuration
- Use .editorconfig for consistent formatting
- Configure linters/formatters to run on save
- Install language-specific plugins (gRPC, Protocol Buffers)

## CI/CD

### GitHub Actions Workflow
1. Lint and format check
2. Unit tests
3. Integration tests
4. Security scanning (Snyk, Dependabot)
5. Build Docker image
6. Push to container registry
7. Deploy to environment (staging/production)

### Deployment
- Blue-green deployments for zero downtime
- Auto-rollback on health check failures
- Database migrations run before service deployment
- Smoke tests after deployment

## Agentic Coding Considerations

Since this project uses full agentic coding (AI code generation):
- AI-generated code must still pass all quality checks
- Review AI-generated tests for edge case coverage
- Validate AI-generated SQL migrations carefully
- Ensure AI-generated gRPC contracts match business requirements
- AI tools should follow these same standards

## Questions?

For architecture questions, see `design/High Level Technical Design.md`  
For business context, see `requirement/Business Requirement.md`  
For service-specific details, see `docs/superpowers/specs/`

---

**Last Updated:** May 24, 2026  
**Maintainer:** Development Team
