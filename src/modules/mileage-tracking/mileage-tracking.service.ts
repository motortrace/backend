import { PrismaClient } from '@prisma/client';
import {
  CreateMileageEntryRequest,
  UpdateMileageEntryRequest,
  MileageEntryResponse,
  VehicleMileageSummary,
  MileageAnalyticsRequest,
  MileageAnalyticsResponse,
  BulkMileageUpdateRequest
} from './mileage-tracking.types';

const prisma = new PrismaClient();

export class MileageTrackingService {

  /**
   * Create a new mileage entry
   */
  async createMileageEntry(
    data: CreateMileageEntryRequest,
    userId?: string
  ): Promise<MileageEntryResponse> {
    // Get the previous mileage entry for this vehicle to calculate distance
    const previousEntry = await prisma.mileageEntry.findFirst({
      where: { vehicleId: data.vehicleId },
      orderBy: { recordedAt: 'desc' },
    });

    let distance: number | undefined;
    let efficiency: number | undefined;

    if (previousEntry && data.mileage > previousEntry.mileage) {
      distance = data.mileage - previousEntry.mileage;

      // Calculate efficiency if fuel data is provided
      if (data.fuelUsed && distance > 0) {
        efficiency = Number((distance / data.fuelUsed).toFixed(2));
      }
    }

    // Create the mileage entry
    const entry = await prisma.mileageEntry.create({
      data: {
        vehicleId: data.vehicleId,
        mileage: data.mileage,
        fuelUsed: data.fuelUsed,
        distance: distance,
        efficiency: efficiency || data.efficiency,
        latitude: data.latitude,
        longitude: data.longitude,
        locationName: data.locationName,
        notes: data.notes,
        recordedById: userId,
      },
      include: {
        recordedBy: {
          select: { id: true, name: true }
        }
      }
    });

    // Update or create vehicle mileage summary
    await this.updateVehicleMileageSummary(data.vehicleId);

    return this.formatMileageEntry(entry);
  }

  /**
   * Update an existing mileage entry
   */
  async updateMileageEntry(
    entryId: string,
    data: UpdateMileageEntryRequest
  ): Promise<MileageEntryResponse> {
    const entry = await prisma.mileageEntry.update({
      where: { id: entryId },
      data: {
        mileage: data.mileage,
        fuelUsed: data.fuelUsed,
        distance: data.distance,
        efficiency: data.efficiency,
        latitude: data.latitude,
        longitude: data.longitude,
        locationName: data.locationName,
        notes: data.notes,
      },
      include: {
        recordedBy: {
          select: { id: true, name: true }
        }
      }
    });

    // Recalculate vehicle mileage summary
    await this.updateVehicleMileageSummary(entry.vehicleId);

    return this.formatMileageEntry(entry);
  }

  /**
   * Get mileage entries for a vehicle
   */
  async getMileageEntries(
    vehicleId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<MileageEntryResponse[]> {
    const entries = await prisma.mileageEntry.findMany({
      where: { vehicleId },
      orderBy: { recordedAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        recordedBy: {
          select: { id: true, name: true }
        }
      }
    });

    return entries.map(this.formatMileageEntry);
  }

  /**
   * Get vehicle mileage summary
   */
  async getVehicleMileageSummary(vehicleId: string): Promise<VehicleMileageSummary | null> {
    const summary = await prisma.vehicleMileage.findUnique({
      where: { vehicleId }
    });

    if (!summary) {
      return null;
    }

    return {
      vehicleId: summary.vehicleId,
      currentMileage: summary.currentMileage,
      totalDistance: summary.totalDistance,
      totalFuelUsed: Number(summary.totalFuelUsed),
      averageEfficiency: summary.averageEfficiency ? Number(summary.averageEfficiency) : undefined,
      lastUpdated: summary.lastUpdated,
      lastLocationLat: summary.lastLocationLat ? Number(summary.lastLocationLat) : undefined,
      lastLocationLng: summary.lastLocationLng ? Number(summary.lastLocationLng) : undefined,
      lastLocationName: summary.lastLocationName || undefined,
    };
  }

  /**
   * Get mileage analytics for a vehicle
   */
  async getMileageAnalytics(
    request: MileageAnalyticsRequest
  ): Promise<MileageAnalyticsResponse> {
    const { vehicleId, period, startDate, endDate } = request;

    // Calculate date range based on period if not provided
    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = new Date();
      start = new Date();

      switch (period) {
        case 'day':
          start.setDate(end.getDate() - 7); // Last 7 days
          break;
        case 'week':
          start.setDate(end.getDate() - 28); // Last 4 weeks
          break;
        case 'month':
          start.setMonth(end.getMonth() - 6); // Last 6 months
          break;
        case 'year':
          start.setFullYear(end.getFullYear() - 1); // Last year
          break;
      }
    }

    // Get entries within date range
    const entries = await prisma.mileageEntry.findMany({
      where: {
        vehicleId,
        recordedAt: {
          gte: start,
          lte: end,
        }
      },
      orderBy: { recordedAt: 'asc' },
      include: {
        recordedBy: {
          select: { id: true, name: true }
        }
      }
    });

    // Calculate totals
    const totalDistance = entries.reduce((sum, entry) => sum + (entry.distance || 0), 0);
    const totalFuelUsed = entries.reduce((sum, entry) => sum + Number(entry.fuelUsed || 0), 0);
    const efficiencies = entries.filter(entry => entry.efficiency).map(entry => Number(entry.efficiency));
    const averageEfficiency = efficiencies.length > 0
      ? Number((efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length).toFixed(2))
      : 0;

    // Generate chart data based on period
    const chartData = this.generateChartData(entries, period, start, end);

    return {
      period,
      totalDistance,
      totalFuelUsed,
      averageEfficiency,
      entries: entries.map(this.formatMileageEntry),
      chartData
    };
  }

  /**
   * Bulk update mileage entries
   */
  async bulkUpdateMileage(
    data: BulkMileageUpdateRequest,
    userId?: string
  ): Promise<MileageEntryResponse[]> {
    const { vehicleId, entries } = data;

    const createdEntries = await prisma.$transaction(
      entries.map(entry =>
        prisma.mileageEntry.create({
          data: {
            vehicleId,
            mileage: entry.mileage,
            fuelUsed: entry.fuelUsed,
            latitude: entry.latitude,
            longitude: entry.longitude,
            locationName: entry.locationName,
            notes: entry.notes,
            recordedAt: entry.recordedAt ? new Date(entry.recordedAt) : undefined,
            recordedById: userId,
          },
          include: {
            recordedBy: {
              select: { id: true, name: true }
            }
          }
        })
      )
    );

    // Update vehicle mileage summary
    await this.updateVehicleMileageSummary(vehicleId);

    return createdEntries.map(this.formatMileageEntry);
  }

  /**
   * Delete a mileage entry
   */
  async deleteMileageEntry(entryId: string): Promise<void> {
    const entry = await prisma.mileageEntry.findUnique({
      where: { id: entryId }
    });

    if (!entry) {
      throw new Error('Mileage entry not found');
    }

    await prisma.mileageEntry.delete({
      where: { id: entryId }
    });

    // Update vehicle mileage summary
    await this.updateVehicleMileageSummary(entry.vehicleId);
  }

  /**
   * Update vehicle mileage summary
   */
  private async updateVehicleMileageSummary(vehicleId: string): Promise<void> {
    // Get all entries for this vehicle
    const entries = await prisma.mileageEntry.findMany({
      where: { vehicleId },
      orderBy: { recordedAt: 'desc' },
    });

    if (entries.length === 0) {
      return;
    }

    const latestEntry = entries[0];
    const totalDistance = entries.reduce((sum, entry) => sum + (entry.distance || 0), 0);
    const totalFuelUsed = entries.reduce((sum, entry) => sum + Number(entry.fuelUsed || 0), 0);

    // Calculate average efficiency
    const efficiencies = entries.filter(entry => entry.efficiency).map(entry => Number(entry.efficiency));
    const averageEfficiency = efficiencies.length > 0
      ? Number((efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length).toFixed(2))
      : null;

    // Update or create summary
    await prisma.vehicleMileage.upsert({
      where: { vehicleId },
      update: {
        currentMileage: latestEntry.mileage,
        totalDistance,
        totalFuelUsed,
        averageEfficiency,
        lastUpdated: new Date(),
        lastLocationLat: latestEntry.latitude,
        lastLocationLng: latestEntry.longitude,
        lastLocationName: latestEntry.locationName,
      },
      create: {
        vehicleId,
        currentMileage: latestEntry.mileage,
        totalDistance,
        totalFuelUsed,
        averageEfficiency,
        lastLocationLat: latestEntry.latitude,
        lastLocationLng: latestEntry.longitude,
        lastLocationName: latestEntry.locationName,
      }
    });
  }

  /**
   * Generate chart data based on period
   */
  private generateChartData(entries: any[], period: string, start: Date, end: Date) {
    const chartData: { date: string; distance: number; fuel: number; efficiency: number }[] = [];

    if (entries.length === 0) return chartData;

    switch (period) {
      case 'day':
        // Group by day
        const dayGroups: { [key: string]: any[] } = {};
        entries.forEach(entry => {
          const dateKey = entry.recordedAt.toISOString().split('T')[0];
          if (!dayGroups[dateKey]) dayGroups[dateKey] = [];
          dayGroups[dateKey].push(entry);
        });

        Object.keys(dayGroups).sort().forEach(dateKey => {
          const dayEntries = dayGroups[dateKey];
          const totalDistance = dayEntries.reduce((sum, entry) => sum + (entry.distance || 0), 0);
          const totalFuel = dayEntries.reduce((sum, entry) => sum + Number(entry.fuelUsed || 0), 0);
          const avgEfficiency = dayEntries.filter(e => e.efficiency).length > 0
            ? dayEntries.filter(e => e.efficiency).reduce((sum, e) => sum + Number(e.efficiency), 0) /
              dayEntries.filter(e => e.efficiency).length
            : 0;

          chartData.push({
            date: dateKey,
            distance: totalDistance,
            fuel: Number(totalFuel.toFixed(1)),
            efficiency: Number(avgEfficiency.toFixed(1))
          });
        });
        break;

      case 'week':
        // Group by week
        const weekGroups: { [key: string]: any[] } = {};
        entries.forEach(entry => {
          const weekStart = new Date(entry.recordedAt);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const weekKey = weekStart.toISOString().split('T')[0];
          if (!weekGroups[weekKey]) weekGroups[weekKey] = [];
          weekGroups[weekKey].push(entry);
        });

        Object.keys(weekGroups).sort().forEach(weekKey => {
          const weekEntries = weekGroups[weekKey];
          const totalDistance = weekEntries.reduce((sum, entry) => sum + (entry.distance || 0), 0);
          const totalFuel = weekEntries.reduce((sum, entry) => sum + Number(entry.fuelUsed || 0), 0);
          const avgEfficiency = weekEntries.filter(e => e.efficiency).length > 0
            ? weekEntries.filter(e => e.efficiency).reduce((sum, e) => sum + Number(e.efficiency), 0) /
              weekEntries.filter(e => e.efficiency).length
            : 0;

          chartData.push({
            date: `Week of ${weekKey}`,
            distance: totalDistance,
            fuel: Number(totalFuel.toFixed(1)),
            efficiency: Number(avgEfficiency.toFixed(1))
          });
        });
        break;

      case 'month':
        // Group by month
        const monthGroups: { [key: string]: any[] } = {};
        entries.forEach(entry => {
          const monthKey = `${entry.recordedAt.getFullYear()}-${String(entry.recordedAt.getMonth() + 1).padStart(2, '0')}`;
          if (!monthGroups[monthKey]) monthGroups[monthKey] = [];
          monthGroups[monthKey].push(entry);
        });

        Object.keys(monthGroups).sort().forEach(monthKey => {
          const monthEntries = monthGroups[monthKey];
          const totalDistance = monthEntries.reduce((sum, entry) => sum + (entry.distance || 0), 0);
          const totalFuel = monthEntries.reduce((sum, entry) => sum + Number(entry.fuelUsed || 0), 0);
          const avgEfficiency = monthEntries.filter(e => e.efficiency).length > 0
            ? monthEntries.filter(e => e.efficiency).reduce((sum, e) => sum + Number(e.efficiency), 0) /
              monthEntries.filter(e => e.efficiency).length
            : 0;

          const [year, month] = monthKey.split('-');
          const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' });

          chartData.push({
            date: `${monthName} ${year}`,
            distance: totalDistance,
            fuel: Number(totalFuel.toFixed(1)),
            efficiency: Number(avgEfficiency.toFixed(1))
          });
        });
        break;
    }

    return chartData;
  }

  /**
   * Format mileage entry for response
   */
  private formatMileageEntry(entry: any): MileageEntryResponse {
    return {
      id: entry.id,
      vehicleId: entry.vehicleId,
      mileage: entry.mileage,
      fuelUsed: entry.fuelUsed ? Number(entry.fuelUsed) : undefined,
      distance: entry.distance || undefined,
      efficiency: entry.efficiency ? Number(entry.efficiency) : undefined,
      latitude: entry.latitude ? Number(entry.latitude) : undefined,
      longitude: entry.longitude ? Number(entry.longitude) : undefined,
      locationName: entry.locationName || undefined,
      notes: entry.notes || undefined,
      recordedAt: entry.recordedAt,
      recordedBy: entry.recordedBy ? {
        id: entry.recordedBy.id,
        name: entry.recordedBy.name
      } : undefined
    };
  }
}