import 'dotenv/config';
import { config } from './config';
import app from './app';
import prisma from './infrastructure/database/prisma';
import { StorageService } from './modules/storage/storage.service';
import { Server } from 'http';

const PORT = parseInt(config.port) || 3000;

// Declare server variable in the outer scope with proper typing
let server: Server;

// Initialize storage buckets on startup
async function initializeServices() {
  try {
    console.log(' Initializing services...');
        
    // Initialize Supabase Storage
    await StorageService.initializeStorage();
    console.log(' Storage service initialized');
        
    // Test database connection
    await prisma.$connect();
    console.log(' Database connected');
      
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Start server after initializing services
initializeServices().then(() => {
  server = app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/health`);
    console.log(` DB check: http://localhost:${PORT}/test-db`);
    console.log(` Storage endpoints: http://localhost:${PORT}/storage`);
  });
});

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down...');
  await prisma.$disconnect();
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);