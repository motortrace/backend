import {
  ServiceRuleType,
  ServicePriority,
  ServiceSeverity,
  RecommendationStatus,
  DrivingCondition,
  ServiceInterval
} from '@prisma/client';

export interface ServiceRuleDefinition {
  code: string;
  name: string;
  description?: string;
  ruleType: ServiceRuleType;
  priority: ServicePriority;
  severity: ServiceSeverity;
  mileageInterval?: number;
  timeIntervalMonths?: number;
  timeIntervalDays?: number;
  serviceType: string;
  serviceName: string;
  category: string;
  dependsOn?: string[];
  conflictsWith?: string[];
  canBundle?: boolean;
  applicableVehicleTypes?: string[];
  applicableDrivingConditions?: string[];
  severeConditionMultiplier?: number;
  offroadMultiplier?: number;
}

export interface VehicleContext {
  vehicleId: string;
  make: string;
  model: string;
  year?: number;
  currentMileage: number;
  drivingCondition: DrivingCondition;
  serviceInterval: ServiceInterval;
  engineType?: string;
  transmissionType?: string;
  fuelType?: string;
}

export interface ServiceHistoryEntry {
  serviceType: string;
  serviceDate: Date;
  serviceMileage: number;
  provider?: string;
  cost?: number;
}

export interface RuleEvaluationResult {
  ruleCode: string;
  triggered: boolean;
  priority: ServicePriority;
  severity: ServiceSeverity;
  dueMileage?: number;
  dueDate?: Date;
  reason: string;
  lastServiceDate?: Date;
  lastServiceMileage?: number;
  estimatedCost?: number;
  estimatedDuration?: number;
}

export interface ServiceRecommendationResult {
  vehicleId: string;
  serviceType: string;
  serviceName: string;
  category: string;
  priority: ServicePriority;
  severity: ServiceSeverity;
  reason: string;
  dueMileage?: number;
  dueDate?: Date;
  estimatedCost?: number;
  estimatedDuration?: number;
  lastServiceDate?: Date;
  lastServiceMileage?: number;
  canBundle: boolean;
  dependsOn?: string[];
  conflictsWith?: string[];
}

export interface GetRecommendationsRequest {
  vehicleId: string;
  includeCompleted?: boolean;
  includeDismissed?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetRecommendationsResponse {
  recommendations: ServiceRecommendationResult[];
  totalCount: number;
  vehicleContext: VehicleContext;
  lastUpdated: Date;
}

export interface UpdateRecommendationStatusRequest {
  recommendationId: string;
  status: RecommendationStatus;
  dismissedReason?: string;
  scheduledAt?: Date;
  completedAt?: Date;
}

export interface BulkUpdateRecommendationsRequest {
  vehicleId: string;
  recommendations: {
    ruleCode: string;
    status: RecommendationStatus;
    dismissedReason?: string;
  }[];
}

export interface ServiceRuleEngineConfig {
  enableBundling: boolean;
  maxRecommendationsPerCategory: number;
  priorityThresholds: {
    critical: number; // days until critical
    high: number;     // days until high
    medium: number;   // days until medium
  };
  severityMultipliers: {
    severe: number;
    offroad: number;
    commercial: number;
  };
}