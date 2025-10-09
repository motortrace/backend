-- Migration: Add Notification Tables
-- Purpose: Store notifications for users to view when they log in

-- ============================================================================
-- NOTIFICATION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "customerId" TEXT NOT NULL,
  "workOrderId" TEXT,
  
  -- Notification Details
  "type" TEXT NOT NULL, -- 'WORK_ORDER_STATUS', 'PART_APPROVAL', 'VEHICLE_READY', etc.
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "priority" TEXT NOT NULL DEFAULT 'NORMAL', -- 'LOW', 'NORMAL', 'HIGH', 'URGENT'
  
  -- Read/Unread Status
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "readAt" TIMESTAMP,
  
  -- Action URL (for deep linking)
  "actionUrl" TEXT,
  "actionText" TEXT,
  
  -- Metadata (JSON field for flexible data storage)
  "metadata" JSONB,
  
  -- Channels used
  "sentViaEmail" BOOLEAN DEFAULT false,
  "sentViaPush" BOOLEAN DEFAULT false,
  
  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP, -- Optional expiration date for notifications
  
  -- Foreign Keys
  CONSTRAINT "Notification_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE,
  CONSTRAINT "Notification_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE SET NULL
);

-- Indexes for better query performance
CREATE INDEX "Notification_customerId_idx" ON "Notification"("customerId");
CREATE INDEX "Notification_workOrderId_idx" ON "Notification"("workOrderId");
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt" DESC);
CREATE INDEX "Notification_customerId_isRead_idx" ON "Notification"("customerId", "isRead");

-- ============================================================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS "NotificationPreferences" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "customerId" TEXT NOT NULL UNIQUE,
  
  -- Channel Preferences
  "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
  "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
  "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
  
  -- Event Type Preferences
  "workOrderStatusChanges" BOOLEAN NOT NULL DEFAULT true,
  "serviceApprovals" BOOLEAN NOT NULL DEFAULT true,
  "partApprovals" BOOLEAN NOT NULL DEFAULT true,
  "inspectionReports" BOOLEAN NOT NULL DEFAULT true,
  "paymentConfirmations" BOOLEAN NOT NULL DEFAULT true,
  "appointmentReminders" BOOLEAN NOT NULL DEFAULT true,
  "vehicleReadyAlerts" BOOLEAN NOT NULL DEFAULT true,
  "promotionalMessages" BOOLEAN NOT NULL DEFAULT false,
  
  -- Quiet Hours
  "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
  "quietHoursStart" TEXT, -- Format: "22:00"
  "quietHoursEnd" TEXT,   -- Format: "08:00"
  
  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Key
  CONSTRAINT "NotificationPreferences_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE
);

-- Index
CREATE INDEX "NotificationPreferences_customerId_idx" ON "NotificationPreferences"("customerId");

-- ============================================================================
-- NOTIFICATION HISTORY TABLE (for audit/tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "NotificationHistory" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "notificationId" TEXT,
  "customerId" TEXT NOT NULL,
  
  -- Delivery Details
  "channel" TEXT NOT NULL, -- 'EMAIL', 'PUSH', 'IN_APP'
  "status" TEXT NOT NULL,  -- 'SENT', 'FAILED', 'PENDING', 'DELIVERED', 'BOUNCED'
  "recipient" TEXT,        -- Email address or phone number
  
  -- Content
  "subject" TEXT,
  "message" TEXT,
  
  -- Delivery Tracking
  "sentAt" TIMESTAMP,
  "deliveredAt" TIMESTAMP,
  "failedAt" TIMESTAMP,
  "errorMessage" TEXT,
  
  -- Metadata
  "metadata" JSONB,
  
  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  CONSTRAINT "NotificationHistory_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE SET NULL,
  CONSTRAINT "NotificationHistory_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE
);

-- Indexes
CREATE INDEX "NotificationHistory_notificationId_idx" ON "NotificationHistory"("notificationId");
CREATE INDEX "NotificationHistory_customerId_idx" ON "NotificationHistory"("customerId");
CREATE INDEX "NotificationHistory_channel_idx" ON "NotificationHistory"("channel");
CREATE INDEX "NotificationHistory_status_idx" ON "NotificationHistory"("status");
CREATE INDEX "NotificationHistory_sentAt_idx" ON "NotificationHistory"("sentAt" DESC);

-- ============================================================================
-- RLS POLICIES FOR NOTIFICATIONS
-- ============================================================================

-- Enable RLS
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationPreferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationHistory" ENABLE ROW LEVEL SECURITY;

-- Notification Policies
-- Customers can only see their own notifications
CREATE POLICY "Customers can view their own notifications"
  ON "Notification" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Customer" c
      INNER JOIN "UserProfile" up ON up.id = c."userProfileId"
      WHERE c.id = "Notification"."customerId"
      AND up."supabaseUserId" = auth.uid()
    )
  );

-- Customers can mark their notifications as read
CREATE POLICY "Customers can update their own notifications"
  ON "Notification" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Customer" c
      INNER JOIN "UserProfile" up ON up.id = c."userProfileId"
      WHERE c.id = "Notification"."customerId"
      AND up."supabaseUserId" = auth.uid()
    )
  );

-- Backend can insert notifications
CREATE POLICY "Service role can insert notifications"
  ON "Notification" FOR INSERT
  WITH CHECK (true);

-- Notification Preferences Policies
CREATE POLICY "Customers can view their own preferences"
  ON "NotificationPreferences" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Customer" c
      INNER JOIN "UserProfile" up ON up.id = c."userProfileId"
      WHERE c.id = "NotificationPreferences"."customerId"
      AND up."supabaseUserId" = auth.uid()
    )
  );

CREATE POLICY "Customers can update their own preferences"
  ON "NotificationPreferences" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Customer" c
      INNER JOIN "UserProfile" up ON up.id = c."userProfileId"
      WHERE c.id = "NotificationPreferences"."customerId"
      AND up."supabaseUserId" = auth.uid()
    )
  );

CREATE POLICY "Customers can insert their own preferences"
  ON "NotificationPreferences" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Customer" c
      INNER JOIN "UserProfile" up ON up.id = c."userProfileId"
      WHERE c.id = "NotificationPreferences"."customerId"
      AND up."supabaseUserId" = auth.uid()
    )
  );

-- Notification History Policies (read-only for customers)
CREATE POLICY "Customers can view their own notification history"
  ON "NotificationHistory" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Customer" c
      INNER JOIN "UserProfile" up ON up.id = c."userProfileId"
      WHERE c.id = "NotificationHistory"."customerId"
      AND up."supabaseUserId" = auth.uid()
    )
  );

-- ============================================================================
-- REALTIME PUBLICATION
-- ============================================================================

-- Add tables to Supabase Realtime publication
-- Note: You may need to run this in Supabase SQL Editor if your app doesn't have permissions
-- DROP PUBLICATION IF EXISTS supabase_realtime;
-- CREATE PUBLICATION supabase_realtime FOR TABLE "Notification", "NotificationPreferences";

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically mark old notifications as expired
CREATE OR REPLACE FUNCTION mark_expired_notifications()
RETURNS void AS $$
BEGIN
  UPDATE "Notification"
  SET "isRead" = true
  WHERE "expiresAt" IS NOT NULL
  AND "expiresAt" < CURRENT_TIMESTAMP
  AND "isRead" = false;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(customer_id TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM "Notification"
    WHERE "customerId" = customer_id
    AND "isRead" = false
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_updated_at
  BEFORE UPDATE ON "Notification"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON "NotificationPreferences"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_history_updated_at
  BEFORE UPDATE ON "NotificationHistory"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
