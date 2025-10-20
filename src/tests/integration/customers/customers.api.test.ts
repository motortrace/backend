import request from 'supertest';
import app from '../../../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Customer API Integration Tests', () => {
  let authToken: string;
  let testCustomerId: string;

  // Mock auth token for testing
  // In real tests, you'd generate this from your auth service
  beforeAll(async () => {
    // For now, using a mock token - replace with actual token generation
    authToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  });

  afterAll(async () => {
    // Disconnect Prisma
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up test customer if created
    if (testCustomerId) {
      try {
        await prisma.customer.delete({ where: { id: testCustomerId } });
      } catch (error) {
        // Customer might not exist
      }
      testCustomerId = '';
    }
  });

  describe('POST /customers', () => {
    it('should create a new customer with valid data', async () => {
      // Arrange
      const customerData = {
        name: 'Integration Test Customer',
        email: 'integration@test.com',
        phone: '+1234567890',
      };

      // Act
      const response = await request(app)
        .post('/customers')
        .set('Authorization', authToken)
        .send(customerData)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
      });
      expect(response.body.data.id).toBeDefined();

      // Save for cleanup
      testCustomerId = response.body.data.id;
    });

    it('should return 400 for invalid email format', async () => {
      // Arrange
      const invalidData = {
        name: 'Test Customer',
        email: 'invalid-email-format',
      };

      // Act
      const response = await request(app)
        .post('/customers')
        .set('Authorization', authToken)
        .send(invalidData)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing required name field', async () => {
      // Arrange
      const invalidData = {
        email: 'test@example.com',
        // name is missing
      };

      // Act
      const response = await request(app)
        .post('/customers')
        .set('Authorization', authToken)
        .send(invalidData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 when no authentication token provided', async () => {
      // Arrange
      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
      };

      // Act
      const response = await request(app)
        .post('/customers')
        .send(customerData);

      // Assert
      expect(response.status).toBe(401);
    });

    it('should create customer without email (walk-in customer)', async () => {
      // Arrange
      const walkinData = {
        name: 'Walk-in Customer',
        phone: '+9876543210',
      };

      // Act
      const response = await request(app)
        .post('/customers')
        .set('Authorization', authToken)
        .send(walkinData)
        .expect(201);

      // Assert
      expect(response.body.data.name).toBe('Walk-in Customer');
      expect(response.body.data.email).toBeNull();

      testCustomerId = response.body.data.id;
    });
  });

  describe('GET /customers/:id', () => {
    beforeEach(async () => {
      // Create a test customer for GET tests
      const customer = await prisma.customer.create({
        data: {
          name: 'Get Test Customer',
          email: 'gettest@example.com',
          phone: '+1111111111',
        },
      });
      testCustomerId = customer.id;
    });

    it('should retrieve customer by id', async () => {
      // Act
      const response = await request(app)
        .get(`/customers/${testCustomerId}`)
        .set('Authorization', authToken)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testCustomerId);
      expect(response.body.data.name).toBe('Get Test Customer');
      expect(response.body.data.email).toBe('gettest@example.com');
    });

    it('should return 404 for non-existent customer', async () => {
      // Act
      const response = await request(app)
        .get('/customers/nonexistent-id-12345')
        .set('Authorization', authToken)
        .expect(404);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Customer not found');
    });

    it('should include related data (vehicles, workOrders, appointments)', async () => {
      // Act
      const response = await request(app)
        .get(`/customers/${testCustomerId}`)
        .set('Authorization', authToken)
        .expect(200);

      // Assert
      expect(response.body.data).toHaveProperty('vehicles');
      expect(response.body.data).toHaveProperty('workOrders');
      expect(response.body.data).toHaveProperty('appointments');
    });
  });

  describe('GET /customers', () => {
    beforeEach(async () => {
      // Create multiple test customers
      await prisma.customer.createMany({
        data: [
          { name: 'Alice Johnson', email: 'alice@example.com', phone: '+1111111111' },
          { name: 'Bob Smith', email: 'bob@example.com', phone: '+2222222222' },
          { name: 'Charlie Brown', email: 'charlie@example.com', phone: '+3333333333' },
        ],
      });
    });

    afterEach(async () => {
      // Clean up all test customers
      await prisma.customer.deleteMany({
        where: {
          email: {
            in: ['alice@example.com', 'bob@example.com', 'charlie@example.com'],
          },
        },
      });
    });

    it('should retrieve list of customers', async () => {
      // Act
      const response = await request(app)
        .get('/customers')
        .set('Authorization', authToken)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter customers by search query', async () => {
      // Act
      const response = await request(app)
        .get('/customers?search=Alice')
        .set('Authorization', authToken)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].name).toContain('Alice');
    });

    it('should support pagination with limit and offset', async () => {
      // Act
      const response = await request(app)
        .get('/customers?limit=2&offset=0')
        .set('Authorization', authToken)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination).toMatchObject({
        limit: 2,
        offset: 0,
      });
    });
  });

  describe('PUT /customers/:id', () => {
    beforeEach(async () => {
      const customer = await prisma.customer.create({
        data: {
          name: 'Update Test Customer',
          email: 'update@example.com',
          phone: '+1111111111',
        },
      });
      testCustomerId = customer.id;
    });

    it('should update customer information', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      // Act
      const response = await request(app)
        .put(`/customers/${testCustomerId}`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.email).toBe('updated@example.com');
    });

    it('should return 404 when updating non-existent customer', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Name',
      };

      // Act
      const response = await request(app)
        .put('/customers/nonexistent-id-12345')
        .set('Authorization', authToken)
        .send(updateData)
        .expect(404);

      // Assert
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /customers/:id', () => {
    beforeEach(async () => {
      const customer = await prisma.customer.create({
        data: {
          name: 'Delete Test Customer',
          email: 'delete@example.com',
        },
      });
      testCustomerId = customer.id;
    });

    it('should delete customer (manager role required)', async () => {
      // Act
      const response = await request(app)
        .delete(`/customers/${testCustomerId}`)
        .set('Authorization', authToken)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Customer deleted successfully');

      // Verify customer is deleted
      const deletedCustomer = await prisma.customer.findUnique({
        where: { id: testCustomerId },
      });
      expect(deletedCustomer).toBeNull();

      testCustomerId = ''; // Already deleted
    });

    it('should return 404 when deleting non-existent customer', async () => {
      // Act
      const response = await request(app)
        .delete('/customers/nonexistent-id-12345')
        .set('Authorization', authToken)
        .expect(404);

      // Assert
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /customers/:customerId/statistics', () => {
    beforeEach(async () => {
      // Create customer with some data
      const customer = await prisma.customer.create({
        data: {
          name: 'Stats Test Customer',
          email: 'stats@example.com',
          phone: '+1234567890',
        },
      });
      testCustomerId = customer.id;

      // Create a vehicle for the customer
      await prisma.vehicle.create({
        data: {
          customerId: testCustomerId,
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          vin: 'TEST123456789',
        },
      });

      // Create a work order
      await prisma.workOrder.create({
        data: {
          customerId: testCustomerId,
          vehicleId: (await prisma.vehicle.findFirst({ where: { customerId: testCustomerId } }))!.id,
          workOrderNumber: 'WO-TEST-001',
          status: 'COMPLETED',
          jobType: 'MAINTENANCE',
          priority: 'NORMAL',
        },
      });
    });

    it('should return comprehensive customer statistics', async () => {
      // Act
      const response = await request(app)
        .get(`/customers/${testCustomerId}/statistics`)
        .set('Authorization', authToken)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('customer');
      expect(response.body.data).toHaveProperty('financials');
      expect(response.body.data).toHaveProperty('visits');
      expect(response.body.data).toHaveProperty('vehicles');
      expect(response.body.data).toHaveProperty('customerProfile');
      
      // Check specific metrics
      expect(response.body.data.vehicles.totalVehicles).toBe(1);
      expect(response.body.data.visits.totalWorkOrders).toBe(1);
      expect(response.body.data.customerProfile.loyaltyScore).toBeGreaterThanOrEqual(0);
      expect(response.body.data.customerProfile.loyaltyScore).toBeLessThanOrEqual(100);
    });

    it('should return 404 for non-existent customer statistics', async () => {
      // Act
      const response = await request(app)
        .get('/customers/nonexistent-id-12345/statistics')
        .set('Authorization', authToken)
        .expect(404);

      // Assert
      expect(response.body.success).toBe(false);
    });
  });
});
