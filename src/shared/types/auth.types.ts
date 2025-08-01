import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;           // Supabase uses string IDs (UUID)
    email?: string;
    role?: 'car_owner' | 'admin' | 'manager' | 'service_advisor' | 'inventory_manager' | 'technician';
  };
}
