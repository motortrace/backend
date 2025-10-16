import { StorageService } from '../../../modules/storage/storage.service';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid-123')
}));

// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
        remove: jest.fn(),
        list: jest.fn()
      }),
      listBuckets: jest.fn(),
      createBucket: jest.fn(),
      updateBucket: jest.fn()
    }
  })
}));

describe('StorageService', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

    // Get the mocked client
    const { createClient } = require('@supabase/supabase-js');
    mockSupabaseClient = createClient();
  });

  describe('uploadProfileImage', () => {
    it('should upload profile image successfully', async () => {
      // Arrange
      const file = Buffer.from('test image data');
      const fileName = 'test.jpg';
      const mimeType = 'image/jpeg';
      const userId = 'user123';

      const mockUploadResponse = { data: {}, error: null };
      const mockUrlResponse = { data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/profile-images/user123/mock-uuid-123.jpg' } };

      mockSupabaseClient.storage.from('profile-images').upload.mockResolvedValue(mockUploadResponse);
      mockSupabaseClient.storage.from('profile-images').getPublicUrl.mockReturnValue(mockUrlResponse);

      // Act
      const result = await StorageService.uploadProfileImage(file, fileName, mimeType, userId);

      // Assert
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('profile-images');
      expect(mockSupabaseClient.storage.from('profile-images').upload).toHaveBeenCalledWith(
        'user123/mock-uuid-123.jpg',
        file,
        { contentType: 'image/jpeg', upsert: false }
      );
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://test.supabase.co/storage/v1/object/public/profile-images/user123/mock-uuid-123.jpg');
    });

    it('should reject file size over 5MB', async () => {
      // Arrange
      const largeFile = Buffer.alloc(6 * 1024 * 1024); // 6MB
      const fileName = 'large.jpg';
      const mimeType = 'image/jpeg';
      const userId = 'user123';

      // Act
      const result = await StorageService.uploadProfileImage(largeFile, fileName, mimeType, userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('File size exceeds 5MB limit');
    });

    it('should reject invalid mime type', async () => {
      // Arrange
      const file = Buffer.from('test data');
      const fileName = 'test.txt';
      const mimeType = 'text/plain';
      const userId = 'user123';

      // Act
      const result = await StorageService.uploadProfileImage(file, fileName, mimeType, userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid file type. Only JPEG, PNG, and WebP images are allowed');
    });

    it('should handle upload error', async () => {
      // Arrange
      const file = Buffer.from('test image data');
      const fileName = 'test.jpg';
      const mimeType = 'image/jpeg';
      const userId = 'user123';

      mockSupabaseClient.storage.from('profile-images').upload.mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' }
      });

      // Act
      const result = await StorageService.uploadProfileImage(file, fileName, mimeType, userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to upload image to storage');
    });
  });

  describe('uploadCarImage', () => {
    it('should upload car image successfully', async () => {
      // Arrange
      const file = Buffer.from('test car image data');
      const fileName = 'car.jpg';
      const mimeType = 'image/jpeg';
      const userId = 'user123';

      const mockUploadResponse = { error: null };
      const mockUrlResponse = { data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/car-images/user123/mock-uuid-123.jpg' } };

      mockSupabaseClient.storage.from('car-images').upload.mockResolvedValue(mockUploadResponse);
      mockSupabaseClient.storage.from('car-images').getPublicUrl.mockReturnValue(mockUrlResponse);

      // Act
      const result = await StorageService.uploadCarImage(file, fileName, mimeType, userId);

      // Assert
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('car-images');
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://test.supabase.co/storage/v1/object/public/car-images/user123/mock-uuid-123.jpg');
    });

    it('should handle getPublicUrl failure and construct URL manually', async () => {
      // Arrange
      const file = Buffer.from('test car image data');
      const fileName = 'car.jpg';
      const mimeType = 'image/jpeg';
      const userId = 'user123';

      mockSupabaseClient.storage.from('car-images').upload.mockResolvedValue({ error: null });
      mockSupabaseClient.storage.from('car-images').getPublicUrl.mockReturnValue({ data: null });

      // Act
      const result = await StorageService.uploadCarImage(file, fileName, mimeType, userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.url).toContain('https://test.supabase.co/storage/v1/object/public/car-images/');
    });
  });

  describe('uploadWorkOrderAttachment', () => {
    it('should upload work order attachment successfully', async () => {
      // Arrange
      const file = Buffer.from('test attachment data');
      const fileName = 'attachment.pdf';
      const mimeType = 'application/pdf';
      const workOrderId = 'wo123';

      const mockUploadResponse = { error: null };
      const mockUrlResponse = { data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/work-order-attachments/wo123/mock-uuid-123.pdf' } };

      mockSupabaseClient.storage.from('work-order-attachments').upload.mockResolvedValue(mockUploadResponse);
      mockSupabaseClient.storage.from('work-order-attachments').getPublicUrl.mockReturnValue(mockUrlResponse);

      // Act
      const result = await StorageService.uploadWorkOrderAttachment(file, fileName, mimeType, workOrderId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://test.supabase.co/storage/v1/object/public/work-order-attachments/wo123/mock-uuid-123.pdf');
    });

    it('should reject file size over 10MB', async () => {
      // Arrange
      const largeFile = Buffer.alloc(15 * 1024 * 1024); // 15MB
      const fileName = 'large.pdf';
      const mimeType = 'application/pdf';
      const workOrderId = 'wo123';

      // Act
      const result = await StorageService.uploadWorkOrderAttachment(largeFile, fileName, mimeType, workOrderId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('File size exceeds 10MB limit');
    });

    it('should reject invalid attachment type', async () => {
      // Arrange
      const file = Buffer.from('test data');
      const fileName = 'test.exe';
      const mimeType = 'application/x-msdownload';
      const workOrderId = 'wo123';

      // Act
      const result = await StorageService.uploadWorkOrderAttachment(file, fileName, mimeType, workOrderId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid file type. Only images, PDFs, and videos are allowed');
    });
  });

  describe('uploadTemplateImage', () => {
    it('should upload template image successfully', async () => {
      // Arrange
      const file = Buffer.from('test template image data');
      const fileName = 'template.jpg';
      const mimeType = 'image/jpeg';
      const templateId = 'template123';

      const mockUploadResponse = { data: {}, error: null };
      const mockUrlResponse = { data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/template-images/template123/mock-uuid-123.jpg' } };

      mockSupabaseClient.storage.from('template-images').upload.mockResolvedValue(mockUploadResponse);
      mockSupabaseClient.storage.from('template-images').getPublicUrl.mockReturnValue(mockUrlResponse);

      // Act
      const result = await StorageService.uploadTemplateImage(file, fileName, mimeType, templateId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://test.supabase.co/storage/v1/object/public/template-images/template123/mock-uuid-123.jpg');
    });
  });

  describe('uploadInvoicePDF', () => {
    it('should upload invoice PDF successfully', async () => {
      // Arrange
      const file = Buffer.from('test PDF data');
      const fileName = 'invoice.pdf';
      const invoiceId = 'inv123';

      const mockUploadResponse = { error: null };
      const mockUrlResponse = { data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/invoices/inv123/invoice.pdf' } };

      mockSupabaseClient.storage.from('invoices').upload.mockResolvedValue(mockUploadResponse);
      mockSupabaseClient.storage.from('invoices').getPublicUrl.mockReturnValue(mockUrlResponse);

      // Act
      const result = await StorageService.uploadInvoicePDF(file, fileName, invoiceId);

      // Assert
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('invoices');
      expect(mockSupabaseClient.storage.from('invoices').upload).toHaveBeenCalledWith(
        'inv123/invoice.pdf',
        file,
        { contentType: 'application/pdf', upsert: true }
      );
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://test.supabase.co/storage/v1/object/public/invoices/inv123/invoice.pdf');
    });

    it('should reject PDF size over 20MB', async () => {
      // Arrange
      const largeFile = Buffer.alloc(25 * 1024 * 1024); // 25MB
      const fileName = 'large.pdf';
      const invoiceId = 'inv123';

      // Act
      const result = await StorageService.uploadInvoicePDF(largeFile, fileName, invoiceId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('PDF size exceeds 20MB limit');
    });
  });

  describe('uploadEstimatePDF', () => {
    it('should upload estimate PDF successfully', async () => {
      // Arrange
      const file = Buffer.from('test estimate PDF data');
      const fileName = 'estimate.pdf';
      const workOrderId = 'wo123';

      const mockUploadResponse = { error: null };
      const mockUrlResponse = { data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/estimates/wo123/mock-uuid-123.pdf' } };

      mockSupabaseClient.storage.from('estimates').upload.mockResolvedValue(mockUploadResponse);
      mockSupabaseClient.storage.from('estimates').getPublicUrl.mockReturnValue(mockUrlResponse);

      // Act
      const result = await StorageService.uploadEstimatePDF(file, fileName, workOrderId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://test.supabase.co/storage/v1/object/public/estimates/wo123/mock-uuid-123.pdf');
    });
  });

  describe('uploadInspectionPDF', () => {
    it('should upload inspection PDF successfully', async () => {
      // Arrange
      const file = Buffer.from('test inspection PDF data');
      const fileName = 'inspection.pdf';
      const workOrderId = 'wo123';

      const mockUploadResponse = { error: null };
      const mockUrlResponse = { data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/inspections/wo123/mock-uuid-123.pdf' } };

      mockSupabaseClient.storage.from('inspections').upload.mockResolvedValue(mockUploadResponse);
      mockSupabaseClient.storage.from('inspections').getPublicUrl.mockReturnValue(mockUrlResponse);

      // Act
      const result = await StorageService.uploadInspectionPDF(file, fileName, workOrderId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://test.supabase.co/storage/v1/object/public/inspections/wo123/mock-uuid-123.pdf');
    });
  });

  describe('deleteProfileImage', () => {
    it('should delete profile image successfully', async () => {
      // Arrange
      const imageUrl = 'https://test.supabase.co/storage/v1/object/public/profile-images/user123/image.jpg';

      mockSupabaseClient.storage.from('profile-images').remove.mockResolvedValue({ error: null });

      // Act
      const result = await StorageService.deleteProfileImage(imageUrl);

      // Assert
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('profile-images');
      expect(mockSupabaseClient.storage.from('profile-images').remove).toHaveBeenCalledWith(['user123/image.jpg']);
      expect(result.success).toBe(true);
    });

    it('should handle delete error', async () => {
      // Arrange
      const imageUrl = 'https://test.supabase.co/storage/v1/object/public/profile-images/user123/image.jpg';

      mockSupabaseClient.storage.from('profile-images').remove.mockResolvedValue({
        error: { message: 'Delete failed' }
      });

      // Act
      const result = await StorageService.deleteProfileImage(imageUrl);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete image from storage');
    });
  });

  describe('deleteTemplateImage', () => {
    it('should delete template image successfully', async () => {
      // Arrange
      const imageUrl = 'https://test.supabase.co/storage/v1/object/public/template-images/template123/image.jpg';

      mockSupabaseClient.storage.from('template-images').remove.mockResolvedValue({ error: null });

      // Act
      const result = await StorageService.deleteTemplateImage(imageUrl);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('initializeStorage', () => {
    it('should initialize storage buckets successfully', async () => {
      // Arrange
      mockSupabaseClient.storage.listBuckets.mockResolvedValue({
        data: [],
        error: null
      });

      mockSupabaseClient.storage.createBucket.mockResolvedValue({ error: null });
      mockSupabaseClient.storage.updateBucket.mockResolvedValue({ error: null });

      // Act
      await StorageService.initializeStorage();

      // Assert
      expect(mockSupabaseClient.storage.listBuckets).toHaveBeenCalled();
      expect(mockSupabaseClient.storage.createBucket).toHaveBeenCalledTimes(5); // All buckets
    });

    it('should skip existing buckets', async () => {
      // Arrange
      mockSupabaseClient.storage.listBuckets.mockResolvedValue({
        data: [
          { name: 'profile-images' },
          { name: 'car-images' },
          { name: 'template-images' },
          { name: 'work-order-attachments' },
          { name: 'invoices' }
        ],
        error: null
      });

      // Act
      await StorageService.initializeStorage();

      // Assert
      expect(mockSupabaseClient.storage.createBucket).not.toHaveBeenCalled();
      expect(mockSupabaseClient.storage.updateBucket).toHaveBeenCalledWith('car-images', { public: true });
    });

    it('should handle missing environment variables', async () => {
      // Arrange
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_ANON_KEY;

      // Act
      await StorageService.initializeStorage();

      // Assert - Should not throw, just log errors
      expect(mockSupabaseClient.storage.listBuckets).not.toHaveBeenCalled();
    });
  });

  describe('getServiceClient', () => {
    it('should create service client with correct configuration', () => {
      // Act
      const client = StorageService.getServiceClientInstance();

      // Assert
      expect(client).toBeDefined();
      const { createClient } = require('@supabase/supabase-js');
      expect(createClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-service-role-key',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    });

    it('should use anon key when service role key is not available', () => {
      // Arrange
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      process.env.SUPABASE_ANON_KEY = 'test-anon-key';

      // Act
      const client = StorageService.getServiceClientInstance();

      // Assert
      const { createClient } = require('@supabase/supabase-js');
      expect(createClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.any(Object)
      );
    });
  });
});