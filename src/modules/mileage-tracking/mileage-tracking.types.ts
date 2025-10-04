export interface CreateMileageEntryRequest {
  vehicleId: string;
  mileage: number;
  fuelUsed?: number;
  distance?: number;
  efficiency?: number;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  notes?: string;
}

export interface UpdateMileageEntryRequest {
  mileage?: number;
  fuelUsed?: number;
  distance?: number;
  efficiency?: number;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  notes?: string;
}

export interface MileageEntryResponse {
  id: string;
  vehicleId: string;
  mileage: number;
  fuelUsed?: number;
  distance?: number;
  efficiency?: number;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  notes?: string;
  recordedAt: Date;
  recordedBy?: {
    id: string;
    name?: string;
  };
}

export interface VehicleMileageSummary {
  vehicleId: string;
  currentMileage: number;
  totalDistance: number;
  totalFuelUsed: number;
  averageEfficiency?: number;
  lastUpdated: Date;
  lastLocationLat?: number;
  lastLocationLng?: number;
  lastLocationName?: string;
}

export interface MileageAnalyticsRequest {
  vehicleId: string;
  period: 'day' | 'week' | 'month' | 'year';
  startDate?: Date;
  endDate?: Date;
}

export interface MileageAnalyticsResponse {
  period: string;
  totalDistance: number;
  totalFuelUsed: number;
  averageEfficiency: number;
  entries: MileageEntryResponse[];
  chartData: {
    date: string;
    distance: number;
    fuel: number;
    efficiency: number;
  }[];
}

export interface BulkMileageUpdateRequest {
  vehicleId: string;
  entries: {
    mileage: number;
    fuelUsed?: number;
    recordedAt?: Date;
    latitude?: number;
    longitude?: number;
    locationName?: string;
    notes?: string;
  }[];
}