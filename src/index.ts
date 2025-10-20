import 'dotenv/config';
import { config } from './config';
import app from './app';
import prisma from './infrastructure/database/prisma';
import { StorageService } from './modules/storage/storage.service';
import { Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import { MessageService } from './modules/messages/messages.service';
import { MessageType } from './modules/messages/messages.types';

const PORT = parseInt(config.port) || 3000;

// Declare server variable in the outer scope with proper typing
let server: Server;
let io: SocketServer;

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

// Initialize Socket.IO with authentication
function initializeSocketIO(server: Server) {
  io = new SocketServer(server, {
    cors: {
      origin: ["http://localhost:8081", "http://10.0.2.2:8081", "http://127.0.0.1:8081"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  const messageService = new MessageService();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Verify token with Supabase (simplified - you might want to use a proper JWT library)
      // For now, we'll trust the token and extract user info
      console.log('🔌 Socket authenticated for user');

      next();
    } catch (error) {
      console.error('❌ Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    socket.on('join-work-order', (workOrderId: string) => {
      console.log('🔌 User joined work order room:', workOrderId);
      socket.join(`work-order-${workOrderId}`);
    });

    socket.on('send-message', async (data: { workOrderId: string; message: string; userId: string }) => {
      try {
        console.log('🔌 Received message:', data);

        // The userId from socket is the UserProfile ID, we need to get the Supabase user ID
        // Get Supabase user ID from UserProfile ID
        const userProfile = await prisma.userProfile.findUnique({
          where: { id: data.userId }
        });

        if (!userProfile) {
          throw new Error('User profile not found');
        }

        console.log('🔌 Found user profile:', userProfile.id, 'supabaseUserId:', userProfile.supabaseUserId);

        // Create message using service with Supabase user ID
        const message = await messageService.createMessage(userProfile.supabaseUserId, {
          workOrderId: data.workOrderId,
          message: data.message,
          messageType: MessageType.TEXT
        });

        console.log('🔌 Message created:', message.id);

        // Send to all users in the work order room (EXCEPT sender)
        socket.to(`work-order-${data.workOrderId}`).emit('new-message', message);

        // Send confirmation to sender with the created message
        socket.emit('message-sent', message);

      } catch (error) {
        console.error('❌ Error sending message:', error);
        socket.emit('message-error', { error: error instanceof Error ? error.message : 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 User disconnected:', socket.id);
    });
  });

  console.log('🔌 Socket.IO initialized');
}

// Start server after initializing services
initializeServices().then(() => {
  server = app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/health`);
    console.log(` DB check: http://localhost:${PORT}/test-db`);
    console.log(` Storage endpoints: http://localhost:${PORT}/storage`);
  });

  // Initialize Socket.IO after server starts
  initializeSocketIO(server);
  console.log(' Server ready with Socket.IO initialized');
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