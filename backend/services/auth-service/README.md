# Auth Service

Authentication and authorization microservice for the B2C e-commerce platform.

## Features

- User registration with email/password
- Login with JWT token generation
- Session management (Redis-backed)
- Rate limiting (5 failed attempts → 15-min lockout)
- Logout with immediate session revocation
- Token validation for API Gateway

## Tech Stack

- Java 17
- Spring Boot 3.2.5
- Spring Security 6
- PostgreSQL 15+
- Redis 7+
- JWT (jjwt 0.12.3)

## Running Locally

### Prerequisites

```bash
# Start PostgreSQL and Redis
docker-compose up -d
```

### Run the service

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Run tests

```bash
mvn test
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| SPRING_DATASOURCE_URL | PostgreSQL connection URL | jdbc:postgresql://localhost:5432/auth_db | Yes |
| SPRING_DATASOURCE_USERNAME | Database username | postgres | Yes |
| SPRING_DATASOURCE_PASSWORD | Database password | postgres | Yes |
| SPRING_DATA_REDIS_HOST | Redis host | localhost | Yes |
| SPRING_DATA_REDIS_PORT | Redis port | 6379 | Yes |
| JWT_SECRET | Secret key for JWT signing | dev-secret-key-change-in-production | Yes |
| JWT_EXPIRATION | Token expiration (milliseconds) | 3600000 (1 hour) | No |
| SERVER_PORT | Application port | 8081 | No |
| SPRING_PROFILES_ACTIVE | Active profile (dev/prod) | dev | No |

**Production Setup:**
- Use strong random JWT_SECRET (min 256 bits)
- Store secrets in AWS Secrets Manager or equivalent
- Never commit secrets to version control

## API Endpoints

### POST /api/v1/auth/register
Register a new user account.

**Request:**
```bash
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response (201 Created):**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2026-05-27T10:30:00Z"
}
```

**Error Response (409 Conflict):**
```json
{
  "error": "Email already exists"
}
```

### POST /api/v1/auth/login
Authenticate user and receive JWT token.

**Request:**
```bash
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

**Error Response (429 Too Many Requests - Account Locked):**
```json
{
  "error": "Account locked due to too many failed login attempts. Try again in 15 minutes."
}
```

### POST /api/v1/auth/logout
Logout user and invalidate token.

**Request:**
```bash
curl -X POST http://localhost:8081/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

### GET /api/v1/auth/validate
Validate JWT token and retrieve user information.

**Request:**
```bash
curl -X GET http://localhost:8081/api/v1/auth/validate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "valid": true,
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "roles": ["USER"]
}
```

**Error Response (401 Unauthorized):**
```json
{
  "valid": false,
  "error": "Invalid or expired token"
}
```

## Troubleshooting

### Docker containers not running

**Problem:** Service fails to start with database connection errors.

**Solution:**
```bash
# Check container status
docker ps -a | grep auth

# Start containers if stopped
cd backend/services/auth-service
docker-compose up -d

# Check logs
docker logs auth-postgres
docker logs auth-redis

# Verify health
docker ps --filter "name=auth" --format "table {{.Names}}\t{{.Status}}"
```

### Port conflicts

**Problem:** `Address already in use` error on startup.

**Solution:**
```bash
# Check what's using the ports
lsof -i :8081  # Application port
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Kill process or change ports in application.yml/docker-compose.yml
```

### Database connection refused

**Problem:** `Connection refused` or `Unknown database` errors.

**Solution:**
```bash
# Verify PostgreSQL is accessible
docker exec -it auth-postgres psql -U postgres -d auth_db -c "\dt"

# If database doesn't exist, recreate containers
docker-compose down -v
docker-compose up -d

# Wait for health checks to pass (check STATUS column)
docker ps --filter "name=auth"
```

### Redis connection issues

**Problem:** Session management fails or tokens not invalidating.

**Solution:**
```bash
# Test Redis connectivity
docker exec -it auth-redis redis-cli ping
# Expected output: PONG

# Check Redis keys
docker exec -it auth-redis redis-cli KEYS "*"

# Clear Redis cache if needed
docker exec -it auth-redis redis-cli FLUSHALL
```

### JWT token validation fails

**Problem:** Valid tokens return 401 Unauthorized.

**Possible causes:**
1. JWT_SECRET mismatch between token creation and validation
2. Token expired (check JWT_EXPIRATION setting)
3. Token blacklisted after logout
4. Clock skew between systems

**Solution:**
```bash
# Verify JWT_SECRET consistency
grep JWT_SECRET backend/services/auth-service/src/main/resources/application*.yml

# Check token expiration (decode JWT at jwt.io)
# Ensure system time is synchronized
```

### Rate limiting lockout

**Problem:** Account locked after failed login attempts.

**Solution:**
```bash
# Clear rate limiting for user (requires user email)
docker exec -it auth-redis redis-cli DEL "login_attempts:user@example.com"

# Or wait 15 minutes for automatic unlock
```

### Build failures

**Problem:** Maven build fails or dependencies can't be resolved.

**Solution:**
```bash
# Clear Maven cache
rm -rf ~/.m2/repository

# Rebuild with fresh dependencies
mvn clean install -U

# Skip tests if needed during development
mvn clean install -DskipTests
```

### Health check endpoint

**Useful for debugging:**
```bash
# Check application health
curl http://localhost:8081/actuator/health

# Expected response:
# {"status":"UP"}
```
