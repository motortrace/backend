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

export class StorageController {
  // Multer middleware for profile image uploads
  public uploadProfileImageMiddleware = upload.single('profileImage');
  
  // Multer middleware for car image uploads
  public uploadCarImageMiddleware = upload.single('carImage');

  async uploadProfileImage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No image file provided' });
        return;
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
        res.status(400).json({ 
          error: result.error || 'Failed to upload image' 
        });
        return;
      }

      console.log(' Profile image uploaded successfully:', result.url);

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

  async uploadCarImage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No image file provided' });
        return;
      }

      console.log('📤 Uploading car image for user:', req.user.id);

      const result = await StorageService.uploadCarImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user.id
      );

      if (!result.success) {
        res.status(400).json({ error: result.error || 'Failed to upload image' });
        return;
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

  async deleteProfileImage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { imageUrl } = req.body;

      if (!imageUrl) {
        res.status(400).json({ error: 'Image URL is required' });
        return;
      }

      console.log('🗑️ Deleting profile image:', imageUrl);

      const result = await StorageService.deleteProfileImage(imageUrl);

      if (!result.success) {
        res.status(400).json({ 
          error: result.error || 'Failed to delete image' 
        });
        return;
      }

      console.log(' Profile image deleted successfully');

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

  async getUploadConfig(req: Request, res: Response): Promise<void> {
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

  async initializeStorage(req: Request, res: Response): Promise<void> {
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
 * Test storage functionality
 */
export async function testStorage(req: Request, res: Response) {
  try {
    console.log('🧪 Testing storage functionality...');

    const serviceClient = StorageService.getServiceClientInstance();

    // List buckets
    const { data: buckets, error: listError } = await serviceClient.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return res.status(500).json({
        success: false,
        error: 'Failed to list buckets',
        details: listError
      });
    }

    console.log('📦 Available buckets:', buckets?.map(b => b.name));

    // Check car-images bucket
    const carBucket = buckets?.find(b => b.name === 'car-images');
    if (!carBucket) {
      console.error('❌ car-images bucket not found');
      return res.status(500).json({
        success: false,
        error: 'car-images bucket not found',
        availableBuckets: buckets?.map(b => b.name)
      });
    }

    console.log('🔒 car-images bucket public status:', carBucket.public);

    // Make sure bucket is public
    if (!carBucket.public) {
      console.log('🔓 Making car-images bucket public...');
      const { error: updateError } = await serviceClient.storage.updateBucket(
        'car-images',
        { public: true }
      );

      if (updateError) {
        console.error('❌ Failed to make bucket public:', updateError);
      } else {
        console.log('✅ Bucket made public successfully');
      }
    }

    // Test public URL generation
    const testFileName = 'test-file.jpg';
    const { data: urlData } = StorageService.getServiceClientInstance().storage
      .from('car-images')
      .getPublicUrl(testFileName);

    console.log('🔗 Test public URL:', urlData?.publicUrl);

    res.json({
      success: true,
      data: {
        buckets: buckets?.map(b => ({ name: b.name, public: b.public })),
        carImagesBucket: {
          exists: true,
          public: carBucket.public,
          testUrl: urlData?.publicUrl
        }
      },
      message: 'Storage test completed'
    });

  } catch (error: any) {
    console.error('❌ Storage test error:', error);
    res.status(500).json({
      success: false,
      error: 'Storage test failed',
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
