import { PrismaClient, UserProfile } from '@prisma/client';

export interface IUsersService {
  getUsers(): Promise<UserProfile[]>;
  getUserById(id: string): Promise<UserProfile | null>;
  createUser(data: CreateUserData): Promise<UserProfile>;
  updateUser(id: string, data: UpdateUserData): Promise<UserProfile>;
  deleteUser(id: string): Promise<void>;
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
}
