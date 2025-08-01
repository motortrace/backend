// src/app.ts
import express from 'express';
import cors from 'cors';
import prisma from './infrastructure/database/prisma';

import authSupabaseRoutes from './modules/auth/supabase/authSupabase.routes';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

app.use('/auth', authSupabaseRoutes);  // <- mount here

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

export default app;
