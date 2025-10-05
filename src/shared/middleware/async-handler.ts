import { Request, Response, NextFunction } from 'express';

/**
 * Type definition for async route handlers
 */
type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Async Handler Wrapper
 * 
 * Wraps async controller methods to automatically catch errors
 * and pass them to the error handling middleware
 * 
 * Without this wrapper:
 * ```typescript
 * async getInvoice(req: Request, res: Response) {
 *   try {
 *     const invoice = await this.service.getInvoice(req.params.id);
 *     res.json({ data: invoice });
 *   } catch (error) {
 *     next(error); // Manual error handling
 *   }
 * }
 * ```
 * 
 * With this wrapper:
 * ```typescript
 * getInvoice = asyncHandler(async (req: Request, res: Response) => {
 *   const invoice = await this.service.getInvoice(req.params.id);
 *   res.json({ data: invoice });
 *   // Errors automatically caught and forwarded
 * });
 * ```
 * 
 * @param fn - Async function to wrap
 * @returns Wrapped function that catches errors
 * 
 * @example
 * // In controller:
 * import { asyncHandler } from '../../shared/middleware/async-handler';
 * 
 * export class InvoicesController {
 *   getInvoiceById = asyncHandler(async (req: Request, res: Response) => {
 *     const invoice = await this.invoicesService.getInvoiceById(req.params.id);
 *     res.json({ success: true, data: invoice });
 *   });
 * }
 * 
 * // In routes (no .bind needed with arrow functions):
 * router.get('/:id', controller.getInvoiceById);
 */
export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Execute the async function and catch any errors
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Alternative: Async Handler for class methods
 * Use this if you prefer regular methods instead of arrow functions
 * 
 * @example
 * export class InvoicesController {
 *   async getInvoiceById(req: Request, res: Response) {
 *     const invoice = await this.invoicesService.getInvoiceById(req.params.id);
 *     res.json({ success: true, data: invoice });
 *   }
 * }
 * 
 * // In routes (requires .bind):
 * router.get('/:id', asyncHandler(controller.getInvoiceById.bind(controller)));
 */
export const asyncHandlerWithBind = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
