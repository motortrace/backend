# Backend Refactoring Roadmap

## 🎯 Goal
Transform the backend from **procedural code in classes** to **proper Object-Oriented Architecture** with SOLID principles.

---

## 📋 Refactoring Strategy

### **Approach: Incremental, Module-by-Module**
- ✅ Fix one module completely before moving to next
- ✅ Keep existing code working (backward compatible)
- ✅ Test after each change
- ✅ Start with critical infrastructure fixes
- ✅ Move to architectural improvements
- ✅ Finish with domain-driven design patterns

---

## 🚀 Phase 1: Critical Infrastructure Fixes (Week 1)

### **1.1 Fix Prisma Singleton Usage** ⏱️ 2 hours
**Problem:** Every service creates `new PrismaClient()`  
**Impact:** 🔴 Critical - Wastes DB connections, poor performance

**Files to Change:**
- ✅ All `*.service.ts` files (15+ files)
- ❌ Remove: `const prisma = new PrismaClient()`
- ✅ Add: `import prisma from '../../infrastructure/database/prisma'`

**Example:**
```typescript
// ❌ BEFORE
const prisma = new PrismaClient();

export class CustomerService {
  async getCustomers() {
    return await prisma.customer.findMany();
  }
}

// ✅ AFTER
import prisma from '../../infrastructure/database/prisma';

export class CustomerService {
  async getCustomers() {
    return await prisma.customer.findMany();
  }
}
```

**Testing:** Run all existing tests, verify DB connections don't exceed limit

---

### **1.2 Implement Global Error Handling** ⏱️ 3 hours
**Problem:** Empty `error-handler.ts`, try-catch in every controller method  
**Impact:** 🔴 Critical - Inconsistent error responses, no logging

**Steps:**
1. Create custom error classes
2. Implement error handler middleware
3. Create async handler wrapper
4. Remove try-catch from controllers

**Files to Create/Modify:**
- ✅ `src/shared/errors/custom-errors.ts` (new)
- ✅ `src/shared/middleware/error-handler.ts` (populate)
- ✅ `src/shared/middleware/async-handler.ts` (new)
- ✅ `src/app.ts` (add error middleware)
- ✅ All `*.controller.ts` files (remove try-catch)

**Implementation:**

```typescript
// ✅ src/shared/errors/custom-errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id ${id} not found` : `${resource} not found`,
      404
    );
  }
}

export class ValidationError extends AppError {
  constructor(public errors: any[]) {
    super('Validation failed', 422);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}
```

```typescript
// ✅ src/shared/middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/custom-errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Operational errors (known errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err instanceof ValidationError && { errors: err.errors }),
    });
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      error: 'Database operation failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Unknown errors (bugs)
  console.error('💥 UNHANDLED ERROR:', err);
  
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```

```typescript
// ✅ src/shared/middleware/async-handler.ts
import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

```typescript
// ✅ src/app.ts (add at the end, before export)
import { errorHandler } from './shared/middleware/error-handler';

// ... all routes ...

// Error handling middleware (MUST be last)
app.use(errorHandler);

export default app;
```

---

### **1.3 Add Structured Logging** ⏱️ 2 hours
**Problem:** Console.log everywhere, no log levels, no structure  
**Impact:** 🟠 Major - Hard to debug production issues

**Steps:**
1. Install Winston logger
2. Create logger configuration
3. Replace console.log with logger

**Commands:**
```bash
npm install winston
npm install --save-dev @types/winston
```

**Files to Create:**
```typescript
// ✅ src/infrastructure/logging/logger.ts
import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'motortrace-backend' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // Write all logs with level 'error' to error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

export default logger;
```

**Usage:**
```typescript
// ❌ BEFORE
console.log('🚀 Initializing services...');
console.error('❌ Failed:', error);

// ✅ AFTER
import logger from './infrastructure/logging/logger';

logger.info('Initializing services');
logger.error('Failed to initialize', { error, service: 'storage' });
```

---

### **1.4 Fix Method Binding Issues** ⏱️ 1 hour
**Problem:** `.bind(controller)` required in every route  
**Impact:** 🟡 Minor - Bug risk, verbose code

**Solution:** Use arrow functions in controllers

```typescript
// ❌ BEFORE
export class InvoicesController {
  private invoicesService = new InvoicesService();

  async createInvoice(req: Request, res: Response) {
    // 'this' can be undefined if not bound
  }
}

// In routes:
router.post('/', controller.createInvoice.bind(controller)); // ❌ Easy to forget

// ✅ AFTER
export class InvoicesController {
  private invoicesService = new InvoicesService();

  createInvoice = async (req: Request, res: Response) => {
    // 'this' is always bound correctly
  };
}

// In routes:
router.post('/', controller.createInvoice); // ✅ Clean, no binding needed
```

**Files to Change:** All `*.controller.ts` files

---

## 🏗️ Phase 2: Dependency Injection & Interfaces (Week 2)

### **2.1 Create Service Interfaces** ⏱️ 4 hours
**Problem:** No abstraction, tight coupling  
**Impact:** 🟠 Major - Hard to test, can't swap implementations

**Steps:**
1. Define interfaces for each service
2. Services implement interfaces
3. Controllers depend on interfaces

**Example Module: Invoices**

```typescript
// ✅ src/modules/invoices/invoices.interface.ts
export interface IInvoicesService {
  createInvoice(data: CreateInvoiceRequest): Promise<InvoiceWithDetails>;
  getInvoiceById(id: string): Promise<InvoiceWithDetails | null>;
  getInvoices(filters: InvoiceFilters, page: number, limit: number): Promise<{
    invoices: InvoiceWithDetails[];
    total: number;
  }>;
  updateInvoice(id: string, data: UpdateInvoiceRequest): Promise<InvoiceWithDetails>;
  deleteInvoice(id: string): Promise<void>;
  // ... all public methods
}
```

```typescript
// ✅ src/modules/invoices/invoices.service.ts
import { IInvoicesService } from './invoices.interface';

export class InvoicesService implements IInvoicesService {
  // Implementation
}
```

---

### **2.2 Implement Constructor Injection** ⏱️ 6 hours
**Problem:** Controllers create their own services (tight coupling)  
**Impact:** 🔴 Critical - Cannot test, cannot swap implementations

**Steps:**
1. Add constructors to controllers
2. Inject services via constructor
3. Update route files to instantiate correctly

**Example:**

```typescript
// ✅ src/modules/invoices/invoices.controller.ts
import { IInvoicesService } from './invoices.interface';

export class InvoicesController {
  constructor(
    private readonly invoicesService: IInvoicesService
  ) {}

  createInvoice = async (req: Request, res: Response) => {
    const invoice = await this.invoicesService.createInvoice(req.body);
    res.status(201).json({ success: true, data: invoice });
  };
}
```

```typescript
// ✅ src/modules/invoices/invoices.routes.ts
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

// Create instances with dependencies
const invoicesService = new InvoicesService();
const invoicesController = new InvoicesController(invoicesService);

// Routes use injected controller
router.post('/', asyncHandler(invoicesController.createInvoice));
```

---

### **2.3 Create Dependency Injection Container** ⏱️ 4 hours
**Problem:** Manual dependency wiring in routes  
**Impact:** 🟠 Major - Verbose, error-prone

**Option 1: Manual Container (Simpler)**
```typescript
// ✅ src/infrastructure/di/container.ts
import { InvoicesService } from '../../modules/invoices/invoices.service';
import { InvoicesController } from '../../modules/invoices/invoices.controller';
// ... other imports

class Container {
  // Services
  private _invoicesService?: InvoicesService;
  
  get invoicesService(): InvoicesService {
    if (!this._invoicesService) {
      this._invoicesService = new InvoicesService();
    }
    return this._invoicesService;
  }
  
  // Controllers
  private _invoicesController?: InvoicesController;
  
  get invoicesController(): InvoicesController {
    if (!this._invoicesController) {
      this._invoicesController = new InvoicesController(this.invoicesService);
    }
    return this._invoicesController;
  }
}

export const container = new Container();
```

**Option 2: Use TypeDI or TSyringe (Advanced)**
```bash
npm install typedi reflect-metadata
```

---

## 🗄️ Phase 3: Repository Pattern (Week 3)

### **3.1 Create Repository Layer** ⏱️ 8 hours
**Problem:** Business logic mixed with data access  
**Impact:** 🟠 Major - Hard to test, violates SRP

**Steps:**
1. Create repository interfaces
2. Implement Prisma repositories
3. Inject repositories into services
4. Move data access logic to repositories

**Example:**

```typescript
// ✅ src/modules/invoices/invoices.repository.interface.ts
export interface IInvoiceRepository {
  create(data: CreateInvoiceData): Promise<Invoice>;
  findById(id: string): Promise<Invoice | null>;
  findByWorkOrderId(workOrderId: string): Promise<Invoice[]>;
  findMany(filters: InvoiceFilters, pagination: Pagination): Promise<{
    invoices: Invoice[];
    total: number;
  }>;
  update(id: string, data: UpdateInvoiceData): Promise<Invoice>;
  delete(id: string): Promise<void>;
}
```

```typescript
// ✅ src/modules/invoices/invoices.repository.ts
import { PrismaClient } from '@prisma/client';
import prisma from '../../infrastructure/database/prisma';
import { IInvoiceRepository } from './invoices.repository.interface';

export class InvoiceRepository implements IInvoiceRepository {
  constructor(private readonly prisma: PrismaClient = prisma) {}

  async create(data: CreateInvoiceData): Promise<Invoice> {
    return await this.prisma.invoice.create({
      data,
      include: {
        workOrder: true,
        lineItems: true,
      },
    });
  }

  async findById(id: string): Promise<Invoice | null> {
    return await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        workOrder: true,
        lineItems: true,
      },
    });
  }

  // ... other data access methods
}
```

```typescript
// ✅ src/modules/invoices/invoices.service.ts
export class InvoicesService implements IInvoicesService {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly workOrderRepository: IWorkOrderRepository
  ) {}

  async createInvoice(data: CreateInvoiceRequest): Promise<InvoiceWithDetails> {
    // Get data via repository
    const workOrder = await this.workOrderRepository.findById(data.workOrderId);
    
    if (!workOrder) {
      throw new NotFoundError('WorkOrder', data.workOrderId);
    }

    // Business logic (pure, no DB access)
    const invoiceNumber = await this.generateInvoiceNumber();
    const subtotal = this.calculateSubtotal(workOrder);
    const taxAmount = this.calculateTax(subtotal);
    const total = subtotal + taxAmount;

    // Save via repository
    const invoice = await this.invoiceRepository.create({
      invoiceNumber,
      workOrderId: data.workOrderId,
      subtotal,
      taxAmount,
      totalAmount: total,
      // ... other fields
    });

    return invoice;
  }

  // Pure business logic (no DB access)
  private calculateSubtotal(workOrder: WorkOrder): number {
    return workOrder.services.reduce((sum, s) => sum + Number(s.subtotal), 0);
  }

  private calculateTax(subtotal: number): number {
    return subtotal * 0.18;
  }
}
```

---

## 🏛️ Phase 4: Thin Controllers (Week 4)

### **4.1 Refactor Controllers** ⏱️ 6 hours
**Problem:** Fat controllers with parsing, validation, formatting  
**Impact:** 🟠 Major - Violates SRP, repetitive code

**Steps:**
1. Remove try-catch (use asyncHandler)
2. Extract request parsing to helper methods
3. Remove response formatting (use middleware)
4. Keep controllers thin (1-3 lines per method)

**Example:**

```typescript
// ❌ BEFORE (Fat Controller)
async getInvoices(req: Request, res: Response) {
  try {
    const { workOrderId, status, startDate, endDate, page = 1, limit = 10 } = req.query;

    const filters: InvoiceFilters = {};
    if (workOrderId) filters.workOrderId = workOrderId as string;
    if (status) filters.status = status as any;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const result = await this.invoicesService.getInvoices(
      filters, 
      Number(page), 
      Number(limit)
    );

    res.json({
      success: true,
      data: result.invoices,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        pages: Math.ceil(result.total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// ✅ AFTER (Thin Controller)
getInvoices = asyncHandler(async (req: Request, res: Response) => {
  const filters = this.parseFilters(req.query);
  const pagination = this.parsePagination(req.query);
  
  const result = await this.invoicesService.getInvoices(filters, pagination);
  
  res.json({
    success: true,
    data: result.invoices,
    meta: {
      pagination: {
        ...pagination,
        total: result.total,
        pages: Math.ceil(result.total / pagination.limit),
      },
    },
  });
});

// Helper methods
private parseFilters(query: any): InvoiceFilters {
  const filters: InvoiceFilters = {};
  if (query.workOrderId) filters.workOrderId = query.workOrderId;
  if (query.status) filters.status = query.status;
  if (query.startDate) filters.startDate = new Date(query.startDate);
  if (query.endDate) filters.endDate = new Date(query.endDate);
  return filters;
}

private parsePagination(query: any): Pagination {
  return {
    page: Number(query.page) || 1,
    limit: Number(query.limit) || 10,
  };
}
```

---

## 🎨 Phase 5: Domain-Driven Design (Week 5)

### **5.1 Create Value Objects** ⏱️ 4 hours
**Problem:** Primitive obsession, no validation  
**Impact:** 🟡 Minor - Type safety, validation

**Examples:**

```typescript
// ✅ src/shared/domain/value-objects/Money.ts
export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string = 'USD'
  ) {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
  }

  static fromAmount(amount: number, currency = 'USD'): Money {
    return new Money(amount, currency);
  }

  static zero(): Money {
    return new Money(0);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toNumber(): number {
    return this.amount;
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot operate on different currencies`);
    }
  }
}
```

```typescript
// ✅ src/modules/invoices/domain/InvoiceNumber.ts
export class InvoiceNumber {
  private constructor(private readonly value: string) {}

  static generate(date: Date, sequence: number): InvoiceNumber {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const seq = String(sequence).padStart(4, '0');
    return new InvoiceNumber(`INV-${year}${month}-${seq}`);
  }

  static fromString(value: string): InvoiceNumber {
    if (!this.isValid(value)) {
      throw new Error(`Invalid invoice number: ${value}`);
    }
    return new InvoiceNumber(value);
  }

  private static isValid(value: string): boolean {
    return /^INV-\d{6}-\d{4}$/.test(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: InvoiceNumber): boolean {
    return this.value === other.toString();
  }
}
```

---

### **5.2 Create Rich Domain Models** ⏱️ 8 hours
**Problem:** Anemic models, business logic in services  
**Impact:** 🟠 Major - Poor encapsulation

**Example:**

```typescript
// ✅ src/modules/invoices/domain/Invoice.ts
export class Invoice {
  private constructor(
    private readonly id: string,
    private readonly invoiceNumber: InvoiceNumber,
    private readonly workOrderId: string,
    private readonly lineItems: LineItem[],
    private readonly taxRate: number = 0.18,
    private status: InvoiceStatus,
    private paidAmount: Money
  ) {}

  // Factory methods
  static create(data: CreateInvoiceData): Invoice {
    const invoiceNumber = InvoiceNumber.generate(new Date(), data.sequence);
    
    return new Invoice(
      data.id,
      invoiceNumber,
      data.workOrderId,
      data.lineItems,
      0.18,
      InvoiceStatus.DRAFT,
      Money.zero()
    );
  }

  static fromPersistence(data: any): Invoice {
    return new Invoice(
      data.id,
      InvoiceNumber.fromString(data.invoiceNumber),
      data.workOrderId,
      data.lineItems.map(LineItem.fromPersistence),
      data.taxRate,
      data.status,
      Money.fromAmount(data.paidAmount)
    );
  }

  // Business logic
  calculateSubtotal(): Money {
    return this.lineItems.reduce(
      (sum, item) => sum.add(item.getTotal()),
      Money.zero()
    );
  }

  calculateTax(): Money {
    return this.calculateSubtotal().multiply(this.taxRate);
  }

  calculateTotal(): Money {
    return this.calculateSubtotal().add(this.calculateTax());
  }

  isPaid(): boolean {
    return this.paidAmount.equals(this.calculateTotal());
  }

  isOverdue(): boolean {
    return this.status === InvoiceStatus.OVERDUE;
  }

  markAsSent(): void {
    if (this.status !== InvoiceStatus.DRAFT) {
      throw new Error('Only draft invoices can be marked as sent');
    }
    this.status = InvoiceStatus.SENT;
  }

  markAsPaid(amount: Money): void {
    if (amount.toNumber() <= 0) {
      throw new Error('Payment amount must be positive');
    }
    
    this.paidAmount = this.paidAmount.add(amount);
    
    if (this.isPaid()) {
      this.status = InvoiceStatus.PAID;
    }
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getInvoiceNumber(): string {
    return this.invoiceNumber.toString();
  }

  getTotal(): Money {
    return this.calculateTotal();
  }

  // Convert to persistence format
  toPersistence(): any {
    return {
      id: this.id,
      invoiceNumber: this.invoiceNumber.toString(),
      workOrderId: this.workOrderId,
      status: this.status,
      subtotal: this.calculateSubtotal().toNumber(),
      taxAmount: this.calculateTax().toNumber(),
      totalAmount: this.calculateTotal().toNumber(),
      paidAmount: this.paidAmount.toNumber(),
      // ... other fields
    };
  }
}
```

---

## 📊 Progress Tracking

### **Module Refactoring Checklist**

| Module | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Status |
|--------|---------|---------|---------|---------|---------|--------|
| Invoices | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔴 Not Started |
| Customers | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔴 Not Started |
| Appointments | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔴 Not Started |
| Work Orders | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔴 Not Started |
| Estimates | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔴 Not Started |
| Payments | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔴 Not Started |
| Inventory | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔴 Not Started |
| Vehicles | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔴 Not Started |

Legend:
- ⬜ Not Started
- 🟡 In Progress
- ✅ Completed
- 🔴 Blocked

---

## 🎯 Success Metrics

### **Code Quality Metrics**
- ✅ Test coverage > 80%
- ✅ No Prisma instances created in services
- ✅ All controllers < 50 lines
- ✅ All services have interfaces
- ✅ All repositories tested in isolation
- ✅ No try-catch in controllers

### **Performance Metrics**
- ✅ Max DB connections < 10
- ✅ Response time < 200ms (p95)
- ✅ No memory leaks

### **Maintainability Metrics**
- ✅ Cyclomatic complexity < 10
- ✅ Function length < 30 lines
- ✅ Class coupling < 5

---

## 📚 Reference Architecture

```
src/
├── modules/                    # Business modules
│   └── invoices/
│       ├── domain/            # ✅ Phase 5: Domain models
│       │   ├── Invoice.ts
│       │   ├── InvoiceNumber.ts
│       │   └── LineItem.ts
│       ├── invoices.interface.ts        # ✅ Phase 2: Service interface
│       ├── invoices.service.ts          # ✅ Phase 2: Implements interface
│       ├── invoices.repository.interface.ts  # ✅ Phase 3: Repo interface
│       ├── invoices.repository.ts       # ✅ Phase 3: Data access
│       ├── invoices.controller.ts       # ✅ Phase 4: Thin controller
│       ├── invoices.routes.ts
│       ├── invoices.types.ts
│       └── invoices.validation.ts
├── shared/
│   ├── errors/               # ✅ Phase 1: Custom errors
│   ├── middleware/           # ✅ Phase 1: Error handler, async wrapper
│   └── domain/               # ✅ Phase 5: Value objects (Money, Email, etc.)
└── infrastructure/
    ├── database/             # ✅ Phase 1: Singleton Prisma
    ├── logging/              # ✅ Phase 1: Winston logger
    └── di/                   # ✅ Phase 2: DI container
```

---

## 🚀 Let's Start!

**Ready to begin?** We'll start with:
1. **Phase 1.1:** Fix Prisma singleton (quickest win, high impact)
2. **Phase 1.2:** Error handling (foundation for everything else)
3. Then proceed module by module

**Which module should we refactor first?**
- Recommendation: Start with **Invoices** (smallest, good example)
- Or **Customers** (simple CRUD)
- Your choice!
