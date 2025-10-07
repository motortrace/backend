import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MotorTrace API',
      version: '1.0.0',
      description: `
        MotorTrace API - Automotive Service Management System
        
        ## Overview
        This API provides comprehensive management for automotive service centers including:
        - Customer management
        - Vehicle tracking
        - Work orders and estimates
        - Appointments scheduling
        - Inventory management
        - Payment processing
        
        ## Authentication
        Most endpoints require authentication via Supabase JWT tokens.
        Include the token in the Authorization header:
        \`Authorization: Bearer <your-token>\`
        
        ## Getting Started
        1. Sign up: POST /auth/signup
        2. Login: POST /auth/login
        3. Use the returned access_token in subsequent requests
      `,
      contact: {
        name: 'MotorTrace Support',
        email: 'support@motortrace.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'http://10.0.2.2:3000',
        description: 'Android Emulator server',
      },
      {
        url: 'https://api.motortrace.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Supabase JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            error: {
              type: 'string',
              example: 'Detailed error information',
            },
          },
        },
        UserRole: {
          type: 'string',
          enum: ['customer', 'technician', 'service_advisor', 'inventory_manager', 'manager', 'admin'],
          description: 'User role in the system',
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID from Supabase',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            role: {
              $ref: '#/components/schemas/UserRole',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        UserProfile: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Profile ID',
            },
            supabaseUserId: {
              type: 'string',
              description: 'Reference to Supabase user',
            },
            name: {
              type: 'string',
            },
            phone: {
              type: 'string',
            },
            profileImage: {
              type: 'string',
              nullable: true,
            },
            role: {
              $ref: '#/components/schemas/UserRole',
            },
            isRegistrationComplete: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            userProfileId: {
              type: 'string',
              nullable: true,
              description: 'NULL for walk-in customers',
            },
            name: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
              nullable: true,
            },
            phone: {
              type: 'string',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Vehicle: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            customerId: {
              type: 'string',
            },
            make: {
              type: 'string',
            },
            model: {
              type: 'string',
            },
            year: {
              type: 'number',
              nullable: true,
            },
            vin: {
              type: 'string',
              nullable: true,
            },
            licensePlate: {
              type: 'string',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Customers',
        description: 'Customer management endpoints',
      },
      {
        name: 'Vehicles',
        description: 'Vehicle management endpoints',
      },
      {
        name: 'Appointments',
        description: 'Appointment scheduling endpoints',
      },
      {
        name: 'Work Orders',
        description: 'Work order management endpoints',
      },
      {
        name: 'Estimates',
        description: 'Estimate management endpoints',
      },
      {
        name: 'Invoices',
        description: 'Invoice management endpoints',
      },
      {
        name: 'Canned Services',
        description: 'Pre-defined service packages',
      },
      {
        name: 'Inventory',
        description: 'Inventory management endpoints',
      },
      {
        name: 'Payments',
        description: 'Payment processing endpoints',
      },
    ],
  },
  // Path to the API routes
  apis: [
    './src/modules/*/*.routes.ts',
    './src/modules/*/routes/*.routes.ts',
    './src/modules/auth/supabase/*.routes.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
