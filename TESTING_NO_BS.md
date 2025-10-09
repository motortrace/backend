# Testing - No BS Guide

## Setup (One Time)

```bash
# 1. Install dependencies
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest

# 2. Create jest.config.js in ROOT (already done)
# 3. Create .env.test file
cp .env.test.example .env.test

# 4. Create test database
createdb motortrace_test

# 5. Run migrations on test database
DATABASE_URL="postgresql://user:password@localhost:5432/motortrace_test" npx prisma migrate deploy
```

---

## File Structure

```
src/tests/
├── unit/              # Test individual functions
├── integration/       # Test API endpoints
├── helpers/           # Reusable test functions
└── fixtures/          # Test data
```

---

## Unit Tests

### Create: `src/tests/unit/SERVICE_NAME.test.ts`

```typescript
import { ServiceName } from '../../modules/MODULE/service-name.service';

describe('ServiceName', () => {
  let service: ServiceName;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      model: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };
    service = new ServiceName(mockPrisma);
  });

  it('should do something', async () => {
    // Arrange
    mockPrisma.model.create.mockResolvedValue({ id: '123', name: 'Test' });

    // Act
    const result = await service.createSomething({ name: 'Test' });

    // Assert
    expect(result.id).toBe('123');
    expect(mockPrisma.model.create).toHaveBeenCalledTimes(1);
  });
});
```

### Run:
```bash
npm test SERVICE_NAME.test
```

---

## Integration Tests (API)

### Create: `src/tests/integration/ENDPOINT.api.test.ts`

```typescript
import request from 'supertest';
import app from '../../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('GET /endpoint', () => {
  let authToken = 'Bearer YOUR_TOKEN';
  let testId: string;

  afterEach(async () => {
    // Clean up
    if (testId) {
      await prisma.model.delete({ where: { id: testId } });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return data', async () => {
    const response = await request(app)
      .get('/endpoint')
      .set('Authorization', authToken)
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it('should create data', async () => {
    const response = await request(app)
      .post('/endpoint')
      .set('Authorization', authToken)
      .send({ name: 'Test' })
      .expect(201);

    testId = response.body.data.id;
    expect(response.body.data.name).toBe('Test');
  });
});
```

### Run:
```bash
npm test ENDPOINT.api.test
```

---

## Common Test Patterns

### Test Success Case
```typescript
it('should work', async () => {
  const result = await service.doThing();
  expect(result).toBe(expected);
});
```

### Test Error Case
```typescript
it('should throw error', async () => {
  await expect(service.doThing()).rejects.toThrow('Error message');
});
```

### Test API Endpoint
```typescript
it('should return 200', async () => {
  await request(app)
    .get('/endpoint')
    .set('Authorization', token)
    .expect(200);
});
```

### Mock Return Value
```typescript
mockPrisma.model.findUnique.mockResolvedValue({ id: '123' });
```

### Mock Error
```typescript
mockPrisma.model.create.mockRejectedValue(new Error('Failed'));
```

---

## Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test filename.test

# Run tests matching pattern
npm test customers

# Run in watch mode (auto-rerun on save)
npm run test:watch

# Run with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

---

## Quick Examples

### Example 1: Test Service Method

**File:** `src/tests/unit/customers.service.test.ts`

```typescript
import { CustomerService } from '../../modules/customers/customers.service';

describe('CustomerService', () => {
  let service: CustomerService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      customer: {
        findUnique: jest.fn(),
      },
    };
    service = new CustomerService(mockPrisma);
  });

  it('should get customer by id', async () => {
    mockPrisma.customer.findUnique.mockResolvedValue({
      id: '123',
      name: 'John',
    });

    const result = await service.getCustomerById('123');

    expect(result.name).toBe('John');
  });
});
```

**Run:** `npm test customers.service.test`

---

### Example 2: Test API Endpoint

**File:** `src/tests/integration/customers.api.test.ts`

```typescript
import request from 'supertest';
import app from '../../app';

describe('POST /customers', () => {
  it('should create customer', async () => {
    const response = await request(app)
      .post('/customers')
      .set('Authorization', 'Bearer TOKEN')
      .send({ name: 'John', email: 'john@test.com' })
      .expect(201);

    expect(response.body.data.name).toBe('John');
  });
});
```

**Run:** `npm test customers.api.test`

---

## Debugging

### See what's being called
```typescript
console.log(mockPrisma.model.create.mock.calls);
```

### Run single test
```bash
npm test -- -t "should create customer"
```

### Increase timeout
```typescript
it('slow test', async () => {
  // test code
}, 30000); // 30 seconds
```

---

## Common Issues

**Issue:** Can't find module
```bash
npx prisma generate
```

**Issue:** Database error
```bash
# Check .env.test has correct DATABASE_URL
# Create database: createdb motortrace_test
# Run migrations
```

**Issue:** Port in use
```bash
# Change PORT in .env.test to 3001
```

**Issue:** TypeScript errors
```bash
# Make sure jest.config.js exists in root
```

---

## Workflow

1. Write code
2. Write test
3. Run test: `npm test filename.test`
4. Fix errors
5. Repeat

---

## Real Working Example

You already have a working test: `src/tests/unit/customers.service.test.ts`

**Run it:**
```bash
npm test customers.service.test
```

**Copy it for new service:**
```bash
cp src/tests/unit/customers.service.test.ts src/tests/unit/workorders.service.test.ts
```

Then edit the new file to test your service.

---

## That's It

- Write test
- Run `npm test filename.test`
- Fix errors
- Done

No theory, no philosophy, just commands and examples.
