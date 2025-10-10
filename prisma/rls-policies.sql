-- ============================================================================
-- Row Level Security (RLS) Policies for Supabase Realtime
-- ============================================================================
-- Purpose: Secure real-time subscriptions so users only see their own data
-- Usage: Run this after enabling Realtime on tables
-- ============================================================================

-- ============================================================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL REALTIME TABLES
-- ============================================================================

ALTER TABLE "WorkOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkOrderService" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkOrderPart" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkOrderInspection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InspectionChecklistItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkOrderApproval" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkOrderAttachment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkOrderInspectionAttachment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceLineItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkOrderLabor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkOrderQC" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. HELPER FUNCTIONS FOR ROLE CHECKING
-- ============================================================================

-- Function to check if current user is a customer
CREATE OR REPLACE FUNCTION is_customer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "UserProfile" up
    JOIN "Customer" c ON c."userProfileId" = up.id
    WHERE up."supabaseUserId" = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is a service advisor
CREATE OR REPLACE FUNCTION is_service_advisor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "UserProfile" up
    JOIN "ServiceAdvisor" sa ON sa."userProfileId" = up.id
    WHERE up."supabaseUserId" = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is a technician
CREATE OR REPLACE FUNCTION is_technician()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "UserProfile" up
    JOIN "Technician" t ON t."userProfileId" = up.id
    WHERE up."supabaseUserId" = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is staff (advisor, technician, manager, admin)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "UserProfile"
    WHERE "supabaseUserId" = auth.uid()
    AND role IN ('SERVICE_ADVISOR', 'TECHNICIAN', 'MANAGER', 'ADMIN', 'INVENTORY_MANAGER')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is admin or manager
CREATE OR REPLACE FUNCTION is_admin_or_manager()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "UserProfile"
    WHERE "supabaseUserId" = auth.uid()
    AND role IN ('ADMIN', 'MANAGER')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's customer ID
CREATE OR REPLACE FUNCTION get_current_customer_id()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT c.id FROM "UserProfile" up
    JOIN "Customer" c ON c."userProfileId" = up.id
    WHERE up."supabaseUserId" = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. WORKORDER POLICIES
-- ============================================================================

-- Policy: Customers can view their own work orders
CREATE POLICY "customers_view_own_workorders"
ON "WorkOrder"
FOR SELECT
USING (
  "customerId" = get_current_customer_id()
);

-- Policy: Staff can view all work orders
CREATE POLICY "staff_view_all_workorders"
ON "WorkOrder"
FOR SELECT
USING (
  is_staff()
);

-- Policy: Service advisors can insert work orders
CREATE POLICY "service_advisors_insert_workorders"
ON "WorkOrder"
FOR INSERT
WITH CHECK (
  is_service_advisor() OR is_admin_or_manager()
);

-- Policy: Service advisors can update work orders
CREATE POLICY "service_advisors_update_workorders"
ON "WorkOrder"
FOR UPDATE
USING (
  is_service_advisor() OR is_admin_or_manager()
);

-- Policy: Only admins can delete work orders
CREATE POLICY "admins_delete_workorders"
ON "WorkOrder"
FOR DELETE
USING (
  is_admin_or_manager()
);

-- ============================================================================
-- 4. WORKORDERSERVICE POLICIES
-- ============================================================================

-- Policy: Customers can view services for their work orders
CREATE POLICY "customers_view_own_services"
ON "WorkOrderService"
FOR SELECT
USING (
  "workOrderId" IN (
    SELECT id FROM "WorkOrder"
    WHERE "customerId" = get_current_customer_id()
  )
);

-- Policy: Staff can view all services
CREATE POLICY "staff_view_all_services"
ON "WorkOrderService"
FOR SELECT
USING (
  is_staff()
);

-- Policy: Service advisors and technicians can insert services
CREATE POLICY "staff_insert_services"
ON "WorkOrderService"
FOR INSERT
WITH CHECK (
  is_staff()
);

-- Policy: Staff can update services
CREATE POLICY "staff_update_services"
ON "WorkOrderService"
FOR UPDATE
USING (
  is_staff()
);

-- Policy: Customers can update approval status on their services
CREATE POLICY "customers_approve_own_services"
ON "WorkOrderService"
FOR UPDATE
USING (
  "workOrderId" IN (
    SELECT id FROM "WorkOrder"
    WHERE "customerId" = get_current_customer_id()
  )
)
WITH CHECK (
  "workOrderId" IN (
    SELECT id FROM "WorkOrder"
    WHERE "customerId" = get_current_customer_id()
  )
);

-- Policy: Service advisors can delete services
CREATE POLICY "advisors_delete_services"
ON "WorkOrderService"
FOR DELETE
USING (
  is_service_advisor() OR is_admin_or_manager()
);

-- ============================================================================
-- 5. WORKORDERPART POLICIES
-- ============================================================================

-- Policy: Customers can view parts for their work orders
CREATE POLICY "customers_view_own_parts"
ON "WorkOrderPart"
FOR SELECT
USING (
  "workOrderId" IN (
    SELECT id FROM "WorkOrder"
    WHERE "customerId" = get_current_customer_id()
  )
);

-- Policy: Staff can view all parts
CREATE POLICY "staff_view_all_parts"
ON "WorkOrderPart"
FOR SELECT
USING (
  is_staff()
);

-- Policy: Staff can insert parts
CREATE POLICY "staff_insert_parts"
ON "WorkOrderPart"
FOR INSERT
WITH CHECK (
  is_staff()
);

-- Policy: Staff can update parts
CREATE POLICY "staff_update_parts"
ON "WorkOrderPart"
FOR UPDATE
USING (
  is_staff()
);

-- Policy: Customers can approve/reject their parts
CREATE POLICY "customers_approve_own_parts"
ON "WorkOrderPart"
FOR UPDATE
USING (
  "workOrderId" IN (
    SELECT id FROM "WorkOrder"
    WHERE "customerId" = get_current_customer_id()
  )
)
WITH CHECK (
  "workOrderId" IN (
    SELECT id FROM "WorkOrder"
    WHERE "customerId" = get_current_customer_id()
  )
);

-- Policy: Service advisors can delete parts
CREATE POLICY "advisors_delete_parts"
ON "WorkOrderPart"
FOR DELETE
USING (
  is_service_advisor() OR is_admin_or_manager()
);

-- ============================================================================
-- 6. PAYMENT POLICIES
-- ============================================================================

-- Policy: Customers can view their own payments
CREATE POLICY "customers_view_own_payments"
ON "Payment"
FOR SELECT
USING (
  "workOrderId" IN (
    SELECT id FROM "WorkOrder"
    WHERE "customerId" = get_current_customer_id()
  )
);

-- Policy: Staff can view all payments
CREATE POLICY "staff_view_all_payments"
ON "Payment"
FOR SELECT
USING (
  is_staff()
);

-- Policy: Service advisors can insert payments
CREATE POLICY "advisors_insert_payments"
ON "Payment"
FOR INSERT
WITH CHECK (
  is_service_advisor() OR is_admin_or_manager()
);

-- Policy: Service advisors can update payments
CREATE POLICY "advisors_update_payments"
ON "Payment"
FOR UPDATE
USING (
  is_service_advisor() OR is_admin_or_manager()
);

-- Policy: Only admins can delete payments
CREATE POLICY "admins_delete_payments"
ON "Payment"
FOR DELETE
USING (
  is_admin_or_manager()
);

-- ============================================================================
-- 7. APPOINTMENT POLICIES
-- ============================================================================

-- Policy: Customers can view their own appointments
CREATE POLICY "customers_view_own_appointments"
ON "Appointment"
FOR SELECT
USING (
  "customerId" = get_current_customer_id()
);

-- Policy: Staff can view all appointments
CREATE POLICY "staff_view_all_appointments"
ON "Appointment"
FOR SELECT
USING (
  is_staff()
);

-- Policy: Customers can create their own appointments
CREATE POLICY "customers_insert_own_appointments"
ON "Appointment"
FOR INSERT
WITH CHECK (
  "customerId" = get_current_customer_id()
);

-- Policy: Service advisors can create appointments
CREATE POLICY "advisors_insert_appointments"
ON "Appointment"
FOR INSERT
WITH CHECK (
  is_service_advisor() OR is_admin_or_manager()
);

-- Policy: Customers can update their own appointments
CREATE POLICY "customers_update_own_appointments"
ON "Appointment"
FOR UPDATE
USING (
  "customerId" = get_current_customer_id()
)
WITH CHECK (
  "customerId" = get_current_customer_id()
);

-- Policy: Service advisors can update all appointments
CREATE POLICY "advisors_update_appointments"
ON "Appointment"
FOR UPDATE
USING (
  is_service_advisor() OR is_admin_or_manager()
);

-- Policy: Customers can cancel their own appointments
CREATE POLICY "customers_delete_own_appointments"
ON "Appointment"
FOR DELETE
USING (
  "customerId" = get_current_customer_id()
);

-- Policy: Service advisors can delete appointments
CREATE POLICY "advisors_delete_appointments"
ON "Appointment"
FOR DELETE
USING (
  is_service_advisor() OR is_admin_or_manager()
);

-- ============================================================================
-- 8. WORKORDERINSPECTION POLICIES
-- ============================================================================

-- Policy: Customers can view inspections for their work orders
CREATE POLICY "customers_view_own_inspections"
ON "WorkOrderInspection"
FOR SELECT
USING (
  "workOrderId" IN (
    SELECT id FROM "WorkOrder"
    WHERE "customerId" = get_current_customer_id()
  )
);

-- Policy: Staff can view all inspections
CREATE POLICY "staff_view_all_inspections"
ON "WorkOrderInspection"
FOR SELECT
USING (
  is_staff()
);

-- Policy: Technicians can insert inspections
CREATE POLICY "technicians_insert_inspections"
ON "WorkOrderInspection"
FOR INSERT
WITH CHECK (
  is_technician() OR is_service_advisor() OR is_admin_or_manager()
);

-- Policy: Technicians can update their inspections
CREATE POLICY "technicians_update_inspections"
ON "WorkOrderInspection"
FOR UPDATE
USING (
  is_technician() OR is_service_advisor() OR is_admin_or_manager()
);

-- Policy: Service advisors can delete inspections
CREATE POLICY "advisors_delete_inspections"
ON "WorkOrderInspection"
FOR DELETE
USING (
  is_service_advisor() OR is_admin_or_manager()
);

-- ============================================================================
-- 9. INSPECTIONCHECKLISTITEM POLICIES
-- ============================================================================

-- Policy: Customers can view checklist items for their inspections
CREATE POLICY "customers_view_own_checklist_items"
ON "InspectionChecklistItem"
FOR SELECT
USING (
  "inspectionId" IN (
    SELECT i.id FROM "WorkOrderInspection" i
    JOIN "WorkOrder" wo ON wo.id = i."workOrderId"
    WHERE wo."customerId" = get_current_customer_id()
  )
);

-- Policy: Staff can view all checklist items
CREATE POLICY "staff_view_all_checklist_items"
ON "InspectionChecklistItem"
FOR SELECT
USING (
  is_staff()
);

-- Policy: Technicians can insert checklist items
CREATE POLICY "technicians_insert_checklist_items"
ON "InspectionChecklistItem"
FOR INSERT
WITH CHECK (
  is_technician() OR is_service_advisor() OR is_admin_or_manager()
);

-- Policy: Technicians can update checklist items
CREATE POLICY "technicians_update_checklist_items"
ON "InspectionChecklistItem"
FOR UPDATE
USING (
  is_technician() OR is_service_advisor() OR is_admin_or_manager()
);

-- Policy: Service advisors can delete checklist items
CREATE POLICY "advisors_delete_checklist_items"
ON "InspectionChecklistItem"
FOR DELETE
USING (
  is_service_advisor() OR is_admin_or_manager()
);

-- ============================================================================
-- 10. WORKORDERAPPROVAL POLICIES
-- ============================================================================

-- Policy: Customers can view approvals for their work orders
CREATE POLICY "customers_view_own_approvals"
ON "WorkOrderApproval"
FOR SELECT
USING (
  "workOrderId" IN (
    SELECT id FROM "WorkOrder"
    WHERE "customerId" = get_current_customer_id()
  )
);

-- Policy: Staff can view all approvals
CREATE POLICY "staff_view_all_approvals"
ON "WorkOrderApproval"
FOR SELECT
USING (
  is_staff()
);

-- Policy: Service advisors can insert approvals
CREATE POLICY "advisors_insert_approvals"
ON "WorkOrderApproval"
FOR INSERT
WITH CHECK (
  is_service_advisor() OR is_admin_or_manager()
);

-- Policy: Service advisors can update approvals
CREATE POLICY "advisors_update_approvals"
ON "WorkOrderApproval"
FOR UPDATE
USING (
  is_service_advisor() OR is_admin_or_manager()
);

-- Policy: Customers can approve their own work orders
CREATE POLICY "customers_approve_own_workorders"
ON "WorkOrderApproval"
FOR UPDATE
USING (
  "workOrderId" IN (
    SELECT id FROM "WorkOrder"
    WHERE "customerId" = get_current_customer_id()
  )
)
WITH CHECK (
  "workOrderId" IN (
    SELECT id FROM "WorkOrder"
    WHERE "customerId" = get_current_customer_id()
  )
);

-- ============================================================================
-- 11. WORKORDERATTACHMENT POLICIES
-- ============================================================================

-- Policy: Customers can view attachments for their work orders
CREATE POLICY "customers_view_own_attachments"
ON "WorkOrderAttachment"
FOR SELECT
USING (
  "workOrderId" IN (
    SELECT id FROM "WorkOrder"
    WHERE "customerId" = get_current_customer_id()
  )
);

-- Policy: Staff can view all attachments
CREATE POLICY "staff_view_all_attachments"
ON "WorkOrderAttachment"
FOR SELECT
USING (
  is_staff()
);

-- Policy: Staff can insert attachments
CREATE POLICY "staff_insert_attachments"
ON "WorkOrderAttachment"
FOR INSERT
WITH CHECK (
  is_staff()
);

-- Policy: Staff can delete their own attachments
CREATE POLICY "staff_delete_own_attachments"
ON "WorkOrderAttachment"
FOR DELETE
USING (
  is_staff()
);

-- ============================================================================
-- 12. WORKORDERINSPECTIONATTACHMENT POLICIES
-- ============================================================================

-- Policy: Customers can view inspection attachments for their work orders
CREATE POLICY "customers_view_own_inspection_attachments"
ON "WorkOrderInspectionAttachment"
FOR SELECT
USING (
  "inspectionId" IN (
    SELECT i.id FROM "WorkOrderInspection" i
    JOIN "WorkOrder" wo ON wo.id = i."workOrderId"
    WHERE wo."customerId" = get_current_customer_id()
  )
);

-- Policy: Staff can view all inspection attachments
CREATE POLICY "staff_view_all_inspection_attachments"
ON "WorkOrderInspectionAttachment"
FOR SELECT
USING (
  is_staff()
);

-- Policy: Staff can insert inspection attachments
CREATE POLICY "staff_insert_inspection_attachments"
ON "WorkOrderInspectionAttachment"
FOR INSERT
WITH CHECK (
  is_staff()
);

-- Policy: Staff can delete inspection attachments
CREATE POLICY "staff_delete_inspection_attachments"
ON "WorkOrderInspectionAttachment"
FOR DELETE
USING (
  is_staff()
);

-- ============================================================================
-- 13. INVOICE POLICIES
-- ============================================================================

-- Policy: Customers can view their own invoices
CREATE POLICY "customers_view_own_invoices"
ON "Invoice"
FOR SELECT
USING (
  "workOrderId" IN (
    SELECT id FROM "WorkOrder"
    WHERE "customerId" = get_current_customer_id()
  )
);

-- Policy: Staff can view all invoices
CREATE POLICY "staff_view_all_invoices"
ON "Invoice"
FOR SELECT
USING (
  is_staff()
);

-- Policy: Service advisors can insert invoices
CREATE POLICY "advisors_insert_invoices"
ON "Invoice"
FOR INSERT
WITH CHECK (
  is_service_advisor() OR is_admin_or_manager()
);

-- Policy: Service advisors can update invoices
CREATE POLICY "advisors_update_invoices"
ON "Invoice"
FOR UPDATE
USING (
  is_service_advisor() OR is_admin_or_manager()
);

-- Policy: Only admins can delete invoices
CREATE POLICY "admins_delete_invoices"
ON "Invoice"
FOR DELETE
USING (
  is_admin_or_manager()
);

-- ============================================================================
-- 14. INVOICELINEITEM POLICIES
-- ============================================================================

-- Policy: Customers can view line items for their invoices
CREATE POLICY "customers_view_own_invoice_items"
ON "InvoiceLineItem"
FOR SELECT
USING (
  "invoiceId" IN (
    SELECT i.id FROM "Invoice" i
    JOIN "WorkOrder" wo ON wo.id = i."workOrderId"
    WHERE wo."customerId" = get_current_customer_id()
  )
);

-- Policy: Staff can view all invoice line items
CREATE POLICY "staff_view_all_invoice_items"
ON "InvoiceLineItem"
FOR SELECT
USING (
  is_staff()
);

-- Policy: Service advisors can insert invoice line items
CREATE POLICY "advisors_insert_invoice_items"
ON "InvoiceLineItem"
FOR INSERT
WITH CHECK (
  is_service_advisor() OR is_admin_or_manager()
);

-- Policy: Service advisors can update invoice line items
CREATE POLICY "advisors_update_invoice_items"
ON "InvoiceLineItem"
FOR UPDATE
USING (
  is_service_advisor() OR is_admin_or_manager()
);

-- Policy: Service advisors can delete invoice line items
CREATE POLICY "advisors_delete_invoice_items"
ON "InvoiceLineItem"
FOR DELETE
USING (
  is_service_advisor() OR is_admin_or_manager()
);

-- ============================================================================
-- 15. WORKORDERLABOR POLICIES
-- ============================================================================

-- Policy: Customers can view labor items for their work orders
CREATE POLICY "customers_view_own_labor"
ON "WorkOrderLabor"
FOR SELECT
USING (
  "workOrderId" IN (
    SELECT id FROM "WorkOrder"
    WHERE "customerId" = get_current_customer_id()
  )
);

-- Policy: Staff can view all labor items
CREATE POLICY "staff_view_all_labor"
ON "WorkOrderLabor"
FOR SELECT
USING (
  is_staff()
);

-- Policy: Technicians and advisors can insert labor items
CREATE POLICY "staff_insert_labor"
ON "WorkOrderLabor"
FOR INSERT
WITH CHECK (
  is_staff()
);

-- Policy: Technicians can update their labor items
CREATE POLICY "technicians_update_labor"
ON "WorkOrderLabor"
FOR UPDATE
USING (
  is_staff()
);

-- Policy: Service advisors can delete labor items
CREATE POLICY "advisors_delete_labor"
ON "WorkOrderLabor"
FOR DELETE
USING (
  is_service_advisor() OR is_admin_or_manager()
);

-- ============================================================================
-- 16. WORKORDERQC POLICIES
-- ============================================================================

-- Policy: Customers can view QC checks for their work orders
CREATE POLICY "customers_view_own_qc"
ON "WorkOrderQC"
FOR SELECT
USING (
  "workOrderId" IN (
    SELECT id FROM "WorkOrder"
    WHERE "customerId" = get_current_customer_id()
  )
);

-- Policy: Staff can view all QC checks
CREATE POLICY "staff_view_all_qc"
ON "WorkOrderQC"
FOR SELECT
USING (
  is_staff()
);

-- Policy: Technicians can insert QC checks
CREATE POLICY "technicians_insert_qc"
ON "WorkOrderQC"
FOR INSERT
WITH CHECK (
  is_technician() OR is_service_advisor() OR is_admin_or_manager()
);

-- Policy: Technicians can update QC checks
CREATE POLICY "technicians_update_qc"
ON "WorkOrderQC"
FOR UPDATE
USING (
  is_technician() OR is_service_advisor() OR is_admin_or_manager()
);

-- Policy: Service advisors can delete QC checks
CREATE POLICY "advisors_delete_qc"
ON "WorkOrderQC"
FOR DELETE
USING (
  is_service_advisor() OR is_admin_or_manager()
);

-- ============================================================================
-- 17. GRANT REALTIME PERMISSIONS
-- ============================================================================

-- Grant SELECT permission on tables to authenticated users for Realtime
GRANT SELECT ON "WorkOrder" TO authenticated;
GRANT SELECT ON "WorkOrderService" TO authenticated;
GRANT SELECT ON "WorkOrderPart" TO authenticated;
GRANT SELECT ON "Payment" TO authenticated;
GRANT SELECT ON "Appointment" TO authenticated;
GRANT SELECT ON "WorkOrderInspection" TO authenticated;
GRANT SELECT ON "InspectionChecklistItem" TO authenticated;
GRANT SELECT ON "WorkOrderApproval" TO authenticated;
GRANT SELECT ON "WorkOrderAttachment" TO authenticated;
GRANT SELECT ON "WorkOrderInspectionAttachment" TO authenticated;
GRANT SELECT ON "Invoice" TO authenticated;
GRANT SELECT ON "InvoiceLineItem" TO authenticated;
GRANT SELECT ON "WorkOrderLabor" TO authenticated;
GRANT SELECT ON "WorkOrderQC" TO authenticated;

-- ============================================================================
-- 18. ENABLE REALTIME ON TABLES (OPTIONAL - SKIP IF ALREADY ENABLED)
-- ============================================================================

-- NOTE: If you already enabled Realtime in the Supabase Dashboard,
-- you can skip this entire section. Just comment it out or delete it.

-- If you need to add tables to Realtime publication, uncomment below:

/*
-- Add tables to Realtime publication (skip if already added)
DO $$
BEGIN
    -- Try to add each table, ignore if already exists
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "WorkOrder";
    EXCEPTION WHEN duplicate_object THEN
        NULL; -- Table already in publication, ignore
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "WorkOrderService";
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "WorkOrderPart";
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "Payment";
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "Appointment";
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "WorkOrderInspection";
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "InspectionChecklistItem";
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "WorkOrderApproval";
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "WorkOrderAttachment";
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "WorkOrderInspectionAttachment";
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "Invoice";
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "InvoiceLineItem";
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "WorkOrderLabor";
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "WorkOrderQC";
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify RLS is working correctly:

-- Check which tables have RLS enabled:
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' AND rowsecurity = true;

-- Check all policies on a table:
-- SELECT * FROM pg_policies WHERE tablename = 'WorkOrder';

-- Test as customer (replace with actual customer supabase ID):
-- SET auth.uid = '00000000-0000-0000-0000-000000000000';
-- SELECT * FROM "WorkOrder";

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Apply these policies AFTER enabling Realtime in Supabase dashboard
-- 2. Test policies with different user roles before deploying to production
-- 3. The helper functions use SECURITY DEFINER to bypass RLS when checking roles
-- 4. Customers can only see their own data, staff can see all data
-- 5. Customers can approve/reject parts and services on their work orders
-- 6. Only admins can delete critical records (work orders, payments, invoices)
-- ============================================================================
