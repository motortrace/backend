# MotorTrace Backend Database Schema Diagram

## Overview
This document provides a comprehensive database schema diagram showing the entity-relationship model for the MotorTrace backend system, focusing on the database tables and their relationships.

## Database Schema Diagram

```mermaid
erDiagram
    %% User Management
    UserProfile {
        string id PK
        string supabaseUserId UK
        string name
        string phone
        string profileImage
        UserRole role
        boolean isRegistrationComplete
        datetime createdAt
        datetime updatedAt
    }

    Customer {
        string id PK
        string userProfileId FK
        string name
        string email
        string phone
        datetime createdAt
        datetime updatedAt
    }

    ServiceAdvisor {
        string id PK
        string userProfileId FK,UK
        string employeeId UK
        string department
        string mobile
        datetime createdAt
        datetime updatedAt
    }

    Technician {
        string id PK
        string userProfileId FK,UK
        string employeeId UK
        string specialization
        string[] certifications
        datetime createdAt
        datetime updatedAt
    }

    InventoryManager {
        string id PK
        string userProfileId FK,UK
        string employeeId UK
        string department
        datetime createdAt
        datetime updatedAt
    }

    Manager {
        string id PK
        string userProfileId FK,UK
        string employeeId UK
        string department
        datetime createdAt
        datetime updatedAt
    }

    Admin {
        string id PK
        string userProfileId FK,UK
        string employeeId UK
        string[] permissions
        datetime createdAt
        datetime updatedAt
    }

    %% Vehicle Management
    Vehicle {
        string id PK
        string customerId FK
        string make
        string model
        int year
        string vin UK
        string licensePlate
        string color
        string imageUrl
        VehicleStatus status
        datetime createdAt
        datetime updatedAt
    }

    VehicleProfile {
        string id PK
        string vehicleId FK,UK
        DrivingCondition drivingCondition
        int averageDailyMileage
        string primaryUse
        string engineType
        string transmissionType
        string fuelType
        ServiceInterval preferredServiceInterval
        string[] notificationPreferences
        datetime createdAt
        datetime updatedAt
    }

    VehicleMileage {
        string id PK
        string vehicleId FK,UK
        int currentMileage
        int totalDistance
        decimal totalFuelUsed
        decimal averageEfficiency
        datetime lastUpdated
        decimal lastLocationLat
        decimal lastLocationLng
        string lastLocationName
    }

    MileageEntry {
        string id PK
        string vehicleId FK
        string recordedById FK
        int mileage
        decimal fuelUsed
        int distance
        decimal efficiency
        decimal latitude
        decimal longitude
        string locationName
        string notes
        datetime recordedAt
    }

    VehicleServiceHistory {
        string id PK
        string vehicleId FK
        string workOrderId FK
        string serviceType
        string serviceName
        datetime serviceDate
        int serviceMileage
        string provider
        decimal cost
        string notes
    }

    ServiceRecommendation {
        string id PK
        string vehicleId FK
        string ruleId FK
        RecommendationStatus status
        ServicePriority priority
        ServiceSeverity severity
        datetime triggeredAt
        int currentMileage
        datetime dueMileage
        datetime dueDate
        datetime lastServiceDate
        int lastServiceMileage
        string reason
        decimal estimatedCost
        int estimatedDuration
        datetime dismissedAt
        string dismissedReason
        datetime scheduledAt
        datetime completedAt
        datetime createdAt
        datetime updatedAt
    }

    CarExpense {
        string id PK
        string vehicleId FK
        string createdById FK
        ExpenseCategory category
        string description
        decimal amount
        datetime date
        string provider
        string receiptUrl
        string notes
        datetime createdAt
        datetime updatedAt
    }

    %% Work Order Management
    WorkOrder {
        string id PK
        string workOrderNumber UK
        string customerId FK
        string vehicleId FK
        string appointmentId FK,UK
        string advisorId FK
        WorkOrderStatus status
        JobType jobType
        JobPriority priority
        JobSource source
        string complaint
        int odometerReading
        WarrantyStatus warrantyStatus
        decimal estimatedTotal
        string estimateNotes
        boolean estimateApproved
        decimal subtotalServices
        decimal subtotalParts
        decimal subtotal
        decimal discountAmount
        string discountType
        string discountReason
        decimal taxAmount
        decimal totalAmount
        decimal paidAmount
        datetime openedAt
        datetime promisedAt
        datetime closedAt
        WorkflowStep workflowStep
        string internalNotes
        string customerNotes
        string invoiceNumber
        datetime finalizedAt
        PaymentStatus paymentStatus
        string warrantyClaimNumber
        string thirdPartyApprovalCode
        string campaignId
        string servicePackageId
        string customerSignature
        string customerFeedback
        datetime createdAt
        datetime updatedAt
    }

    WorkOrderService {
        string id PK
        string workOrderId FK
        string cannedServiceId FK
        string description
        int quantity
        decimal unitPrice
        decimal subtotal
        boolean customerApproved
        boolean customerRejected
        string customerNotes
        datetime approvedAt
        datetime rejectedAt
        ServiceStatus status
        string notes
        datetime createdAt
        datetime updatedAt
    }

    WorkOrderPart {
        string id PK
        string workOrderId FK
        string inventoryItemId FK
        string installedById FK
        string description
        int quantity
        decimal unitPrice
        decimal subtotal
        boolean customerApproved
        boolean customerRejected
        string customerNotes
        datetime approvedAt
        datetime rejectedAt
        PartSource source
        string supplierName
        string supplierInvoice
        string warrantyInfo
        string notes
        datetime installedAt
        datetime createdAt
        datetime updatedAt
    }

    WorkOrderPart {
        string id PK
        string workOrderId FK
        string inventoryItemId FK
        string installedById FK
        string description
        int quantity
        decimal unitPrice
        decimal subtotal
        boolean customerApproved
        boolean customerRejected
        string customerNotes
        datetime approvedAt
        datetime rejectedAt
        PartSource source
        string supplierName
        string supplierInvoice
        string warrantyInfo
        string notes
        datetime installedAt
        datetime createdAt
        datetime updatedAt
    }

    WorkOrderLabor {
        string id PK
        string workOrderId FK
        string serviceId FK
        string laborCatalogId FK
        string technicianId FK
        string description
        int estimatedMinutes
        datetime startTime
        datetime endTime
        int actualMinutes
        ServiceStatus status
        string notes
        datetime createdAt
        datetime updatedAt
    }

    WorkOrderInspection {
        string id PK
        string workOrderId FK
        string inspectorId FK
        string templateId FK
        datetime date
        string notes
        boolean isCompleted
    }

    InspectionChecklistItem {
        string id PK
        string inspectionId FK
        string templateItemId FK
        string category
        string item
        ChecklistStatus status
        string notes
        boolean requiresFollowUp
        datetime createdAt
    }

    TireInspection {
        string id PK
        string inspectionId FK
        TirePosition position
        string brand
        string model
        string size
        int psi
        decimal treadDepth
        string damageNotes
        datetime createdAt
    }

    WorkOrderAttachment {
        string id PK
        string workOrderId FK
        string uploadedById FK
        string fileUrl
        string fileName
        string fileType
        int fileSize
        string description
        AttachmentCategory category
        datetime uploadedAt
    }

    WorkOrderInspectionAttachment {
        string id PK
        string inspectionId FK
        string uploadedById FK
        string fileUrl
        string fileName
        string fileType
        int fileSize
        string description
        datetime uploadedAt
    }

    WorkOrderApproval {
        string id PK
        string workOrderId FK
        string approvedById FK
        ApprovalStatus status
        datetime requestedAt
        datetime approvedAt
        ApprovalMethod method
        string notes
        string customerSignature
        string pdfUrl
        string inspectionPdfUrl
        datetime createdAt
        datetime updatedAt
    }

    WorkOrderQC {
        string id PK
        string workOrderId FK
        string inspectorId FK
        boolean passed
        string notes
        datetime qcDate
        boolean reworkRequired
        string reworkNotes
        datetime createdAt
        datetime updatedAt
    }

    %% Appointment System
    Appointment {
        string id PK
        string customerId FK
        string vehicleId FK
        string assignedToId FK
        datetime requestedAt
        datetime startTime
        datetime endTime
        AppointmentStatus status
        AppointmentPriority priority
        string notes
        datetime createdAt
        datetime updatedAt
    }

    AppointmentCannedService {
        string id PK
        string appointmentId FK
        string cannedServiceId FK
        int quantity
        decimal price
        string notes
    }

    %% Inventory Management
    InventoryCategory {
        string id PK
        string name UK
    }

    InventoryItem {
        string id PK
        string categoryId FK
        string name
        string sku UK
        string partNumber UK
        string manufacturer
        string location
        int quantity
        int minStockLevel
        int maxStockLevel
        int reorderPoint
        decimal unitPrice
        string supplier
        string supplierPartNumber
        boolean core
        decimal corePrice
        datetime createdAt
        datetime updatedAt
    }

    %% Service Management
    CannedService {
        string id PK
        string code UK
        string name
        string description
        int duration
        decimal price
        boolean isAvailable
        ServiceVariantLabel variantLabel
        VehicleType vehicleType
        boolean hasOptionalParts
        boolean hasOptionalLabor
        string category
        int minVehicleAge
        int maxVehicleMileage
        boolean isArchived
        datetime createdAt
        datetime updatedAt
    }

    CannedServiceLabor {
        string id PK
        string cannedServiceId FK
        string laborCatalogId FK
        int sequence
        int estimatedMinutes
        string notes
    }

    CannedServicePartsCategory {
        string id PK
        string cannedServiceId FK
        string categoryId FK
        boolean isRequired
        string notes
    }

    LaborCatalog {
        string id PK
        string code UK
        string name
        string description
        int estimatedMinutes
        string category
        string skillLevel
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    %% Payment & Billing
    Payment {
        string id PK
        string workOrderId FK
        string processedById FK
        PaymentMethod method
        decimal amount
        string reference
        PaymentStatus status
        datetime paidAt
        string notes
        decimal refundAmount
        string refundReason
        datetime createdAt
        datetime updatedAt
    }

    Invoice {
        string id PK
        string invoiceNumber UK
        string workOrderId FK
        datetime issueDate
        datetime dueDate
        InvoiceStatus status
        decimal subtotalServices
        decimal subtotalLabor
        decimal subtotalParts
        decimal subtotal
        decimal taxAmount
        decimal discountAmount
        decimal totalAmount
        decimal paidAmount
        decimal balanceDue
        string notes
        string terms
        string pdfUrl
        datetime createdAt
        datetime updatedAt
    }

    InvoiceLineItem {
        string id PK
        string invoiceId FK
        LineItemType type
        string description
        int quantity
        decimal unitPrice
        decimal subtotal
        string workOrderServiceId
        string workOrderLaborId
        string workOrderPartId
        string notes
        datetime createdAt
        datetime updatedAt
    }

    %% Notification System
    Notification {
        string id PK
        string userProfileId FK
        string workOrderId FK
        NotificationType type
        string title
        string message
        NotificationPriority priority
        boolean isRead
        datetime readAt
        string actionUrl
        string actionText
        json metadata
        boolean sentViaEmail
        boolean sentViaPush
        datetime createdAt
        datetime updatedAt
        datetime expiresAt
    }

    %% Service Rules & Recommendations
    ServiceRule {
        string id PK
        string code UK
        string name
        string description
        ServiceRuleType ruleType
        ServicePriority priority
        ServiceSeverity severity
        int mileageInterval
        int timeIntervalMonths
        int timeIntervalDays
        string serviceType
        string serviceName
        string category
        string[] dependsOn
        string[] conflictsWith
        boolean canBundle
        string[] applicableVehicleTypes
        string[] applicableDrivingConditions
        decimal severeConditionMultiplier
        decimal offroadMultiplier
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    %% Shop Configuration
    ShopOperatingHours {
        string id PK
        DayOfWeek dayOfWeek UK
        boolean isOpen
        string openTime
        string closeTime
        datetime createdAt
        datetime updatedAt
    }

    ShopCapacitySettings {
        string id PK
        int appointmentsPerDay
        int appointmentsPerTimeBlock
        int timeBlockIntervalMinutes
        int minimumNoticeHours
        int futureSchedulingCutoffYears
        datetime createdAt
        datetime updatedAt
    }

    %% Session Management
    UserSession {
        string id PK
        string userId
        string sessionId UK
        string deviceInfo
        string ipAddress
        string userAgent
        string location
        boolean isActive
        datetime lastActivity
        datetime createdAt
        datetime expiresAt
    }

    LoginActivity {
        string id PK
        string userId
        string action
        string deviceInfo
        string ipAddress
        string userAgent
        string location
        string reason
        datetime createdAt
    }

    %% Relationships
    UserProfile ||--o{ Customer : "1:1 optional"
    UserProfile ||--o{ ServiceAdvisor : "1:1 optional"
    UserProfile ||--o{ Technician : "1:1 optional"
    UserProfile ||--o{ InventoryManager : "1:1 optional"
    UserProfile ||--o{ Manager : "1:1 optional"
    UserProfile ||--o{ Admin : "1:1 optional"
    UserProfile ||--o{ WorkOrderAttachment : "uploads"
    UserProfile ||--o{ WorkOrderInspectionAttachment : "uploads"
    UserProfile ||--o{ Notification : "receives"
    UserProfile ||--o{ WorkOrderApproval : "approves"
    UserProfile ||--o{ MileageEntry : "records"
    UserProfile ||--o{ CarExpense : "creates"

    Customer ||--o{ Vehicle : "owns"
    Customer ||--o{ WorkOrder : "has"
    Customer ||--o{ Appointment : "books"

    Vehicle ||--o{ WorkOrder : "service history"
    Vehicle ||--o{ Appointment : "scheduled"
    Vehicle ||--o{ MileageEntry : "mileage tracking"
    Vehicle ||--o{ VehicleMileage : "1:1"
    Vehicle ||--o{ ServiceRecommendation : "recommendations"
    Vehicle ||--o{ VehicleServiceHistory : "service history"
    Vehicle ||--o{ VehicleProfile : "1:1 optional"
    Vehicle ||--o{ CarExpense : "expenses"

    VehicleProfile ||--|| Vehicle : "1:1"

    VehicleMileage ||--|| Vehicle : "1:1"
    VehicleMileage ||--o{ MileageEntry : "entries"

    MileageEntry ||--o{ Vehicle : "belongs to"
    MileageEntry ||--o{ UserProfile : "recorded by"

    VehicleServiceHistory ||--o{ Vehicle : "belongs to"
    VehicleServiceHistory ||--o{ WorkOrder : "references"

    ServiceRecommendation ||--o{ Vehicle : "for"
    ServiceRecommendation ||--o{ ServiceRule : "based on"

    CarExpense ||--o{ Vehicle : "for"
    CarExpense ||--o{ UserProfile : "created by"

    WorkOrder ||--o{ Customer : "belongs to"
    WorkOrder ||--o{ Vehicle : "for"
    WorkOrder ||--o{ Appointment : "1:1 optional"
    WorkOrder ||--o{ ServiceAdvisor : "assigned to"
    WorkOrder ||--o{ WorkOrderService : "services"
    WorkOrder ||--o{ WorkOrderPart : "parts"
    WorkOrder ||--o{ WorkOrderLabor : "labor"
    WorkOrder ||--o{ Payment : "payments"
    WorkOrder ||--o{ WorkOrderInspection : "inspections"
    WorkOrder ||--o{ WorkOrderApproval : "approvals"
    WorkOrder ||--o{ WorkOrderQC : "quality checks"
    WorkOrder ||--o{ WorkOrderAttachment : "attachments"
    WorkOrder ||--o{ Invoice : "invoices"
    WorkOrder ||--o{ Notification : "notifications"
    WorkOrder ||--o{ VehicleServiceHistory : "service history"

    WorkOrderService ||--o{ WorkOrder : "belongs to"
    WorkOrderService ||--o{ CannedService : "based on"
    WorkOrderService ||--o{ WorkOrderLabor : "labor items"

    WorkOrderPart ||--o{ WorkOrder : "belongs to"
    WorkOrderPart ||--o{ InventoryItem : "uses"
    WorkOrderPart ||--o{ Technician : "installed by"

    WorkOrderLabor ||--o{ WorkOrder : "belongs to"
    WorkOrderLabor ||--o{ WorkOrderService : "part of"
    WorkOrderLabor ||--o{ LaborCatalog : "based on"
    WorkOrderLabor ||--o{ Technician : "performed by"

    WorkOrderInspection ||--o{ WorkOrder : "belongs to"
    WorkOrderInspection ||--o{ Technician : "performed by"
    WorkOrderInspection ||--o{ InspectionTemplate : "uses"
    WorkOrderInspection ||--o{ InspectionChecklistItem : "checklist"
    WorkOrderInspection ||--o{ TireInspection : "tires"
    WorkOrderInspection ||--o{ WorkOrderInspectionAttachment : "attachments"

    InspectionChecklistItem ||--o{ WorkOrderInspection : "belongs to"
    InspectionChecklistItem ||--o{ InspectionTemplateItem : "based on"

    TireInspection ||--o{ WorkOrderInspection : "belongs to"

    WorkOrderAttachment ||--o{ WorkOrder : "belongs to"
    WorkOrderAttachment ||--o{ UserProfile : "uploaded by"

    WorkOrderInspectionAttachment ||--o{ WorkOrderInspection : "belongs to"
    WorkOrderInspectionAttachment ||--o{ UserProfile : "uploaded by"

    WorkOrderApproval ||--o{ WorkOrder : "for"
    WorkOrderApproval ||--o{ UserProfile : "approved by"

    WorkOrderQC ||--o{ WorkOrder : "for"
    WorkOrderQC ||--o{ Technician : "performed by"

    Appointment ||--o{ Customer : "belongs to"
    Appointment ||--o{ Vehicle : "for"
    Appointment ||--o{ ServiceAdvisor : "assigned to"
    Appointment ||--o{ WorkOrder : "1:1 optional"
    Appointment ||--o{ AppointmentCannedService : "services"

    AppointmentCannedService ||--o{ Appointment : "belongs to"
    AppointmentCannedService ||--o{ CannedService : "references"

    InventoryCategory ||--o{ InventoryItem : "contains"
    InventoryCategory ||--o{ CannedServicePartsCategory : "used in"

    InventoryItem ||--o{ InventoryCategory : "belongs to"
    InventoryItem ||--o{ WorkOrderPart : "used in"

    CannedService ||--o{ WorkOrderService : "used in"
    CannedService ||--o{ AppointmentCannedService : "booked"
    CannedService ||--o{ CannedServiceLabor : "labor operations"
    CannedService ||--o{ CannedServicePartsCategory : "parts categories"

    CannedServiceLabor ||--o{ CannedService : "belongs to"
    CannedServiceLabor ||--o{ LaborCatalog : "references"

    CannedServicePartsCategory ||--o{ CannedService : "belongs to"
    CannedServicePartsCategory ||--o{ InventoryCategory : "references"

    LaborCatalog ||--o{ CannedServiceLabor : "used in"
    LaborCatalog ||--o{ WorkOrderLabor : "used in"

    Payment ||--o{ WorkOrder : "belongs to"
    Payment ||--o{ ServiceAdvisor : "processed by"

    Invoice ||--o{ WorkOrder : "belongs to"
    Invoice ||--o{ InvoiceLineItem : "line items"

    InvoiceLineItem ||--o{ Invoice : "belongs to"

    Notification ||--o{ UserProfile : "belongs to"
    Notification ||--o{ WorkOrder : "references"

    ServiceRule ||--o{ ServiceRecommendation : "generates"

    UserSession ||--o{ UserProfile : "belongs to"
    LoginActivity ||--o{ UserProfile : "belongs to"
```

## Database Schema Explanation

### **Core Business Entities**

#### **User Management**
- **UserProfile**: Central user entity linked to Supabase auth
- **Customer**: Customer information (optional link to UserProfile for walk-ins)
- **Staff Roles**: ServiceAdvisor, Technician, InventoryManager, Manager, Admin (inheritance from UserProfile)

#### **Vehicle Management**
- **Vehicle**: Core vehicle information
- **VehicleProfile**: Extended vehicle configuration
- **VehicleMileage**: Current mileage summary
- **MileageEntry**: Individual mileage readings
- **VehicleServiceHistory**: Service history records
- **ServiceRecommendation**: AI-generated service suggestions
- **CarExpense**: Vehicle-related expenses

#### **Work Order Management**
- **WorkOrder**: Main business transaction entity
- **WorkOrderService**: Services performed (billed items)
- **WorkOrderPart**: Parts used (inventory tracking)
- **WorkOrderLabor**: Labor operations (time tracking)
- **WorkOrderInspection**: Diagnostic inspections
- **WorkOrderAttachment**: File attachments
- **WorkOrderApproval**: Customer approvals
- **WorkOrderQC**: Quality control checks

#### **Appointment System**
- **Appointment**: Service scheduling
- **AppointmentCannedService**: Services booked in appointments

#### **Inventory Management**
- **InventoryCategory**: Parts categorization
- **InventoryItem**: Individual parts and supplies

#### **Service Management**
- **CannedService**: Predefined service packages
- **LaborCatalog**: Available labor operations
- **Service Rules**: Automated recommendation engine

#### **Financial Management**
- **Payment**: Payment transactions
- **Invoice**: Billing documents
- **InvoiceLineItem**: Invoice details

#### **Communication**
- **Notification**: System notifications
- **UserSession**: Session management
- **LoginActivity**: Authentication tracking

### **Key Relationships**

#### **Inheritance Relationships**
```
UserProfile <|-- Customer
UserProfile <|-- ServiceAdvisor
UserProfile <|-- Technician
UserProfile <|-- InventoryManager
UserProfile <|-- Manager
UserProfile <|-- Admin
```

#### **Core Business Relationships**
```
Customer -- Vehicle : "1:many"
Vehicle -- WorkOrder : "1:many"
WorkOrder -- WorkOrderService : "1:many"
WorkOrder -- WorkOrderPart : "1:many"
WorkOrder -- WorkOrderLabor : "1:many"
WorkOrderService -- WorkOrderLabor : "1:many"
```

#### **Supporting Relationships**
```
WorkOrder -- Payment : "1:many"
WorkOrder -- Invoice : "1:many"
WorkOrder -- Notification : "1:many"
Appointment -- WorkOrder : "1:1 optional"
InventoryItem -- WorkOrderPart : "1:many"
```

### **Database Design Principles**

1. **Normalized Structure**: Proper normalization to reduce redundancy
2. **Referential Integrity**: Foreign key constraints maintain data consistency
3. **Audit Trail**: Created/updated timestamps on all tables
4. **Flexible Design**: Optional fields and extensible enums
5. **Performance**: Proper indexing on frequently queried fields
6. **Scalability**: Modular design allowing for future extensions

This ER diagram provides a comprehensive view of the MotorTrace database schema, showing all tables, their attributes, and the relationships between them in a clear, standardized format.