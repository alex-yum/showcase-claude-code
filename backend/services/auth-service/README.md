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

## API Endpoints

- POST /api/v1/auth/register - Register new user
- POST /api/v1/auth/login - Login and get JWT
- POST /api/v1/auth/logout - Logout (requires token)
- GET /api/v1/auth/validate - Validate token (requires token)
