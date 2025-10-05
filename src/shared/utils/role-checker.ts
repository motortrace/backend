import { PrismaClient, UserRole } from '@prisma/client';
import { UserRole as AuthUserRole } from '../types/auth.types';

const prisma = new PrismaClient();

export interface UserRoleInfo {
  role: AuthUserRole;
  isStaff: boolean;
  isCustomer: boolean;
}

export async function getUserRole(supabaseUserId: string): Promise<UserRoleInfo | null> {
  try {
    // Check if user has a UserProfile
    const userProfile = await prisma.userProfile.findUnique({
      where: { supabaseUserId },
      select: { role: true }
    });

    if (userProfile && userProfile.role) {
      // Map database role to auth role
      const authRole = mapDatabaseRoleToAuthRole(userProfile.role);
      
      // Staff roles: everyone except CUSTOMER
      const isStaff = userProfile.role !== UserRole.CUSTOMER;
      const isCustomer = userProfile.role === UserRole.CUSTOMER;
      
      return {
        role: authRole,
        isStaff,
        isCustomer
      };
    }

    // User not found
    return null;
  } catch (error) {
    console.error('Error checking user role:', error);
    return null;
  }
}

function mapDatabaseRoleToAuthRole(dbRole: UserRole): AuthUserRole {
  switch (dbRole) {
    case UserRole.CUSTOMER:
      return 'customer';
    case UserRole.ADMIN:
      return 'admin';
    case UserRole.MANAGER:
      return 'manager';
    case UserRole.SERVICE_ADVISOR:
      return 'service_advisor';
    case UserRole.INVENTORY_MANAGER:
      return 'inventory_manager';
    case UserRole.TECHNICIAN:
      return 'technician';
    default:
      return 'customer';
  }
}

export async function hasRole(supabaseUserId: string, requiredRoles: AuthUserRole[]): Promise<boolean> {
  const userRole = await getUserRole(supabaseUserId);
  if (!userRole) return false;
  
  return requiredRoles.includes(userRole.role);
}

export async function isStaffMember(supabaseUserId: string): Promise<boolean> {
  const userRole = await getUserRole(supabaseUserId);
  return userRole?.isStaff || false;
}

export async function isCustomer(supabaseUserId: string): Promise<boolean> {
  const userRole = await getUserRole(supabaseUserId);
  return userRole?.isCustomer || false;
}

export async function isServiceAdvisor(supabaseUserId: string): Promise<boolean> {
  return hasRole(supabaseUserId, ['service_advisor', 'manager', 'admin']);
}

export async function isTechnician(supabaseUserId: string): Promise<boolean> {
  return hasRole(supabaseUserId, ['technician', 'manager', 'admin']);
}

export async function isInventoryManager(supabaseUserId: string): Promise<boolean> {
  return hasRole(supabaseUserId, ['inventory_manager', 'manager', 'admin']);
}

export async function isAdmin(supabaseUserId: string): Promise<boolean> {
  return hasRole(supabaseUserId, ['admin']);
}

export async function isManager(supabaseUserId: string): Promise<boolean> {
  return hasRole(supabaseUserId, ['manager', 'admin']);
}
