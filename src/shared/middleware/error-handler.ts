import { Request, Response, NextFunction } from 'express';
import { 
  AppError, 
  ValidationError, 
  isOperationalError 
} from '../errors/custom-errors';
import { Prisma } from '@prisma/client';

/**
 * Global Error Handler Middleware
 * 
 * This middleware catches all errors and sends consistent responses
 * Must be registered LAST in app.ts (after all routes)
 * 
 * Error Flow:
 * 1. Controller throws error or calls next(error)
 * 2. Express catches error and forwards to this middleware
 * 3. We determine error type and send appropriate response
 * 4. Log error for debugging/monitoring
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Don't handle if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  // Log error for debugging
  console.error('❌ ERROR:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Handle custom AppError (operational errors)
  if (err instanceof AppError) {
    // Special handling for ValidationError (includes errors array)
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json({
        success: false,
        error: err.message,
        errors: err.errors,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      });
    }

    // Standard AppError response
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(err, res);
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      error: 'Invalid data provided',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Handle JWT errors (from authentication)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
    });
  }

  // Handle Multer errors (file upload)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`,
    });
  }

  // Handle unknown/programming errors (bugs)
  console.error('💥 UNHANDLED ERROR:', err);
  
  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      type: err.constructor.name,
    }),
  });
};

/**
 * Handle Prisma-specific errors with friendly messages
 */
function handlePrismaError(
  err: Prisma.PrismaClientKnownRequestError,
  res: Response
) {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation
      const field = (err.meta?.target as string[])?.join(', ') || 'field';
      return res.status(409).json({
        success: false,
        error: `A record with this ${field} already exists`,
        field,
      });

    case 'P2025':
      // Record not found
      return res.status(404).json({
        success: false,
        error: 'Record not found',
      });

    case 'P2003':
      // Foreign key constraint failed
      return res.status(400).json({
        success: false,
        error: 'Related record not found',
      });

    case 'P2014':
      // Invalid ID
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format',
      });

    default:
      return res.status(400).json({
        success: false,
        error: 'Database operation failed',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
  }
}

/**
 * 404 Not Found Handler
 * Used for routes that don't exist
 * Register this BEFORE the error handler in app.ts
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
};
