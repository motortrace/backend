import { UsersService, CreateUserData, UpdateUserData } from '../../../modules/users/users.service';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
jest.mock('@prisma/client');

describe('UsersService', () => {
  let usersService: UsersService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    usersService = new UsersService(mockPrisma);
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 'user1',
          supabaseUserId: 'supabase1',
          name: 'John Doe',
          phone: '+1234567890',
          profileImage: null,
          role: 'CUSTOMER',
          isRegistrationComplete: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'user2',
          supabaseUserId: 'supabase2',
          name: 'Jane Smith',
          phone: '+0987654321',
          profileImage: 'jane.jpg',
          role: 'TECHNICIAN',
          isRegistrationComplete: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPrisma.userProfile.findMany.mockResolvedValue(mockUsers as any);

      // Act
      const result = await usersService.getUsers();

      // Assert
      expect(mockPrisma.userProfile.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = 'user123';
      const mockUser = {
        id: userId,
        supabaseUserId: 'supabase123',
        name: 'John Doe',
        phone: '+1234567890',
        profileImage: null,
        role: 'CUSTOMER',
        isRegistrationComplete: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.userProfile.findUnique.mockResolvedValue(mockUser as any);

      // Act
      const result = await usersService.getUserById(userId);

      // Assert
      expect(mockPrisma.userProfile.findUnique).toHaveBeenCalledWith({
        where: { id: userId }
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 'nonexistent';
      mockPrisma.userProfile.findUnique.mockResolvedValue(null);

      // Act
      const result = await usersService.getUserById(userId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Arrange
      const userData: CreateUserData = {
        supabaseUserId: 'supabase123',
        name: 'John Doe',
        phone: '+1234567890',
        profileImage: 'john.jpg',
        isRegistrationComplete: true
      };

      const mockCreatedUser = {
        id: 'user123',
        ...userData,
        role: 'CUSTOMER',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.userProfile.create.mockResolvedValue(mockCreatedUser as any);

      // Act
      const result = await usersService.createUser(userData);

      // Assert
      expect(mockPrisma.userProfile.create).toHaveBeenCalledWith({
        data: {
          supabaseUserId: 'supabase123',
          name: 'John Doe',
          phone: '+1234567890',
          profileImage: 'john.jpg',
          isRegistrationComplete: true
        }
      });
      expect(result).toEqual(mockCreatedUser);
    });

    it('should create user with default isRegistrationComplete as false', async () => {
      // Arrange
      const userData: CreateUserData = {
        supabaseUserId: 'supabase123',
        name: 'John Doe'
      };

      const mockCreatedUser = {
        id: 'user123',
        ...userData,
        phone: undefined,
        profileImage: undefined,
        isRegistrationComplete: false,
        role: 'CUSTOMER',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.userProfile.create.mockResolvedValue(mockCreatedUser as any);

      // Act
      const result = await usersService.createUser(userData);

      // Assert
      expect(mockPrisma.userProfile.create).toHaveBeenCalledWith({
        data: {
          supabaseUserId: 'supabase123',
          name: 'John Doe',
          phone: undefined,
          profileImage: undefined,
          isRegistrationComplete: false
        }
      });
      expect(result.isRegistrationComplete).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = 'user123';
      const updateData: UpdateUserData = {
        name: 'John Updated',
        phone: '+0987654321',
        profileImage: 'john-updated.jpg',
        isRegistrationComplete: true
      };

      const mockUpdatedUser = {
        id: userId,
        supabaseUserId: 'supabase123',
        name: 'John Updated',
        phone: '+0987654321',
        profileImage: 'john-updated.jpg',
        role: 'CUSTOMER',
        isRegistrationComplete: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      };

      mockPrisma.userProfile.update.mockResolvedValue(mockUpdatedUser as any);

      // Act
      const result = await usersService.updateUser(userId, updateData);

      // Assert
      expect(mockPrisma.userProfile.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          name: 'John Updated',
          phone: '+0987654321',
          profileImage: 'john-updated.jpg',
          isRegistrationComplete: true
        }
      });
      expect(result.name).toBe('John Updated');
      expect(result.phone).toBe('+0987654321');
    });

    it('should update user with partial data', async () => {
      // Arrange
      const userId = 'user123';
      const updateData: UpdateUserData = {
        name: 'John Updated'
      };

      const mockUpdatedUser = {
        id: userId,
        supabaseUserId: 'supabase123',
        name: 'John Updated',
        phone: '+1234567890',
        profileImage: null,
        role: 'CUSTOMER',
        isRegistrationComplete: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      };

      mockPrisma.userProfile.update.mockResolvedValue(mockUpdatedUser as any);

      // Act
      const result = await usersService.updateUser(userId, updateData);

      // Assert
      expect(mockPrisma.userProfile.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          name: 'John Updated',
          phone: undefined,
          profileImage: undefined,
          isRegistrationComplete: undefined
        }
      });
      expect(result.name).toBe('John Updated');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const userId = 'user123';

      // Act
      await usersService.deleteUser(userId);

      // Assert
      expect(mockPrisma.userProfile.delete).toHaveBeenCalledWith({
        where: { id: userId }
      });
    });
  });

  describe('createServiceAdvisor', () => {
    it('should create service advisor successfully', async () => {
      // Arrange
      const userProfileId = 'profile123';
      const employeeId = 'SA001';

      const mockServiceAdvisor = {
        id: 'advisor123',
        userProfileId: 'profile123',
        employeeId: 'SA001',
        department: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.serviceAdvisor.create.mockResolvedValue(mockServiceAdvisor as any);

      // Act
      const result = await usersService.createServiceAdvisor(userProfileId, employeeId);

      // Assert
      expect(mockPrisma.serviceAdvisor.create).toHaveBeenCalledWith({
        data: {
          userProfileId: 'profile123',
          employeeId: 'SA001'
        }
      });
      expect(result).toEqual(mockServiceAdvisor);
    });

    it('should create service advisor without employee ID', async () => {
      // Arrange
      const userProfileId = 'profile123';

      const mockServiceAdvisor = {
        id: 'advisor123',
        userProfileId: 'profile123',
        employeeId: null,
        department: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.serviceAdvisor.create.mockResolvedValue(mockServiceAdvisor as any);

      // Act
      const result = await usersService.createServiceAdvisor(userProfileId);

      // Assert
      expect(mockPrisma.serviceAdvisor.create).toHaveBeenCalledWith({
        data: {
          userProfileId: 'profile123',
          employeeId: undefined
        }
      });
      expect(result.employeeId).toBeNull();
    });
  });

  describe('createTechnician', () => {
    it('should create technician successfully', async () => {
      // Arrange
      const userProfileId = 'profile123';
      const employeeId = 'TECH001';

      const mockTechnician = {
        id: 'tech123',
        userProfileId: 'profile123',
        employeeId: 'TECH001',
        specialization: null,
        certifications: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.technician.create.mockResolvedValue(mockTechnician as any);

      // Act
      const result = await usersService.createTechnician(userProfileId, employeeId);

      // Assert
      expect(mockPrisma.technician.create).toHaveBeenCalledWith({
        data: {
          userProfileId: 'profile123',
          employeeId: 'TECH001'
        }
      });
      expect(result).toEqual(mockTechnician);
    });
  });

  describe('createInventoryManager', () => {
    it('should create inventory manager successfully', async () => {
      // Arrange
      const userProfileId = 'profile123';
      const employeeId = 'IM001';

      const mockInventoryManager = {
        id: 'im123',
        userProfileId: 'profile123',
        employeeId: 'IM001',
        department: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.inventoryManager.create.mockResolvedValue(mockInventoryManager as any);

      // Act
      const result = await usersService.createInventoryManager(userProfileId, employeeId);

      // Assert
      expect(mockPrisma.inventoryManager.create).toHaveBeenCalledWith({
        data: {
          userProfileId: 'profile123',
          employeeId: 'IM001'
        }
      });
      expect(result).toEqual(mockInventoryManager);
    });
  });

  describe('createManager', () => {
    it('should create manager successfully', async () => {
      // Arrange
      const userProfileId = 'profile123';
      const employeeId = 'MGR001';

      const mockManager = {
        id: 'mgr123',
        userProfileId: 'profile123',
        employeeId: 'MGR001',
        department: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.manager.create.mockResolvedValue(mockManager as any);

      // Act
      const result = await usersService.createManager(userProfileId, employeeId);

      // Assert
      expect(mockPrisma.manager.create).toHaveBeenCalledWith({
        data: {
          userProfileId: 'profile123',
          employeeId: 'MGR001'
        }
      });
      expect(result).toEqual(mockManager);
    });
  });

  describe('createAdmin', () => {
    it('should create admin successfully', async () => {
      // Arrange
      const userProfileId = 'profile123';
      const employeeId = 'ADMIN001';

      const mockAdmin = {
        id: 'admin123',
        userProfileId: 'profile123',
        employeeId: 'ADMIN001',
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.admin.create.mockResolvedValue(mockAdmin as any);

      // Act
      const result = await usersService.createAdmin(userProfileId, employeeId);

      // Assert
      expect(mockPrisma.admin.create).toHaveBeenCalledWith({
        data: {
          userProfileId: 'profile123',
          employeeId: 'ADMIN001',
          permissions: []
        }
      });
      expect(result).toEqual(mockAdmin);
      expect(result.permissions).toEqual([]);
    });

    it('should create admin without employee ID', async () => {
      // Arrange
      const userProfileId = 'profile123';

      const mockAdmin = {
        id: 'admin123',
        userProfileId: 'profile123',
        employeeId: null,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.admin.create.mockResolvedValue(mockAdmin as any);

      // Act
      const result = await usersService.createAdmin(userProfileId);

      // Assert
      expect(mockPrisma.admin.create).toHaveBeenCalledWith({
        data: {
          userProfileId: 'profile123',
          employeeId: undefined,
          permissions: []
        }
      });
      expect(result.employeeId).toBeNull();
    });
  });
});