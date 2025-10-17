# MotorTrace Backend Database Schema - Focused Diagrams

## Overview
This document provides focused, smaller ER diagrams for specific domains of the MotorTrace backend system to avoid overlapping arrows and improve readability.

## 1. User Management Domain

```mermaid
erDiagram
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
    UserProfile ||--o{ UserSession : "has sessions"
    UserProfile ||--o{ LoginActivity : "login history"
```

## 2. Vehicle Management Domain

```mermaid
erDiagram
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

    %% Relationships
    Vehicle ||--o{ VehicleProfile : "1:1 optional"
    Vehicle ||--o{ VehicleMileage : "1:1"
    Vehicle ||--o{ MileageEntry : "mileage tracking"
    Vehicle ||--o{ VehicleServiceHistory : "service history"
    Vehicle ||--o{ ServiceRecommendation : "recommendations"
    Vehicle ||--o{ CarExpense : "expenses"

    VehicleMileage ||--o{ MileageEntry : "entries"
    ServiceRule ||--o{ ServiceRecommendation : "generates"
```

## 3. Work Order Core Domain

```mermaid
erDiagram
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

    %% Relationships
    WorkOrder ||--o{ WorkOrderService : "services"
    WorkOrder ||--o{ WorkOrderPart : "parts"
    WorkOrder ||--o{ WorkOrderLabor : "labor"

    WorkOrderService ||--o{ WorkOrderLabor : "labor items"
```

## 4. Appointment & Scheduling Domain

```mermaid
erDiagram
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

    %% Relationships
    Appointment ||--o{ AppointmentCannedService : "services"
    AppointmentCannedService ||--o{ CannedService : "references"
```

## 5. Inventory & Parts Domain

```mermaid
erDiagram
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

    %% Relationships
    InventoryCategory ||--o{ InventoryItem : "contains"
    InventoryCategory ||--o{ CannedServicePartsCategory : "used in"
    InventoryItem ||--o{ CannedServicePartsCategory : "references"
    LaborCatalog ||--o{ CannedServiceLabor : "used in"
```

## 6. Financial Domain

```mermaid
erDiagram
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

    %% Relationships
    Invoice ||--o{ InvoiceLineItem : "line items"
```

## 7. Communication & Notifications Domain

```mermaid
erDiagram
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

    %% Relationships
    Notification ||--o{ UserProfile : "belongs to"
    Notification ||--o{ WorkOrder : "references"
    WorkOrderAttachment ||--o{ WorkOrder : "belongs to"
    WorkOrderAttachment ||--o{ UserProfile : "uploaded by"
    WorkOrderInspectionAttachment ||--o{ WorkOrderInspection : "belongs to"
    WorkOrderInspectionAttachment ||--o{ UserProfile : "uploaded by"
```

## Summary

These focused ER diagrams break down the complex database schema into manageable, readable sections:

1. **User Management** - User profiles and staff roles
2. **Vehicle Management** - Vehicles and related tracking
3. **Work Order Core** - Main business transactions
4. **Appointment & Scheduling** - Service booking system
5. **Inventory & Parts** - Parts and labor catalog
6. **Financial** - Payments and invoicing
7. **Communication** - Notifications and file attachments

Each diagram focuses on a specific business domain, eliminating overlapping arrows and providing clear, readable relationship visualizations. This approach is much better for documentation and understanding than one massive diagram.