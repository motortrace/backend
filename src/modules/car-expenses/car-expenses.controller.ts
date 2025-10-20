import { Response } from 'express';
import { AuthenticatedRequest } from '../../shared/types/auth.types';
import { CarExpensesService } from './car-expenses.service';
import { CreateCarExpenseRequest, UpdateCarExpenseRequest, CarExpenseFilters } from './car-expenses.types';

const carExpensesService = new CarExpensesService();

export class CarExpensesController {
  // Create a new car expense
  async createCarExpense(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id; // Assuming auth middleware sets req.user
      const expenseData: CreateCarExpenseRequest = req.body;

      const expense = await carExpensesService.createCarExpense(expenseData, userId);

      res.status(201).json({
        success: true,
        message: 'Car expense created successfully',
        data: expense,
      });
    } catch (error) {
      console.error('Error creating car expense:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create car expense',
      });
    }
  }

  // Get car expense by ID
  async getCarExpenseById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const expense = await carExpensesService.getCarExpenseById(id);

      res.json({
        success: true,
        data: expense,
      });
    } catch (error) {
      console.error('Error getting car expense:', error);
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'Car expense not found',
      });
    }
  }

  // Get all car expenses with filters
  async getCarExpenses(req: AuthenticatedRequest, res: Response) {
    try {
      const filters: CarExpenseFilters = {
        vehicleId: req.query.vehicleId as string,
        category: req.query.category as any,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
        maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined,
        search: req.query.search as string,
      };

      const expenses = await carExpensesService.getCarExpenses(filters);

      res.json({
        success: true,
        data: expenses,
        count: expenses.length,
      });
    } catch (error) {
      console.error('Error getting car expenses:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get car expenses',
      });
    }
  }

  // Update car expense
  async updateCarExpense(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateCarExpenseRequest = req.body;

      const expense = await carExpensesService.updateCarExpense(id, updateData);

      res.json({
        success: true,
        message: 'Car expense updated successfully',
        data: expense,
      });
    } catch (error) {
      console.error('Error updating car expense:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update car expense',
      });
    }
  }

  // Delete car expense
  async deleteCarExpense(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await carExpensesService.deleteCarExpense(id);

      res.json({
        success: true,
        message: 'Car expense deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting car expense:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete car expense',
      });
    }
  }

  // Get expenses by vehicle
  async getExpensesByVehicle(req: AuthenticatedRequest, res: Response) {
    try {
      const { vehicleId } = req.params;
      const expenses = await carExpensesService.getExpensesByVehicle(vehicleId);

      res.json({
        success: true,
        data: expenses,
        count: expenses.length,
      });
    } catch (error) {
      console.error('Error getting expenses by vehicle:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get expenses by vehicle',
      });
    }
  }

  // Get expense statistics
  async getExpenseStatistics(req: AuthenticatedRequest, res: Response) {
    try {
      const { vehicleId } = req.query;
      const statistics = await carExpensesService.getExpenseStatistics(vehicleId as string);

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      console.error('Error getting expense statistics:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get expense statistics',
      });
    }
  }

  // Get vehicle expense summary
  async getVehicleExpenseSummary(req: AuthenticatedRequest, res: Response) {
    try {
      const { vehicleId } = req.params;
      const summary = await carExpensesService.getVehicleExpenseSummary(vehicleId);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('Error getting vehicle expense summary:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get vehicle expense summary',
      });
    }
  }
}