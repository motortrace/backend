import { InspectionTemplatesService } from '../../../modules/inspection-templates/inspection-templates.service';
import { PrismaClient, ChecklistStatus } from '@prisma/client';
import { CreateInspectionTemplateRequest, UpdateInspectionTemplateRequest, AssignTemplateToWorkOrderRequest, CreateInspectionFromTemplateRequest, CreateChecklistItemRequest, UpdateChecklistItemRequest, InspectionTemplateFilters, WorkOrderInspectionFilters } from '../../../modules/inspection-templates/inspection-templates.types';

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    inspectionTemplate: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    workOrderInspection: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    inspectionChecklistItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workOrderInspectionAttachment: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    workOrder: {
      findUnique: jest.fn(),
    },
    technician: {
      findUnique: jest.fn(),
    },
  })),
}));

describe('InspectionTemplatesService', () => {
  let inspectionTemplatesService: InspectionTemplatesService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    inspectionTemplatesService = new InspectionTemplatesService(mockPrisma);
  });

  describe('createInspectionTemplate', () => {
    it('should create an inspection template successfully', async () => {
      // Arrange
      const templateData: CreateInspectionTemplateRequest = {
        name: 'Full Vehicle Inspection',
        description: 'Complete vehicle inspection template',
        category: 'MAINTENANCE',
        isActive: true,
        templateItems: [
          {
            name: 'Engine Check',
            category: 'ENGINE',
            sortOrder: 1,
            isRequired: true,
            allowsNotes: true
          },
          {
            name: 'Brake Inspection',
            category: 'BRAKES',
            sortOrder: 2,
            isRequired: true,
            allowsNotes: false
          }
        ]
      };

      const mockCreatedTemplate = {
        id: 'template123',
        ...templateData,
        createdAt: new Date(),
        updatedAt: new Date(),
        templateItems: [
          { id: 'item1', name: 'Engine Check', category: 'ENGINE', sortOrder: 1 },
          { id: 'item2', name: 'Brake Inspection', category: 'BRAKES', sortOrder: 2 }
        ]
      };

      mockPrisma.inspectionTemplate.create.mockResolvedValue(mockCreatedTemplate as any);

      // Act
      const result = await inspectionTemplatesService.createInspectionTemplate(templateData);

      // Assert
      expect(mockPrisma.inspectionTemplate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Full Vehicle Inspection',
          category: 'MAINTENANCE',
          templateItems: {
            create: expect.arrayContaining([
              expect.objectContaining({ name: 'Engine Check', category: 'ENGINE' }),
              expect.objectContaining({ name: 'Brake Inspection', category: 'BRAKES' })
            ])
          }
        }),
        include: { templateItems: { orderBy: { sortOrder: 'asc' } } }
      });
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Full Vehicle Inspection');
    });

    it('should handle creation error', async () => {
      // Arrange
      const templateData: CreateInspectionTemplateRequest = {
        name: 'Test Template',
        category: 'MAINTENANCE'
      };

      mockPrisma.inspectionTemplate.create.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await inspectionTemplatesService.createInspectionTemplate(templateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create inspection template');
    });
  });

  describe('getInspectionTemplate', () => {
    it('should return inspection template when found', async () => {
      // Arrange
      const templateId = 'template123';
      const mockTemplate = {
        id: templateId,
        name: 'Full Vehicle Inspection',
        category: 'MAINTENANCE',
        templateItems: [
          { id: 'item1', name: 'Engine Check', sortOrder: 1 },
          { id: 'item2', name: 'Brake Inspection', sortOrder: 2 }
        ]
      };

      mockPrisma.inspectionTemplate.findUnique.mockResolvedValue(mockTemplate as any);

      // Act
      const result = await inspectionTemplatesService.getInspectionTemplate(templateId);

      // Assert
      expect(mockPrisma.inspectionTemplate.findUnique).toHaveBeenCalledWith({
        where: { id: templateId },
        include: { templateItems: { orderBy: { sortOrder: 'asc' } } }
      });
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(templateId);
    });

    it('should return error when template not found', async () => {
      // Arrange
      const templateId = 'nonexistent';
      mockPrisma.inspectionTemplate.findUnique.mockResolvedValue(null);

      // Act
      const result = await inspectionTemplatesService.getInspectionTemplate(templateId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Inspection template not found');
    });
  });

  describe('getInspectionTemplates', () => {
    it('should return inspection templates with filters and pagination', async () => {
      // Arrange
      const filters: InspectionTemplateFilters = {
        category: 'MAINTENANCE',
        isActive: true,
        search: 'vehicle'
      };

      const mockTemplates = [
        {
          id: 'template1',
          name: 'Vehicle Inspection',
          category: 'MAINTENANCE',
          templateItems: []
        }
      ];

      mockPrisma.inspectionTemplate.findMany.mockResolvedValue(mockTemplates as any);
      mockPrisma.inspectionTemplate.count.mockResolvedValue(1);

      // Act
      const result = await inspectionTemplatesService.getInspectionTemplates(filters, 1, 10);

      // Assert
      expect(mockPrisma.inspectionTemplate.findMany).toHaveBeenCalledWith({
        where: {
          category: 'MAINTENANCE',
          isActive: true,
          OR: [
            { name: { contains: 'vehicle', mode: 'insensitive' } },
            { description: { contains: 'vehicle', mode: 'insensitive' } },
            { category: { contains: 'vehicle', mode: 'insensitive' } }
          ]
        },
        include: { templateItems: { orderBy: { sortOrder: 'asc' } } },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        skip: 0,
        take: 10
      });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.pagination?.total).toBe(1);
    });
  });

  describe('updateInspectionTemplate', () => {
    it('should update inspection template successfully', async () => {
      // Arrange
      const templateId = 'template123';
      const updateData: UpdateInspectionTemplateRequest = {
        name: 'Updated Template Name',
        category: 'REPAIR'
      };

      const mockUpdatedTemplate = {
        id: templateId,
        name: 'Updated Template Name',
        category: 'REPAIR',
        templateItems: []
      };

      mockPrisma.inspectionTemplate.update.mockResolvedValue(mockUpdatedTemplate as any);

      // Act
      const result = await inspectionTemplatesService.updateInspectionTemplate(templateId, updateData);

      // Assert
      expect(mockPrisma.inspectionTemplate.update).toHaveBeenCalledWith({
        where: { id: templateId },
        data: updateData,
        include: { templateItems: { orderBy: { sortOrder: 'asc' } } }
      });
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Updated Template Name');
    });
  });

  describe('deleteInspectionTemplate', () => {
    it('should delete inspection template successfully', async () => {
      // Arrange
      const templateId = 'template123';
      const mockTemplate = {
        id: templateId,
        name: 'Test Template',
        _count: { workOrderInspections: 0 }
      };

      mockPrisma.inspectionTemplate.findUnique.mockResolvedValue(mockTemplate as any);

      // Act
      const result = await inspectionTemplatesService.deleteInspectionTemplate(templateId);

      // Assert
      expect(mockPrisma.workOrderInspection.count).toHaveBeenCalledWith({
        where: { templateId }
      });
      expect(mockPrisma.inspectionTemplate.delete).toHaveBeenCalledWith({
        where: { id: templateId }
      });
      expect(result.success).toBe(true);
    });

    it('should prevent deletion when template is in use', async () => {
      // Arrange
      const templateId = 'template123';
      const mockTemplate = {
        id: templateId,
        name: 'Test Template',
        _count: { workOrderInspections: 3 }
      };

      mockPrisma.inspectionTemplate.findUnique.mockResolvedValue(mockTemplate as any);

      // Act
      const result = await inspectionTemplatesService.deleteInspectionTemplate(templateId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot delete template. It is being used in 3 inspection(s).');
    });
  });

  describe('assignTemplateToWorkOrder', () => {
    it('should assign template to work order successfully', async () => {
      // Arrange
      const assignData: AssignTemplateToWorkOrderRequest = {
        workOrderId: 'wo123',
        templateId: 'template123',
        inspectorId: 'inspector123',
        notes: 'Initial inspection'
      };

      const mockWorkOrder = { id: 'wo123' };
      const mockTemplate = {
        id: 'template123',
        name: 'Full Inspection',
        templateItems: [
          { id: 'item1', name: 'Engine Check', category: 'ENGINE' },
          { id: 'item2', name: 'Brake Check', category: 'BRAKES' }
        ]
      };
      const mockInspector = { id: 'inspector123' };
      const mockInspection = {
        id: 'inspection123',
        workOrderId: 'wo123',
        templateId: 'template123',
        inspectorId: 'inspector123',
        template: mockTemplate,
        workOrder: { id: 'wo123', workOrderNumber: 'WO-001' }
      };

      mockPrisma.workOrder.findUnique.mockResolvedValue(mockWorkOrder as any);
      mockPrisma.inspectionTemplate.findFirst.mockResolvedValue(mockTemplate as any);
      mockPrisma.technician.findUnique.mockResolvedValue(mockInspector as any);
      mockPrisma.workOrderInspection.create.mockResolvedValue(mockInspection as any);
      mockPrisma.inspectionChecklistItem.create.mockResolvedValue({} as any);

      // Act
      const result = await inspectionTemplatesService.assignTemplateToWorkOrder(assignData);

      // Assert
      expect(mockPrisma.workOrderInspection.create).toHaveBeenCalledWith({
        data: {
          workOrderId: 'wo123',
          inspectorId: 'inspector123',
          templateId: 'template123',
          notes: 'Initial inspection',
          isCompleted: false
        },
        include: expect.any(Object)
      });
      expect(mockPrisma.inspectionChecklistItem.create).toHaveBeenCalledTimes(2); // Two template items
      expect(result.success).toBe(true);
      expect(result.data?.inspection.id).toBe('inspection123');
    });

    it('should return error when work order not found', async () => {
      // Arrange
      const assignData: AssignTemplateToWorkOrderRequest = {
        workOrderId: 'nonexistent',
        templateId: 'template123'
      };

      mockPrisma.workOrder.findUnique.mockResolvedValue(null);

      // Act
      const result = await inspectionTemplatesService.assignTemplateToWorkOrder(assignData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Work order not found');
    });

    it('should return error when template not found or inactive', async () => {
      // Arrange
      const assignData: AssignTemplateToWorkOrderRequest = {
        workOrderId: 'wo123',
        templateId: 'nonexistent'
      };

      const mockWorkOrder = { id: 'wo123' };

      mockPrisma.workOrder.findUnique.mockResolvedValue(mockWorkOrder as any);
      mockPrisma.inspectionTemplate.findFirst.mockResolvedValue(null);

      // Act
      const result = await inspectionTemplatesService.assignTemplateToWorkOrder(assignData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Inspection template not found or inactive');
    });
  });

  describe('getWorkOrderInspection', () => {
    it('should return work order inspection when found', async () => {
      // Arrange
      const inspectionId = 'inspection123';
      const mockInspection = {
        id: inspectionId,
        workOrderId: 'wo123',
        templateId: 'template123',
        checklistItems: [
          { id: 'item1', item: 'Engine Check', status: ChecklistStatus.GREEN }
        ],
        inspector: { id: 'inspector123', userProfile: { name: 'John Doe' } },
        workOrder: { id: 'wo123', workOrderNumber: 'WO-001' },
        template: { id: 'template123', name: 'Full Inspection' }
      };

      mockPrisma.workOrderInspection.findUnique.mockResolvedValue(mockInspection as any);

      // Act
      const result = await inspectionTemplatesService.getWorkOrderInspection(inspectionId);

      // Assert
      expect(mockPrisma.workOrderInspection.findUnique).toHaveBeenCalledWith({
        where: { id: inspectionId },
        include: expect.any(Object)
      });
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(inspectionId);
    });

    it('should return error when inspection not found', async () => {
      // Arrange
      const inspectionId = 'nonexistent';
      mockPrisma.workOrderInspection.findUnique.mockResolvedValue(null);

      // Act
      const result = await inspectionTemplatesService.getWorkOrderInspection(inspectionId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Work order inspection not found');
    });
  });

  describe('getWorkOrderInspections', () => {
    it('should return work order inspections with filters', async () => {
      // Arrange
      const filters: WorkOrderInspectionFilters = {
        workOrderId: 'wo123',
        inspectorId: 'inspector123',
        isCompleted: false
      };

      const mockInspections = [
        {
          id: 'inspection1',
          workOrderId: 'wo123',
          inspectorId: 'inspector123',
          isCompleted: false,
          workOrder: { id: 'wo123', workOrderNumber: 'WO-001' },
          template: { id: 'template123', name: 'Full Inspection' }
        }
      ];

      mockPrisma.workOrderInspection.findMany.mockResolvedValue(mockInspections as any);
      mockPrisma.workOrderInspection.count.mockResolvedValue(1);

      // Act
      const result = await inspectionTemplatesService.getWorkOrderInspections(filters, 1, 10);

      // Assert
      expect(mockPrisma.workOrderInspection.findMany).toHaveBeenCalledWith({
        where: {
          workOrderId: 'wo123',
          inspectorId: 'inspector123',
          isCompleted: false
        },
        include: expect.any(Object),
        orderBy: { date: 'desc' },
        skip: 0,
        take: 10
      });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('updateChecklistItem', () => {
    it('should update checklist item successfully', async () => {
      // Arrange
      const itemId = 'item123';
      const updateData: UpdateChecklistItemRequest = {
        status: ChecklistStatus.RED,
        notes: 'Issue found',
        requiresFollowUp: true
      };

      const mockUpdatedItem = {
        id: itemId,
        inspection: {
          id: 'inspection123',
          workOrder: { workOrderNumber: 'WO-001' }
        }
      };

      mockPrisma.inspectionChecklistItem.update.mockResolvedValue(mockUpdatedItem as any);

      // Act
      const result = await inspectionTemplatesService.updateChecklistItem(itemId, updateData);

      // Assert
      expect(mockPrisma.inspectionChecklistItem.update).toHaveBeenCalledWith({
        where: { id: itemId },
        data: updateData,
        include: expect.any(Object)
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Checklist item updated successfully');
    });
  });

  describe('addChecklistItem', () => {
    it('should add checklist item successfully', async () => {
      // Arrange
      const inspectionId = 'inspection123';
      const itemData: CreateChecklistItemRequest = {
        item: 'Custom Check',
        category: 'CUSTOM',
        status: ChecklistStatus.GREEN,
        notes: 'Additional check'
      };

      mockPrisma.inspectionChecklistItem.create.mockResolvedValue({} as any);
      mockPrisma.workOrderInspection.findUnique.mockResolvedValue({
        id: inspectionId,
        workOrderNumber: 'WO-001'
      } as any);

      // Act
      const result = await inspectionTemplatesService.addChecklistItem(inspectionId, itemData);

      // Assert
      expect(mockPrisma.inspectionChecklistItem.create).toHaveBeenCalledWith({
        data: {
          inspectionId,
          templateItemId: undefined,
          category: 'CUSTOM',
          item: 'Custom Check',
          status: ChecklistStatus.GREEN,
          notes: 'Additional check',
          requiresFollowUp: false
        }
      });
      expect(result.success).toBe(true);
    });
  });

  describe('deleteChecklistItem', () => {
    it('should delete checklist item successfully', async () => {
      // Arrange
      const itemId = 'item123';
      const mockItem = {
        id: itemId,
        inspectionId: 'inspection123'
      };

      mockPrisma.inspectionChecklistItem.findUnique.mockResolvedValue(mockItem as any);
      mockPrisma.inspectionChecklistItem.delete.mockResolvedValue({} as any);
      mockPrisma.workOrderInspection.findUnique.mockResolvedValue({
        id: 'inspection123',
        workOrderNumber: 'WO-001'
      } as any);

      // Act
      const result = await inspectionTemplatesService.deleteChecklistItem(itemId);

      // Assert
      expect(mockPrisma.inspectionChecklistItem.delete).toHaveBeenCalledWith({
        where: { id: itemId }
      });
      expect(result.success).toBe(true);
    });

    it('should return error when checklist item not found', async () => {
      // Arrange
      const itemId = 'nonexistent';
      mockPrisma.inspectionChecklistItem.findUnique.mockResolvedValue(null);

      // Act
      const result = await inspectionTemplatesService.deleteChecklistItem(itemId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Checklist item not found');
    });
  });

  describe('getWorkOrderInspectionStatus', () => {
    it('should return inspection status for work order', async () => {
      // Arrange
      const workOrderId = 'wo123';
      const mockInspections = [
        {
          id: 'inspection1',
          workOrderId,
          isCompleted: true,
          template: { name: 'Full Inspection' },
          inspector: { userProfile: { name: 'John Doe' } },
          checklistItems: [
            { id: 'item1', item: 'Engine Check', status: ChecklistStatus.GREEN, requiresFollowUp: false }
          ]
        },
        {
          id: 'inspection2',
          workOrderId,
          isCompleted: false,
          template: { name: 'Brake Inspection' },
          inspector: { userProfile: { name: 'Jane Smith' } },
          checklistItems: [
            { id: 'item2', item: 'Brake Check', status: ChecklistStatus.RED, requiresFollowUp: true, notes: 'Needs repair' }
          ]
        }
      ];

      mockPrisma.workOrderInspection.findMany.mockResolvedValue(mockInspections as any);

      // Act
      const result = await inspectionTemplatesService.getWorkOrderInspectionStatus(workOrderId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.totalInspections).toBe(2);
      expect(result.data?.completedInspections).toBe(1);
      expect(result.data?.pendingInspections).toBe(1);
      expect(result.data?.allCompleted).toBe(false);
      expect(result.data?.inspections).toHaveLength(2);
    });

    it('should return empty status when no inspections exist', async () => {
      // Arrange
      const workOrderId = 'wo123';
      mockPrisma.workOrderInspection.findMany.mockResolvedValue([]);

      // Act
      const result = await inspectionTemplatesService.getWorkOrderInspectionStatus(workOrderId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.totalInspections).toBe(0);
      expect(result.data?.completedInspections).toBe(0);
      expect(result.data?.allCompleted).toBe(false);
      expect(result.data?.inspections).toEqual([]);
    });
  });

  describe('canProceedToEstimate', () => {
    it('should allow proceeding when all inspections completed and no follow-ups needed', async () => {
      // Arrange
      const workOrderId = 'wo123';
      const mockInspections = [
        {
          id: 'inspection1',
          workOrderId,
          isCompleted: true,
          template: { name: 'Full Inspection' },
          inspector: { userProfile: { name: 'John Doe' } },
          checklistItems: [
            { id: 'item1', item: 'Engine Check', status: ChecklistStatus.GREEN, requiresFollowUp: false }
          ]
        }
      ];

      mockPrisma.workOrderInspection.findMany.mockResolvedValue(mockInspections as any);

      // Act
      const result = await inspectionTemplatesService.canProceedToEstimate(workOrderId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.canProceed).toBe(true);
      expect(result.data?.reason).toBe('All inspections completed successfully');
      expect(result.data?.followUpItems).toEqual([]);
    });

    it('should prevent proceeding when inspections are pending', async () => {
      // Arrange
      const workOrderId = 'wo123';
      const mockInspections = [
        {
          id: 'inspection1',
          workOrderId,
          isCompleted: false,
          template: { name: 'Full Inspection' },
          checklistItems: []
        }
      ];

      mockPrisma.workOrderInspection.findMany.mockResolvedValue(mockInspections as any);

      // Act
      const result = await inspectionTemplatesService.canProceedToEstimate(workOrderId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.canProceed).toBe(false);
      expect(result.data?.reason).toBe('1 inspection(s) still pending');
    });

    it('should prevent proceeding when follow-up items exist', async () => {
      // Arrange
      const workOrderId = 'wo123';
      const mockInspections = [
        {
          id: 'inspection1',
          workOrderId,
          isCompleted: true,
          template: { name: 'Full Inspection' },
          checklistItems: [
            { id: 'item1', item: 'Engine Check', status: ChecklistStatus.RED, requiresFollowUp: true, notes: 'Needs repair' }
          ]
        }
      ];

      mockPrisma.workOrderInspection.findMany.mockResolvedValue(mockInspections as any);

      // Act
      const result = await inspectionTemplatesService.canProceedToEstimate(workOrderId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.canProceed).toBe(false);
      expect(result.data?.reason).toBe('1 item(s) require follow-up before proceeding');
      expect(result.data?.followUpItems).toHaveLength(1);
    });
  });

  describe('createInspectionAttachment', () => {
    it('should create inspection attachment successfully', async () => {
      // Arrange
      const inspectionId = 'inspection123';
      const attachmentData = {
        fileUrl: 'https://example.com/file.pdf',
        fileName: 'inspection-report.pdf',
        fileType: 'application/pdf',
        fileSize: 1024000,
        description: 'Inspection report',
        uploadedById: 'user123'
      };

      const mockAttachment = {
        id: 'attachment123',
        inspectionId,
        ...attachmentData,
        uploadedAt: new Date()
      };

      mockPrisma.workOrderInspectionAttachment.create.mockResolvedValue(mockAttachment as any);

      // Act
      const result = await inspectionTemplatesService.createInspectionAttachment(inspectionId, attachmentData);

      // Assert
      expect(mockPrisma.workOrderInspectionAttachment.create).toHaveBeenCalledWith({
        data: {
          inspectionId,
          ...attachmentData
        }
      });
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('attachment123');
    });
  });

  describe('getInspectionAttachments', () => {
    it('should return inspection attachments', async () => {
      // Arrange
      const inspectionId = 'inspection123';
      const mockAttachments = [
        {
          id: 'attachment1',
          fileUrl: 'https://example.com/file1.pdf',
          fileName: 'report1.pdf',
          uploadedBy: { id: 'user123', name: 'John Doe' }
        }
      ];

      mockPrisma.workOrderInspectionAttachment.findMany.mockResolvedValue(mockAttachments as any);

      // Act
      const result = await inspectionTemplatesService.getInspectionAttachments(inspectionId);

      // Assert
      expect(mockPrisma.workOrderInspectionAttachment.findMany).toHaveBeenCalledWith({
        where: { inspectionId },
        include: { uploadedBy: { select: { id: true, name: true } } },
        orderBy: { uploadedAt: 'desc' }
      });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('deleteInspectionAttachment', () => {
    it('should delete inspection attachment successfully', async () => {
      // Arrange
      const attachmentId = 'attachment123';

      // Act
      const result = await inspectionTemplatesService.deleteInspectionAttachment(attachmentId);

      // Assert
      expect(mockPrisma.workOrderInspectionAttachment.delete).toHaveBeenCalledWith({
        where: { id: attachmentId }
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Inspection attachment deleted successfully');
    });
  });

  describe('getAllTemplatesForPage', () => {
    it('should return all templates for page display', async () => {
      // Arrange
      const mockTemplates = [
        {
          id: 'template1',
          name: 'Full Inspection',
          templateItems: [
            { id: 'item1', name: 'Engine Check', sortOrder: 1 }
          ],
          _count: { workOrderInspections: 5 }
        }
      ];

      mockPrisma.inspectionTemplate.findMany.mockResolvedValue(mockTemplates as any);

      // Act
      const result = await inspectionTemplatesService.getAllTemplatesForPage();

      // Assert
      expect(mockPrisma.inspectionTemplate.findMany).toHaveBeenCalledWith({
        include: {
          templateItems: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { workOrderInspections: true } }
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
      });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.pagination?.total).toBe(1);
    });
  });
});