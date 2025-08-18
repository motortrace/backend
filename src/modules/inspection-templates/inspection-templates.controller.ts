import { Request, Response } from 'express';
import { InspectionTemplatesService } from './inspection-templates.service';
import {
  validateCreateInspectionTemplate,
  validateUpdateInspectionTemplate,
  validateAssignTemplateToWorkOrder,
  validateCreateInspectionFromTemplate,
  validateUpdateChecklistItem,
  validateInspectionTemplateFilters,
  validateWorkOrderInspectionFilters,
  templateIdSchema,
  inspectionIdSchema,
  checklistItemIdSchema
} from './inspection-templates.validation';

export class InspectionTemplatesController {
  private service: InspectionTemplatesService;

  constructor() {
    this.service = new InspectionTemplatesService();
  }

  // Template Management Endpoints
  async createInspectionTemplate(req: Request, res: Response) {
    try {
      const validation = validateCreateInspectionTemplate(req.body);
      if (validation.error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.error.details.map(detail => detail.message)
        });
      }

      const result = await this.service.createInspectionTemplate(validation.value);
      
      if (result.success) {
        return res.status(201).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      console.error('Controller error - createInspectionTemplate:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getInspectionTemplate(req: Request, res: Response) {
    try {
      const validation = templateIdSchema.validate({ id: req.params.id });
      if (validation.error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid template ID',
          details: validation.error.details.map(detail => detail.message)
        });
      }

      const result = await this.service.getInspectionTemplate(validation.value.id);
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(404).json(result);
      }
    } catch (error) {
      console.error('Controller error - getInspectionTemplate:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getInspectionTemplates(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, category, isActive, search } = req.query;
      
      const filters = { category, isActive: isActive === 'true', search };
      const validation = validateInspectionTemplateFilters({ ...filters, page, limit });
      
      if (validation.error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: validation.error.details.map(detail => detail.message)
        });
      }

      const result = await this.service.getInspectionTemplates(
        validation.value,
        Number(page),
        Number(limit)
      );
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Controller error - getInspectionTemplates:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async updateInspectionTemplate(req: Request, res: Response) {
    try {
      const idValidation = templateIdSchema.validate({ id: req.params.id });
      if (idValidation.error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid template ID',
          details: idValidation.error.details.map(detail => detail.message)
        });
      }

      const dataValidation = validateUpdateInspectionTemplate(req.body);
      if (dataValidation.error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: dataValidation.error.details.map(detail => detail.message)
        });
      }

      const result = await this.service.updateInspectionTemplate(
        idValidation.value.id,
        dataValidation.value
      );
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      console.error('Controller error - updateInspectionTemplate:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async deleteInspectionTemplate(req: Request, res: Response) {
    try {
      const validation = templateIdSchema.validate({ id: req.params.id });
      if (validation.error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid template ID',
          details: validation.error.details.map(detail => detail.message)
        });
      }

      const result = await this.service.deleteInspectionTemplate(validation.value.id);
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      console.error('Controller error - deleteInspectionTemplate:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Work Order Inspection Management Endpoints
  async assignTemplateToWorkOrder(req: Request, res: Response) {
    try {
      const validation = validateAssignTemplateToWorkOrder(req.body);
      if (validation.error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.error.details.map(detail => detail.message)
        });
      }

      const result = await this.service.assignTemplateToWorkOrder(validation.value);
      
      if (result.success) {
        return res.status(201).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      console.error('Controller error - assignTemplateToWorkOrder:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async createInspectionFromTemplate(req: Request, res: Response) {
    try {
      const validation = validateCreateInspectionFromTemplate(req.body);
      if (validation.error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.error.details.map(detail => detail.message)
        });
      }

      const result = await this.service.createInspectionFromTemplate(validation.value);
      
      if (result.success) {
        return res.status(201).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      console.error('Controller error - createInspectionFromTemplate:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getWorkOrderInspection(req: Request, res: Response) {
    try {
      const validation = inspectionIdSchema.validate({ id: req.params.id });
      if (validation.error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid inspection ID',
          details: validation.error.details.map(detail => detail.message)
        });
      }

      const result = await this.service.getWorkOrderInspection(validation.value.id);
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(404).json(result);
      }
    } catch (error) {
      console.error('Controller error - getWorkOrderInspection:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getWorkOrderInspections(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        workOrderId, 
        inspectorId, 
        templateId, 
        isCompleted, 
        dateFrom, 
        dateTo 
      } = req.query;
      
      const filters = { 
        workOrderId, 
        inspectorId, 
        templateId, 
        isCompleted: isCompleted === 'true',
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined
      };
      
      const validation = validateWorkOrderInspectionFilters({ ...filters, page, limit });
      
      if (validation.error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: validation.error.details.map(detail => detail.message)
        });
      }

      const result = await this.service.getWorkOrderInspections(
        validation.value,
        Number(page),
        Number(limit)
      );
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Controller error - getWorkOrderInspections:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async updateWorkOrderInspection(req: Request, res: Response) {
    try {
      const idValidation = inspectionIdSchema.validate({ id: req.params.id });
      if (idValidation.error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid inspection ID',
          details: idValidation.error.details.map(detail => detail.message)
        });
      }

      const { notes, isCompleted } = req.body;
      const updateData: { notes?: string; isCompleted?: boolean } = {};
      
      if (notes !== undefined) updateData.notes = notes;
      if (isCompleted !== undefined) updateData.isCompleted = isCompleted;

      const result = await this.service.updateWorkOrderInspection(
        idValidation.value.id,
        updateData
      );
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      console.error('Controller error - updateWorkOrderInspection:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Checklist Item Management Endpoints
  async updateChecklistItem(req: Request, res: Response) {
    try {
      const idValidation = checklistItemIdSchema.validate({ id: req.params.id });
      if (idValidation.error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid checklist item ID',
          details: idValidation.error.details.map(detail => detail.message)
        });
      }

      const dataValidation = validateUpdateChecklistItem(req.body);
      if (dataValidation.error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: dataValidation.error.details.map(detail => detail.message)
        });
      }

      const result = await this.service.updateChecklistItem(
        idValidation.value.id,
        dataValidation.value
      );
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      console.error('Controller error - updateChecklistItem:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async addChecklistItem(req: Request, res: Response) {
    try {
      const inspectionIdValidation = inspectionIdSchema.validate({ id: req.params.inspectionId });
      if (inspectionIdValidation.error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid inspection ID',
          details: inspectionIdValidation.error.details.map(detail => detail.message)
        });
      }

      const dataValidation = validateUpdateChecklistItem(req.body);
      if (dataValidation.error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: dataValidation.error.details.map(detail => detail.message)
        });
      }

      const result = await this.service.addChecklistItem(
        inspectionIdValidation.value.id,
        dataValidation.value
      );
      
      if (result.success) {
        return res.status(201).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      console.error('Controller error - addChecklistItem:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async deleteChecklistItem(req: Request, res: Response) {
    try {
      const validation = checklistItemIdSchema.validate({ id: req.params.id });
      if (validation.error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid checklist item ID',
          details: validation.error.details.map(detail => detail.message)
        });
      }

      const result = await this.service.deleteChecklistItem(validation.value.id);
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      console.error('Controller error - deleteChecklistItem:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Utility Endpoints
  async getAvailableTemplates(req: Request, res: Response) {
    try {
      const result = await this.service.getAvailableTemplates();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Controller error - getAvailableTemplates:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getTemplatesByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      if (!category) {
        return res.status(400).json({
          success: false,
          error: 'Category parameter is required'
        });
      }

      const result = await this.service.getTemplatesByCategory(category);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Controller error - getTemplatesByCategory:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getWorkOrderInspectionsByWorkOrder(req: Request, res: Response) {
    try {
      const { workOrderId } = req.params;
      if (!workOrderId) {
        return res.status(400).json({
          success: false,
          error: 'Work order ID parameter is required'
        });
      }

      const result = await this.service.getWorkOrderInspectionsByWorkOrder(workOrderId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Controller error - getWorkOrderInspectionsByWorkOrder:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getWorkOrderInspectionsByInspector(req: Request, res: Response) {
    try {
      const { inspectorId } = req.params;
      if (!inspectorId) {
        return res.status(400).json({
          success: false,
          error: 'Inspector ID parameter is required'
        });
      }

      const result = await this.service.getWorkOrderInspectionsByInspector(inspectorId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Controller error - getWorkOrderInspectionsByInspector:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
