import request from 'supertest';
import app from '../../../app';
import { createTestDatabase, cleanupTestDatabase, resetTestDatabase, disconnectTestDatabase, createTestCustomer } from '../../helpers/test-database';
import { vehicleFixtures, customerFixtures, generateUniqueVIN } from '../../fixtures/test-data.fixtures';

describe('Vehicles Integration Tests', () => {
  let authToken: string;
  let testCustomerId: string;
  let testVehicleId: string;

  beforeAll(async () => {
    await createTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await disconnectTestDatabase();
  });

  beforeEach(async () => {
    await resetTestDatabase();

    // Create a test customer
    const customer = await createTestCustomer({
      name: customerFixtures.validCustomer.name,
      email: customerFixtures.validCustomer.email,
      phone: customerFixtures.validCustomer.phone
    });
    testCustomerId = customer.id;

    // Mock authentication token (in real tests, you'd authenticate properly)
    authToken = 'Bearer mock-jwt-token';
  });

  afterEach(async () => {
    // Clean up test vehicle if created
    if (testVehicleId) {
      try {
        // Clean up would happen here
        testVehicleId = '';
      } catch (error) {
        // Vehicle might not exist
      }
    }
  });

  describe('POST /vehicles', () => {
    it('should create a new vehicle with valid data', async () => {
      const vehicleData = {
        customerId: testCustomerId,
        make: vehicleFixtures.toyota.make,
        model: vehicleFixtures.toyota.model,
        year: vehicleFixtures.toyota.year,
        vin: generateUniqueVIN(),
        licensePlate: vehicleFixtures.toyota.licensePlate,
        imageUrl: 'https://example.com/vehicle.jpg'
      };

      const response = await request(app)
        .post('/vehicles')
        .set('Authorization', authToken)
        .send(vehicleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        customerId: testCustomerId,
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        vin: vehicleData.vin,
        licensePlate: vehicleData.licensePlate
      });
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('customer');

      testVehicleId = response.body.data.id;
    });

    it('should create vehicle without VIN (optional field)', async () => {
      const vehicleData = {
        customerId: testCustomerId,
        make: vehicleFixtures.vehicleWithoutVIN.make,
        model: vehicleFixtures.vehicleWithoutVIN.model,
        year: vehicleFixtures.vehicleWithoutVIN.year,
        licensePlate: vehicleFixtures.vehicleWithoutVIN.licensePlate
      };

      const response = await request(app)
        .post('/vehicles')
        .set('Authorization', authToken)
        .send(vehicleData)
        .expect(201);

      expect(response.body.data.vin).toBeNull();
      testVehicleId = response.body.data.id;
    });

    it('should return 400 for duplicate VIN', async () => {
      // Create first vehicle
      const vehicleData1 = {
        customerId: testCustomerId,
        make: vehicleFixtures.toyota.make,
        model: vehicleFixtures.toyota.model,
        year: vehicleFixtures.toyota.year,
        vin: generateUniqueVIN(),
        licensePlate: 'PLATE001'
      };

      await request(app)
        .post('/vehicles')
        .set('Authorization', authToken)
        .send(vehicleData1)
        .expect(201);

      // Try to create second vehicle with same VIN
      const vehicleData2 = {
        customerId: testCustomerId,
        make: vehicleFixtures.honda.make,
        model: vehicleFixtures.honda.model,
        year: vehicleFixtures.honda.year,
        vin: vehicleData1.vin, // Same VIN
        licensePlate: 'PLATE002'
      };

      const response = await request(app)
        .post('/vehicles')
        .set('Authorization', authToken)
        .send(vehicleData2)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('VIN already exists');
    });

    it('should return 400 for non-existent customer', async () => {
      const vehicleData = {
        customerId: 'nonexistent-customer-id',
        make: vehicleFixtures.toyota.make,
        model: vehicleFixtures.toyota.model,
        year: vehicleFixtures.toyota.year,
        licensePlate: 'TEST123'
      };

      const response = await request(app)
        .post('/vehicles')
        .set('Authorization', authToken)
        .send(vehicleData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Customer not found');
    });

    it('should return 401 when not authenticated', async () => {
      const vehicleData = {
        customerId: testCustomerId,
        make: vehicleFixtures.toyota.make,
        model: vehicleFixtures.toyota.model,
        year: vehicleFixtures.toyota.year
      };

      const response = await request(app)
        .post('/vehicles')
        .send(vehicleData)
        .expect(401);

      expect(response.body.error).toBe('User not authenticated');
    });
  });

  describe('GET /vehicles/:id', () => {
    beforeEach(async () => {
      // Create a test vehicle
      const vehicleData = {
        customerId: testCustomerId,
        make: vehicleFixtures.toyota.make,
        model: vehicleFixtures.toyota.model,
        year: vehicleFixtures.toyota.year,
        vin: generateUniqueVIN(),
        licensePlate: vehicleFixtures.toyota.licensePlate
      };

      const response = await request(app)
        .post('/vehicles')
        .set('Authorization', authToken)
        .send(vehicleData)
        .expect(201);

      testVehicleId = response.body.data.id;
    });

    it('should retrieve vehicle by id with customer details', async () => {
      const response = await request(app)
        .get(`/vehicles/${testVehicleId}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testVehicleId);
      expect(response.body.data.make).toBe(vehicleFixtures.toyota.make);
      expect(response.body.data.model).toBe(vehicleFixtures.toyota.model);
      expect(response.body.data.customer).toBeDefined();
      expect(response.body.data.customer.name).toBe(customerFixtures.validCustomer.name);
    });

    it('should return 404 for non-existent vehicle', async () => {
      const response = await request(app)
        .get('/vehicles/nonexistent-vehicle-id')
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Vehicle not found');
    });
  });

  describe('GET /vehicles', () => {
    beforeEach(async () => {
      // Create multiple test vehicles
      const vehicles = [
        {
          customerId: testCustomerId,
          make: vehicleFixtures.toyota.make,
          model: vehicleFixtures.toyota.model,
          year: vehicleFixtures.toyota.year,
          vin: generateUniqueVIN(),
          licensePlate: vehicleFixtures.toyota.licensePlate
        },
        {
          customerId: testCustomerId,
          make: vehicleFixtures.honda.make,
          model: vehicleFixtures.honda.model,
          year: vehicleFixtures.honda.year,
          vin: generateUniqueVIN(),
          licensePlate: vehicleFixtures.honda.licensePlate
        }
      ];

      for (const vehicle of vehicles) {
        await request(app)
          .post('/vehicles')
          .set('Authorization', authToken)
          .send(vehicle)
          .expect(201);
      }
    });

    it('should retrieve all vehicles with filters', async () => {
      const response = await request(app)
        .get('/vehicles')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter vehicles by customer ID', async () => {
      const response = await request(app)
        .get(`/vehicles?customerId=${testCustomerId}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      response.body.data.forEach((vehicle: any) => {
        expect(vehicle.customerId).toBe(testCustomerId);
      });
    });

    it('should filter vehicles by make', async () => {
      const response = await request(app)
        .get(`/vehicles?make=Toyota`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((vehicle: any) => {
        expect(vehicle.make.toLowerCase()).toContain('toyota');
      });
    });

    it('should search vehicles by query', async () => {
      const response = await request(app)
        .get('/vehicles?search=Toyota')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((vehicle: any) => {
        const searchableText = `${vehicle.make} ${vehicle.model} ${vehicle.vin} ${vehicle.licensePlate}`.toLowerCase();
        expect(searchableText).toContain('toyota');
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/vehicles?limit=1&offset=0')
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

  describe('PUT /vehicles/:id', () => {
    beforeEach(async () => {
      // Create a test vehicle
      const vehicleData = {
        customerId: testCustomerId,
        make: vehicleFixtures.toyota.make,
        model: vehicleFixtures.toyota.model,
        year: vehicleFixtures.toyota.year,
        vin: generateUniqueVIN(),
        licensePlate: vehicleFixtures.toyota.licensePlate
      };

      const response = await request(app)
        .post('/vehicles')
        .set('Authorization', authToken)
        .send(vehicleData)
        .expect(201);

      testVehicleId = response.body.data.id;
    });

    it('should update vehicle information', async () => {
      const updateData = {
        make: 'Honda',
        model: 'Civic',
        year: 2022,
        licensePlate: 'UPDATED123'
      };

      const response = await request(app)
        .put(`/vehicles/${testVehicleId}`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.make).toBe('Honda');
      expect(response.body.data.model).toBe('Civic');
      expect(response.body.data.year).toBe(2022);
      expect(response.body.data.licensePlate).toBe('UPDATED123');
    });

    it('should return 404 when updating non-existent vehicle', async () => {
      const updateData = {
        make: 'Updated Make'
      };

      const response = await request(app)
        .put('/vehicles/nonexistent-vehicle-id')
        .set('Authorization', authToken)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Vehicle not found');
    });

    it('should return 400 when updating to existing VIN', async () => {
      // Create another vehicle first
      const anotherVehicle = {
        customerId: testCustomerId,
        make: vehicleFixtures.honda.make,
        model: vehicleFixtures.honda.model,
        year: vehicleFixtures.honda.year,
        vin: generateUniqueVIN(),
        licensePlate: 'ANOTHER123'
      };

      await request(app)
        .post('/vehicles')
        .set('Authorization', authToken)
        .send(anotherVehicle)
        .expect(201);

      // Try to update our test vehicle to use the same VIN
      const updateData = {
        vin: anotherVehicle.vin
      };

      const response = await request(app)
        .put(`/vehicles/${testVehicleId}`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('VIN already exists');
    });
  });

  describe('DELETE /vehicles/:id', () => {
    beforeEach(async () => {
      // Create a test vehicle
      const vehicleData = {
        customerId: testCustomerId,
        make: vehicleFixtures.toyota.make,
        model: vehicleFixtures.toyota.model,
        year: vehicleFixtures.toyota.year,
        vin: generateUniqueVIN(),
        licensePlate: vehicleFixtures.toyota.licensePlate
      };

      const response = await request(app)
        .post('/vehicles')
        .set('Authorization', authToken)
        .send(vehicleData)
        .expect(201);

      testVehicleId = response.body.data.id;
    });

    it('should delete vehicle successfully', async () => {
      const response = await request(app)
        .delete(`/vehicles/${testVehicleId}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Vehicle deleted successfully');

      // Verify vehicle is deleted
      const getResponse = await request(app)
        .get(`/vehicles/${testVehicleId}`)
        .set('Authorization', authToken)
        .expect(404);

      expect(getResponse.body.success).toBe(false);
    });

    it('should return 404 when deleting non-existent vehicle', async () => {
      const response = await request(app)
        .delete('/vehicles/nonexistent-vehicle-id')
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Vehicle not found');
    });
  });

  describe('GET /vehicles/customer/:customerId', () => {
    beforeEach(async () => {
      // Create multiple vehicles for the customer
      const vehicles = [
        {
          customerId: testCustomerId,
          make: vehicleFixtures.toyota.make,
          model: vehicleFixtures.toyota.model,
          year: vehicleFixtures.toyota.year,
          vin: generateUniqueVIN(),
          licensePlate: vehicleFixtures.toyota.licensePlate
        },
        {
          customerId: testCustomerId,
          make: vehicleFixtures.honda.make,
          model: vehicleFixtures.honda.model,
          year: vehicleFixtures.honda.year,
          vin: generateUniqueVIN(),
          licensePlate: vehicleFixtures.honda.licensePlate
        }
      ];

      for (const vehicle of vehicles) {
        await request(app)
          .post('/vehicles')
          .set('Authorization', authToken)
          .send(vehicle)
          .expect(201);
      }
    });

    it('should retrieve all vehicles for a customer', async () => {
      const response = await request(app)
        .get(`/vehicles/customer/${testCustomerId}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);

      response.body.data.forEach((vehicle: any) => {
        expect(vehicle.customerId).toBe(testCustomerId);
        expect(vehicle.customer).toBeDefined();
      });
    });

    it('should return empty array for customer with no vehicles', async () => {
      const newCustomer = await createTestCustomer({
        name: 'Empty Customer',
        email: 'empty@example.com',
        phone: '+9999999999'
      });

      const response = await request(app)
        .get(`/vehicles/customer/${newCustomer.id}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /vehicles/search', () => {
    beforeEach(async () => {
      // Create test vehicles for search
      const vehicles = [
        {
          customerId: testCustomerId,
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          vin: 'SEARCHVIN001',
          licensePlate: 'SEARCH001'
        },
        {
          customerId: testCustomerId,
          make: 'Honda',
          model: 'Civic',
          year: 2019,
          vin: 'SEARCHVIN002',
          licensePlate: 'SEARCH002'
        }
      ];

      for (const vehicle of vehicles) {
        await request(app)
          .post('/vehicles')
          .set('Authorization', authToken)
          .send(vehicle)
          .expect(201);
      }
    });

    it('should search vehicles by make', async () => {
      const response = await request(app)
        .get('/vehicles/search?q=Toyota')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((vehicle: any) => {
        expect(vehicle.make.toLowerCase()).toContain('toyota');
      });
    });

    it('should search vehicles by VIN', async () => {
      const response = await request(app)
        .get('/vehicles/search?q=SEARCHVIN001')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((vehicle: any) => {
        expect(vehicle.vin).toContain('SEARCHVIN001');
      });
    });

    it('should limit search results', async () => {
      const response = await request(app)
        .get('/vehicles/search?q=SEARCH')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(20); // Default limit
    });
  });

  describe('GET /vehicles/statistics', () => {
    beforeEach(async () => {
      // Create vehicles for statistics
      const vehicles = [
        { customerId: testCustomerId, make: 'Toyota', model: 'Camry', year: 2020, vin: generateUniqueVIN(), licensePlate: 'STAT001' },
        { customerId: testCustomerId, make: 'Toyota', model: 'Corolla', year: 2021, vin: generateUniqueVIN(), licensePlate: 'STAT002' },
        { customerId: testCustomerId, make: 'Honda', model: 'Civic', year: 2020, vin: generateUniqueVIN(), licensePlate: 'STAT003' },
        { customerId: testCustomerId, make: 'Ford', model: 'F-150', year: 2019, vin: generateUniqueVIN(), licensePlate: 'STAT004' }
      ];

      for (const vehicle of vehicles) {
        await request(app)
          .post('/vehicles')
          .set('Authorization', authToken)
          .send(vehicle)
          .expect(201);
      }
    });

    it('should return comprehensive vehicle statistics', async () => {
      const response = await request(app)
        .get('/vehicles/statistics')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalVehicles');
      expect(response.body.data).toHaveProperty('vehiclesByMake');
      expect(response.body.data).toHaveProperty('vehiclesByYear');
      expect(response.body.data).toHaveProperty('recentAdditions');

      expect(response.body.data.totalVehicles).toBeGreaterThanOrEqual(4);
      expect(Array.isArray(response.body.data.vehiclesByMake)).toBe(true);
      expect(Array.isArray(response.body.data.vehiclesByYear)).toBe(true);
      expect(Array.isArray(response.body.data.recentAdditions)).toBe(true);
    });
  });
});