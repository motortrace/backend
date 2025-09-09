import { Router } from 'express';
import { uploadProfileImage, uploadCarImage, deleteProfileImage, getUploadConfig, initializeStorage } from './storage.controller';
import { authenticateSupabaseToken } from '../../modules/auth/supabase/authSupabase.middleware';

const router = Router();

// Get upload configuration (public)
router.get('/config', getUploadConfig);

// Initialize storage bucket (public - for debugging)
router.post('/init', initializeStorage);

// Upload profile image (authenticated)
router.post('/profile-image', authenticateSupabaseToken, uploadProfileImage);

// Upload car image (authenticated)
router.post('/car-image', authenticateSupabaseToken, uploadCarImage);

// Delete profile image (authenticated)
router.delete('/profile-image', authenticateSupabaseToken, deleteProfileImage);

export default router;
