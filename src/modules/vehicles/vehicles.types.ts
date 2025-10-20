// Vehicle creation request
export interface CreateVehicleRequest {
    customerId: string;
    make: string;
    model: string;
    year?: number;
    vin?: string;
    licensePlate?: string;
    imageUrl?: string;
    color?: string;
  }
  
  // Vehicle update request
  export interface UpdateVehicleRequest {
      make?: string;
      model?: string;
      year?: number;
      vin?: string;
      licensePlate?: string;
      color?: string;
      imageUrl?: string | null;
    }
  
  // Vehicle response
  export interface VehicleResponse {
      id: string;
      customerId: string;
      make: string;
      model: string;
      year?: number;
      vin?: string;
      licensePlate?: string;
      color?: string;
      imageUrl?: string | null;
      createdAt: Date;
      updatedAt: Date;
      customer?: {
        id: string;
        name: string;
        email?: string;
      };
    }
  
  // Vehicle filters for search
  export interface VehicleFilters {
    customerId?: string;
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
    licensePlate?: string;
    search?: string;
  }
  
  // Vehicle statistics
  export interface VehicleStatistics {
    totalVehicles: number;
    vehiclesByMake: { make: string; count: number }[];
    vehiclesByYear: { year: number; count: number }[];
    recentAdditions: VehicleResponse[];
  }