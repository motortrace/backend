import { Router } from 'express';
import { CustomerController } from './customers.controller';
import { authenticateSupabaseToken, requireManager } from '../auth/supabase/authSupabase.middleware';
import {
  validateCreateCustomer,
  validateUpdateCustomer,
  validateCustomerFilters,
} from './customers.validation';

const router = Router();
const customerController = new CustomerController();

// All routes require authentication
router.use(authenticateSupabaseToken);

// Customer Management Routes
// better if we avoid creating customers directly, because the current method is to first create a profiile and then do the onboarding, if the admin goes to create it by himself, then that will cause a huge issue
// router.post('/', validateCreateCustomer, customerController.createCustomer.bind(customerController));
router.get('/', validateCustomerFilters, customerController.getCustomers.bind(customerController));
router.get('/:id', customerController.getCustomerById.bind(customerController));
router.put('/:id', validateUpdateCustomer, customerController.updateCustomer.bind(customerController));
router.delete('/:id', requireManager, customerController.deleteCustomer.bind(customerController));

// Customer-specific data routes
router.get('/:customerId/vehicles', customerController.getCustomerVehicles.bind(customerController));
router.get('/:customerId/work-orders', customerController.getCustomerWorkOrders.bind(customerController));
router.get('/:customerId/appointments', customerController.getCustomerAppointments.bind(customerController));

// Special route for getting customer by user profile ID (useful for mobile app)
router.get('/profile/:userProfileId', customerController.getCustomerByUserProfileId.bind(customerController));

export default router;
