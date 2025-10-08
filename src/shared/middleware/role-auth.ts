import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { UserRole as AuthUserRole } from '../types/auth.types';
import { 
  hasRole, 
  isServiceAdvisor, 
  isTechnician, 
  isInventoryManager, 
  isAdmin, 
  isManager 
} from '../utils/role-checker';

export const requireRole = (requiredRoles: AuthUserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role;
      
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      //  OPTIMIZED: Read role from JWT token (req.user.role) instead of querying database
      // Role is already validated by JWT signature and available in token claims
      if (!userRole || !requiredRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          required: requiredRoles,
          current: userRole
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
};

export const requireServiceAdvisor = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;
    const allowedRoles: AuthUserRole[] = ['service_advisor', 'manager', 'admin'];
    
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    //  OPTIMIZED: Use role from JWT token instead of database query
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Service advisor access required'
      });
    }

    next();
  } catch (error) {
    console.error('Service advisor check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const requireTechnician = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;
    const allowedRoles: AuthUserRole[] = ['technician', 'manager', 'admin'];
    
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    //  OPTIMIZED: Use role from JWT token instead of database query
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Technician access required'
      });
    }

    next();
  } catch (error) {
    console.error('Technician check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const requireInventoryManager = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;
    const allowedRoles: AuthUserRole[] = ['inventory_manager', 'manager', 'admin'];
    
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    //  OPTIMIZED: Use role from JWT token instead of database query
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Inventory manager access required'
      });
    }

    next();
  } catch (error) {
    console.error('Inventory manager check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;
    const allowedRoles: AuthUserRole[] = ['admin'];
    
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    //  OPTIMIZED: Use role from JWT token instead of database query
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const requireManager = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role;
    const allowedRoles: AuthUserRole[] = ['manager', 'admin'];
    
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    //  OPTIMIZED: Use role from JWT token instead of database query
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Manager access required'
      });
    }

    next();
  } catch (error) {
    console.error('Manager check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
