import { Router } from 'express';
import { CustomerController } from './customers.controller';
import { CustomerService } from './customers.service';
import { authenticateSupabaseToken, requireManager } from '../auth/supabase/authSupabase.middleware';
import {
  validateCreateCustomer,
  validateUpdateCustomer,
  validateCustomerFilters,
} from './customers.validation';
import prisma from '../../infrastructure/database/prisma';

const router = Router();

// Dependency Injection
const customerService = new CustomerService(prisma);
const customerController = new CustomerController(customerService);

// All routes require authentication
router.use(authenticateSupabaseToken);

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get all customers with optional filters
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search customers by name, email, or phone
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: List of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     count:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', validateCustomerFilters, customerController.getCustomers.bind(customerController));

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *   put:
 *     summary: Update customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       404:
 *         description: Customer not found
 *   delete:
 *     summary: Delete customer (Manager only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *       403:
 *         description: Forbidden - Manager role required
 *       404:
 *         description: Customer not found
 */
router.get('/:id', customerController.getCustomerById.bind(customerController));
router.put('/:id', validateUpdateCustomer, customerController.updateCustomer.bind(customerController));
router.delete('/:id', requireManager, customerController.deleteCustomer.bind(customerController));

/**
 * @swagger
 * /customers/profile/{userProfileId}:
 *   get:
 *     summary: Get customer by user profile ID (for mobile app)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userProfileId
 *         required: true
 *         schema:
 *           type: string
 *         description: User Profile ID
 *     responses:
 *       200:
 *         description: Customer details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 */
router.get('/profile/:userProfileId', customerController.getCustomerByUserProfileId.bind(customerController));

/**
 * @swagger
 * /customers/{customerId}/vehicles:
 *   get:
 *     summary: Get all vehicles for a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of customer vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vehicle'
 */
router.get('/:customerId/vehicles', customerController.getCustomerVehicles.bind(customerController));

/**
 * @swagger
 * /customers/{customerId}/work-orders:
 *   get:
 *     summary: Get all work orders for a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of customer work orders
 */
router.get('/:customerId/work-orders', customerController.getCustomerWorkOrders.bind(customerController));

/**
 * @swagger
 * /customers/{customerId}/appointments:
 *   get:
 *     summary: Get all appointments for a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of customer appointments
 */
router.get('/:customerId/appointments', customerController.getCustomerAppointments.bind(customerController));

export default router;
