import { Response } from 'express';
import { AuthenticatedRequest } from '../../shared/types/auth.types';
import { IUsersService } from './users.service';

export class UsersController {
  constructor(private readonly usersService: IUsersService) {}

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
}
