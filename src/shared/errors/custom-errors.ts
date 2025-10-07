/**
 * Custom Error Classes for MotorTrace Backend
 * 
 * These errors provide:
 * - Consistent error handling across the application
 * - Proper HTTP status codes
 * - Operational vs Programming error distinction
 * - Type-safe error handling
 */

/**
 * Base Application Error
 * All custom errors extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  
  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Maintains proper stack trace for where error was thrown (V8 only)
    Error.captureStackTrace(this, this.constructor);
    
    // Set the prototype explicitly to fix instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 404 Not Found Error
 * Used when a resource doesn't exist
 * 
 * @example
 * throw new NotFoundError('Customer', customerId);
 * // Returns: "Customer with id abc123 not found"
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    super(message, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 422 Validation Error
 * Used when request data fails validation
 * 
 * @example
 * throw new ValidationError([
 *   { field: 'email', message: 'Invalid email format' },
 *   { field: 'phone', message: 'Phone number required' }
 * ]);
 */
export class ValidationError extends AppError {
  public readonly errors: Array<{ field?: string; message: string }>;
  
  constructor(errors: Array<{ field?: string; message: string }> | string) {
    const message = typeof errors === 'string' ? errors : 'Validation failed';
    super(message, 422);
    this.errors = typeof errors === 'string' ? [{ message: errors }] : errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 401 Unauthorized Error
 * Used when authentication is required but missing/invalid
 * 
 * @example
 * throw new UnauthorizedError('Invalid or expired token');
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 403 Forbidden Error
 * Used when user is authenticated but lacks permission
 * 
 * @example
 * throw new ForbiddenError('Only managers can delete work orders');
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * 409 Conflict Error
 * Used when request conflicts with current state
 * 
 * @example
 * throw new ConflictError('Invoice already exists for this work order');
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * 400 Bad Request Error
 * Used for general client errors
 * 
 * @example
 * throw new BadRequestError('Invalid date format');
 */
export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * 500 Internal Server Error
 * Used for unexpected server errors
 * Note: Usually these are caught automatically, not thrown explicitly
 * 
 * @example
 * throw new InternalServerError('Database connection failed');
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', isOperational: boolean = false) {
    super(message, 500, isOperational);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

/**
 * Helper function to check if error is operational
 * Operational errors are expected (like NotFoundError)
 * Non-operational errors are bugs (like TypeError)
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Type guard to check if error is AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
