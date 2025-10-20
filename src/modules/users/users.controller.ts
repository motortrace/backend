import { Response } from 'express';
import { AuthenticatedRequest } from '../../shared/types/auth.types';
import { IUsersService } from './users.service';
import { createClient } from '@supabase/supabase-js';

export class UsersController {
  private readonly supabaseAdmin: ReturnType<typeof createClient>;

  constructor(private readonly usersService: IUsersService) {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }

  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('Request made by:', req.user?.email, 'with role:', req.user?.role);
      
      const users = await this.usersService.getUsers();
      
      res.json({
        success: true,
        message: 'Users retrieved successfully',
        requestedBy: req.user?.email,
        data: users
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: 'Failed to retrieve users', 
        message: error.message 
      });
    }
  }

  async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const user = await this.usersService.getUserById(id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }
      
      res.json({
        success: true,
        message: 'User retrieved successfully',
        requestedBy: req.user?.email,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: 'Failed to retrieve user', 
        message: error.message 
      });
    }
  }

  async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { supabaseUserId, name, phone, profileImage, isRegistrationComplete } = req.body;
      
      if (!supabaseUserId || !name) {
        res.status(400).json({
          success: false,
          error: 'Supabase User ID and name are required'
        });
        return;
      }
      
      const user = await this.usersService.createUser({
        supabaseUserId,
        name,
        phone,
        profileImage,
        isRegistrationComplete
      });
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        createdBy: req.user?.email,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: 'Failed to create user', 
        message: error.message 
      });
    }
  }

  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, phone, profileImage, isRegistrationComplete } = req.body;
      
      const user = await this.usersService.updateUser(id, {
        name,
        phone,
        profileImage,
        isRegistrationComplete
      });
      
      res.json({
        success: true,
        message: 'User updated successfully',
        updatedBy: req.user?.email,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: 'Failed to update user', 
        message: error.message 
      });
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      await this.usersService.deleteUser(id);
      
      res.json({
        success: true,
        message: 'User deleted successfully',
        deletedBy: req.user?.email,
        userId: id
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: 'Failed to delete user', 
        message: error.message 
      });
    }
  }

  /**
   *  ADMIN ONLY: Create customer user
   * Customer users go through onboarding process
   */
  async createCustomerUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, password, name, phone } = req.body;

      // Validate required fields
      if (!email || !password || !name) {
        res.status(400).json({
          success: false,
          error: 'Email, password, and name are required'
        });
        return;
      }

      console.log(' Creating customer user:', { email, name });

      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await this.supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for customer users
        user_metadata: {
          role: 'customer',
          isRegistrationComplete: false // Customer users need onboarding
        }
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Failed to create user in Supabase Auth');
      }

      console.log(' Supabase Auth user created:', authData.user.id);

      // 2. Create UserProfile in PostgreSQL
      const userProfile = await this.usersService.createUser({
        supabaseUserId: authData.user.id,
        name,
        phone: phone || undefined,
        profileImage: undefined,
        isRegistrationComplete: false // Customer users need onboarding
      });

      console.log(' UserProfile created:', userProfile.id);

      // 3. Create Customer record
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const customer = await prisma.customer.create({
        data: {
          userProfileId: userProfile.id,
          name,
          email,
          phone: phone || undefined,
        }
      });

      console.log(' Customer record created:', customer.id);

      res.status(201).json({
        success: true,
        message: `Customer user created successfully. User needs to complete onboarding.`,
        createdBy: req.user?.email,
        data: {
          authUserId: authData.user.id,
          email: authData.user.email,
          role: 'customer',
          profile: userProfile,
          customer
        }
      });

    } catch (error: any) {
      console.error('❌ Failed to create customer user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create customer user',
        message: error.message
      });
    }
  }

  /**
   *  ADMIN ONLY: Create staff user (Service Advisor, Technician, Manager, etc.)
   * Staff users are created complete - NO onboarding required
   * They can login and access the system immediately
   */
  async createStaffUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, password, role, name, phone, employeeId } = req.body;

      // Validate required fields
      if (!email || !password || !role || !name) {
        res.status(400).json({
          success: false,
          error: 'Email, password, role, and name are required'
        });
        return;
      }

      // Validate role (must be staff role, not customer)
      const validStaffRoles = ['admin', 'manager', 'service_advisor', 'technician', 'inventory_manager'];
      if (!validStaffRoles.includes(role)) {
        res.status(400).json({
          success: false,
          error: 'Invalid staff role',
          validRoles: validStaffRoles
        });
        return;
      }

      console.log(' Creating staff user:', { email, role, name });

      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await this.supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for staff users
        user_metadata: {
          role,
          isRegistrationComplete: true // Staff users are complete immediately
        }
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Failed to create user in Supabase Auth');
      }

      console.log(' Supabase Auth user created:', authData.user.id);

      // 2. Create UserProfile in PostgreSQL
      const userProfile = await this.usersService.createUser({
        supabaseUserId: authData.user.id,
        name,
        phone: phone || undefined,
        profileImage: undefined,
        isRegistrationComplete: true
      });

      console.log(' UserProfile created:', userProfile.id);

      // 3. Create role-specific record (ServiceAdvisor, Technician, etc.)
      let roleSpecificRecord = null;

      try {
        switch (role) {
          case 'service_advisor':
            roleSpecificRecord = await this.usersService.createServiceAdvisor(userProfile.id, employeeId);
            break;
          case 'technician':
            roleSpecificRecord = await this.usersService.createTechnician(userProfile.id, employeeId);
            break;
          case 'inventory_manager':
            roleSpecificRecord = await this.usersService.createInventoryManager(userProfile.id, employeeId);
            break;
          case 'manager':
            roleSpecificRecord = await this.usersService.createManager(userProfile.id, employeeId);
            break;
          case 'admin':
            roleSpecificRecord = await this.usersService.createAdmin(userProfile.id, employeeId);
            break;
        }

        console.log(' Role-specific record created:', roleSpecificRecord);
      } catch (roleError: any) {
        console.warn(' Failed to create role-specific record:', roleError.message);
      }

      res.status(201).json({
        success: true,
        message: `Staff user created successfully. User can login immediately.`,
        createdBy: req.user?.email,
        data: {
          authUserId: authData.user.id,
          email: authData.user.email,
          role,
          profile: userProfile,
          roleSpecificRecord
        }
      });

    } catch (error: any) {
      console.error('❌ Failed to create staff user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create staff user',
        message: error.message
      });
    }
  }
}
