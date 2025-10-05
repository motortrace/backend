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

// Get all users (admin and manager only)
router.get('/', requireManager, usersController.getUsers.bind(usersController));

// Get user by ID (admin and manager only)
router.get('/:id', requireManager, usersController.getUserById.bind(usersController));

// Create new user (admin only)
router.post('/', requireAdmin, usersController.createUser.bind(usersController));

// Update user (admin only)
router.put('/:id', requireAdmin, usersController.updateUser.bind(usersController));

// Delete user (admin only)
router.delete('/:id', requireAdmin, usersController.deleteUser.bind(usersController));

export default router;
