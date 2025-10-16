import request from 'supertest';
import app from '../../../app';
import { createTestDatabase, cleanupTestDatabase, resetTestDatabase, disconnectTestDatabase, createTestCustomer, createTestVehicle } from '../../helpers/test-database';
import { workOrderFixtures, serviceFixtures, customerFixtures, vehicleFixtures, generateWorkOrderNumber, generateUniqueVIN } from '../../fixtures/test-data.fixtures';

describe('Work Orders Integration Tests', () => {
  let authToken: string;
  let testCustomerId: string;
  let testVehicleId: string;
  let testWorkOrderId: string;

  beforeAll(async () => {
    await createTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await disconnectTestDatabase();
  });

  beforeEach(async () => {
    await resetTestDatabase();

    // Create test customer and vehicle
    const customer = await createTestCustomer({
      name: customerFixtures.validCustomer.name,
      email: customerFixtures.validCustomer.email,
      phone: customerFixtures.validCustomer.phone
    });
    testCustomerId = customer.id;

    const vehicle = await createTestVehicle(testCustomerId, {
      make: vehicleFixtures.toyota.make,
      model: vehicleFixtures.toyota.model,
      year: vehicleFixtures.toyota.year,
      vin: generateUniqueVIN(),
      licensePlate: vehicleFixtures.toyota.licensePlate
    });
    testVehicleId = vehicle.id;

    // Mock authentication token
    authToken = 'Bearer mock-jwt-token';
  });

  afterEach(async () => {
    // Clean up test work order if created
    if (testWorkOrderId) {
      try {
        // Clean up would happen here
        testWorkOrderId = '';
      } catch (error) {
        // Work order might not exist
      }
    }
  });

  describe('POST /work-orders', () => {
    it('should create a new work order with valid data', async () => {
      const workOrderData = {
        customerId: testCustomerId,
        vehicleId: testVehicleId,
        workOrderNumber: generateWorkOrderNumber(),
        status: workOrderFixtures.basicRepair.status,
        jobType: workOrderFixtures.basicRepair.jobType,
        priority: workOrderFixtures.basicRepair.priority,
        complaint: workOrderFixtures.basicRepair.complaint,
        odometerReading: workOrderFixtures.basicRepair.odometerReading
      };

      const response = await request(app)
        .post('/work-orders')
        .set('Authorization', authToken)
        .send(workOrderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        customerId: testCustomerId,
        vehicleId: testVehicleId,
        status: workOrderData.status,
        jobType: workOrderData.jobType,
        priority: workOrderData.priority,
        complaint: workOrderData.complaint
      });
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('customer');
      expect(response.body.data).toHaveProperty('vehicle');

      testWorkOrderId = response.body.data.id;
    });

    it('should create work order with services', async () => {
      const workOrderData = {
        customerId: testCustomerId,
        vehicleId: testVehicleId,
        workOrderNumber: generateWorkOrderNumber(),
        status: 'PENDING',
        jobType: 'MAINTENANCE',
        priority: 'NORMAL',
        complaint: 'Regular maintenance',
        services: [
          {
            cannedServiceId: 'service1', // Would be created in setup
            quantity: 1,
            unitPrice: 49.99
          }
        ]
      };

      const response = await request(app)
        .post('/work-orders')
        .set('Authorization', authToken)
        .send(workOrderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.services).toBeDefined();
      expect(Array.isArray(response.body.data.services)).toBe(true);

      testWorkOrderId = response.body.data.id;
    });

    it('should return 400 for invalid customer ID', async () => {
      const workOrderData = {
        customerId: 'invalid-customer-id',
        vehicleId: testVehicleId,
        workOrderNumber: generateWorkOrderNumber(),
        status: 'PENDING',
        jobType: 'REPAIR',
        priority: 'NORMAL',
        complaint: 'Test complaint'
      };

      const response = await request(app)
        .post('/work-orders')
        .set('Authorization', authToken)
        .send(workOrderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Customer not found');
    });

    it('should return 400 for invalid vehicle ID', async () => {
      const workOrderData = {
        customerId: testCustomerId,
        vehicleId: 'invalid-vehicle-id',
        workOrderNumber: generateWorkOrderNumber(),
        status: 'PENDING',
        jobType: 'REPAIR',
        priority: 'NORMAL',
        complaint: 'Test complaint'
      };

      const response = await request(app)
        .post('/work-orders')
        .set('Authorization', authToken)
        .send(workOrderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Vehicle not found');
    });
  });

  describe('GET /work-orders/:id', () => {
    beforeEach(async () => {
      // Create a test work order
      const workOrderData = {
        customerId: testCustomerId,
        vehicleId: testVehicleId,
        workOrderNumber: generateWorkOrderNumber(),
        status: workOrderFixtures.basicRepair.status,
        jobType: workOrderFixtures.basicRepair.jobType,
        priority: workOrderFixtures.basicRepair.priority,
        complaint: workOrderFixtures.basicRepair.complaint,
        odometerReading: workOrderFixtures.basicRepair.odometerReading
      };

      const response = await request(app)
        .post('/work-orders')
        .set('Authorization', authToken)
        .send(workOrderData)
        .expect(201);

      testWorkOrderId = response.body.data.id;
    });

    it('should retrieve work order with all related data', async () => {
      const response = await request(app)
        .get(`/work-orders/${testWorkOrderId}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testWorkOrderId);
      expect(response.body.data.customer).toBeDefined();
      expect(response.body.data.vehicle).toBeDefined();
      expect(response.body.data.customer.name).toBe(customerFixtures.validCustomer.name);
      expect(response.body.data.vehicle.make).toBe(vehicleFixtures.toyota.make);
    });

    it('should return 404 for non-existent work order', async () => {
      const response = await request(app)
        .get('/work-orders/nonexistent-work-order-id')
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Work order not found');
    });
  });

  describe('GET /work-orders', () => {
    beforeEach(async () => {
      // Create multiple test work orders
      const workOrders = [
        {
          customerId: testCustomerId,
          vehicleId: testVehicleId,
          workOrderNumber: generateWorkOrderNumber(),
          status: 'PENDING',
          jobType: 'REPAIR',
          priority: 'NORMAL',
          complaint: 'Brake issue'
        },
        {
          customerId: testCustomerId,
          vehicleId: testVehicleId,
          workOrderNumber: generateWorkOrderNumber(),
          status: 'IN_PROGRESS',
          jobType: 'MAINTENANCE',
          priority: 'HIGH',
          complaint: 'Oil change'
        }
      ];

      for (const workOrder of workOrders) {
        await request(app)
          .post('/work-orders')
          .set('Authorization', authToken)
          .send(workOrder)
          .expect(201);
      }
    });

    it('should retrieve work orders with filters', async () => {
      const response = await request(app)
        .get('/work-orders')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter work orders by status', async () => {
      const response = await request(app)
        .get('/work-orders?status=PENDING')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((workOrder: any) => {
        expect(workOrder.status).toBe('PENDING');
      });
    });

    it('should filter work orders by customer', async () => {
      const response = await request(app)
        .get(`/work-orders?customerId=${testCustomerId}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((workOrder: any) => {
        expect(workOrder.customerId).toBe(testCustomerId);
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/work-orders?limit=1&offset=0')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.pagination).toMatchObject({
        limit: 1,
        offset: 0
      });
    });
  });

  describe('PUT /work-orders/:id', () => {
    beforeEach(async () => {
      // Create a test work order
      const workOrderData = {
        customerId: testCustomerId,
        vehicleId: testVehicleId,
        workOrderNumber: generateWorkOrderNumber(),
        status: 'PENDING',
        jobType: 'REPAIR',
        priority: 'NORMAL',
        complaint: 'Initial complaint'
      };

      const response = await request(app)
        .post('/work-orders')
        .set('Authorization', authToken)
        .send(workOrderData)
        .expect(201);

      testWorkOrderId = response.body.data.id;
    });

    it('should update work order information', async () => {
      const updateData = {
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        complaint: 'Updated complaint with more details'
      };

      const response = await request(app)
        .put(`/work-orders/${testWorkOrderId}`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('IN_PROGRESS');
      expect(response.body.data.priority).toBe('HIGH');
      expect(response.body.data.complaint).toBe('Updated complaint with more details');
    });

    it('should return 404 when updating non-existent work order', async () => {
      const updateData = {
        status: 'COMPLETED'
      };

      const response = await request(app)
        .put('/work-orders/nonexistent-work-order-id')
        .set('Authorization', authToken)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Work order not found');
    });
  });

  describe('Work Order Services Management', () => {
    beforeEach(async () => {
      // Create a test work order
      const workOrderData = {
        customerId: testCustomerId,
        vehicleId: testVehicleId,
        workOrderNumber: generateWorkOrderNumber(),
        status: 'PENDING',
        jobType: 'MAINTENANCE',
        priority: 'NORMAL',
        complaint: 'Service required'
      };

      const response = await request(app)
        .post('/work-orders')
        .set('Authorization', authToken)
        .send(workOrderData)
        .expect(201);

      testWorkOrderId = response.body.data.id;
    });

    it('should add service to work order', async () => {
      const serviceData = {
        cannedServiceId: 'service1', // Would be created in setup
        quantity: 1,
        unitPrice: 49.99,
        description: 'Oil change service'
      };

      const response = await request(app)
        .post(`/work-orders/${testWorkOrderId}/services`)
        .set('Authorization', authToken)
        .send(serviceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.quantity).toBe(1);
      expect(response.body.data.unitPrice).toBe('49.99');
    });

    it('should retrieve services for work order', async () => {
      // First add a service
      const serviceData = {
        cannedServiceId: 'service1',
        quantity: 1,
        unitPrice: 39.99,
        description: 'Tire rotation'
      };

      await request(app)
        .post(`/work-orders/${testWorkOrderId}/services`)
        .set('Authorization', authToken)
        .send(serviceData)
        .expect(201);

      // Then retrieve services
      const response = await request(app)
        .get(`/work-orders/${testWorkOrderId}/services`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Work Order Labor Management', () => {
    let technicianId: string;

    beforeEach(async () => {
      // Create a test work order
      const workOrderData = {
        customerId: testCustomerId,
        vehicleId: testVehicleId,
        workOrderNumber: generateWorkOrderNumber(),
        status: 'IN_PROGRESS',
        jobType: 'REPAIR',
        priority: 'NORMAL',
        complaint: 'Brake repair needed'
      };

      const response = await request(app)
        .post('/work-orders')
        .set('Authorization', authToken)
        .send(workOrderData)
        .expect(201);

      testWorkOrderId = response.body.data.id;

      // Mock technician ID (would be created in real setup)
      technicianId = 'technician-123';
    });

    it('should add labor to work order', async () => {
      const laborData = {
        laborCatalogId: 'labor1', // Would be created in setup
        technicianId: technicianId,
        estimatedMinutes: 120,
        hourlyRate: 75.00,
        description: 'Brake pad replacement'
      };

      const response = await request(app)
        .post(`/work-orders/${testWorkOrderId}/labor`)
        .set('Authorization', authToken)
        .send(laborData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.estimatedMinutes).toBe(120);
      expect(response.body.data.hourlyRate).toBe('75.00');
    });

    it('should start labor work', async () => {
      // First add labor
      const laborData = {
        laborCatalogId: 'labor1',
        technicianId: technicianId,
        estimatedMinutes: 60,
        hourlyRate: 50.00,
        description: 'Diagnostic work'
      };

      const laborResponse = await request(app)
        .post(`/work-orders/${testWorkOrderId}/labor`)
        .set('Authorization', authToken)
        .send(laborData)
        .expect(201);

      const laborId = laborResponse.body.data.id;

      // Start the labor
      const startResponse = await request(app)
        .post(`/work-orders/labor/${laborId}/start`)
        .set('Authorization', authToken)
        .send()
        .expect(200);

      expect(startResponse.body.success).toBe(true);
      expect(startResponse.body.message).toContain('started');
    });

    it('should complete labor work', async () => {
      // First add and start labor
      const laborData = {
        laborCatalogId: 'labor1',
        technicianId: technicianId,
        estimatedMinutes: 30,
        hourlyRate: 60.00,
        description: 'Quick repair'
      };

      const laborResponse = await request(app)
        .post(`/work-orders/${testWorkOrderId}/labor`)
        .set('Authorization', authToken)
        .send(laborData)
        .expect(201);

      const laborId = laborResponse.body.data.id;

      await request(app)
        .post(`/work-orders/labor/${laborId}/start`)
        .set('Authorization', authToken)
        .send()
        .expect(200);

      // Complete the labor
      const completeResponse = await request(app)
        .post(`/work-orders/labor/${laborId}/complete`)
        .set('Authorization', authToken)
        .send({ notes: 'Work completed successfully' })
        .expect(200);

      expect(completeResponse.body.success).toBe(true);
      expect(completeResponse.body.message).toContain('completed');
    });
  });

  describe('Work Order Status Transitions', () => {
    beforeEach(async () => {
      // Create a test work order
      const workOrderData = {
        customerId: testCustomerId,
        vehicleId: testVehicleId,
        workOrderNumber: generateWorkOrderNumber(),
        status: 'PENDING',
        jobType: 'REPAIR',
        priority: 'NORMAL',
        complaint: 'Status transition test'
      };

      const response = await request(app)
        .post('/work-orders')
        .set('Authorization', authToken)
        .send(workOrderData)
        .expect(201);

      testWorkOrderId = response.body.data.id;
    });

    it('should transition work order status from PENDING to IN_PROGRESS', async () => {
      const statusUpdate = {
        status: 'IN_PROGRESS',
        notes: 'Starting work on the vehicle'
      };

      const response = await request(app)
        .patch(`/work-orders/${testWorkOrderId}/status`)
        .set('Authorization', authToken)
        .send(statusUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('IN_PROGRESS');
    });

    it('should transition work order to COMPLETED', async () => {
      // First set to IN_PROGRESS
      await request(app)
        .patch(`/work-orders/${testWorkOrderId}/status`)
        .set('Authorization', authToken)
        .send({ status: 'IN_PROGRESS' })
        .expect(200);

      // Then complete it
      const completeResponse = await request(app)
        .patch(`/work-orders/${testWorkOrderId}/status`)
        .set('Authorization', authToken)
        .send({
          status: 'COMPLETED',
          notes: 'Work completed successfully'
        })
        .expect(200);

      expect(completeResponse.body.success).toBe(true);
      expect(completeResponse.body.data.status).toBe('COMPLETED');
    });
  });

  describe('Work Order Statistics', () => {
    beforeEach(async () => {
      // Create multiple work orders for statistics
      const workOrders = [
        {
          customerId: testCustomerId,
          vehicleId: testVehicleId,
          workOrderNumber: generateWorkOrderNumber(),
          status: 'COMPLETED',
          jobType: 'MAINTENANCE',
          priority: 'NORMAL',
          complaint: 'Completed maintenance'
        },
        {
          customerId: testCustomerId,
          vehicleId: testVehicleId,
          workOrderNumber: generateWorkOrderNumber(),
          status: 'IN_PROGRESS',
          jobType: 'REPAIR',
          priority: 'HIGH',
          complaint: 'Ongoing repair'
        },
        {
          customerId: testCustomerId,
          vehicleId: testVehicleId,
          workOrderNumber: generateWorkOrderNumber(),
          status: 'PENDING',
          jobType: 'INSPECTION',
          priority: 'NORMAL',
          complaint: 'Scheduled inspection'
        }
      ];

      for (const workOrder of workOrders) {
        await request(app)
          .post('/work-orders')
          .set('Authorization', authToken)
          .send(workOrder)
          .expect(201);
      }
    });

    it('should return work order statistics', async () => {
      const response = await request(app)
        .get('/work-orders/statistics')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalWorkOrders');
      expect(response.body.data).toHaveProperty('statusBreakdown');
      expect(response.body.data).toHaveProperty('priorityBreakdown');
      expect(response.body.data).toHaveProperty('jobTypeBreakdown');

      expect(response.body.data.totalWorkOrders).toBeGreaterThanOrEqual(3);
      expect(response.body.data.statusBreakdown.COMPLETED).toBeGreaterThanOrEqual(1);
      expect(response.body.data.statusBreakdown.IN_PROGRESS).toBeGreaterThanOrEqual(1);
      expect(response.body.data.statusBreakdown.PENDING).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Work Order Search and Filtering', () => {
    beforeEach(async () => {
      // Create work orders with searchable content
      const workOrders = [
        {
          customerId: testCustomerId,
          vehicleId: testVehicleId,
          workOrderNumber: 'WO-SEARCH-001',
          status: 'COMPLETED',
          jobType: 'REPAIR',
          priority: 'NORMAL',
          complaint: 'Brake repair completed'
        },
        {
          customerId: testCustomerId,
          vehicleId: testVehicleId,
          workOrderNumber: 'WO-SEARCH-002',
          status: 'PENDING',
          jobType: 'MAINTENANCE',
          priority: 'HIGH',
          complaint: 'Oil change needed'
        }
      ];

      for (const workOrder of workOrders) {
        await request(app)
          .post('/work-orders')
          .set('Authorization', authToken)
          .send(workOrder)
          .expect(201);
      }
    });

    it('should search work orders by complaint text', async () => {
      const response = await request(app)
        .get('/work-orders/search?q=brake')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((workOrder: any) => {
        expect(workOrder.complaint.toLowerCase()).toContain('brake');
      });
    });

    it('should search work orders by work order number', async () => {
      const response = await request(app)
        .get('/work-orders/search?q=WO-SEARCH-001')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((workOrder: any) => {
        expect(workOrder.workOrderNumber).toContain('WO-SEARCH-001');
      });
    });
  });
});