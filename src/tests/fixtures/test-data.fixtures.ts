/**
 * Test data fixtures for consistent test data across test suites
 */

export const customerFixtures = {
  validCustomer: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
  },

  walkinCustomer: {
    name: 'Walk-in Customer',
    phone: '+9876543210',
  },

  customerWithoutPhone: {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
  },

  multipleCustomers: [
    {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '+1111111111',
    },
    {
      name: 'Bob Smith',
      email: 'bob@example.com',
      phone: '+2222222222',
    },
    {
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      phone: '+3333333333',
    },
  ],
};

export const vehicleFixtures = {
  toyota: {
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    vin: 'TOYOTA123456789',
    licensePlate: 'ABC-1234',
  },

  honda: {
    make: 'Honda',
    model: 'Civic',
    year: 2019,
    vin: 'HONDA123456789',
    licensePlate: 'XYZ-5678',
  },

  ford: {
    make: 'Ford',
    model: 'F-150',
    year: 2021,
    vin: 'FORD123456789',
    licensePlate: 'DEF-9012',
  },

  vehicleWithoutVIN: {
    make: 'Chevrolet',
    model: 'Malibu',
    year: 2018,
    licensePlate: 'GHI-3456',
  },
};

export const workOrderFixtures = {
  basicRepair: {
    status: 'PENDING' as const,
    jobType: 'REPAIR' as const,
    priority: 'NORMAL' as const,
    complaint: 'Engine making strange noise',
    odometerReading: 45000,
  },

  maintenance: {
    status: 'IN_PROGRESS' as const,
    jobType: 'MAINTENANCE' as const,
    priority: 'NORMAL' as const,
    complaint: 'Scheduled maintenance',
    odometerReading: 30000,
  },

  urgentRepair: {
    status: 'PENDING' as const,
    jobType: 'REPAIR' as const,
    priority: 'URGENT' as const,
    complaint: 'Car won\'t start',
    odometerReading: 52000,
  },

  inspection: {
    status: 'PENDING' as const,
    jobType: 'INSPECTION' as const,
    priority: 'NORMAL' as const,
    complaint: 'Pre-purchase inspection',
    odometerReading: 25000,
  },
};

export const serviceFixtures = {
  oilChange: {
    code: 'OIL_CHANGE',
    name: 'Oil Change',
    description: 'Standard oil change with filter replacement',
    duration: 30,
    price: 49.99,
    isAvailable: true,
  },

  tireRotation: {
    code: 'TIRE_ROTATION',
    name: 'Tire Rotation',
    description: 'Rotate all four tires for even wear',
    duration: 45,
    price: 39.99,
    isAvailable: true,
  },

  brakeInspection: {
    code: 'BRAKE_INSPECTION',
    name: 'Brake Inspection',
    description: 'Complete brake system inspection',
    duration: 60,
    price: 89.99,
    isAvailable: true,
  },

  transmission: {
    code: 'TRANSMISSION_SERVICE',
    name: 'Transmission Service',
    description: 'Transmission fluid change and inspection',
    duration: 90,
    price: 149.99,
    isAvailable: true,
  },
};

export const appointmentFixtures = {
  scheduled: {
    requestedAt: new Date('2025-02-15T10:00:00Z'),
    startTime: new Date('2025-02-15T10:00:00Z'),
    endTime: new Date('2025-02-15T11:00:00Z'),
    status: 'SCHEDULED' as const,
    priority: 'NORMAL' as const,
    notes: 'Customer wants oil change',
  },

  pending: {
    requestedAt: new Date('2025-02-20T14:00:00Z'),
    status: 'PENDING' as const,
    priority: 'NORMAL' as const,
    notes: 'Need to check brake noise',
  },

  urgent: {
    requestedAt: new Date(),
    status: 'PENDING' as const,
    priority: 'URGENT' as const,
    notes: 'Car won\'t start, needs immediate attention',
  },
};

export const invoiceFixtures = {
  basic: {
    subtotalServices: 100.00,
    subtotalLabor: 0,
    subtotalParts: 50.00,
    subtotal: 150.00,
    taxAmount: 15.00,
    discountAmount: 0,
    totalAmount: 165.00,
    paidAmount: 165.00,
    balanceDue: 0,
    status: 'PAID' as const,
  },

  partial: {
    subtotalServices: 200.00,
    subtotalLabor: 0,
    subtotalParts: 100.00,
    subtotal: 300.00,
    taxAmount: 30.00,
    discountAmount: 0,
    totalAmount: 330.00,
    paidAmount: 150.00,
    balanceDue: 180.00,
    status: 'PARTIAL' as const,
  },

  unpaid: {
    subtotalServices: 150.00,
    subtotalLabor: 0,
    subtotalParts: 75.00,
    subtotal: 225.00,
    taxAmount: 22.50,
    discountAmount: 0,
    totalAmount: 247.50,
    paidAmount: 0,
    balanceDue: 247.50,
    status: 'DRAFT' as const,
  },
};

export const userProfileFixtures = {
  manager: {
    name: 'Service Manager',
    phone: '+1234567891',
    role: 'MANAGER' as const,
    isRegistrationComplete: true,
  },

  serviceAdvisor: {
    name: 'John Advisor',
    phone: '+1234567892',
    role: 'SERVICE_ADVISOR' as const,
    isRegistrationComplete: true,
  },

  technician: {
    name: 'Mike Mechanic',
    phone: '+1234567893',
    role: 'TECHNICIAN' as const,
    isRegistrationComplete: true,
  },

  customer: {
    name: 'Regular Customer',
    phone: '+1234567894',
    role: 'CUSTOMER' as const,
    isRegistrationComplete: true,
  },
};

/**
 * Helper to generate unique email
 */
export function generateUniqueEmail(prefix: string = 'test'): string {
  return `${prefix}_${Date.now()}@example.com`;
}

/**
 * Helper to generate unique phone number
 */
export function generateUniquePhone(): string {
  const timestamp = Date.now().toString().slice(-10);
  return `+1${timestamp}`;
}

/**
 * Helper to generate unique VIN
 */
export function generateUniqueVIN(): string {
  return `VIN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
}

/**
 * Helper to generate work order number
 */
export function generateWorkOrderNumber(): string {
  return `WO-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}
