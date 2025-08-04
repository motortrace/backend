import { Router } from 'express';
import { authenticateSupabaseToken, requireAdmin, requireManager } from '../auth/supabase/authSupabase.middleware';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from './users.controller';

const router = Router();

// All routes require authentication
router.use(authenticateSupabaseToken);

// Get all users (admin and manager only)
router.get('/', requireManager, getUsers);

// Get user by ID (admin and manager only)
router.get('/:id', requireManager, getUserById);

// Create new user (admin only)
router.post('/', requireAdmin, createUser);

// Update user (admin only)
router.put('/:id', requireAdmin, updateUser);

// Delete user (admin only)
router.delete('/:id', requireAdmin, deleteUser);

export default router;
