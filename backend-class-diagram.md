# MotorTrace Backend Class Diagram (Application Architecture)

## Overview
This document provides a comprehensive class diagram showing the application architecture of the MotorTrace backend system, including controllers, services, interfaces, and their relationships.

## Class Diagram

```mermaid
classDiagram
    %% Presentation Layer - Controllers
    class UsersController {
        -usersService: IUsersService
        +getUsers(req, res): Promise<void>
        +getUserById(req, res): Promise<void>
        +createUser(req, res): Promise<void>
        +updateUser(req, res): Promise<void>
        +deleteUser(req, res): Promise<void>
        +createStaffUser(req, res): Promise<void>
    }

    class VehiclesController {
        -vehiclesService: VehiclesService
        +createVehicle(req, res): Promise<void>
        +getVehicleById(req, res): Promise<void>
        +getVehicles(req, res): Promise<void>
        +updateVehicle(req, res): Promise<void>
        +deleteVehicle(req, res): Promise<void>
        +getVehiclesByCustomer(req, res): Promise<void>
        +uploadVehicleImage(req, res): Promise<void>
    }

    class WorkOrderController {
        -workOrderService: IWorkOrderService
        +createWorkOrder(req, res): Promise<void>
        +getWorkOrders(req, res): Promise<void>
        +getWorkOrderById(req, res): Promise<void>
        +updateWorkOrder(req, res): Promise<void>
        +deleteWorkOrder(req, res): Promise<void>
        +createWorkOrderService(req, res): Promise<void>
        +createPayment(req, res): Promise<void>
        +generateEstimate(req, res): Promise<void>
        +approveService(req, res): Promise<void>
        +rejectService(req, res): Promise<void>
    }

    %% Business Logic Layer - Services & Interfaces
    class IUsersService {
        <<interface>>
        +getUsers(): Promise<UserProfile[]>
        +getUserById(id: string): Promise<UserProfile | null>
        +createUser(data: CreateUserData): Promise<UserProfile>
        +updateUser(id: string, data: UpdateUserData): Promise<UserProfile>
        +deleteUser(id: string): Promise<void>
        +createServiceAdvisor(userProfileId: string, employeeId?: string): Promise<any>
        +createTechnician(userProfileId: string, employeeId?: string): Promise<any>
        +createInventoryManager(userProfileId: string, employeeId?: string): Promise<any>
        +createManager(userProfileId: string, employeeId?: string): Promise<any>
        +createAdmin(userProfileId: string, employeeId?: string): Promise<any>
    }

    class UsersService {
        -prisma: PrismaClient
        +getUsers(): Promise<UserProfile[]>
        +getUserById(id: string): Promise<UserProfile | null>
        +createUser(data: CreateUserData): Promise<UserProfile>
        +updateUser(id: string, data: UpdateUserData): Promise<UserProfile>
        +deleteUser(id: string): Promise<void>
        +createServiceAdvisor(userProfileId: string, employeeId?: string): Promise<any>
        +createTechnician(userProfileId: string, employeeId?: string): Promise<any>
        +createInventoryManager(userProfileId: string, employeeId?: string): Promise<any>
        +createManager(userProfileId: string, employeeId?: string): Promise<any>
        +createAdmin(userProfileId: string, employeeId?: string): Promise<any>
    }

    class VehiclesService {
        -prisma: PrismaClient
        +createVehicle(data: CreateVehicleRequest): Promise<Vehicle>
        +getVehicleById(id: string): Promise<Vehicle>
        +getVehicles(filters: VehicleFilters): Promise<Vehicle[]>
        +updateVehicle(id: string, data: UpdateVehicleRequest): Promise<Vehicle>
        +deleteVehicle(id: string): Promise<void>
        +getVehiclesByCustomer(customerId: string): Promise<Vehicle[]>
        +getVehicleMileage(id: string): Promise<VehicleMileage>
        +getVehicleRecommendations(id: string, status?: string): Promise<ServiceRecommendation[]>
        +getVehicleStatistics(): Promise<VehicleStatistics>
        +searchVehicles(query: string): Promise<Vehicle[]>
    }

    class IWorkOrderService {
        <<interface>>
        +createWorkOrder(data: CreateWorkOrderRequest): Promise<string>
        +getWorkOrders(filters: WorkOrderFilters): Promise<WorkOrder[]>
        +getWorkOrderById(id: string): Promise<WorkOrder>
        +updateWorkOrder(id: string, data: UpdateWorkOrderRequest): Promise<WorkOrder>
        +deleteWorkOrder(id: string): Promise<WorkOrder>
        +createWorkOrderService(data: CreateWorkOrderServiceRequest): Promise<WorkOrderService>
        +createPayment(data: CreatePaymentRequest): Promise<Payment>
        +generateEstimatePDF(workOrderId: string): Promise<string>
        +approveService(serviceId: string, customerId: string, notes?: string): Promise<string>
        +rejectService(serviceId: string, customerId: string, reason: string): Promise<string>
    }

    %% Data Access Layer
    class PrismaClient {
        +userProfile: UserProfileDelegate
        +customer: CustomerDelegate
        +vehicle: VehicleDelegate
        +workOrder: WorkOrderDelegate
        +serviceAdvisor: ServiceAdvisorDelegate
        +technician: TechnicianDelegate
        +inventoryManager: InventoryManagerDelegate
        +manager: ManagerDelegate
        +admin: AdminDelegate
        +workOrderService: WorkOrderServiceDelegate
        +workOrderPart: WorkOrderPartDelegate
        +workOrderLabor: WorkOrderLaborDelegate
        +payment: PaymentDelegate
        +inspection: InspectionDelegate
        +$connect(): Promise<void>
        +$disconnect(): Promise<void>
        +$transaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T>
    }

    %% Domain Models (Data Transfer Objects)
    class UserProfile {
        +id: string
        +supabaseUserId: string
        +name: string
        +phone?: string
        +profileImage?: string
        +role: UserRole
        +isRegistrationComplete: boolean
        +createdAt: DateTime
        +updatedAt: DateTime
    }

    class Vehicle {
        +id: string
        +customerId: string
        +make: string
        +model: string
        +year?: Int
        +vin?: string
        +licensePlate?: string
        +color?: string
        +imageUrl?: string
        +status: VehicleStatus
        +createdAt: DateTime
        +updatedAt: DateTime
    }

    class WorkOrder {
        +id: string
        +workOrderNumber: string
        +customerId: string
        +vehicleId: string
        +appointmentId?: string
        +advisorId?: string
        +status: WorkOrderStatus
        +jobType: JobType
        +priority: JobPriority
        +source: JobSource
        +complaint?: string
        +odometerReading?: Int
        +warrantyStatus: WarrantyStatus
        +estimatedTotal?: Decimal
        +estimateNotes?: string
        +estimateApproved: boolean
        +subtotalServices?: Decimal
        +subtotalParts?: Decimal
        +subtotal?: Decimal
        +discountAmount?: Decimal
        +discountType?: string
        +discountReason?: string
        +taxAmount?: Decimal
        +totalAmount?: Decimal
        +paidAmount?: Decimal
        +openedAt?: DateTime
        +promisedAt?: DateTime
        +closedAt?: DateTime
        +workflowStep: WorkflowStep
        +internalNotes?: string
        +customerNotes?: string
        +invoiceNumber?: string
        +finalizedAt?: DateTime
        +paymentStatus: PaymentStatus
        +warrantyClaimNumber?: string
        +thirdPartyApprovalCode?: string
        +campaignId?: string
        +servicePackageId?: string
        +customerSignature?: string
        +customerFeedback?: string
        +createdAt: DateTime
        +updatedAt: DateTime
    }

    %% Enums
    class UserRole {
        <<enumeration>>
        CUSTOMER
        ADMIN
        MANAGER
        SERVICE_ADVISOR
        INVENTORY_MANAGER
        TECHNICIAN
    }

    class WorkOrderStatus {
        <<enumeration>>
        PENDING
        AWAITING_APPROVAL
        APPROVED
        IN_PROGRESS
        COMPLETED
        INVOICED
        PAID
        CANCELLED
    }

    class ServiceStatus {
        <<enumeration>>
        ESTIMATED
        PENDING
        IN_PROGRESS
        COMPLETED
        CANCELLED
    }

    class PaymentMethod {
        <<enumeration>>
        CASH
        CREDIT_CARD
        DEBIT_CARD
        BANK_TRANSFER
        UPI
        CHEQUE
        DIGITAL_WALLET
        INSURANCE
        WARRANTY
    }

    class PaymentStatus {
        <<enumeration>>
        PENDING
        PARTIALLY_PAID
        PAID
        OVERDUE
        COMPLETED
        FAILED
        REFUNDED
        PARTIAL_REFUND
        CANCELLED
    }

    class VehicleStatus {
        <<enumeration>>
        ACTIVE
        MAINTENANCE
        INACTIVE
        ISSUES
    }

    class AppointmentStatus {
        <<enumeration>>
        PENDING
        CONFIRMED
        IN_PROGRESS
        COMPLETED
        CANCELLED
        NO_SHOW
    }

    class PartSource {
        <<enumeration>>
        INVENTORY
        SUPPLIER
        CUSTOMER_SUPPLIED
        WARRANTY
        SALVAGE
    }

    %% Relationships
    UsersController ..> IUsersService : uses
    UsersService ..|> IUsersService : implements
    UsersService --> PrismaClient : uses

    VehiclesController --> VehiclesService : uses
    VehiclesService --> PrismaClient : uses

    WorkOrderController --> IWorkOrderService : uses

    %% Styling
    classDef controller fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef service fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef interface fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef dataAccess fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef domain fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef enum fill:#f9fbe7,stroke:#827717,stroke-width:2px

    class UsersController, VehiclesController, WorkOrderController controller
    class UsersService, VehiclesService service
    class IUsersService, IWorkOrderService interface
    class PrismaClient dataAccess
    class UserProfile, Vehicle, WorkOrder domain
    class UserRole, WorkOrderStatus, ServiceStatus, PaymentMethod, PaymentStatus, VehicleStatus, AppointmentStatus, PartSource enum
```

## Class Diagram Explanation

### **Presentation Layer (Controllers)**
- **UsersController**: Handles HTTP requests for user management operations
- **VehiclesController**: Manages vehicle CRUD operations and image uploads
- **WorkOrderController**: Orchestrates work order lifecycle and approvals

### **Business Logic Layer (Services)**
- **IUsersService**: Interface defining user service contract
- **UsersService**: Implementation of user business logic with Prisma integration
- **VehiclesService**: Vehicle-related business operations
- **IWorkOrderService**: Work order service interface

### **Data Access Layer**
- **PrismaClient**: Type-safe database client providing ORM functionality

### **Domain Models**
- **UserProfile**: User data transfer object
- **Vehicle**: Vehicle data transfer object
- **WorkOrder**: Work order data transfer object

### **Enumerations**
- **UserRole**: Defines user types in the system
- **WorkOrderStatus**: Work order lifecycle states
- **ServiceStatus**: Service operation states
- **PaymentMethod/PaymentStatus**: Payment processing states
- **VehicleStatus**: Vehicle condition states
- **AppointmentStatus**: Appointment scheduling states
- **PartSource**: Origin of parts used

### **Design Patterns Implemented**
1. **Dependency Injection**: Services injected into controllers
2. **Interface Segregation**: Specific interfaces for different services
3. **Repository Pattern**: PrismaClient provides data access abstraction
4. **Service Layer Pattern**: Business logic separated from controllers
5. **Data Transfer Objects**: Domain models for data exchange

This class diagram shows the application architecture with clear separation of concerns between presentation, business logic, and data access layers.
    %% Core User Management
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

    %% Core Vehicle Management
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

    %% Core Work Order Management
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

    %% Core Appointment System
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

    %% Core Inventory Management
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

    %% Core Service Management
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

    %% Core Financial Management
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

    %% Core Communication
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

    %% Relationships
    UserProfile ||--o{ Customer : "1:1 optional"
    UserProfile ||--o{ ServiceAdvisor : "1:1 optional"
    UserProfile ||--o{ Technician : "1:1 optional"

    Customer ||--o{ Vehicle : "owns"
    Customer ||--o{ WorkOrder : "has orders"
    Customer ||--o{ Appointment : "books"

    Vehicle ||--o{ WorkOrder : "service history"
    Vehicle ||--o{ Appointment : "scheduled for"
    Vehicle ||--o{ VehicleMileage : "1:1"
    Vehicle ||--o{ MileageEntry : "mileage tracking"

    VehicleMileage ||--o{ MileageEntry : "entries"

    WorkOrder ||--o{ WorkOrderService : "services"
    WorkOrder ||--o{ WorkOrderPart : "parts"
    WorkOrder ||--o{ WorkOrderLabor : "labor"
    WorkOrder ||--o{ Payment : "payments"
    WorkOrder ||--o{ Invoice : "invoices"
    WorkOrder ||--o{ Notification : "notifications"

    WorkOrderService ||--o{ WorkOrderLabor : "labor items"

    WorkOrderPart ||--o{ InventoryItem : "uses part"

    WorkOrderLabor ||--o{ LaborCatalog : "based on"

    ServiceAdvisor ||--o{ WorkOrder : "assigned to"
    ServiceAdvisor ||--o{ Appointment : "assigned to"
    ServiceAdvisor ||--o{ Payment : "processed"

    Technician ||--o{ WorkOrderLabor : "performs"
    Technician ||--o{ WorkOrderPart : "installs"

    Appointment ||--o{ WorkOrder : "1:1 optional"

    InventoryCategory ||--o{ InventoryItem : "contains"

    InventoryItem ||--o{ WorkOrderPart : "used in"

    LaborCatalog ||--o{ WorkOrderLabor : "used in"

    CannedService ||--o{ WorkOrderService : "used in"
    CannedService ||--o{ Appointment : "booked"

    Payment ||--o{ ServiceAdvisor : "processed by"

    Invoice ||--o{ WorkOrder : "belongs to"

    Notification ||--o{ UserProfile : "belongs to"
    Notification ||--o{ WorkOrder : "references"
```

## Database Schema Explanation

### **Core Business Entities**

#### **1. User Management**
- **UserProfile**: Central user entity with Supabase authentication
- **Customer**: Customer information (supports walk-ins)
- **ServiceAdvisor**: Service advisors with employee details
- **Technician**: Technicians with certifications and specializations

#### **2. Vehicle Management**
- **Vehicle**: Core vehicle information with specifications
- **VehicleMileage**: Current mileage summary and statistics
- **MileageEntry**: Individual mileage readings with GPS data

#### **3. Work Order Management**
- **WorkOrder**: Main business transaction entity
- **WorkOrderService**: Services performed (customer billed items)
- **WorkOrderPart**: Parts used in service (inventory tracking)
- **WorkOrderLabor**: Labor operations performed (time tracking)

#### **4. Appointment System**
- **Appointment**: Service scheduling and booking

#### **5. Inventory Management**
- **InventoryCategory**: Parts categorization
- **InventoryItem**: Individual parts and supplies
- **LaborCatalog**: Available labor operations

#### **6. Service Management**
- **CannedService**: Predefined service packages

#### **7. Financial Management**
- **Payment**: Payment transactions
- **Invoice**: Billing documents

#### **8. Communication**
- **Notification**: System notifications and alerts

### **Key Relationships**

#### **User Hierarchy**
```
UserProfile <|-- Customer
UserProfile <|-- ServiceAdvisor
UserProfile <|-- Technician
```

#### **Core Business Flow**
```
Customer -- Vehicle -- WorkOrder -- WorkOrderService
                           |          |
                           |          |-- WorkOrderPart
                           |          |-- WorkOrderLabor
                           |
                           |-- Appointment
                           |-- Payment
                           |-- Invoice
```

#### **Inventory Integration**
```
InventoryCategory -- InventoryItem -- WorkOrderPart
LaborCatalog -- WorkOrderLabor
```

### **Database Design Principles**

1. **Normalized Structure**: Proper relationships and foreign keys
2. **Referential Integrity**: Foreign key constraints maintain consistency
3. **Audit Trail**: Created/updated timestamps on all entities
4. **Flexible Design**: Optional fields and extensible enums
5. **Performance**: Strategic indexing on frequently queried fields
6. **Scalability**: Modular design supporting future extensions

This ER diagram represents the complete database schema for the MotorTrace automotive service management system, showing all tables with their attributes and relationships in a clear, standardized format suitable for SRS documentation.