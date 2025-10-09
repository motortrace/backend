// Update the import path if the file was moved or renamed
import { CustomerService } from '../../modules/customers/customers.service';
import { PrismaClient } from '@prisma/client';
import { CreateCustomerDto } from '../../modules/customers/customers.types';

// Mock Prisma Client
jest.mock('@prisma/client');

describe('CustomerService Unit Tests', () => {
  let customerService: CustomerService;
  let mockPrisma: any;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create mock Prisma client with proper Jest mock functions
    mockPrisma = {
      customer: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    // Initialize service with mock
    customerService = new CustomerService(mockPrisma as PrismaClient);
  });

  describe('createCustomer', () => {
    it('should create a customer with valid data', async () => {
      // Arrange
      const customerData: CreateCustomerDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
      };

      const expectedCustomer = {
        id: 'customer_123',
        ...customerData,
        userProfileId: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      mockPrisma.customer.create.mockResolvedValue(expectedCustomer as any);

      // Act
      const result = await customerService.createCustomer(customerData);

      // Assert
      expect(result).toEqual(expectedCustomer);
      expect(mockPrisma.customer.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: customerData,
        include: expect.any(Object),
      });
    });

    it('should create a customer without email (walk-in)', async () => {
      // Arrange
      const customerData: CreateCustomerDto = {
        name: 'Walk-in Customer',
        phone: '+1234567890',
      };

      const expectedCustomer = {
        id: 'customer_456',
        ...customerData,
        email: null,
        userProfileId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.customer.create.mockResolvedValue(expectedCustomer as any);

      // Act
      const result = await customerService.createCustomer(customerData);

      // Assert
      expect(result.name).toBe('Walk-in Customer');
      expect(result.email).toBeNull();
    });

    it('should throw error when database operation fails', async () => {
      // Arrange
      const customerData: CreateCustomerDto = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      mockPrisma.customer.create.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(customerService.createCustomer(customerData)).rejects.toThrow(
        'Failed to create customer: Database connection failed'
      );
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
        phone: '+1234567890',
        userProfileId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
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
      const customerId = 'nonexistent_id';
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      // Act
      const result = await customerService.getCustomerById(customerId);

      // Assert
      expect(result).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      // Arrange
      const customerId = 'customer_123';
      mockPrisma.customer.findUnique.mockRejectedValue(new Error('Query timeout'));

      // Act & Assert
      await expect(customerService.getCustomerById(customerId)).rejects.toThrow(
        'Failed to get customer: Query timeout'
      );
    });
  });

  describe('getCustomers', () => {
    it('should return list of customers with filters', async () => {
      // Arrange
      const filters = {
        search: 'John',
        limit: 10,
        offset: 0,
      };

      const mockCustomers = [
        {
          id: 'customer_1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1111111111',
        },
        {
          id: 'customer_2',
          name: 'Johnny Smith',
          email: 'johnny@example.com',
          phone: '+2222222222',
        },
      ];

      mockPrisma.customer.findMany.mockResolvedValue(mockCustomers as any);

      // Act
      const result = await customerService.getCustomers(filters);

      // Assert
      expect(result).toEqual(mockCustomers);
      expect(result).toHaveLength(2);
      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 0,
        })
      );
    });

    it('should handle empty search results', async () => {
      // Arrange
      const filters = {
        search: 'NonexistentName',
        limit: 10,
        offset: 0,
      };

      mockPrisma.customer.findMany.mockResolvedValue([]);

      // Act
      const result = await customerService.getCustomers(filters);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('updateCustomer', () => {
    it('should update customer with new data', async () => {
      // Arrange
      const customerId = 'customer_123';
      const updateData = {
        name: 'John Updated',
        email: 'john.new@example.com',
      };

      const updatedCustomer = {
        id: customerId,
        ...updateData,
        phone: '+1234567890',
        userProfileId: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-15'),
      };

      mockPrisma.customer.update.mockResolvedValue(updatedCustomer as any);

      // Act
      const result = await customerService.updateCustomer(customerId, updateData);

      // Assert
      expect(result.name).toBe('John Updated');
      expect(result.email).toBe('john.new@example.com');
      expect(mockPrisma.customer.update).toHaveBeenCalledWith({
        where: { id: customerId },
        data: updateData,
        include: expect.any(Object),
      });
    });

    it('should throw error when updating non-existent customer', async () => {
      // Arrange
      const customerId = 'nonexistent_id';
      const updateData = { name: 'Updated Name' };

      mockPrisma.customer.update.mockRejectedValue(new Error('Record not found'));

      // Act & Assert
      await expect(customerService.updateCustomer(customerId, updateData)).rejects.toThrow(
        'Failed to update customer: Record not found'
      );
    });
  });

  describe('deleteCustomer', () => {
    it('should delete customer successfully', async () => {
      // Arrange
      const customerId = 'customer_123';
      mockPrisma.customer.delete.mockResolvedValue({} as any);

      // Act
      await customerService.deleteCustomer(customerId);

      // Assert
      expect(mockPrisma.customer.delete).toHaveBeenCalledWith({
        where: { id: customerId },
      });
    });

    it('should throw error when deleting non-existent customer', async () => {
      // Arrange
      const customerId = 'nonexistent_id';
      mockPrisma.customer.delete.mockRejectedValue(new Error('Record not found'));

      // Act & Assert
      await expect(customerService.deleteCustomer(customerId)).rejects.toThrow(
        'Failed to delete customer: Record not found'
      );
    });
  });
});
