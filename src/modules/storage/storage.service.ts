import { supabase } from '../../shared/utils/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class StorageService {
  private static readonly PROFILE_IMAGES_BUCKET = 'profile-images';
  private static readonly CAR_IMAGES_BUCKET = 'car-images';
  private static readonly TEMPLATE_IMAGES_BUCKET = 'template-images';
  private static readonly WORK_ORDER_ATTACHMENTS_BUCKET = 'work-order-attachments';
  private static readonly INVOICES_BUCKET = 'invoices';
  private static readonly ESTIMATES_BUCKET = 'estimates';
  private static readonly INSPECTIONS_BUCKET = 'inspections';
  /**
   * Upload an estimate PDF to Supabase Storage
   */
  static async uploadEstimatePDF(
    file: Buffer | Uint8Array,
    fileName: string,
    workOrderId: string
  ): Promise<UploadResult> {
    try {
      if (file.length > this.MAX_PDF_SIZE) {
        return { success: false, error: 'PDF size exceeds 20MB limit' };
      }
      const fileExtension = fileName.split('.').pop() || 'pdf';
      const uniqueFileName = `${workOrderId}/${uuidv4()}.${fileExtension}`;
      const serviceClient = this.getServiceClient();
      const { error } = await serviceClient.storage
        .from(this.ESTIMATES_BUCKET)
        .upload(uniqueFileName, file, { contentType: 'application/pdf', upsert: false });
      if (error) {
        console.error('Storage upload error:', error);
        return { success: false, error: 'Failed to upload PDF to storage' };
      }
      const { data: urlData } = serviceClient.storage
        .from(this.ESTIMATES_BUCKET)
        .getPublicUrl(uniqueFileName);
      return { success: true, url: urlData.publicUrl };
    } catch (error: any) {
      console.error('Estimate PDF upload error:', error);
      return { success: false, error: 'Internal server error during PDF upload' };
    }
  }

  /**
   * Upload an inspection PDF to Supabase Storage
   */
  static async uploadInspectionPDF(
    file: Buffer | Uint8Array,
    fileName: string,
    workOrderId: string
  ): Promise<UploadResult> {
    try {
      if (file.length > this.MAX_PDF_SIZE) {
        return { success: false, error: 'PDF size exceeds 20MB limit' };
      }
      const fileExtension = fileName.split('.').pop() || 'pdf';
      const uniqueFileName = `${workOrderId}/${uuidv4()}.${fileExtension}`;
      const serviceClient = this.getServiceClient();
      const { error } = await serviceClient.storage
        .from(this.INSPECTIONS_BUCKET)
        .upload(uniqueFileName, file, { contentType: 'application/pdf', upsert: false });
      if (error) {
        console.error('Storage upload error:', error);
        return { success: false, error: 'Failed to upload PDF to storage' };
      }
      const { data: urlData } = serviceClient.storage
        .from(this.INSPECTIONS_BUCKET)
        .getPublicUrl(uniqueFileName);
      return { success: true, url: urlData.publicUrl };
    } catch (error: any) {
      console.error('Inspection PDF upload error:', error);
      return { success: false, error: 'Internal server error during PDF upload' };
    }
  }
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB for attachments
  private static readonly MAX_PDF_SIZE = 20 * 1024 * 1024; // 20MB for PDFs
  private static readonly ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private static readonly ALLOWED_ATTACHMENT_TYPES = [
    'image/jpeg', 'image/png', 'image/webp', 'image/jpg',
    'application/pdf', 
    'video/mp4', 'video/quicktime'
  ];

  // Create a service role client for admin operations
  private static getServiceClient() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
    
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  /**
   * Upload a profile image to Supabase Storage
   */
  static async uploadProfileImage(
    file: Buffer | Uint8Array,
    fileName: string,
    mimeType: string,
    userId: string
  ): Promise<UploadResult> {
    try {
      // Validate file size
      if (file.length > this.MAX_FILE_SIZE) {
        return {
          success: false,
          error: 'File size exceeds 5MB limit'
        };
      }

      // Validate MIME type
      if (!this.ALLOWED_MIME_TYPES.includes(mimeType)) {
        return {
          success: false,
          error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed'
        };
      }

      // Generate unique filename
      const fileExtension = fileName.split('.').pop() || 'jpg';
      const uniqueFileName = `${userId}/${uuidv4()}.${fileExtension}`;

      // Use service client for uploads (bypasses RLS)
      const serviceClient = this.getServiceClient();

      // Upload to Supabase Storage
      const { data, error } = await serviceClient.storage
        .from(this.PROFILE_IMAGES_BUCKET)
        .upload(uniqueFileName, file, {
          contentType: mimeType,
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        return {
          success: false,
          error: 'Failed to upload image to storage'
        };
      }

      // Get public URL
      const { data: urlData } = serviceClient.storage
        .from(this.PROFILE_IMAGES_BUCKET)
        .getPublicUrl(uniqueFileName);

      return {
        success: true,
        url: urlData.publicUrl
      };

    } catch (error: any) {
      console.error('Profile image upload error:', error);
      return {
        success: false,
        error: 'Internal server error during image upload'
      };
    }
  }

  /**
   * Upload a car image to Supabase Storage
   */
  static async uploadCarImage(
    file: Buffer | Uint8Array,
    fileName: string,
    mimeType: string,
    userId: string
  ): Promise<UploadResult> {
    try {
      if (file.length > this.MAX_FILE_SIZE) {
        return { success: false, error: 'File size exceeds 5MB limit' };
      }
      if (!this.ALLOWED_MIME_TYPES.includes(mimeType)) {
        return { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed' };
      }

      const fileExtension = fileName.split('.').pop() || 'jpg';
      const uniqueFileName = `${userId}/${uuidv4()}.${fileExtension}`;

      const serviceClient = this.getServiceClient();

      const { error } = await serviceClient.storage
        .from(this.CAR_IMAGES_BUCKET)
        .upload(uniqueFileName, file, { contentType: mimeType, upsert: false });

      if (error) {
        console.error('Storage upload error:', error);
        return { success: false, error: 'Failed to upload image to storage' };
      }

      const { data: urlData } = serviceClient.storage
        .from(this.CAR_IMAGES_BUCKET)
        .getPublicUrl(uniqueFileName);

      return { success: true, url: urlData.publicUrl };
    } catch (error: any) {
      console.error('Car image upload error:', error);
      return { success: false, error: 'Internal server error during image upload' };
    }
  }

  /**
   * Upload a work order attachment to Supabase Storage
   */
  static async uploadWorkOrderAttachment(
    file: Buffer | Uint8Array,
    fileName: string,
    mimeType: string,
    workOrderId: string
  ): Promise<UploadResult> {
    try {
      if (file.length > this.MAX_ATTACHMENT_SIZE) {
        return { success: false, error: 'File size exceeds 10MB limit' };
      }
      if (!this.ALLOWED_ATTACHMENT_TYPES.includes(mimeType)) {
        return { success: false, error: 'Invalid file type. Only images, PDFs, and videos are allowed' };
      }

      const fileExtension = fileName.split('.').pop() || 'jpg';
      const uniqueFileName = `${workOrderId}/${uuidv4()}.${fileExtension}`;

      const serviceClient = this.getServiceClient();

      const { error } = await serviceClient.storage
        .from(this.WORK_ORDER_ATTACHMENTS_BUCKET)
        .upload(uniqueFileName, file, { contentType: mimeType, upsert: false });

      if (error) {
        console.error('Storage upload error:', error);
        return { success: false, error: 'Failed to upload attachment to storage' };
      }

      const { data: urlData } = serviceClient.storage
        .from(this.WORK_ORDER_ATTACHMENTS_BUCKET)
        .getPublicUrl(uniqueFileName);

      return { success: true, url: urlData.publicUrl };
    } catch (error: any) {
      console.error('Work order attachment upload error:', error);
      return { success: false, error: 'Internal server error during attachment upload' };
    }
  }

  /**
   * Upload an inspection attachment to Supabase Storage
   */
  static async uploadInspectionAttachment(
    file: Buffer | Uint8Array,
    fileName: string,
    mimeType: string,
    inspectionId: string
  ): Promise<UploadResult> {
    try {
      if (file.length > this.MAX_ATTACHMENT_SIZE) {
        return { success: false, error: 'File size exceeds 10MB limit' };
      }
      if (!this.ALLOWED_ATTACHMENT_TYPES.includes(mimeType)) {
        return { success: false, error: 'Invalid file type. Only images, PDFs, and videos are allowed' };
      }

      const fileExtension = fileName.split('.').pop() || 'jpg';
      const uniqueFileName = `${inspectionId}/${uuidv4()}.${fileExtension}`;

      const serviceClient = this.getServiceClient();

      const { error } = await serviceClient.storage
        .from(this.WORK_ORDER_ATTACHMENTS_BUCKET)
        .upload(uniqueFileName, file, { contentType: mimeType, upsert: false });

      if (error) {
        console.error('Storage upload error:', error);
        return { success: false, error: 'Failed to upload attachment to storage' };
      }

      const { data: urlData } = serviceClient.storage
        .from(this.WORK_ORDER_ATTACHMENTS_BUCKET)
        .getPublicUrl(uniqueFileName);

      return { success: true, url: urlData.publicUrl };
    } catch (error: any) {
      console.error('Inspection attachment upload error:', error);
      return { success: false, error: 'Internal server error during attachment upload' };
    }
  }

  /**
   * Upload a template image to Supabase Storage
   */
  static async uploadTemplateImage(
    file: Buffer | Uint8Array,
    fileName: string,
    mimeType: string,
    templateId: string
  ): Promise<UploadResult> {
    try {
      // Validate file size
      if (file.length > this.MAX_FILE_SIZE) {
        return {
          success: false,
          error: 'File size exceeds 5MB limit'
        };
      }

      // Validate MIME type
      if (!this.ALLOWED_MIME_TYPES.includes(mimeType)) {
        return {
          success: false,
          error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed'
        };
      }

      // Generate unique filename
      const fileExtension = fileName.split('.').pop() || 'jpg';
      const uniqueFileName = `${templateId}/${uuidv4()}.${fileExtension}`;

      // Use service client for uploads (bypasses RLS)
      const serviceClient = this.getServiceClient();

      // Upload to Supabase Storage
      const { data, error } = await serviceClient.storage
        .from(this.TEMPLATE_IMAGES_BUCKET)
        .upload(uniqueFileName, file, {
          contentType: mimeType,
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        return {
          success: false,
          error: 'Failed to upload image to storage'
        };
      }

      // Get public URL
      const { data: urlData } = serviceClient.storage
        .from(this.TEMPLATE_IMAGES_BUCKET)
        .getPublicUrl(uniqueFileName);

      return {
        success: true,
        url: urlData.publicUrl
      };

    } catch (error: any) {
      console.error('Template image upload error:', error);
      return {
        success: false,
        error: 'Internal server error during image upload'
      };
    }
  }

  /**
   * Upload an invoice PDF to Supabase Storage
   */
  static async uploadInvoicePDF(
    file: Buffer | Uint8Array,
    fileName: string,
    invoiceId: string
  ): Promise<UploadResult> {
    try {
      if (file.length > this.MAX_PDF_SIZE) {
        return { success: false, error: 'File size exceeds 20MB limit' };
      }

      const fileExtension = fileName.split('.').pop() || 'pdf';
      const uniqueFileName = `${invoiceId}/${fileName}`;

      const serviceClient = this.getServiceClient();

      const { error } = await serviceClient.storage
        .from(this.INVOICES_BUCKET)
        .upload(uniqueFileName, file, { contentType: 'application/pdf', upsert: true });

      if (error) {
        console.error('Storage upload error:', error);
        return { success: false, error: 'Failed to upload PDF to storage' };
      }

      const { data: urlData } = serviceClient.storage
        .from(this.INVOICES_BUCKET)
        .getPublicUrl(uniqueFileName);

      return { success: true, url: urlData.publicUrl };
    } catch (error: any) {
      console.error('Invoice PDF upload error:', error);
      return { success: false, error: 'Internal server error during PDF upload' };
    }
  }

  /**
   * Delete a profile image from Supabase Storage
   */
  static async deleteProfileImage(imageUrl: string): Promise<UploadResult> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const userId = urlParts[urlParts.length - 2];
      const filePath = `${userId}/${fileName}`;

      // Use service client for deletions (bypasses RLS)
      const serviceClient = this.getServiceClient();
      
      const { error } = await serviceClient.storage
        .from(this.PROFILE_IMAGES_BUCKET)
        .remove([filePath]);

      if (error) {
        console.error('Storage delete error:', error);
        return {
          success: false,
          error: 'Failed to delete image from storage'
        };
      }

      return {
        success: true
      };

    } catch (error: any) {
      console.error('Profile image delete error:', error);
      return {
        success: false,
        error: 'Internal server error during image deletion'
      };
    }
  }

  /**
   * Delete a template image from Supabase Storage
   */
  static async deleteTemplateImage(imageUrl: string): Promise<UploadResult> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const templateId = urlParts[urlParts.length - 2];
      const filePath = `${templateId}/${fileName}`;

      // Use service client for deletions (bypasses RLS)
      const serviceClient = this.getServiceClient();
      
      const { error } = await serviceClient.storage
        .from(this.TEMPLATE_IMAGES_BUCKET)
        .remove([filePath]);

      if (error) {
        console.error('Storage delete error:', error);
        return {
          success: false,
          error: 'Failed to delete image from storage'
        };
      }

      return {
        success: true
      };

    } catch (error: any) {
      console.error('Template image delete error:', error);
      return {
        success: false,
        error: 'Internal server error during image deletion'
      };
    }
  }

  /**
   * Initialize storage bucket if it doesn't exist
   */
  static async initializeStorage(): Promise<void> {
    try {
      console.log(' Initializing storage...');
      console.log(' Supabase URL:', process.env.SUPABASE_URL || 'Not set');
      console.log(' Supabase Key:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set');

      // Check if Supabase is configured
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.error('❌ Supabase environment variables not configured');
        console.error('❌ Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
        return;
      }

      // Use service client for admin operations
      const serviceClient = this.getServiceClient();
      
      // Check if bucket exists
      const { data: buckets, error: listError } = await serviceClient.storage.listBuckets();
      
      if (listError) {
        console.error('❌ Error listing buckets:', listError);
        console.error('❌ This usually means Supabase is not properly configured');
        return;
      }

      console.log(' Available buckets:', buckets?.map(b => b.name) || []);

      const profileBucketExists = buckets?.some(bucket => bucket.name === this.PROFILE_IMAGES_BUCKET);
      const carBucketExists = buckets?.some(bucket => bucket.name === this.CAR_IMAGES_BUCKET);
      const templateBucketExists = buckets?.some(bucket => bucket.name === this.TEMPLATE_IMAGES_BUCKET);
      const workOrderAttachmentsBucketExists = buckets?.some(bucket => bucket.name === this.WORK_ORDER_ATTACHMENTS_BUCKET);
      const invoicesBucketExists = buckets?.some(bucket => bucket.name === this.INVOICES_BUCKET);

      if (!profileBucketExists) {
        console.log(` Creating bucket: ${this.PROFILE_IMAGES_BUCKET}`);
        
        // Create bucket using service client
        const { error: createError } = await serviceClient.storage.createBucket(
          this.PROFILE_IMAGES_BUCKET,
          {
            public: true,
            allowedMimeTypes: this.ALLOWED_MIME_TYPES,
            fileSizeLimit: this.MAX_FILE_SIZE
          }
        );

        if (createError) {
          console.error('❌ Error creating bucket:', createError);
          console.error('❌ Bucket creation failed. Please check your Supabase configuration.');
          console.error('❌ You may need to create the bucket manually in Supabase Studio');
        } else {
          console.log(` Created storage bucket: ${this.PROFILE_IMAGES_BUCKET}`);
        }
      } else {
        console.log(` Storage bucket already exists: ${this.PROFILE_IMAGES_BUCKET}`);
      }

      if (!carBucketExists) {
        console.log(` Creating bucket: ${this.CAR_IMAGES_BUCKET}`);
        const { error: createCarError } = await serviceClient.storage.createBucket(
          this.CAR_IMAGES_BUCKET,
          {
            public: true,
            allowedMimeTypes: this.ALLOWED_MIME_TYPES,
            fileSizeLimit: this.MAX_FILE_SIZE
          }
        );
        if (createCarError) {
          console.error('❌ Error creating car-images bucket:', createCarError);
        } else {
          console.log(` Created storage bucket: ${this.CAR_IMAGES_BUCKET}`);
        }
      } else {
        console.log(` Storage bucket already exists: ${this.CAR_IMAGES_BUCKET}`);
      }

      if (!templateBucketExists) {
        console.log(` Creating bucket: ${this.TEMPLATE_IMAGES_BUCKET}`);
        const { error: createTemplateError } = await serviceClient.storage.createBucket(
          this.TEMPLATE_IMAGES_BUCKET,
          {
            public: true,
            allowedMimeTypes: this.ALLOWED_MIME_TYPES,
            fileSizeLimit: this.MAX_FILE_SIZE
          }
        );
        if (createTemplateError) {
          console.error('❌ Error creating template-images bucket:', createTemplateError);
        } else {
          console.log(` Created storage bucket: ${this.TEMPLATE_IMAGES_BUCKET}`);
        }
      } else {
        console.log(` Storage bucket already exists: ${this.TEMPLATE_IMAGES_BUCKET}`);
      }

      if (!workOrderAttachmentsBucketExists) {
        console.log(` Creating bucket: ${this.WORK_ORDER_ATTACHMENTS_BUCKET}`);
        const { error: createAttachmentsError } = await serviceClient.storage.createBucket(
          this.WORK_ORDER_ATTACHMENTS_BUCKET,
          {
            public: true,
            allowedMimeTypes: this.ALLOWED_ATTACHMENT_TYPES,
            fileSizeLimit: this.MAX_ATTACHMENT_SIZE
          }
        );
        if (createAttachmentsError) {
          console.error('❌ Error creating work-order-attachments bucket:', createAttachmentsError);
        } else {
          console.log(` Created storage bucket: ${this.WORK_ORDER_ATTACHMENTS_BUCKET}`);
        }
      } else {
        console.log(` Storage bucket already exists: ${this.WORK_ORDER_ATTACHMENTS_BUCKET}`);
      }

      if (!invoicesBucketExists) {
        console.log(` Creating bucket: ${this.INVOICES_BUCKET}`);
        const { error: createInvoicesError } = await serviceClient.storage.createBucket(
          this.INVOICES_BUCKET,
          {
            public: true,
            allowedMimeTypes: ['application/pdf'],
            fileSizeLimit: this.MAX_PDF_SIZE
          }
        );
        if (createInvoicesError) {
          console.error('❌ Error creating invoices bucket:', createInvoicesError);
        } else {
          console.log(` Created storage bucket: ${this.INVOICES_BUCKET}`);
        }
      } else {
        console.log(` Storage bucket already exists: ${this.INVOICES_BUCKET}`);
      }
    } catch (error) {
      console.error('❌ Error initializing storage:', error);
    }
  }
}
