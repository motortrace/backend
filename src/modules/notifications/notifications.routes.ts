import express from 'express';
import { authenticateSupabaseToken } from '../auth/supabase/authSupabase.middleware';
import { initializeNotificationService } from './notifications.service';
import prisma from '../../infrastructure/database/prisma';

// Initialize notification service
const notificationService = initializeNotificationService(prisma);

const router = express.Router();

// Get notifications for current user
router.get('/', authenticateSupabaseToken, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('📡 Fetching notifications for userId:', userId);
    // First get the UserProfile ID from the Supabase user ID
    const userProfile = await prisma.userProfile.findUnique({
      where: { supabaseUserId: userId },
      select: { id: true }
    });

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    console.log('📡 Found UserProfile ID:', userProfile.id);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const notifications = await notificationService.getNotifications(userProfile.id, limit);

    console.log('✅ Found notifications:', notifications.length);
    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      error: 'Failed to fetch notifications',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get unread notification count
router.get('/unread-count', authenticateSupabaseToken, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // First get the UserProfile ID from the Supabase user ID
    const userProfile = await prisma.userProfile.findUnique({
      where: { supabaseUserId: userId },
      select: { id: true }
    });

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const count = await notificationService.getUnreadCount(userProfile.id);

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      error: 'Failed to fetch unread count',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateSupabaseToken, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // First get the UserProfile ID from the Supabase user ID
    const userProfile = await prisma.userProfile.findUnique({
      where: { supabaseUserId: userId },
      select: { id: true }
    });

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    await notificationService.markAsRead(notificationId, userProfile.id);

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      error: 'Failed to mark notification as read',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticateSupabaseToken, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // First get the UserProfile ID from the Supabase user ID
    const userProfile = await prisma.userProfile.findUnique({
      where: { supabaseUserId: userId },
      select: { id: true }
    });

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    await notificationService.markAllAsRead(userProfile.id);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      error: 'Failed to mark all notifications as read',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete notification
router.delete('/:id', authenticateSupabaseToken, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // First get the UserProfile ID from the Supabase user ID
    const userProfile = await prisma.userProfile.findUnique({
      where: { supabaseUserId: userId },
      select: { id: true }
    });

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    await notificationService.deleteNotification(notificationId, userProfile.id);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      error: 'Failed to delete notification',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get notification preferences
router.get('/preferences', authenticateSupabaseToken, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const preferences = await notificationService.getPreferences(userId);

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({
      error: 'Failed to fetch notification preferences',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update notification preferences
router.put('/preferences', authenticateSupabaseToken, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const preferences = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const updatedPreferences = await notificationService.updatePreferences(userId, preferences);

    res.json({
      success: true,
      data: updatedPreferences,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      error: 'Failed to update notification preferences',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;