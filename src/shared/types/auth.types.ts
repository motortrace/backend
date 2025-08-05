import { Request } from 'express';

// User roles are now managed by Supabase Auth user_metadata
// This ensures single source of truth for identity data
export type UserRole = 'customer' | 'admin' | 'manager' | 'service_advisor' | 'inventory_manager' | 'technician';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;           // Supabase uses string IDs (UUID)
    email?: string;       // From Supabase Auth
    role?: UserRole;      // From Supabase Auth user_metadata
    user_metadata?: {
      role?: UserRole;
      [key: string]: any;
    };
  };
}

// Supabase Auth user structure
export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    role?: UserRole;
    name?: string;
    phone?: string;
    [key: string]: any;
  };
  app_metadata?: {
    [key: string]: any;
  };
}
