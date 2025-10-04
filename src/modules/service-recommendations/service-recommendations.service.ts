import { PrismaClient, ServiceRuleType, ServicePriority, ServiceSeverity } from '@prisma/client';
import {
  ServiceRuleDefinition,
  VehicleContext,
  ServiceHistoryEntry,
  RuleEvaluationResult,
  ServiceRecommendationResult,
  GetRecommendationsRequest,
  GetRecommendationsResponse,
  UpdateRecommendationStatusRequest,
  BulkUpdateRecommendationsRequest,
  ServiceRuleEngineConfig
} from './service-recommendations.types';

const prisma = new PrismaClient();

export class ServiceRecommendationsService {
  private config: ServiceRuleEngineConfig = {
    enableBundling: true,
    maxRecommendationsPerCategory: 5,
    priorityThresholds: {
      critical: 7,  // 7 days
      high: 30,     // 30 days
      medium: 90    // 90 days
    },
    severityMultipliers: {
      severe: 0.8,    // 80% of normal interval
      offroad: 0.7,   // 70% of normal interval
      commercial: 0.9 // 90% of normal interval
    }
  };

  // Predefined service rules - these would typically be loaded from database
  private defaultRules: ServiceRuleDefinition[] = [
    // Oil Change Rules
    {
      code: 'OIL_CHANGE_MILEAGE',
      name: 'Oil Change - Mileage Based',
      description: 'Regular oil change based on mileage',
      ruleType: ServiceRuleType.MILEAGE_BASED,
      priority: ServicePriority.MEDIUM,
      severity: ServiceSeverity.HIGH,
      mileageInterval: 5000,
      serviceType: 'oil_change',
      serviceName: 'Engine Oil Change',
      category: 'Maintenance',
      applicableVehicleTypes: ['sedan', 'suv', 'truck', 'hatchback'],
      applicableDrivingConditions: ['normal', 'severe', 'offroad'],
      severeConditionMultiplier: 0.8,
      offroadMultiplier: 0.7
    },
    {
      code: 'OIL_CHANGE_TIME',
      name: 'Oil Change - Time Based',
      description: 'Regular oil change based on time elapsed',
      ruleType: ServiceRuleType.TIME_BASED,
      priority: ServicePriority.MEDIUM,
      severity: ServiceSeverity.HIGH,
      timeIntervalMonths: 6,
      serviceType: 'oil_change',
      serviceName: 'Engine Oil Change',
      category: 'Maintenance',
      applicableVehicleTypes: ['sedan', 'suv', 'truck', 'hatchback'],
      applicableDrivingConditions: ['normal', 'severe', 'offroad']
    },

    // Brake Inspection Rules
    {
      code: 'BRAKE_INSPECTION_MILEAGE',
      name: 'Brake System Inspection',
      description: 'Comprehensive brake system check',
      ruleType: ServiceRuleType.MILEAGE_BASED,
      priority: ServicePriority.HIGH,
      severity: ServiceSeverity.CRITICAL,
      mileageInterval: 10000,
      serviceType: 'brake_inspection',
      serviceName: 'Brake System Inspection',
      category: 'Safety',
      applicableVehicleTypes: ['sedan', 'suv', 'truck', 'hatchback'],
      applicableDrivingConditions: ['normal', 'severe', 'offroad'],
      severeConditionMultiplier: 0.8
    },

    // Tire Rotation Rules
    {
      code: 'TIRE_ROTATION_MILEAGE',
      name: 'Tire Rotation',
      description: 'Rotate tires for even wear',
      ruleType: ServiceRuleType.MILEAGE_BASED,
      priority: ServicePriority.LOW,
      severity: ServiceSeverity.MEDIUM,
      mileageInterval: 8000,
      serviceType: 'tire_rotation',
      serviceName: 'Tire Rotation & Balance',
      category: 'Maintenance',
      applicableVehicleTypes: ['sedan', 'suv', 'truck', 'hatchback'],
      applicableDrivingConditions: ['normal', 'severe', 'offroad']
    },

    // Air Filter Rules
    {
      code: 'AIR_FILTER_MILEAGE',
      name: 'Air Filter Replacement',
      description: 'Replace engine air filter',
      ruleType: ServiceRuleType.MILEAGE_BASED,
      priority: ServicePriority.LOW,
      severity: ServiceSeverity.LOW,
      mileageInterval: 15000,
      serviceType: 'air_filter',
      serviceName: 'Air Filter Replacement',
      category: 'Maintenance',
      applicableVehicleTypes: ['sedan', 'suv', 'truck', 'hatchback'],
      applicableDrivingConditions: ['normal', 'severe', 'offroad'],
      severeConditionMultiplier: 0.8
    },

    // Transmission Service
    {
      code: 'TRANSMISSION_SERVICE_MILEAGE',
      name: 'Transmission Service',
      description: 'Automatic transmission fluid change',
      ruleType: ServiceRuleType.MILEAGE_BASED,
      priority: ServicePriority.MEDIUM,
      severity: ServiceSeverity.HIGH,
      mileageInterval: 30000,
      serviceType: 'transmission_service',
      serviceName: 'Transmission Service',
      category: 'Maintenance',
      applicableVehicleTypes: ['sedan', 'suv', 'truck'],
      applicableDrivingConditions: ['normal', 'severe'],
      severeConditionMultiplier: 0.8
    },

    // Battery Check
    {
      code: 'BATTERY_CHECK_TIME',
      name: 'Battery Health Check',
      description: 'Check battery condition and terminals',
      ruleType: ServiceRuleType.TIME_BASED,
      priority: ServicePriority.LOW,
      severity: ServiceSeverity.MEDIUM,
      timeIntervalMonths: 12,
      serviceType: 'battery_check',
      serviceName: 'Battery Health Check',
      category: 'Electrical',
      applicableVehicleTypes: ['sedan', 'suv', 'truck', 'hatchback'],
      applicableDrivingConditions: ['normal', 'severe', 'offroad']
    },

    // Coolant Flush
    {
      code: 'COOLANT_FLUSH_TIME',
      name: 'Coolant System Flush',
      description: 'Flush and replace engine coolant',
      ruleType: ServiceRuleType.TIME_BASED,
      priority: ServicePriority.MEDIUM,
      severity: ServiceSeverity.MEDIUM,
      timeIntervalMonths: 24,
      serviceType: 'coolant_flush',
      serviceName: 'Coolant System Service',
      category: 'Cooling',
      applicableVehicleTypes: ['sedan', 'suv', 'truck', 'hatchback'],
      applicableDrivingConditions: ['normal', 'severe', 'offroad']
    },

    // Spark Plugs
    {
      code: 'SPARK_PLUGS_MILEAGE',
      name: 'Spark Plugs Replacement',
      description: 'Replace spark plugs for optimal performance',
      ruleType: ServiceRuleType.MILEAGE_BASED,
      priority: ServicePriority.MEDIUM,
      severity: ServiceSeverity.MEDIUM,
      mileageInterval: 30000,
      serviceType: 'spark_plugs',
      serviceName: 'Spark Plugs Replacement',
      category: 'Ignition',
      applicableVehicleTypes: ['sedan', 'suv', 'hatchback'],
      applicableDrivingConditions: ['normal', 'severe'],
      severeConditionMultiplier: 0.9
    }
  ];

  /**
   * Generate service recommendations for a vehicle
   */
  async generateRecommendations(
    request: GetRecommendationsRequest
  ): Promise<GetRecommendationsResponse> {
    const { vehicleId, includeCompleted = false, includeDismissed = false } = request;

    // Get vehicle context
    const vehicleContext = await this.getVehicleContext(vehicleId);

    // Get service history
    const serviceHistory = await this.getServiceHistory(vehicleId);

    // Evaluate all rules
    const ruleResults = await this.evaluateAllRules(vehicleContext, serviceHistory);

    // Filter and prioritize recommendations
    const recommendations = this.processRuleResults(ruleResults, vehicleContext);

    // Apply bundling logic
    const bundledRecommendations = this.config.enableBundling
      ? this.applyBundlingLogic(recommendations)
      : recommendations;

    // Get existing recommendations from database
    const existingRecommendations = await this.getExistingRecommendations(vehicleId, includeCompleted, includeDismissed);

    // Merge with existing and update database
    const finalRecommendations = await this.mergeWithExistingRecommendations(
      vehicleId,
      bundledRecommendations,
      existingRecommendations
    );

    return {
      recommendations: finalRecommendations,
      totalCount: finalRecommendations.length,
      vehicleContext,
      lastUpdated: new Date()
    };
  }

  /**
   * Get vehicle context information
   */
  private async getVehicleContext(vehicleId: string): Promise<VehicleContext> {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        vehicleMileage: true,
        vehicleProfile: true
      }
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const currentMileage = vehicle.vehicleMileage?.currentMileage || 0;

    return {
      vehicleId,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year || undefined,
      currentMileage,
      drivingCondition: vehicle.vehicleProfile?.drivingCondition || 'NORMAL',
      serviceInterval: vehicle.vehicleProfile?.serviceInterval || 'STANDARD',
      engineType: vehicle.vehicleProfile?.engineType || undefined,
      transmissionType: vehicle.vehicleProfile?.transmissionType || undefined,
      fuelType: vehicle.vehicleProfile?.fuelType || undefined
    };
  }

  /**
   * Get service history for a vehicle
   */
  private async getServiceHistory(vehicleId: string): Promise<ServiceHistoryEntry[]> {
    const history = await prisma.vehicleServiceHistory.findMany({
      where: { vehicleId },
      orderBy: { serviceDate: 'desc' }
    });

    return history.map(entry => ({
      serviceType: entry.serviceType,
      serviceDate: entry.serviceDate,
      serviceMileage: entry.serviceMileage,
      provider: entry.provider || undefined,
      cost: entry.cost ? Number(entry.cost) : undefined
    }));
  }

  /**
   * Evaluate all service rules against vehicle context and history
   */
  private async evaluateAllRules(
    vehicleContext: VehicleContext,
    serviceHistory: ServiceHistoryEntry[]
  ): Promise<RuleEvaluationResult[]> {
    const results: RuleEvaluationResult[] = [];

    for (const rule of this.defaultRules) {
      // Check if rule applies to this vehicle type
      if (rule.applicableVehicleTypes &&
          !rule.applicableVehicleTypes.some(type => this.vehicleMatchesType(vehicleContext, type))) {
        continue;
      }

      // Check if rule applies to driving conditions
      if (rule.applicableDrivingConditions &&
          !rule.applicableDrivingConditions.includes(vehicleContext.drivingCondition)) {
        continue;
      }

      const result = await this.evaluateRule(rule, vehicleContext, serviceHistory);
      if (result.triggered) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Evaluate a single service rule
   */
  private async evaluateRule(
    rule: ServiceRuleDefinition,
    vehicleContext: VehicleContext,
    serviceHistory: ServiceHistoryEntry[]
  ): Promise<RuleEvaluationResult> {
    // Get last service of this type
    const lastService = serviceHistory
      .filter(s => s.serviceType === rule.serviceType)
      .sort((a, b) => b.serviceDate.getTime() - a.serviceDate.getTime())[0];

    const lastServiceDate = lastService?.serviceDate;
    const lastServiceMileage = lastService?.serviceMileage;

    let triggered = false;
    let dueMileage: number | undefined;
    let dueDate: Date | undefined;
    let reason = '';

    // Apply condition multipliers based on driving conditions
    const mileageMultiplier = this.getMileageMultiplier(vehicleContext.drivingCondition, rule);
    const timeMultiplier = this.getTimeMultiplier(vehicleContext.drivingCondition, rule);

    // Evaluate based on rule type
    if (rule.ruleType === ServiceRuleType.MILEAGE_BASED && rule.mileageInterval) {
      const adjustedInterval = Math.floor(rule.mileageInterval * mileageMultiplier);
      const nextServiceMileage = (lastServiceMileage || 0) + adjustedInterval;

      if (vehicleContext.currentMileage >= nextServiceMileage) {
        triggered = true;
        dueMileage = nextServiceMileage;
        reason = `Current mileage (${vehicleContext.currentMileage}km) exceeds service interval (${adjustedInterval}km from last service at ${lastServiceMileage || 0}km)`;
      } else {
        dueMileage = nextServiceMileage;
      }
    }

    if (rule.ruleType === ServiceRuleType.TIME_BASED && (rule.timeIntervalMonths || rule.timeIntervalDays)) {
      const intervalMonths = rule.timeIntervalMonths || 0;
      const intervalDays = rule.timeIntervalDays || 0;
      const totalDays = (intervalMonths * 30) + intervalDays; // Approximate
      const adjustedDays = Math.floor(totalDays * timeMultiplier);

      const nextServiceDate = lastServiceDate
        ? new Date(lastServiceDate.getTime() + (adjustedDays * 24 * 60 * 60 * 1000))
        : new Date(); // If no last service, due immediately

      if (new Date() >= nextServiceDate) {
        triggered = true;
        dueDate = nextServiceDate;
        reason = `Time since last service (${lastServiceDate ? Math.floor((new Date().getTime() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24)) : 'never'} days) exceeds interval (${adjustedDays} days)`;
      } else {
        dueDate = nextServiceDate;
      }
    }

    return {
      ruleCode: rule.code,
      triggered,
      priority: rule.priority,
      severity: rule.severity,
      dueMileage,
      dueDate,
      reason,
      lastServiceDate,
      lastServiceMileage,
      estimatedCost: this.estimateServiceCost(rule.serviceType),
      estimatedDuration: this.estimateServiceDuration(rule.serviceType)
    };
  }

  /**
   * Process rule evaluation results into recommendations
   */
  private processRuleResults(
    ruleResults: RuleEvaluationResult[],
    vehicleContext: VehicleContext
  ): ServiceRecommendationResult[] {
    return ruleResults.map(result => {
      const rule = this.defaultRules.find(r => r.code === result.ruleCode)!;

      return {
        vehicleId: vehicleContext.vehicleId,
        serviceType: rule.serviceType,
        serviceName: rule.serviceName,
        category: rule.category,
        priority: result.priority,
        severity: result.severity,
        reason: result.reason,
        dueMileage: result.dueMileage,
        dueDate: result.dueDate,
        estimatedCost: result.estimatedCost,
        estimatedDuration: result.estimatedDuration,
        lastServiceDate: result.lastServiceDate,
        lastServiceMileage: result.lastServiceMileage,
        canBundle: rule.canBundle || false,
        dependsOn: rule.dependsOn,
        conflictsWith: rule.conflictsWith
      };
    });
  }

  /**
   * Apply bundling logic to group related services
   */
  private applyBundlingLogic(recommendations: ServiceRecommendationResult[]): ServiceRecommendationResult[] {
    // Group recommendations by category and priority
    const bundled: ServiceRecommendationResult[] = [];
    const processed = new Set<string>();

    for (const rec of recommendations) {
      if (processed.has(rec.serviceType)) continue;

      // Find services that can be bundled together
      const bundleGroup = recommendations.filter(r =>
        r.canBundle &&
        r.category === rec.category &&
        Math.abs((r.priority as any) - (rec.priority as any)) <= 1 && // Similar priority
        !processed.has(r.serviceType)
      );

      if (bundleGroup.length > 1) {
        // Create a bundled recommendation
        const bundledRec: ServiceRecommendationResult = {
          ...rec,
          serviceName: `${bundleGroup.length} Services Bundle`,
          reason: `Bundle of ${bundleGroup.length} related services: ${bundleGroup.map(r => r.serviceName).join(', ')}`,
          estimatedCost: bundleGroup.reduce((sum, r) => sum + (r.estimatedCost || 0), 0),
          estimatedDuration: Math.max(...bundleGroup.map(r => r.estimatedDuration || 0))
        };
        bundled.push(bundledRec);

        // Mark all as processed
        bundleGroup.forEach(r => processed.add(r.serviceType));
      } else {
        bundled.push(rec);
        processed.add(rec.serviceType);
      }
    }

    return bundled;
  }

  /**
   * Get existing recommendations from database
   */
  private async getExistingRecommendations(
    vehicleId: string,
    includeCompleted: boolean,
    includeDismissed: boolean
  ): Promise<any[]> {
    const where: any = { vehicleId };

    if (!includeCompleted) {
      where.status = { not: 'COMPLETED' };
    }

    if (!includeDismissed) {
      where.status = { ...where.status, not: 'DISMISSED' };
    }

    return await prisma.serviceRecommendation.findMany({
      where,
      include: { rule: true }
    });
  }

  /**
   * Merge new recommendations with existing ones
   */
  private async mergeWithExistingRecommendations(
    vehicleId: string,
    newRecommendations: ServiceRecommendationResult[],
    existingRecommendations: any[]
  ): Promise<ServiceRecommendationResult[]> {
    const merged: ServiceRecommendationResult[] = [];

    for (const newRec of newRecommendations) {
      const existing = existingRecommendations.find(
        ex => ex.rule.code === newRec.serviceType // Map serviceType to rule code
      );

      if (existing) {
        // Update existing recommendation
        await prisma.serviceRecommendation.update({
          where: { id: existing.id },
          data: {
            priority: newRec.priority,
            severity: newRec.severity,
            dueMileage: newRec.dueMileage,
            dueDate: newRec.dueDate,
            reason: newRec.reason,
            estimatedCost: newRec.estimatedCost,
            estimatedDuration: newRec.estimatedDuration,
            updatedAt: new Date()
          }
        });
      } else {
        // Create new recommendation
        const rule = await prisma.serviceRule.findUnique({
          where: { code: newRec.serviceType }
        });

        if (rule) {
          await prisma.serviceRecommendation.create({
            data: {
              vehicleId,
              ruleId: rule.id,
              status: 'PENDING',
              priority: newRec.priority,
              severity: newRec.severity,
              dueMileage: newRec.dueMileage,
              dueDate: newRec.dueDate,
              reason: newRec.reason,
              estimatedCost: newRec.estimatedCost,
              estimatedDuration: newRec.estimatedDuration
            }
          });
        }
      }

      merged.push(newRec);
    }

    return merged;
  }

  /**
   * Update recommendation status
   */
  async updateRecommendationStatus(request: UpdateRecommendationStatusRequest): Promise<void> {
    const { recommendationId, status, dismissedReason, scheduledAt, completedAt } = request;

    await prisma.serviceRecommendation.update({
      where: { id: recommendationId },
      data: {
        status,
        dismissedAt: status === 'DISMISSED' ? new Date() : null,
        dismissedReason,
        scheduledAt,
        completedAt,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Bulk update recommendation statuses
   */
  async bulkUpdateRecommendationStatuses(request: BulkUpdateRecommendationsRequest): Promise<void> {
    const { vehicleId, recommendations } = request;

    for (const rec of recommendations) {
      const recommendation = await prisma.serviceRecommendation.findFirst({
        where: {
          vehicleId,
          rule: { code: rec.ruleCode }
        }
      });

      if (recommendation) {
        await this.updateRecommendationStatus({
          recommendationId: recommendation.id,
          status: rec.status,
          dismissedReason: rec.dismissedReason
        });
      }
    }
  }

  /**
   * Helper methods
   */
  private vehicleMatchesType(vehicleContext: VehicleContext, vehicleType: string): boolean {
    // Simple mapping - in real implementation, this would be more sophisticated
    const makeModel = `${vehicleContext.make} ${vehicleContext.model}`.toLowerCase();

    switch (vehicleType) {
      case 'sedan': return makeModel.includes('camry') || makeModel.includes('accord') || makeModel.includes('civic');
      case 'suv': return makeModel.includes('cr-v') || makeModel.includes('rav4') || makeModel.includes('explorer');
      case 'truck': return makeModel.includes('f-150') || makeModel.includes('silverado') || makeModel.includes('ram');
      case 'hatchback': return makeModel.includes('fit') || makeModel.includes('golf') || makeModel.includes('focus');
      default: return true;
    }
  }

  private getMileageMultiplier(drivingCondition: string, rule: ServiceRuleDefinition): number {
    switch (drivingCondition) {
      case 'SEVERE': return rule.severeConditionMultiplier || this.config.severityMultipliers.severe;
      case 'OFFROAD': return rule.offroadMultiplier || this.config.severityMultipliers.offroad;
      case 'COMMERCIAL': return this.config.severityMultipliers.commercial;
      default: return 1.0;
    }
  }

  private getTimeMultiplier(drivingCondition: string, rule: ServiceRuleDefinition): number {
    // Time multipliers are typically less aggressive than mileage multipliers
    switch (drivingCondition) {
      case 'SEVERE': return rule.severeConditionMultiplier || 0.9;
      case 'OFFROAD': return rule.offroadMultiplier || 0.85;
      case 'COMMERCIAL': return 0.95;
      default: return 1.0;
    }
  }

  private estimateServiceCost(serviceType: string): number {
    const costMap: { [key: string]: number } = {
      'oil_change': 45,
      'brake_inspection': 35,
      'tire_rotation': 25,
      'air_filter': 20,
      'transmission_service': 120,
      'battery_check': 15,
      'coolant_flush': 80,
      'spark_plugs': 90
    };
    return costMap[serviceType] || 50;
  }

  private estimateServiceDuration(serviceType: string): number {
    const durationMap: { [key: string]: number } = {
      'oil_change': 30,
      'brake_inspection': 45,
      'tire_rotation': 60,
      'air_filter': 20,
      'transmission_service': 90,
      'battery_check': 15,
      'coolant_flush': 60,
      'spark_plugs': 75
    };
    return durationMap[serviceType] || 45;
  }
}