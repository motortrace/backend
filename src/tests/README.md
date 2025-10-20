# Tests Directory

This directory contains all test files for the MotorTrace backend application.

## 📁 Structure

```
tests/
├── unit/                    # Unit tests (test individual functions/classes)
│   ├── customers.service.test.ts
│   └── auth.validation.test.ts
├── integration/             # Integration tests (test API endpoints + database)
│   └── customers.api.test.ts
├── e2e/                     # End-to-end tests (test complete user workflows)
│   └── (add your E2E tests here)
├── helpers/                 # Test utility functions
│   └── test-database.ts
└── fixtures/                # Reusable test data
    └── test-data.fixtures.ts
```

## 🚀 Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests only
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📝 Writing Tests

### Unit Test Example

```typescript
// tests/unit/service-name.test.ts
import { ServiceName } from '../../modules/module-name/service-name';

describe('ServiceName', () => {
  let service: ServiceName;

  beforeEach(() => {
    service = new ServiceName();
  });

  it('should do something', () => {
    const result = service.doSomething();
    expect(result).toBe(expectedValue);
  });
});
```

### Integration Test Example

```typescript
// tests/integration/endpoint-name.test.ts
import request from 'supertest';
import { app } from '../../app';

describe('GET /endpoint', () => {
  it('should return data', async () => {
    const response = await request(app)
      .get('/endpoint')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});
```

## 🔧 Test Helpers

### Database Helpers

```typescript
import { 
  createTestDatabase, 
  cleanupTestDatabase,
  createTestCustomer 
} from './helpers/test-database';

beforeAll(async () => {
  await createTestDatabase();
});

afterAll(async () => {
  await cleanupTestDatabase();
});
```

### Test Fixtures

```typescript
import { 
  customerFixtures, 
  vehicleFixtures 
} from './fixtures/test-data.fixtures';

const testCustomer = customerFixtures.validCustomer;
const testVehicle = vehicleFixtures.toyota;
```

## 📚 Documentation

- **Quick Start**: `../TESTING_QUICK_START.md` - Get started in 5 minutes
- **Complete Guide**: `../TESTING_GUIDE.md` - Comprehensive testing documentation
- **Summary**: `../TESTING_SUMMARY.md` - Overview of all testing resources

## ✅ Test Checklist

When writing a new test:

- [ ] Test follows AAA pattern (Arrange, Act, Assert)
- [ ] Test has descriptive name
- [ ] Test is independent (doesn't rely on other tests)
- [ ] Test cleans up after itself
- [ ] Mocks external dependencies
- [ ] Tests both success and error cases
- [ ] Test data is in fixtures (if reusable)

## 🎯 Coverage Goals

- **Unit Tests**: 70% coverage
- **Integration Tests**: Cover all API endpoints
- **E2E Tests**: Cover critical user workflows

Current coverage:
```bash
npm run test:coverage
```

## 🐛 Common Issues

1. **Database connection errors**: Check `.env.test` file
2. **Import errors**: Run `npx prisma generate`
3. **Timeout errors**: Increase timeout with `jest.setTimeout(30000)`
4. **Port conflicts**: Change port in `.env.test`

## 💡 Tips

- Write tests as you code, not after
- Test the behavior, not the implementation
- Keep tests simple and readable
- One assertion per test (usually)
- Use descriptive test names
- Mock external services
- Clean up test data

## 📖 Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest GitHub](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
