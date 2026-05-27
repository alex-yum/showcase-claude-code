# Auth Service Design Specification

**Version:** 1.1  
**Date:** 2026-05-24  
**Status:** Active  
**Owner:** Agentic Development Team

---

## Context

This specification defines the Auth Service, a critical microservice for the B2C e-commerce platform that handles user authentication and session management. The service is part of a polyglot microservices architecture with gRPC internal communication, targeting 2,000-10,000 orders/month with a 1-3 month MVP timeline built using full agentic coding.

**Why this service is needed:**
- Secure user authentication is foundational for all e-commerce operations (orders, payments, profile management)
- Centralized authentication enables consistent security policies across 12+ microservices
- Session management provides immediate logout capability and device tracking for security

**MVP Scope:**
- User registration with email/password (no email verification)
- Login with credential validation
- Session management with "remember me" (30-day sessions)
- Secure logout with immediate session revocation
- Rate limiting (5 failed attempts → 15-minute lockout)
- Token validation endpoint for API Gateway and other services
- **Excluded from MVP:** Password reset, email notifications, 2FA/MFA

---

## Technology Stack

**Framework:** Java/Spring Boot 3.x + Spring Security 6  
**Authentication:** JWT tokens (HS256) + Redis session hybrid  
**Database:** PostgreSQL 15+ (user data)  
**Cache/Session Store:** Redis 7+ (sessions, rate limiting)  
**Database Migrations:** Flyway  
**Communication Protocol:** gRPC (internal), REST (external via API Gateway)  
**gRPC Framework:** grpc-spring-boot-starter  
**API Documentation:** springdoc-openapi (REST) + .proto files (gRPC)  
**Testing:** JUnit 5 + Mockito + Testcontainers  
**Deployment:** Kubernetes (Docker Desktop for local MVP)

---

## Architecture

### High-Level Architecture

```
Client (Browser/Mobile)
    ↓ HTTPS/REST
API Gateway (NestJS)
    ↓ gRPC (internal)
Auth Service (Spring Boot)
    ↓
┌─────────────┬──────────────┐
│ PostgreSQL  │    Redis     │
│ (users)     │ (sessions +  │
│             │ rate limits) │
└─────────────┴──────────────┘
```

**Communication Protocols:**
- **External:** API Gateway exposes REST endpoints for browser compatibility
- **Internal:** Auth Service exposes gRPC endpoints for service-to-service calls
- **Performance:** gRPC provides 5-10x faster serialization vs JSON/REST

### Hybrid Authentication Strategy

**JWT + Redis Session Hybrid (Selected Approach):**
- JWT contains: userId, email, sessionId, expiration
- Redis stores full session metadata keyed by sessionId
- Every authenticated request validates both JWT signature AND Redis session existence
- Logout deletes Redis session for immediate revocation
- Session auto-extends on activity (sliding expiration)

**Benefits:**
- Immediate logout/revocation via Redis session deletion
- Session tracking (device info, IP, last activity)
- Future extensibility (logout all devices, session limits)
- Security metadata for anomaly detection

---

## Data Model

### PostgreSQL Schema

**Table: `users`**
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(account_status);
```

**Fields:**
- `id`: Primary key, auto-incrementing
- `email`: Unique login identifier
- `password_hash`: BCrypt hash with cost factor 12
- `account_status`: ACTIVE, LOCKED, SUSPENDED (for future admin controls)
- `created_at`, `updated_at`: Audit timestamps

**Note:** User profile data (first name, last name, phone, addresses) belongs in a separate User Service, not Auth Service. This service only manages authentication credentials.

### Redis Data Structures

**Sessions:**
```
Key: session:{sessionId}
Type: Hash
TTL: 24 hours (default) or 30 days (remember me)

Fields:
  userId: {userId}
  email: {email}
  deviceInfo: {user-agent string}
  ipAddress: {client IP}
  createdAt: {ISO 8601 timestamp}
  lastActivityAt: {ISO 8601 timestamp}
  rememberMe: {true|false}
```

**Failed Login Attempts:**
```
Key: login:attempts:{email}
Type: String (counter)
TTL: 15 minutes
Value: {attempt_count}
```

**Account Lockout:**
```
Key: login:lockout:{email}
Type: String
TTL: 15 minutes
Value: {lockout_timestamp}
```

---

## API Design

### **gRPC API (Internal - Service-to-Service)**

**Protocol Buffer Definition:** `shared/proto/auth.proto` (monorepo shared location)

```protobuf
syntax = "proto3";

package auth.v1;

service AuthService {
  rpc Register(RegisterRequest) returns (RegisterResponse);
  rpc Login(LoginRequest) returns (LoginResponse);
  rpc Logout(LogoutRequest) returns (LogoutResponse);
  rpc ValidateToken(ValidateTokenRequest) returns (ValidateTokenResponse);
}

message RegisterRequest {
  string email = 1;
  string password = 2;
}

message RegisterResponse {
  int64 user_id = 1;
  string email = 2;
  string message = 3;
}

message LoginRequest {
  string email = 1;
  string password = 2;
  bool remember_me = 3;
}

message LoginResponse {
  string access_token = 1;
  string token_type = 2;
  int64 expires_in = 3;
  int64 user_id = 4;
  string email = 5;
}

message LogoutRequest {
  string token = 1;
}

message LogoutResponse {
  string message = 1;
}

message ValidateTokenRequest {
  string token = 1;
}

message ValidateTokenResponse {
  bool valid = 1;
  int64 user_id = 2;
  string email = 3;
  string error = 4;
}
```

### **REST API (External - via API Gateway)**

**Base URL:** `/api/v1/auth`

**Note:** API Gateway translates REST requests to gRPC calls to Auth Service.

**Versioning Convention:** `/api/v1/{service}/{resource}` (version before context)  
Rationale: Industry standard (Stripe, GitHub, Twitter), enables global API versioning, simpler routing at API Gateway level.

### Endpoints

#### **POST /api/v1/auth/register**
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- Email: Valid format, unique in database
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character

**Response (201 Created):**
```json
{
  "userId": 12345,
  "email": "user@example.com",
  "message": "Account created successfully"
}
```

**Error Responses:**
- 400: Validation failure (weak password, invalid email)
- 409: Email already exists

---

#### **POST /api/v1/auth/login**
Authenticate user and create session.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": false
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "userId": 12345,
  "email": "user@example.com"
}
```

**Error Responses:**
- 401: Invalid credentials
- 423: Account locked (too many failed attempts)

**Rate Limiting Logic:**
1. Check if `login:lockout:{email}` exists → throw 423 if locked
2. Validate credentials
3. On failure: increment `login:attempts:{email}`, check if ≥5 → create lockout
4. On success: delete `login:attempts:{email}`, create session + JWT

---

#### **POST /api/v1/auth/logout**
Terminate current session immediately.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Implementation:**
- Extract sessionId from JWT
- Delete Redis session: `DEL session:{sessionId}`
- Return success

---

#### **GET /api/v1/auth/validate**
Validate JWT token (used by API Gateway and other services).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "userId": 12345,
  "email": "user@example.com"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "valid": false,
  "error": "Invalid or expired token"
}
```

**Validation Steps:**
1. Validate JWT signature
2. Check JWT expiration
3. Extract sessionId from JWT
4. Verify Redis session exists
5. Update session `lastActivityAt` (auto-extend)

**Note:** 
- `/refresh` endpoint removed - sessions auto-extend on any authenticated request
- REST endpoints above are exposed by API Gateway, which internally calls Auth Service gRPC methods

---

## Component Structure

### Project Structure (Monorepo - Under /backend/services/)

```
backend/services/auth-service/ (within monorepo)
├── src/
│   ├── main/
│   │   ├── java/com/ecommerce/auth/
│   │   │   ├── AuthServiceApplication.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── RedisConfig.java
│   │   │   │   ├── JwtConfig.java
│   │   │   │   ├── GrpcConfig.java
│   │   │   │   └── OpenApiConfig.java
│   │   │   ├── grpc/
│   │   │   │   └── AuthGrpcService.java
│   │   │   ├── controller/
│   │   │   │   └── AuthController.java (deprecated - for direct REST access only)
│   │   │   ├── service/
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── SessionService.java
│   │   │   │   ├── RateLimitService.java
│   │   │   │   └── JwtService.java
│   │   │   ├── repository/
│   │   │   │   └── UserRepository.java
│   │   │   ├── model/
│   │   │   │   ├── entity/
│   │   │   │   │   └── User.java
│   │   │   │   └── dto/
│   │   │   │       ├── RegisterRequest.java
│   │   │   │       ├── LoginRequest.java
│   │   │   │       ├── LoginResponse.java
│   │   │   │       └── ValidationResponse.java
│   │   │   ├── security/
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   └── JwtAuthenticationEntryPoint.java
│   │   │   └── exception/
│   │   │       ├── GlobalExceptionHandler.java
│   │   │       ├── AccountLockedException.java
│   │   │       ├── InvalidCredentialsException.java
│   │   │       └── UserAlreadyExistsException.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/migration/
│   │           └── V1__create_users_table.sql
│   └── test/
│       └── java/com/ecommerce/auth/
│           ├── integration/
│           │   ├── AuthControllerIntegrationTest.java
│           │   └── TestContainersConfig.java
│           └── unit/
│               ├── service/
│               └── controller/
├── k8s/
│   ├── auth-config.yaml
│   ├── auth-secrets.yaml
│   ├── auth-deployment.yaml
│   └── auth-service.yaml
├── Dockerfile
├── docker-compose.yml (local PostgreSQL + Redis)
├── pom.xml
├── .gitignore
├── README.md
└── docs/
    ├── API.md
    └── DEPLOYMENT.md

Note: Proto files are shared across all services:
  - Located at: ../../shared/proto/auth.proto
  - Referenced in pom.xml via protobuf-maven-plugin
  - All services use shared proto definitions for consistent contracts
```

**Rationale for Monorepo Structure:**
- Shared proto files simplify cross-service contract management
- Single CI/CD pipeline can orchestrate all services
- Easier local development (single git clone)
- Independent deployment still maintained (each service has own Dockerfile/K8s manifests)
- Supports polyglot architecture (Java, Go, NestJS in different subdirectories)
- Aligns with CLAUDE.md project structure guidelines

### Component Responsibilities

**gRPC Services:**
- `AuthGrpcService`: gRPC endpoint implementation (primary interface for service-to-service)

**Controllers (Optional/Deprecated):**
- `AuthController`: REST API endpoints for direct access (mainly for debugging/admin tools)

**Services:**
- `AuthService`: Core business logic (register, login, logout, validate)
- `SessionService`: Redis session CRUD, activity tracking, TTL management
- `RateLimitService`: Failed attempt tracking, lockout enforcement
- `JwtService`: JWT token generation, signature validation, claims extraction

**Security:**
- `JwtAuthenticationFilter`: Intercepts requests, validates JWT, checks Redis session, auto-extends session
- `JwtAuthenticationEntryPoint`: Handles unauthorized access (401 responses)
- `SecurityConfig`: Spring Security configuration, endpoint permissions, CORS

**Repository:**
- `UserRepository`: JPA interface for PostgreSQL user table operations

**Configuration Classes (src/main/java/.../config/):**
- `SecurityConfig.java`: Spring Security configuration
- `RedisConfig.java`: Redis connection and template beans
- `JwtConfig.java`: JWT settings (secret, expiration)
- `GrpcConfig.java`: gRPC server configuration, interceptors
- `OpenApiConfig.java`: Swagger/OpenAPI documentation setup (for REST endpoints)

**Configuration Properties (src/main/resources/):**
- `application.yml`: Default configuration with placeholders
- `application-dev.yml`: Local development overrides
- `application-prod.yml`: Production overrides (minimal, use env vars)

---

## Security Implementation

### JWT Token Structure

**JWT Claims:**
```json
{
  "sub": "12345",              // userId (subject)
  "email": "user@example.com",
  "sessionId": "uuid-v4",       // maps to Redis session
  "iat": 1234567890,            // issued at (Unix timestamp)
  "exp": 1234654290             // expires at (24h or 30d)
}
```

**Configuration:**
- Algorithm: HS256 (HMAC with SHA-256)
- Secret: 256-bit key stored in Kubernetes Secret
- Expiration: 24 hours (standard) or 30 days (rememberMe = true)

### Password Hashing

**BCrypt Configuration:**
- Cost factor: 12 (as per business requirements)
- Salt automatically generated per password
- Implementation: `BCryptPasswordEncoder` from Spring Security

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
}
```

### Authentication Flow

**1. Registration:**
```
POST /api/v1/auth/register
  ↓
Validate email uniqueness
  ↓
Hash password with BCrypt
  ↓
Insert user into PostgreSQL
  ↓
Return userId + success message
```

**2. Login:**
```
POST /api/v1/auth/login
  ↓
Check redis.exists("login:lockout:{email}") → throw 423 if locked
  ↓
Query user by email from PostgreSQL
  ↓
Validate password with BCrypt.matches()
  ↓
IF INVALID:
  - redis.incr("login:attempts:{email}")
  - If attempts ≥ 5: redis.setex("login:lockout:{email}", 15min)
  - throw 401 InvalidCredentialsException
  ↓
IF VALID:
  - redis.del("login:attempts:{email}")
  - Generate sessionId (UUID)
  - Create Redis session with TTL (24h or 30d)
  - Generate JWT with userId, email, sessionId
  - Return JWT + user info
```

**3. Authenticated Request:**
```
Request with Authorization: Bearer {jwt}
  ↓
JwtAuthenticationFilter intercepts
  ↓
Validate JWT signature with secret key
  ↓
Check JWT expiration
  ↓
Extract sessionId from JWT claims
  ↓
Check redis.exists("session:{sessionId}") → throw 401 if not found
  ↓
redis.hset("session:{sessionId}", "lastActivityAt", now) → auto-extend
  ↓
Load UserDetails into SecurityContext
  ↓
Proceed to controller
```

**4. Logout:**
```
POST /api/v1/auth/logout with JWT
  ↓
Extract sessionId from JWT
  ↓
redis.del("session:{sessionId}")
  ↓
Return success
```

### Spring Security Configuration

**Public Endpoints (no authentication):**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /actuator/health` (Kubernetes probes)
- `GET /v3/api-docs`, `/swagger-ui/**` (OpenAPI docs)

**Protected Endpoints (require JWT):**
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/validate`

**CSRF:** Disabled (stateless JWT-based API)  
**CORS:** Configured to allow frontend origin (Next.js app)

---

## Configuration Management

**Strategy:** Environment variables (Option A) for deployment flexibility.

### Configuration Properties Structure

**application.yml (embedded in Docker image with placeholders):**
```yaml
spring:
  application:
    name: auth-service
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/ecommerce}
    username: ${SPRING_DATASOURCE_USERNAME:postgres}
    password: ${SPRING_DATASOURCE_PASSWORD:postgres}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  flyway:
    enabled: true
    locations: classpath:db/migration
  redis:
    host: ${SPRING_REDIS_HOST:localhost}
    port: ${SPRING_REDIS_PORT:6379}

jwt:
  secret: ${JWT_SECRET:changeme-in-production}
  expiration-ms: ${JWT_EXPIRATION_MS:86400000}  # 24 hours
  remember-me-expiration-ms: ${JWT_REMEMBER_ME_EXPIRATION_MS:2592000000}  # 30 days

server:
  port: ${SERVER_PORT:8080}

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      probes:
        enabled: true
```

### Kubernetes Configuration

**ConfigMap (auth-config.yaml):**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: auth-config
  namespace: default
data:
  SPRING_DATASOURCE_URL: "jdbc:postgresql://postgres-service:5432/ecommerce"
  SPRING_REDIS_HOST: "redis-service"
  SPRING_REDIS_PORT: "6379"
  SERVER_PORT: "8080"
  SPRING_PROFILES_ACTIVE: "prod"
  JWT_EXPIRATION_MS: "86400000"
  JWT_REMEMBER_ME_EXPIRATION_MS: "2592000000"
```

**Secret (auth-secrets.yaml):**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: auth-secrets
  namespace: default
type: Opaque
stringData:
  SPRING_DATASOURCE_USERNAME: "postgres"
  SPRING_DATASOURCE_PASSWORD: "your-secure-password"
  JWT_SECRET: "your-256-bit-secret-key-change-in-production"
```

**Deployment (auth-deployment.yaml):**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: your-registry/auth-service:latest
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: auth-config
        - secretRef:
            name: auth-secrets
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 20
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

**Service (auth-service.yaml):**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: default
spec:
  type: ClusterIP
  selector:
    app: auth-service
  ports:
  - port: 8080
    targetPort: 8080
    protocol: TCP
    name: http
```

**Note:** No Istio service mesh for MVP (keeping it simple). Can be added later for mTLS, traffic management, and observability.

---

## Testing Strategy

### Test Coverage Target

**Unit Tests:** 100% coverage for all service classes, controllers, and utility classes  
**Integration Tests:** Cover end-to-end flows with real dependencies

### Unit Tests (JUnit 5 + Mockito)

**Test Classes:**
- `AuthServiceTest`: Register, login, logout, validate logic
- `SessionServiceTest`: Session CRUD, TTL management, activity updates
- `RateLimitServiceTest`: Attempt tracking, lockout enforcement
- `JwtServiceTest`: Token generation, validation, claims extraction
- `AuthControllerTest`: Request validation, response formatting

**Mocking Strategy:**
- Mock repositories (UserRepository)
- Mock Redis operations (RedisTemplate)
- Mock external dependencies

**Example Test:**
```java
@Test
void testLoginSuccess() {
    // Given
    User user = new User("test@example.com", passwordEncoder.encode("Pass123!"));
    when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
    when(sessionService.createSession(any())).thenReturn("session-uuid");
    
    // When
    LoginResponse response = authService.login("test@example.com", "Pass123!", false);
    
    // Then
    assertNotNull(response.getAccessToken());
    assertEquals(user.getId(), response.getUserId());
    verify(rateLimitService).clearAttempts("test@example.com");
}
```

### Integration Tests (Testcontainers)

**Test Configuration:**
```java
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");
    
    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
        .withExposedPorts(6379);
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.redis.host", redis::getHost);
        registry.add("spring.redis.port", redis::getFirstMappedPort);
    }
}
```

**Test Scenarios:**
1. **Happy Path:** Register → Login → Validate → Logout
2. **Rate Limiting:** 5 failed logins → Account locked → Wait 15min → Unlock
3. **Session Expiration:** Login → Wait for TTL → Token rejected
4. **Remember Me:** Login with rememberMe=true → Session TTL is 30 days
5. **Invalid Token:** Tampered JWT signature rejected
6. **Session Deletion:** Logout → Subsequent requests with same token rejected

### Security Tests

**Test Cases:**
- Invalid JWT signature → 401
- Expired JWT → 401
- Missing Authorization header → 401
- Weak password registration → 400
- SQL injection in email field → Properly escaped
- XSS in request fields → Sanitized

---

## Dependencies

### Maven Dependencies (pom.xml excerpt)

**Note:** pom.xml must include protobuf-maven-plugin configured to read from `../../shared/proto/` directory.

```xml
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>
    
    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.3</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>
    
    <!-- OpenAPI/Swagger -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.3.0</version>
    </dependency>
    
    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>testcontainers</artifactId>
        <version>1.19.3</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>postgresql</artifactId>
        <version>1.19.3</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>1.19.3</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### External Infrastructure Dependencies

**Required Before Deployment:**
- PostgreSQL database (can be Kubernetes StatefulSet for MVP)
- Redis cluster (can be Kubernetes Deployment for MVP)

**Optional/Future:**
- API Gateway (NestJS service) for routing
- Message queue (RabbitMQ/SQS) for event publishing

---

## Deployment

### Local Development (Docker Desktop Kubernetes)

**1. Start PostgreSQL + Redis with Docker Compose:**

`docker-compose.yml`:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: ecommerce
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres-data:
```

Run: `docker-compose up -d`

**2. Run Auth Service locally:**
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**3. Access OpenAPI docs:**
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI spec: http://localhost:8080/v3/api-docs

### Docker Build

**Dockerfile:**
```dockerfile
# Multi-stage build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/auth-service-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Build and push:**
```bash
docker build -t your-registry/auth-service:latest .
docker push your-registry/auth-service:latest
```

### Kubernetes Deployment

**1. Apply Kubernetes manifests:**
```bash
kubectl apply -f k8s/auth-config.yaml
kubectl apply -f k8s/auth-secrets.yaml
kubectl apply -f k8s/auth-deployment.yaml
kubectl apply -f k8s/auth-service.yaml
```

**2. Verify deployment:**
```bash
kubectl get pods -l app=auth-service
kubectl logs -l app=auth-service
kubectl get svc auth-service
```

**3. Port-forward for local testing:**
```bash
kubectl port-forward svc/auth-service 8080:8080
```

### CI/CD Pipeline (GitHub Actions)

**Location:** Root-level `.github/workflows/auth-service-ci.yml` (monorepo structure)

**Workflow stages:**
1. **Build:** `cd backend/services/auth-service && mvn clean package`
2. **Unit Tests:** `mvn test` (100% coverage validation with JaCoCo)
3. **Integration Tests:** `mvn verify` (Testcontainers)
4. **Security Scan:** Snyk or Dependabot
5. **Docker Build:** Build and push to Docker Hub (from auth-service directory)
6. **Deploy:** `kubectl apply -f backend/services/auth-service/k8s/` (update Kubernetes deployment)

**Trigger:** Changes to `backend/services/auth-service/**` or `shared/proto/auth.proto`

---

## Implementation Phases

### Phase 1: Project Setup & Database (Day 1-2)
- Initialize Spring Boot project with Maven
- Configure `pom.xml` with all dependencies
- Set up `application.yml` with property placeholders
- Create Flyway migration `V1__create_users_table.sql`
- Configure Redis connection
- Create `docker-compose.yml` for local PostgreSQL + Redis
- Verify local database connectivity

**Deliverable:** Runnable Spring Boot application connecting to PostgreSQL and Redis

### Phase 2: Core Domain & Repository (Day 2-3)
- Create `User` entity with JPA annotations
- Implement `UserRepository` interface (JpaRepository)
- Create DTOs: `RegisterRequest`, `LoginRequest`, `LoginResponse`, `ValidationResponse`
- Add validation annotations (@Email, @NotBlank, custom password validator)
- Create custom exceptions: `AccountLockedException`, `InvalidCredentialsException`, `UserAlreadyExistsException`
- Write unit tests for entity validation

**Deliverable:** User entity, repository, and DTOs with validation

### Phase 3: Security Foundation (Day 3-5)
- Implement `JwtService`: generate, validate, extractClaims
- Configure `BCryptPasswordEncoder` with cost factor 12
- Create `JwtAuthenticationFilter` (OncePerRequestFilter)
- Implement `JwtAuthenticationEntryPoint` for 401 handling
- Configure `SecurityConfig`: public/protected endpoints, CORS, CSRF disabled
- Write unit tests for JWT operations (100% coverage)

**Deliverable:** JWT generation/validation working with Spring Security

### Phase 4: Business Logic (Day 5-7)
- Implement `SessionService`: createSession, getSession, deleteSession, updateActivity
- Implement `RateLimitService`: trackFailedAttempt, isLocked, clearAttempts
- Implement `AuthService`: register, login, logout, validate
- Handle all business logic and exception flows
- Write unit tests for all service methods (100% coverage)

**Deliverable:** Core authentication business logic with full unit test coverage

### Phase 5: REST API (Day 7-8)
- Implement `AuthController` with all endpoints
- Add OpenAPI annotations (@Operation, @ApiResponse)
- Create `GlobalExceptionHandler` with @ControllerAdvice
- Configure OpenAPI with springdoc-openapi
- Test endpoints with Postman/curl

**Deliverable:** Working REST API with Swagger UI documentation

### Phase 6: Integration Testing (Day 8-9)
- Set up Testcontainers configuration
- Write integration tests for all flows:
  - Register → Login → Validate → Logout
  - Rate limiting and lockout
  - Session expiration
  - Remember me functionality
- Verify 100% unit test coverage with JaCoCo report
- Test security scenarios (invalid JWT, expired tokens)

**Deliverable:** Full test suite passing with 100% unit coverage

### Phase 7: Containerization & Deployment (Day 9-10)
- Create Dockerfile with multi-stage build
- Build and test Docker image locally
- Create Kubernetes manifests (ConfigMap, Secret, Deployment, Service)
- Deploy to Docker Desktop Kubernetes
- Set up GitHub Actions CI/CD workflow
- Document deployment process

**Deliverable:** Auth Service deployed to local Kubernetes, CI/CD pipeline operational

---

## Performance Targets

**See:** `design/High Level Technical Design.md` (Performance Characteristics table) for complete targets.

**Auth Service Specific:**
- **Avg Response Time:** <100ms
- **Throughput:** 2,000 req/s
- **Memory:** 512MB per pod

**Optimizations:**
- Redis connection pooling (Lettuce default)
- HikariCP for PostgreSQL connection pooling
- JPA query optimization (indexed fields)
- JWT validation cached in filter chain

---

## Security Considerations

**✅ Implemented:**
- BCrypt password hashing (cost 12)
- JWT signature validation (HS256)
- Hybrid session management (immediate revocation)
- Rate limiting (5 attempts, 15-min lockout)
- HTTPS enforcement (Kubernetes Ingress with TLS)
- Input validation (email format, password strength)

**🔒 Future Enhancements (Post-MVP):**
- Password reset flow with email verification
- Email verification for new registrations
- Multi-factor authentication (2FA/MFA)
- OAuth2 social login (Google, Facebook)
- Device fingerprinting for anomaly detection
- IP-based rate limiting (in addition to email-based)
- Password history enforcement
- Account activity logs

**🚫 Excluded from MVP:**
- Event publishing to message queue (RabbitMQ/SQS)
- Istio service mesh integration
- Advanced observability (distributed tracing)

---

## API Gateway Integration

**Gateway Communication Pattern:**
- **Browser → API Gateway:** REST/JSON (client-friendly)
- **API Gateway → Auth Service:** gRPC (high-performance)

**Gateway Responsibilities:**
- Expose REST endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, etc.
- Translate REST requests to gRPC calls: `AuthService.Register()`, `AuthService.Login()`, etc.
- Validate JWT by calling `AuthService.ValidateToken()` gRPC method
- Rate limiting at gateway level (in addition to Auth Service)
- Protocol translation (JSON ↔ Protocol Buffers)

**Auth Service gRPC Server:**
- Listens on port 9090 for gRPC connections
- Services consume via `auth-service:9090` internal address
- REST endpoint on port 8080 (optional, for debugging/admin direct access)

---

## Open Questions / Future Decisions

1. **Token Rotation:** Should we implement JWT token rotation on refresh for enhanced security?
2. **Session Limits:** Should we enforce max concurrent sessions per user (e.g., 5 devices)?
3. **Audit Logging:** Do we need a separate audit log table for login/logout events?
4. **Email Service:** Which provider (SendGrid vs AWS SES) for password reset when we add it?
5. **Database Sharding:** At what scale do we need to shard the users table?

---

## Success Criteria

**MVP Complete When:**
- [x] User can register with email/password
- [x] User can login and receive JWT token
- [x] User can logout and session is immediately invalidated
- [x] Token validation endpoint works for API Gateway
- [x] Rate limiting prevents brute force attacks
- [x] "Remember me" extends session to 30 days
- [x] 100% unit test coverage for services
- [x] Integration tests cover all critical flows
- [x] Service deployed to Kubernetes successfully
- [x] OpenAPI documentation accessible
- [x] CI/CD pipeline operational

---

## References

- **Business Requirements:** `requirement/Business Requirement.md` (Section: Login & Authentication)
- **Technical Architecture:** `design/High Level Technical Design.md` (Section: Auth Service)
- **Project Guidelines:** `/CLAUDE.md`
- **Spring Security Docs:** https://spring.io/projects/spring-security
- **JWT Best Practices:** https://datatracker.ietf.org/doc/html/rfc8725
- **OWASP Authentication Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- **gRPC Java:** https://grpc.io/docs/languages/java/
- **Protocol Buffers:** https://protobuf.dev/

---

**End of Design Specification**
