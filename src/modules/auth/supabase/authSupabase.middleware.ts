import { Request, Response, NextFunction } from 'express';
import { authSupabaseService } from './authSupabase.service';
import { AuthenticatedRequest } from '../../../shared/types/auth.types';

export const authenticateSupabaseToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('🔐 Auth middleware called for:', req.path);
    console.log('🔐 Headers:', req.headers);
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('❌ No Authorization header found');
      return res.status(401).json({ 
        error: 'Missing Authorization header',
        message: 'Please provide a valid Bearer token'
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      console.log('❌ Empty token after trimming');
      return res.status(401).json({ 
        error: 'Invalid token format',
        message: 'Token must be provided in format: Bearer <token>'
      });
    }

    console.log('🔐 Token received (first 20 chars):', token.substring(0, 20) + '...');

    // Use the service to validate the token
    const user = await authSupabaseService.getUser(token);

    if (!user) {
      console.log('❌ No user returned from service');
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        message: 'Please login again to get a valid token'
      });
    }

    console.log('✅ User authenticated:', { id: user.id, email: user.email, role: user.user_metadata?.role });

    // Attach user info to req.user
    req.user = {
      id: user.id,
      email: user.email || undefined,
      role: user.user_metadata?.role || 'customer', // Read custom role from metadata
    };

    next();
  } catch (err: any) {
    console.error('❌ Auth middleware error:', err);
    
    // Handle specific Supabase auth errors
    if (err.message?.includes('JWT')) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token is malformed or expired'
      });
    }
    
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: 'Internal server error during authentication'
    });
  }
};

// Role-based authorization middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please login first'
      });
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: `Required roles: ${allowedRoles.join(', ')}`,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Convenience middleware for common roles
export const requireAdmin = requireRole(['admin']);
export const requireManager = requireRole(['admin', 'manager']);
export const requireServiceAdvisor = requireRole(['admin', 'manager', 'service_advisor']);
export const requireTechnician = requireRole(['admin', 'manager', 'technician', 'service_advisor']);
export const requireInventoryManager = requireRole(['admin', 'manager', 'inventory_manager']);
