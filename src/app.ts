// src/app.ts
import express from 'express';
import cors from 'cors';
import prisma from './infrastructure/database/prisma';
import { authenticateSupabaseToken } from './modules/auth/supabase/authSupabase.middleware';

import authSupabaseRoutes from './modules/auth/supabase/authSupabase.routes';
import usersRoutes from './modules/users/users.routes';
import appointmentsRoutes from './modules/appointments/appointments.routes';
import workOrdersRoutes from './modules/work-orders';
import laborRoutes from './modules/labor/labor.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import inspectionTemplatesRoutes from './modules/inspection-templates/inspection-templates.routes';
// import cannedServicesRoutes from './modules/canned-services/canned-services.routes';


const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());


// mounting section
app.use('/auth', authSupabaseRoutes);
app.use('/users', usersRoutes); 
app.use('/appointments', appointmentsRoutes);
app.use('/work-orders', workOrdersRoutes);
app.use('/labor', laborRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/inspection-templates', inspectionTemplatesRoutes);
// app.use('/canned-services', cannedServicesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test DB connection
app.get('/test-db', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ message: 'Database connected' });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Protected route example
app.get('/protected', authenticateSupabaseToken, (req: any, res) => {
  res.json({ 
    message: 'This is a protected route',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Example of a route that requires specific roles
app.get('/admin-only', authenticateSupabaseToken, (req: any, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Admin role required'
    });
  }
  
  res.json({ 
    message: 'Welcome to admin area',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

export default app;
