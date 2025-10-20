import { PrismaClient, UserProfile } from '@prisma/client';

export interface IUsersService {
  getUsers(): Promise<UserProfile[]>;
  getUserById(id: string): Promise<UserProfile | null>;
  createUser(data: CreateUserData): Promise<UserProfile>;
  updateUser(id: string, data: UpdateUserData): Promise<UserProfile>;
  deleteUser(id: string): Promise<void>;
  // Staff user creation methods
  createServiceAdvisor(userProfileId: string, employeeId?: string): Promise<any>;
  createTechnician(userProfileId: string, employeeId?: string): Promise<any>;
  createInventoryManager(userProfileId: string, employeeId?: string): Promise<any>;
  createManager(userProfileId: string, employeeId?: string): Promise<any>;
  createAdmin(userProfileId: string, employeeId?: string): Promise<any>;
}

export interface CreateUserData {
  supabaseUserId: string;
  name: string;
  phone?: string;
  profileImage?: string;
  isRegistrationComplete?: boolean;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  profileImage?: string;
  isRegistrationComplete?: boolean;
}

export class UsersService implements IUsersService {
  constructor(private readonly prisma: PrismaClient) {}

  async getUsers(): Promise<UserProfile[]> {
    return await this.prisma.userProfile.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getUserById(id: string): Promise<UserProfile | null> {
    return await this.prisma.userProfile.findUnique({
      where: { id }
    });
  }

  async createUser(data: CreateUserData): Promise<UserProfile> {
    return await this.prisma.userProfile.create({
      data: {
        supabaseUserId: data.supabaseUserId,
        name: data.name,
        phone: data.phone,
        profileImage: data.profileImage,
        isRegistrationComplete: data.isRegistrationComplete ?? false
      }
    });
  }

  async updateUser(id: string, data: UpdateUserData): Promise<UserProfile> {
    return await this.prisma.userProfile.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        profileImage: data.profileImage,
        isRegistrationComplete: data.isRegistrationComplete
      }
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.prisma.userProfile.delete({
      where: { id }
    });
  }

  //  Staff user creation methods
  async createServiceAdvisor(userProfileId: string, employeeId?: string): Promise<any> {
    return await this.prisma.serviceAdvisor.create({
      data: {
        userProfileId,
        employeeId: employeeId || undefined
      }
    });
  }

  async createTechnician(userProfileId: string, employeeId?: string): Promise<any> {
    return await this.prisma.technician.create({
      data: {
        userProfileId,
        employeeId: employeeId || undefined
      }
    });
  }

  async createInventoryManager(userProfileId: string, employeeId?: string): Promise<any> {
    return await this.prisma.inventoryManager.create({
      data: {
        userProfileId,
        employeeId: employeeId || undefined
      }
    });
  }

  async createManager(userProfileId: string, employeeId?: string): Promise<any> {
    return await this.prisma.manager.create({
      data: {
        userProfileId,
        employeeId: employeeId || undefined
      }
    });
  }

  async createAdmin(userProfileId: string, employeeId?: string): Promise<any> {
    return await this.prisma.admin.create({
      data: {
        userProfileId,
        employeeId: employeeId || undefined,
        permissions: [] // Default empty permissions array
      }
    });
  }
}
