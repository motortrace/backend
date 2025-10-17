import { Request, Response, NextFunction } from 'express';
import { authSupabaseService } from './authSupabase.service';
import { AuthenticatedRequest } from '../../../shared/types/auth.types';
import prisma from '../../../infrastructure/database/prisma';

/**
 *  JWT Token Authentication Middleware
 * 
 * PURPOSE: Validates JWT access tokens from Supabase Auth and attaches user info to request
 * 
 * USER TYPES:
 * 1. CUSTOMERS - Self-register via mobile app, go through onboarding
 * 2. STAFF (Admin, Manager, Service Advisor, etc.) - Created by admins, no onboarding
 * 
 * WHAT IT DOES:
 * 1. Extracts JWT token from Authorization header
 * 2. Validates token with Supabase Auth (checks signature, expiration)
 * 3. Extracts user data from token (id, email, role from user_metadata)
 * 4. Attaches user info to req.user for use in controllers
 * 
 * ROLE SOURCE: Role is read from JWT token's user_metadata.role
 * - Stored in Supabase Auth during signup/creation
 * - No database query needed - fast and efficient
 * 
 * @param req - Express request (will be enhanced with user data)
 * @param res - Express response
 * @param next - Express next function
 */
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

    // Validate token with Supabase Auth
    const user = await authSupabaseService.getUser(token);

    if (!user) {
      console.log('❌ No user returned from service');
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        message: 'Please login again to get a valid token'
      });
    }

    console.log(' User authenticated:', { id: user.id, email: user.email, role: user.user_metadata?.role });

    // Prefer role from database-backed UserProfile. This keeps authoritative role data
    // in PostgreSQL (Prisma) instead of relying on Supabase user_metadata which we
    // don't always populate for staff users.
    let resolvedRole: string = 'customer';
    try {
      const userProfile = await prisma.userProfile.findUnique({
        where: { supabaseUserId: user.id },
        select: { role: true }
      });
      if (userProfile && userProfile.role) {
        // Prisma enum values are uppercase (e.g. 'CUSTOMER'). Convert to expected
        // lowercase/underscore format used across the app (e.g. 'service_advisor').
        // Convert e.g. 'SERVICE_ADVISOR' -> 'service_advisor'
        resolvedRole = String(userProfile.role).toLowerCase().replace(/\s+/g, '_');
      } else {
        // Fallback to token metadata if profile doesn't exist
        resolvedRole = user.user_metadata?.role || 'customer';
      }
    } catch (dbErr) {
      console.warn('Could not resolve role from UserProfile, falling back to token metadata:', dbErr);
      resolvedRole = user.user_metadata?.role || 'customer';
    }

    // Attach user info to req.user (id, email, role)
    // Ensure resolvedRole matches the UserRole union defined in types
    const allowedRoles = ['customer','admin','manager','service_advisor','inventory_manager','technician'];
    const finalRole = allowedRoles.includes(resolvedRole) ? (resolvedRole as any) : (user.user_metadata?.role || 'customer');

    req.user = {
      id: user.id,
      email: user.email || undefined,
      role: finalRole,
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
