# Testing Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies (If not already installed)

```bash
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest
```

### Step 2: Create Test Environment File

Create `.env.test` in your root directory:

```env
# Test Database (use a separate database!)
DATABASE_URL="postgresql://user:password@localhost:5432/motortrace_test"
DIRECT_URL="postgresql://user:password@localhost:5432/motortrace_test"

# Test Supabase (optional - use separate project)
NEXT_PUBLIC_SUPABASE_URL="https://your-test-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-test-key"

# Test Environment
NODE_ENV="test"
PORT="3001"
```

### Step 3: Update Jest Config

Your `jest.config.js` is already set up at `src/jest.config.cjs`. Move it to root:

```bash
# Windows PowerShell
Move-Item src\jest.config.cjs jest.config.js

# Or manually create jest.config.js in root
```

**`jest.config.js`:**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  rootDir: './src',
  clearMocks: true,
  verbose: true,
  testTimeout: 10000,
};
```

### Step 4: Set Up Test Database

```bash
# Create test database
createdb motortrace_test

# Run migrations on test database
DATABASE_URL="postgresql://user:password@localhost:5432/motortrace_test" npx prisma migrate deploy
```

### Step 5: Run Your First Test

```bash
# Run all tests
npm test

# Run specific test file
npm test customers.service.test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

---

## 📝 Your First Test

Create `src/tests/unit/example.test.ts`:

```typescript
describe('Example Test Suite', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should test string operations', () => {
    const greeting = 'Hello, World!';
    expect(greeting).toContain('World');
    expect(greeting.length).toBe(13);
  });

  it('should test async operations', async () => {
    const promise = Promise.resolve('success');
    await expect(promise).resolves.toBe('success');
  });
});
```

Run it:
```bash
npm test example.test
```

---

## 🧪 Test Your Customer Service

You already have `customers.service.test.ts` created. Run it:

```bash
npm test customers.service.test
```

If it fails with import errors, make sure your `tsconfig.json` is configured correctly.

---

## 📚 Common Test Patterns

### Testing a Service Method

```typescript
it('should return customer when found', async () => {
  // Arrange - set up test data
  const mockCustomer = { id: '123', name: 'John' };
  mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);

  // Act - call the method
  const result = await customerService.getCustomerById('123');

  // Assert - check the result
  expect(result).toEqual(mockCustomer);
});
```

### Testing an API Endpoint

```typescript
it('should create a customer via API', async () => {
  const response = await request(app)
    .post('/customers')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'John', email: 'john@example.com' })
    .expect(201);

  expect(response.body.data.name).toBe('John');
});
```

### Testing Error Cases

```typescript
it('should throw error on invalid input', async () => {
  await expect(
    customerService.createCustomer({ name: '' })
  ).rejects.toThrow('Name is required');
});
```

---

## 🎯 What to Test

### ✅ DO Test:

1. **Business Logic**
   - Service methods
   - Validation functions
   - Calculations (loyalty score, pricing, etc.)

2. **API Endpoints**
   - Success cases
   - Error cases (400, 404, 500)
   - Authentication/Authorization

3. **Edge Cases**
   - Empty inputs
   - Null/undefined values
   - Boundary conditions

4. **Critical Workflows**
   - Customer creation → Work Order → Invoice → Payment
   - Appointment → Work Order conversion

### ❌ DON'T Test:

1. **Framework Code** - Don't test Express, Prisma internals
2. **Third-party Libraries** - Don't test Supabase, NodeMailer
3. **Simple Getters/Setters** - Not worth the effort
4. **Configuration Files** - Just data, no logic

---

## 🔍 Debugging Tests

### View Detailed Output

```bash
npm test -- --verbose
```

### Run Single Test

```bash
npm test -- -t "should create a customer"
```

### Debug with VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Check What's Being Mocked

```typescript
it('debug mock calls', () => {
  mockPrisma.customer.create.mockClear();
  
  // Run your code
  await customerService.createCustomer(data);
  
  // Debug
  console.log('Mock was called:', mockPrisma.customer.create.mock.calls);
  console.log('Mock call count:', mockPrisma.customer.create.mock.calls.length);
});
```

---

## 📊 View Coverage Report

```bash
npm run test:coverage
```

Then open: `coverage/lcov-report/index.html`

**Green** = Well tested  
**Yellow** = Partially tested  
**Red** = Not tested

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module '@prisma/client'"

**Solution:**
```bash
npx prisma generate
```

### Issue: "Database connection failed"

**Solution:** Check your `.env.test` file and ensure test database exists:
```bash
createdb motortrace_test
```

### Issue: "Tests timeout"

**Solution:** Increase timeout in test:
```typescript
it('slow test', async () => {
  // ...
}, 30000); // 30 second timeout
```

### Issue: "Module import errors"

**Solution:** Check `tsconfig.json`:
```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "moduleResolution": "node"
  }
}
```

### Issue: "Port already in use"

**Solution:** Use different port in `.env.test`:
```env
PORT="3001"
```

---

## 📈 Testing Progress Checklist

- [ ] Jest and dependencies installed
- [ ] `jest.config.js` created
- [ ] `.env.test` file configured
- [ ] Test database created and migrated
- [ ] First unit test written and passing
- [ ] First integration test written and passing
- [ ] Test helpers created (`test-database.ts`)
- [ ] Test fixtures created
- [ ] Coverage configured (70% target)
- [ ] CI/CD pipeline set up (GitHub Actions)
- [ ] Tests run on every PR
- [ ] Coverage reports generated

---

## 🎓 Next Steps

1. **Write More Tests**: Start with your most critical features
2. **Add E2E Tests**: Test complete user workflows
3. **Set Up CI/CD**: Run tests automatically (see `TESTING_GUIDE.md`)
4. **Monitor Coverage**: Aim for 70%+ coverage
5. **Test New Features**: Write tests for all new code

---

## 📚 Resources

- **Main Guide**: See `TESTING_GUIDE.md` for comprehensive documentation
- **Jest Docs**: https://jestjs.io/docs/getting-started
- **Supertest**: https://github.com/visionmedia/supertest
- **Testing Best Practices**: https://github.com/goldbergyoni/javascript-testing-best-practices

---

## 💡 Pro Tips

1. **Test Early, Test Often** - Don't wait until the end
2. **One Test, One Thing** - Keep tests focused
3. **Descriptive Names** - "should create customer with valid email"
4. **Clean Up** - Always clean test data in `afterEach()`
5. **Mock External Services** - Don't hit real APIs in tests
6. **Test Happy & Sad Paths** - Test both success and failure cases

---

**Ready to start testing? Run this command:**

```bash
npm test customers.service.test
```

Good luck! 🚀
