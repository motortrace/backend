# Complete Testing Guide for PERN + Supabase Applications

## Table of Contents
1. [Testing Theory & Best Practices](#testing-theory--best-practices)
2. [Testing Stack Overview](#testing-stack-overview)
3. [Project Structure](#project-structure)
4. [Types of Tests](#types-of-tests)
5. [Setting Up Jest](#setting-up-jest)
6. [Writing Unit Tests](#writing-unit-tests)
7. [Writing Integration Tests](#writing-integration-tests)
8. [Writing E2E Tests](#writing-e2e-tests)
9. [Testing with Supabase](#testing-with-supabase)
10. [Test Database Setup](#test-database-setup)
11. [Mocking & Stubbing](#mocking--stubbing)
12. [CI/CD Integration](#cicd-integration)
13. [Code Coverage](#code-coverage)
14. [Best Practices](#best-practices)

---

## Testing Theory & Best Practices

### The Testing Pyramid

```
        /\
       /  \
      / E2E \     <- Few, expensive, slow (10%)
     /______\
    /        \
   /Integration\ <- More, moderate cost (30%)
  /____________\
 /              \
/  Unit Tests    \ <- Many, cheap, fast (60%)
/__________________\
```

**Testing Pyramid Breakdown:**

1. **Unit Tests (60%)** - Test individual functions/methods in isolation
   - Fastest to run
   - Easiest to write
   - Pinpoint exact failures
   - Mock external dependencies

2. **Integration Tests (30%)** - Test how components work together
   - Test API endpoints
   - Test database interactions
   - Test service layer with real database
   - Use test database

3. **E2E Tests (10%)** - Test complete user flows
   - Test entire application flow
   - Slowest and most expensive
   - Catch issues users would encounter
   - Test with production-like environment

### The AAA Pattern

Every test should follow **Arrange, Act, Assert**:

```typescript
test('should create a customer', async () => {
  // ARRANGE - Set up test data and mocks
  const customerData = { name: 'John', email: 'john@example.com' };
  
  // ACT - Execute the function under test
  const result = await customerService.createCustomer(customerData);
  
  // ASSERT - Verify the result
  expect(result.name).toBe('John');
  expect(result.email).toBe('john@example.com');
});
```

### Test Isolation

- Each test should be **independent**
- Tests should not depend on other tests
- Clean up after each test
- Use `beforeEach()` and `afterEach()` hooks

---

## Testing Stack Overview

### For PERN + Supabase Applications:

| Tool | Purpose |
|------|---------|
| **Jest** | Test framework and test runner |
| **ts-jest** | TypeScript support for Jest |
| **Supertest** | HTTP assertion library for API testing |
| **@faker-js/faker** | Generate fake test data |
| **Prisma Test Utils** | Database testing utilities |
| **MSW** (optional) | Mock Service Worker for API mocking |

### Why Jest?

✅ Built-in test runner, assertions, and mocking  
✅ Great TypeScript support with ts-jest  
✅ Widely adopted in Node.js ecosystem  
✅ Fast parallel test execution  
✅ Built-in code coverage  
✅ Great documentation and community  

---

## Project Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── customers/
│   │   │   ├── customers.service.ts
│   │   │   ├── customers.controller.ts
│   │   │   ├── customers.routes.ts
│   │   │   ├── customers.validation.ts
│   │   │   └── __tests__/              # Module-specific tests (alternative structure)
│   │   │       ├── customers.service.test.ts
│   │   │       └── customers.controller.test.ts
│   │   └── work-orders/
│   │       └── ...
│   └── tests/                           # Centralized test folder (current structure)
│       ├── unit/                        # Unit tests
│       │   ├── customers.service.test.ts
│       │   ├── workorders.service.test.ts
│       │   └── validation.test.ts
│       ├── integration/                 # Integration tests
│       │   ├── customers.api.test.ts
│       │   ├── workorders.api.test.ts
│       │   └── database.test.ts
│       ├── e2e/                         # End-to-end tests
│       │   ├── customer-journey.test.ts
│       │   └── workorder-flow.test.ts
│       ├── fixtures/                    # Test data
│       │   ├── customers.fixture.ts
│       │   └── workorders.fixture.ts
│       ├── helpers/                     # Test utilities
│       │   ├── test-database.ts
│       │   ├── test-server.ts
│       │   └── mock-supabase.ts
│       └── setup.ts                     # Global test setup
├── jest.config.js                       # Jest configuration
├── jest.setup.js                        # Jest setup file
└── .env.test                            # Test environment variables
```

**Note:** You're currently using the centralized structure (`src/tests/`). Both approaches work:
- **Centralized** (`src/tests/`): Better for large projects, easier to find all tests
- **Co-located** (`__tests__` near code): Better for smaller projects, tests near code

---

## Types of Tests

### 1. Unit Tests

Test individual functions/classes in isolation.

**What to Test:**
- Service methods
- Validation functions
- Utility functions
- Business logic

**Example:**
```typescript
// src/tests/unit/customers.service.test.ts
import { CustomerService } from '../../modules/customers/customers.service';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client');

describe('CustomerService', () => {
  let customerService: CustomerService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = {
      customer: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    } as any;

    customerService = new CustomerService(mockPrisma);
  });

  describe('createCustomer', () => {
    it('should create a customer with valid data', async () => {
      // Arrange
      const customerData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
      };

      const expectedCustomer = {
        id: 'customer_123',
        ...customerData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.customer.create.mockResolvedValue(expectedCustomer as any);

      // Act
      const result = await customerService.createCustomer(customerData);

      // Assert
      expect(result).toEqual(expectedCustomer);
      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: customerData,
        include: expect.any(Object),
      });
    });

    it('should throw error if customer creation fails', async () => {
      // Arrange
      const customerData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      mockPrisma.customer.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(customerService.createCustomer(customerData))
        .rejects
        .toThrow('Failed to create customer: Database error');
    });
  });

  describe('getCustomerById', () => {
    it('should return customer when found', async () => {
      // Arrange
      const customerId = 'customer_123';
      const expectedCustomer = {
        id: customerId,
        name: 'John Doe',
        email: 'john@example.com',
      };

      mockPrisma.customer.findUnique.mockResolvedValue(expectedCustomer as any);

      // Act
      const result = await customerService.getCustomerById(customerId);

      // Assert
      expect(result).toEqual(expectedCustomer);
      expect(mockPrisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: customerId },
        include: expect.any(Object),
      });
    });

    it('should return null when customer not found', async () => {
      // Arrange
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      // Act
      const result = await customerService.getCustomerById('nonexistent');

      // Assert
      expect(result).toBeNull();
    });
  });
});
```

### 2. Integration Tests

Test API endpoints with real database interactions.

**What to Test:**
- HTTP endpoints
- Request/response handling
- Database operations
- Authentication/Authorization

**Example:**
```typescript
// src/tests/integration/customers.api.test.ts
import request from 'supertest';
import { app } from '../../app';
import { createTestDatabase, cleanupTestDatabase } from '../helpers/test-database';
import { createAuthToken } from '../helpers/auth-helper';

describe('Customer API Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    await createTestDatabase();
    authToken = await createAuthToken({ role: 'manager' });
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('POST /customers', () => {
    it('should create a new customer', async () => {
      // Arrange
      const customerData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567890',
      };

      // Act
      const response = await request(app)
        .post('/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
      });
      expect(response.body.data.id).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      // Arrange
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
      };

      // Act
      const response = await request(app)
        .post('/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      // Act
      const response = await request(app)
        .post('/customers')
        .send({ name: 'Test' })
        .expect(401);

      // Assert
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /customers/:id', () => {
    let customerId: string;

    beforeEach(async () => {
      // Create a test customer
      const response = await request(app)
        .post('/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Customer',
          email: 'test@example.com',
        });
      
      customerId = response.body.data.id;
    });

    it('should retrieve customer by id', async () => {
      // Act
      const response = await request(app)
        .get(`/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(customerId);
      expect(response.body.data.name).toBe('Test Customer');
    });

    it('should return 404 for non-existent customer', async () => {
      // Act
      const response = await request(app)
        .get('/customers/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      // Assert
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /customers/:id/statistics', () => {
    it('should return customer statistics', async () => {
      // Arrange - Create customer with data
      const customerResponse = await request(app)
        .post('/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Stats Customer',
          email: 'stats@example.com',
        });

      const customerId = customerResponse.body.data.id;

      // Act
      const response = await request(app)
        .get(`/customers/${customerId}/statistics`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('financials');
      expect(response.body.data).toHaveProperty('visits');
      expect(response.body.data).toHaveProperty('customerProfile');
      expect(response.body.data.financials).toHaveProperty('totalSpent');
      expect(response.body.data.customerProfile).toHaveProperty('loyaltyScore');
    });
  });
});
```

### 3. E2E Tests

Test complete user workflows.

**What to Test:**
- Complete business workflows
- User journeys
- Multi-step processes

**Example:**
```typescript
// src/tests/e2e/customer-workorder-journey.test.ts
import request from 'supertest';
import { app } from '../../app';
import { setupTestEnvironment, teardownTestEnvironment } from '../helpers/test-environment';

describe('Customer Work Order Journey E2E', () => {
  let managerToken: string;
  let customerId: string;
  let vehicleId: string;
  let workOrderId: string;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    managerToken = env.managerToken;
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  it('should complete full customer work order workflow', async () => {
    // Step 1: Create a customer
    const customerResponse = await request(app)
      .post('/customers')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        name: 'E2E Test Customer',
        email: 'e2e@example.com',
        phone: '+1234567890',
      })
      .expect(201);

    customerId = customerResponse.body.data.id;
    expect(customerId).toBeDefined();

    // Step 2: Add a vehicle for the customer
    const vehicleResponse = await request(app)
      .post('/vehicles')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        customerId,
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        vin: 'TEST123456789',
      })
      .expect(201);

    vehicleId = vehicleResponse.body.data.id;

    // Step 3: Create an appointment
    const appointmentResponse = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        customerId,
        vehicleId,
        requestedAt: new Date().toISOString(),
        notes: 'Oil change needed',
      })
      .expect(201);

    expect(appointmentResponse.body.data.id).toBeDefined();

    // Step 4: Create work order from appointment
    const workOrderResponse = await request(app)
      .post('/work-orders')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        customerId,
        vehicleId,
        status: 'IN_PROGRESS',
        jobType: 'MAINTENANCE',
      })
      .expect(201);

    workOrderId = workOrderResponse.body.data.id;

    // Step 5: Add service to work order
    await request(app)
      .post(`/work-orders/${workOrderId}/services`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        cannedServiceId: 'oil-change-service-id',
        quantity: 1,
      })
      .expect(201);

    // Step 6: Complete work order
    await request(app)
      .patch(`/work-orders/${workOrderId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        status: 'COMPLETED',
      })
      .expect(200);

    // Step 7: Generate invoice
    const invoiceResponse = await request(app)
      .post(`/work-orders/${workOrderId}/invoice`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(201);

    expect(invoiceResponse.body.data.invoiceNumber).toBeDefined();

    // Step 8: Verify customer statistics updated
    const statsResponse = await request(app)
      .get(`/customers/${customerId}/statistics`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);

    expect(statsResponse.body.data.visits.totalWorkOrders).toBe(1);
    expect(statsResponse.body.data.vehicles.totalVehicles).toBe(1);
  });
});
```

---

## Setting Up Jest

### 1. Install Dependencies

```bash
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest @faker-js/faker
```

### 2. Create Jest Configuration

**`jest.config.js`** (Root of project):
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/__tests__/**/*.test.ts'
  ],
  
  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.test.{ts,js}',
    '!src/tests/**',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Module paths
  moduleFileExtensions: ['ts', 'js', 'json'],
  rootDir: '.',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Timeouts
  testTimeout: 10000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true
};
```

### 3. Create Jest Setup File

**`jest.setup.js`**:
```javascript
// Global test setup
beforeAll(() => {
  console.log('🧪 Starting test suite...');
});

afterAll(() => {
  console.log('✅ Test suite completed');
});

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console methods to reduce noise
global.console = {
  ...console,
  // Uncomment to suppress logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
```

### 4. Update package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --testPathPattern=e2e",
    "test:verbose": "jest --verbose",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

---

## Testing with Supabase

### Challenge with Supabase Auth

Supabase uses external auth service, so we need to mock it for tests.

### Strategy 1: Mock Supabase Client

**`src/tests/helpers/mock-supabase.ts`**:
```typescript
import { User } from '@supabase/supabase-js';

export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
};

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'authenticated',
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  ...overrides,
} as User);

export const mockAuthToken = 'mock-jwt-token-for-testing';
```

### Strategy 2: Use Test Supabase Project

For integration tests, use a separate Supabase test project:

**`.env.test`**:
```env
# Test Database
DATABASE_URL="postgresql://test_user:test_pass@localhost:5432/motortrace_test"
DIRECT_URL="postgresql://test_user:test_pass@localhost:5432/motortrace_test"

# Test Supabase (separate project)
NEXT_PUBLIC_SUPABASE_URL="https://your-test-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-test-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-test-service-role-key"

# Test Environment
NODE_ENV="test"
PORT="3001"
```

---

## Test Database Setup

### Create Test Database Helper

**`src/tests/helpers/test-database.ts`**:
```typescript
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export async function createTestDatabase() {
  console.log('🔧 Setting up test database...');
  
  // Run migrations
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  });
  
  // Optional: Seed test data
  await seedTestData();
  
  console.log('✅ Test database ready');
}

export async function cleanupTestDatabase() {
  console.log('🧹 Cleaning up test database...');
  
  // Delete all data in reverse order of dependencies
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
      } catch (error) {
        console.log(`Could not truncate ${tablename}`);
      }
    }
  }
  
  await prisma.$disconnect();
  console.log('✅ Test database cleaned');
}

export async function resetTestDatabase() {
  await cleanupTestDatabase();
  await seedTestData();
}

async function seedTestData() {
  // Add common test data here
  console.log('🌱 Seeding test data...');
  
  // Example: Create test canned services
  await prisma.cannedService.createMany({
    data: [
      {
        code: 'OIL_CHANGE',
        name: 'Oil Change',
        description: 'Standard oil change service',
        duration: 30,
        price: 49.99,
        isAvailable: true,
      },
      {
        code: 'TIRE_ROTATION',
        name: 'Tire Rotation',
        description: 'Rotate all four tires',
        duration: 45,
        price: 39.99,
        isAvailable: true,
      },
    ],
    skipDuplicates: true,
  });
}

export { prisma as testPrisma };
```

### Using Test Database in Tests

```typescript
import { createTestDatabase, cleanupTestDatabase, resetTestDatabase } from '../helpers/test-database';

describe('Customer API with Real Database', () => {
  beforeAll(async () => {
    await createTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Reset between tests if needed
    await resetTestDatabase();
  });

  // Your tests here...
});
```

---

## Mocking & Stubbing

### When to Mock

✅ **DO Mock:**
- External API calls
- Email services
- Payment gateways
- File system operations
- Third-party services
- Supabase auth in unit tests

❌ **DON'T Mock:**
- Your own business logic
- Database in integration tests
- Simple utility functions

### Mocking Examples

**1. Mock Prisma Client:**
```typescript
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    customer: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  })),
}));
```

**2. Mock External Service:**
```typescript
// src/tests/helpers/mock-email.ts
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  }),
}));
```

**3. Mock File Upload:**
```typescript
jest.mock('multer', () => {
  return jest.fn(() => ({
    single: jest.fn(() => (req: any, res: any, next: any) => {
      req.file = {
        filename: 'test-file.jpg',
        path: '/tmp/test-file.jpg',
      };
      next();
    }),
  }));
});
```

---

## CI/CD Integration

### GitHub Actions Example

**`.github/workflows/test.yml`**:
```yaml
name: Run Tests

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
          POSTGRES_DB: motortrace_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup test database
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/motortrace_test
        run: |
          npx prisma generate
          npx prisma migrate deploy

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/motortrace_test
          NODE_ENV: test
        run: npm run test:integration

      - name: Run E2E tests
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/motortrace_test
          NODE_ENV: test
        run: npm run test:e2e

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### GitLab CI Example

**`.gitlab-ci.yml`**:
```yaml
image: node:18

stages:
  - test
  - coverage

variables:
  POSTGRES_DB: motortrace_test
  POSTGRES_USER: test_user
  POSTGRES_PASSWORD: test_pass
  DATABASE_URL: "postgresql://test_user:test_pass@postgres:5432/motortrace_test"

services:
  - postgres:15

before_script:
  - npm ci
  - npx prisma generate
  - npx prisma migrate deploy

unit_tests:
  stage: test
  script:
    - npm run test:unit
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'

integration_tests:
  stage: test
  script:
    - npm run test:integration

e2e_tests:
  stage: test
  script:
    - npm run test:e2e

coverage:
  stage: coverage
  script:
    - npm run test:coverage
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

---

## Code Coverage

### Understanding Coverage Metrics

- **Statement Coverage**: % of statements executed
- **Branch Coverage**: % of conditional branches tested
- **Function Coverage**: % of functions called
- **Line Coverage**: % of lines executed

### Viewing Coverage

```bash
npm run test:coverage
```

Coverage report will be in `coverage/lcov-report/index.html`

### Coverage Thresholds

In `jest.config.js`:
```javascript
coverageThreshold: {
  global: {
    branches: 70,    // 70% of branches covered
    functions: 70,   // 70% of functions covered
    lines: 70,       // 70% of lines covered
    statements: 70   // 70% of statements covered
  },
  // Per-module thresholds
  './src/modules/customers/': {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

---

## Best Practices

### 1. Test Naming Convention

```typescript
// ✅ Good - Descriptive
describe('CustomerService', () => {
  describe('createCustomer', () => {
    it('should create a customer with valid data', async () => {});
    it('should throw error when email is duplicate', async () => {});
    it('should hash password before saving', async () => {});
  });
});

// ❌ Bad - Vague
describe('Customer', () => {
  it('works', async () => {});
  it('test 1', async () => {});
});
```

### 2. One Assertion Concept Per Test

```typescript
// ✅ Good
it('should return 404 when customer not found', async () => {
  const response = await request(app).get('/customers/invalid-id');
  expect(response.status).toBe(404);
});

it('should return error message when customer not found', async () => {
  const response = await request(app).get('/customers/invalid-id');
  expect(response.body.error).toBeDefined();
});

// ❌ Avoid - Testing multiple concepts
it('should handle customer not found', async () => {
  const response = await request(app).get('/customers/invalid-id');
  expect(response.status).toBe(404);
  expect(response.body.error).toBeDefined();
  expect(response.body.success).toBe(false);
  // Too many assertions - split into multiple tests
});
```

### 3. Test Data Builders

```typescript
// src/tests/fixtures/customer-builder.ts
export class CustomerBuilder {
  private data: any = {
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '+1234567890',
  };

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  withoutEmail(): this {
    delete this.data.email;
    return this;
  }

  build() {
    return { ...this.data };
  }
}

// Usage in tests
const customer = new CustomerBuilder()
  .withName('John Doe')
  .withEmail('john@example.com')
  .build();
```

### 4. Avoid Testing Implementation Details

```typescript
// ❌ Bad - Testing implementation
it('should call prisma.customer.create', async () => {
  await customerService.createCustomer(data);
  expect(mockPrisma.customer.create).toHaveBeenCalled();
});

// ✅ Good - Testing behavior
it('should return created customer with id', async () => {
  const result = await customerService.createCustomer(data);
  expect(result).toHaveProperty('id');
  expect(result.name).toBe(data.name);
});
```

### 5. Clean Test Data

```typescript
describe('Customer Tests', () => {
  let testCustomerId: string;

  afterEach(async () => {
    // Clean up test data
    if (testCustomerId) {
      await prisma.customer.delete({ where: { id: testCustomerId } });
    }
  });

  it('creates a customer', async () => {
    const customer = await customerService.createCustomer(data);
    testCustomerId = customer.id;
    // Test assertions...
  });
});
```

---

## Quick Start Checklist

- [ ] Install testing dependencies
- [ ] Create `jest.config.js`
- [ ] Create `jest.setup.js`
- [ ] Add test scripts to `package.json`
- [ ] Create test database helper
- [ ] Set up `.env.test` file
- [ ] Write first unit test
- [ ] Write first integration test
- [ ] Set up CI/CD pipeline
- [ ] Configure coverage thresholds
- [ ] Write E2E test for critical flow

---

## Next Steps

1. **Start Small**: Begin with unit tests for services
2. **Add Integration Tests**: Test API endpoints
3. **Test Critical Paths**: Write E2E tests for important user flows
4. **Set Up CI/CD**: Automate testing on every commit
5. **Monitor Coverage**: Aim for 70%+ coverage
6. **Iterate**: Continuously add tests as you add features

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing/unit-testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Supabase Testing](https://supabase.com/docs/guides/getting-started/local-development)

---

**Remember**: Good tests are an investment. They catch bugs early, enable refactoring with confidence, and serve as living documentation for your codebase. Start testing today! 🚀
