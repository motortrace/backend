import { Router } from 'express';
import { StorageController } from './storage.controller';
import { getUploadConfig, initializeStorage, testStorage } from './storage.controller';
import { authenticateSupabaseToken } from '../../modules/auth/supabase/authSupabase.middleware';

const router = Router();

// Dependency Injection - Create instance
const storageController = new StorageController();

// Get upload configuration (public)
router.get('/config', storageController.getUploadConfig.bind(storageController));

// Initialize storage bucket (public - for debugging)
router.post('/init', storageController.initializeStorage.bind(storageController));

// Upload profile image (authenticated) - with multer middleware
router.post(
  '/profile-image', 
  authenticateSupabaseToken,
  storageController.uploadProfileImageMiddleware,
  storageController.uploadProfileImage.bind(storageController)
);

// Upload car image (authenticated) - with multer middleware
router.post(
  '/car-image', 
  authenticateSupabaseToken,
  storageController.uploadCarImageMiddleware,
  storageController.uploadCarImage.bind(storageController)
);

// Delete profile image (authenticated)
router.delete('/profile-image', authenticateSupabaseToken, storageController.deleteProfileImage.bind(storageController));

// Test storage functionality (public for debugging)
router.get('/test', testStorage);

export default router;
