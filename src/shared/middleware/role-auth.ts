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
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const supabaseUserId = req.user?.id;
      
      if (!supabaseUserId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const hasRequiredRole = await hasRole(supabaseUserId, requiredRoles);
      
      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
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

export const requireServiceAdvisor = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const supabaseUserId = req.user?.id;
    
    if (!supabaseUserId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const isAdvisor = await isServiceAdvisor(supabaseUserId);
    
    if (!isAdvisor) {
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

export const requireTechnician = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const supabaseUserId = req.user?.id;
    
    if (!supabaseUserId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const isTech = await isTechnician(supabaseUserId);
    
    if (!isTech) {
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

export const requireInventoryManager = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const supabaseUserId = req.user?.id;
    
    if (!supabaseUserId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const isInventoryMgr = await isInventoryManager(supabaseUserId);
    
    if (!isInventoryMgr) {
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

export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const supabaseUserId = req.user?.id;
    
    if (!supabaseUserId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const isAdminUser = await isAdmin(supabaseUserId);
    
    if (!isAdminUser) {
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

export const requireManager = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const supabaseUserId = req.user?.id;
    
    if (!supabaseUserId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const isManagerUser = await isManager(supabaseUserId);
    
    if (!isManagerUser) {
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
