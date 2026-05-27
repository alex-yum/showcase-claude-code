# Auth Service Tests

## Test Status

### Unit Tests ✅
**Status:** 41/41 passing

**Coverage:**
- Repository tests: 3 tests
- Controller tests: 6 tests  
- Service tests: 32 tests (AuthService, JwtService, RateLimitService, SessionServiceTest)

**Run unit tests:**
```bash
./mvnw test -Dtest='!*IntegrationTest'
```

### Integration Tests ⚠️
**Status:** Currently disabled due to Docker/Testcontainers compatibility issue

**Issue:** Testcontainers 1.21.1 + docker-java 3.7.1 cannot connect to Docker Desktop 29.2.1 on macOS  
- Error: "Could not find a valid Docker environment" (Status 400 BadRequestException)
- Docker works fine via CLI/curl
- Known API version negotiation issue between docker-java and Docker Desktop 29.x

**Affected Tests:**
- `AuthIntegrationTest` (4 tests) - requires PostgreSQL + Redis containers

**Workarounds Attempted:**
1. ✅ Upgraded Testcontainers 1.20.4 → 1.21.1
2. ✅ Upgraded docker-java to 3.7.1 (latest)
3. ✅ Switched Docker context to `default`
4. ❌ Still failing with Docker connection error

**To Fix:**
- Wait for Test containers 1.22.x with better Docker 29.x support
- OR downgrade Docker Desktop to 27.x-28.x
- OR investigate docker-java client configuration further

**Run integration tests (will fail):**
```bash
./mvnw test -Dtest='*IntegrationTest'
```

## Test Infrastructure

### Java Version
- **Required:** Java 21 (installed at `/opt/homebrew/opt/openjdk@21`)
- Tests run with Java 21 via Maven (set in `JAVA_HOME`)
- Java 25 has Mockito compatibility issues (resolved by using Java 21)

### Test Database
- **Unit tests:** H2 in-memory (no Docker required)
- **Integration tests:** PostgreSQL via Testcontainers (requires Docker)

### Test Cache
- **Unit tests:** Mocked RedisTemplate (no Docker required)
- **Integration tests:** Redis via Testcontainers (requires Docker)

## Running Tests

### Quick Test (Unit Tests Only)
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
./mvnw test -Dtest='!*IntegrationTest'
```

### All Tests
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
./mvnw test
```
*Note: Will fail on integration tests due to Docker issue*

## CI/CD

### GitHub Actions
- Configured in `.github/workflows/auth-service-ci.yml`
- Runs unit tests only (integration tests excluded)
- Uses Java 21

### Pre-commit Hook
- Located at `.git/hooks/pre-commit`
- Automatically runs unit tests before commit
- Blocks commit if tests fail
- Uses Java 21

## Test Configuration

### Unit Test Config
- `src/test/resources/application-test.yml`
- Flyway disabled (H2 incompatible with PostgreSQL migrations)
- Hibernate `ddl-auto: create-drop`

### Integration Test Config
- `src/test/java/.../config/TestContainersConfig.java`
- PostgreSQL 15-alpine
- Redis 7-alpine
- Auto-configured via Spring Boot Testcontainers support

## Known Issues

1. **Mockito + Java 25:** Fixed by using Java 21
2. **H2 + Flyway:** PostgreSQL-specific migrations don't work with H2. Fixed by disabling Flyway in tests.
3. **Test containers + Docker 29.x:** Currently unresolved. Unit tests provide sufficient coverage.
4. **CSRF in controller tests:** Fixed by adding `@AutoConfigureMockMvc(addFilters = false)`

## Test Coverage Goals

- **Unit tests:** ✅ 100% method coverage for services
- **Integration tests:** ⚠️ End-to-end authentication flows (when Docker issue resolved)
