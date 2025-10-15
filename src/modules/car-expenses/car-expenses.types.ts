export enum ExpenseCategory {
  MAINTENANCE = 'MAINTENANCE',
  REPAIR = 'REPAIR',
  FUEL = 'FUEL',
  INSURANCE = 'INSURANCE',
  REGISTRATION = 'REGISTRATION',
  TIRES = 'TIRES',
  PARTS = 'PARTS',
  WASHING = 'WASHING',
  PARKING = 'PARKING',
  TOLLS = 'TOLLS',
  FINES = 'FINES',
  OTHER = 'OTHER'
}

// Car expense creation request
export interface CreateCarExpenseRequest {
  vehicleId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: Date;
  provider?: string;
  receiptUrl?: string;
  notes?: string;
}

// Car expense update request
export interface UpdateCarExpenseRequest {
  category?: ExpenseCategory;
  description?: string;
  amount?: number;
  date?: Date;
  provider?: string;
  receiptUrl?: string;
  notes?: string;
}

// Car expense response
export interface CarExpenseResponse {
  id: string;
  vehicleId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: Date;
  provider?: string;
  receiptUrl?: string;
  notes?: string;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year?: number;
    licensePlate?: string;
  };
  createdBy?: {
    id: string;
    name?: string;
  };
}

// Car expense filters for search
export interface CarExpenseFilters {
  vehicleId?: string;
  category?: ExpenseCategory;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

// Car expense statistics
export interface CarExpenseStatistics {
  totalExpenses: number;
  totalAmount: number;
  expensesByCategory: { category: ExpenseCategory; count: number; amount: number }[];
  monthlyExpenses: { month: string; count: number; amount: number }[];
  averageExpense: number;
  highestExpense: CarExpenseResponse | null;
  recentExpenses: CarExpenseResponse[];
}

// Expense summary for a vehicle
export interface VehicleExpenseSummary {
  vehicleId: string;
  totalExpenses: number;
  totalAmount: number;
  thisMonthCount: number;
  thisMonthAmount: number;
  lastMonthCount: number;
  lastMonthAmount: number;
  categoriesBreakdown: { category: ExpenseCategory; count: number; amount: number }[];
}