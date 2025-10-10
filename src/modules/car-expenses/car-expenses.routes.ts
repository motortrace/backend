import { Router } from 'express';
import { CarExpensesController } from './car-expenses.controller';
import { authenticateSupabaseToken } from '../auth/supabase/authSupabase.middleware';

const router = Router();
const carExpensesController = new CarExpensesController();

// All car expense routes require authentication
router.use(authenticateSupabaseToken);

// Create car expense
router.post('/', carExpensesController.createCarExpense.bind(carExpensesController));

// Get all car expenses with filters
router.get('/', carExpensesController.getCarExpenses.bind(carExpensesController));

// Get expenses by vehicle
router.get('/vehicle/:vehicleId', carExpensesController.getExpensesByVehicle.bind(carExpensesController));

// Get expense statistics
router.get('/statistics', carExpensesController.getExpenseStatistics.bind(carExpensesController));

// Get vehicle expense summary
router.get('/summary/:vehicleId', carExpensesController.getVehicleExpenseSummary.bind(carExpensesController));

// Get, update, delete specific expense
router.get('/:id', carExpensesController.getCarExpenseById.bind(carExpensesController));
router.put('/:id', carExpensesController.updateCarExpense.bind(carExpensesController));
router.delete('/:id', carExpensesController.deleteCarExpense.bind(carExpensesController));

export default router;