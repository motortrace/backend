import { Router } from 'express';
import { authenticateSupabaseToken, requireAdmin, requireManager } from '../auth/supabase/authSupabase.middleware';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import prisma from '../../infrastructure/database/prisma';

const router = Router();

// Dependency Injection - Create instances
const usersService = new UsersService(prisma);
const usersController = new UsersController(usersService);

// All routes require authentication
router.use(authenticateSupabaseToken);

//  ADMIN ONLY: Create customer user
// Customer users go through onboarding process
router.post('/customer', requireAdmin, usersController.createCustomerUser.bind(usersController));

//  ADMIN ONLY: Create staff user (Service Advisor, Technician, Manager, etc.)
// Staff users bypass onboarding - they're created complete and ready to use
router.post('/staff', requireAdmin, usersController.createStaffUser.bind(usersController));

// Get all users (admin and manager only)
router.get('/', requireManager, usersController.getUsers.bind(usersController));

// Get user by ID (admin and manager only)
router.get('/:id', requireManager, usersController.getUserById.bind(usersController));

// Create new user profile (admin only) - for manual profile creation
router.post('/', requireAdmin, usersController.createUser.bind(usersController));

// Update user (admin only)
router.put('/:id', requireAdmin, usersController.updateUser.bind(usersController));

// Delete user (admin only)
router.delete('/:id', requireAdmin, usersController.deleteUser.bind(usersController));

export default router;
