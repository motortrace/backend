import 'dotenv/config';
import { config } from './config';
import app from './app';
import prisma from './infrastructure/database/prisma';

const PORT = config.port || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`DB check: http://localhost:${PORT}/test-db`);
});

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
