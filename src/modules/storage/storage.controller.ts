import { Request, Response } from 'express';
import multer from 'multer';
import { StorageService } from './storage.service';
import { AuthenticatedRequest } from '../../shared/types/auth.types';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * Upload profile image endpoint
 */
export const uploadProfileImage = [
  upload.single('profileImage'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      console.log('📤 Uploading profile image for user:', req.user.id);

      // Upload to Supabase Storage
      const result = await StorageService.uploadProfileImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user.id
      );

      if (!result.success) {
        return res.status(400).json({ 
          error: result.error || 'Failed to upload image' 
        });
      }

      console.log('✅ Profile image uploaded successfully:', result.url);

      res.json({
        success: true,
        data: {
          imageUrl: result.url,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype
        },
        message: 'Profile image uploaded successfully'
      });

    } catch (error: any) {
      console.error('❌ Profile image upload error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
];

/**
 * Upload car image endpoint
 */
export const uploadCarImage = [
  upload.single('carImage'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      console.log('📤 Uploading car image for user:', req.user.id);

      const result = await StorageService.uploadCarImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user.id
      );

      if (!result.success) {
        return res.status(400).json({ error: result.error || 'Failed to upload image' });
      }

      res.json({
        success: true,
        data: { imageUrl: result.url, fileName: req.file.originalname, fileSize: req.file.size, mimeType: req.file.mimetype },
        message: 'Car image uploaded successfully'
      });

    } catch (error: any) {
      console.error('❌ Car image upload error:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
];

/**
 * Delete profile image endpoint
 */
export async function deleteProfileImage(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    console.log('🗑️ Deleting profile image:', imageUrl);

    const result = await StorageService.deleteProfileImage(imageUrl);

    if (!result.success) {
      return res.status(400).json({ 
        error: result.error || 'Failed to delete image' 
      });
    }

    console.log('✅ Profile image deleted successfully');

    res.json({
      success: true,
      message: 'Profile image deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Profile image delete error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

/**
 * Get upload configuration for frontend
 */
export async function getUploadConfig(req: Request, res: Response) {
  try {
    res.json({
      success: true,
      data: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
      },
      message: 'Upload configuration retrieved successfully'
    });
  } catch (error: any) {
    console.error('❌ Upload config error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

/**
 * Initialize storage bucket (for manual testing/debugging)
 */
export async function initializeStorage(req: Request, res: Response) {
  try {
    console.log('🔄 Manually initializing storage...');
    
    await StorageService.initializeStorage();
    
    res.json({
      success: true,
      message: 'Storage bucket initialized successfully'
    });
  } catch (error: any) {
    console.error('❌ Storage initialization error:', error);
    res.status(500).json({ 
      error: 'Failed to initialize storage',
      message: error.message 
    });
  }
}