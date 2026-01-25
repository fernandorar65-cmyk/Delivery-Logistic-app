import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  Vehicle,
  VehicleCreate,
  VehicleUpdate,
  VehicleListResponse,
  VehicleResponse,
  VehicleApi,
  VehicleApiListResponse,
  VehicleApiResponse
} from '@app/features/vehicles/models/vehicle.model';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/providers`;

  getByProvider(providerId: string): Observable<VehicleListResponse> {
    return this.http
      .get<VehicleApiListResponse>(`${this.apiUrl}/${providerId}/vehicles/`)
      .pipe(map(response => this.mapListResponse(response)));
  }

  getById(providerId: string, vehicleId: string): Observable<VehicleResponse> {
    return this.http
      .get<VehicleApiResponse>(`${this.apiUrl}/${providerId}/vehicles/${vehicleId}/`)
      .pipe(map(response => this.mapResponse(response)));
  }

  create(providerId: string, vehicle: VehicleCreate): Observable<VehicleResponse> {
    const payload = this.mapCreatePayload(vehicle);
    return this.http
      .post<VehicleApiResponse>(`${this.apiUrl}/${providerId}/vehicles/`, payload)
      .pipe(map(response => this.mapResponse(response)));
  }

  update(providerId: string, vehicleId: string, vehicle: VehicleUpdate): Observable<VehicleResponse> {
    const payload = this.mapUpdatePayload(vehicle);
    return this.http
      .put<VehicleApiResponse>(`${this.apiUrl}/${providerId}/vehicles/${vehicleId}/`, payload)
      .pipe(map(response => this.mapResponse(response)));
  }

  patch(providerId: string, vehicleId: string, vehicle: VehicleUpdate): Observable<VehicleResponse> {
    const payload = this.mapUpdatePayload(vehicle);
    return this.http
      .patch<VehicleApiResponse>(`${this.apiUrl}/${providerId}/vehicles/${vehicleId}/`, payload)
      .pipe(map(response => this.mapResponse(response)));
  }

  delete(providerId: string, vehicleId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${providerId}/vehicles/${vehicleId}/`);
  }

  private mapListResponse(response: VehicleApiListResponse): VehicleListResponse {
    const items = Array.isArray(response.result) ? response.result : [];
    return {
      errors: response.errors ?? [],
      result: items.map(vehicle => this.mapVehicleFromApi(vehicle)),
      pagination: response.pagination ?? { count: items.length, next: null, previous: null }
    };
  }

  private mapResponse(response: VehicleApiResponse): VehicleResponse {
    return {
      errors: response.errors,
      result: this.mapVehicleFromApi(response.result)
    };
  }

  private mapVehicleFromApi(vehicle: VehicleApi): Vehicle {
    const plate = vehicle.plate_number ?? vehicle.license_plate ?? '';
    return {
      id: vehicle.id,
      provider_id: vehicle.provider_id,
      provider_name: vehicle.provider_name,
      license_plate: plate,
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      year: vehicle.year,
      vehicle_type: this.mapVehicleType(vehicle.vehicle_type),
      body_type: vehicle.body_type,
      tara_kg: vehicle.tara_kg,
      gross_weight_kg: vehicle.gross_weight_kg,
      net_capacity_kg: vehicle.net_capacity_kg,
      length_m: vehicle.length_m,
      width_m: vehicle.width_m,
      height_m: vehicle.height_m,
      capacity: vehicle.net_capacity_kg ? `${vehicle.net_capacity_kg} kg` : undefined,
      status: this.mapStatus(vehicle.status),
      created_at: vehicle.created_at,
      updated_at: vehicle.updated_at
    };
  }

  private mapCreatePayload(vehicle: VehicleCreate): Partial<VehicleApi> {
    return {
      plate_number: vehicle.license_plate,
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      year: vehicle.year,
      vehicle_type: this.mapVehicleTypeToApi(vehicle.vehicle_type),
      body_type: vehicle.body_type,
      tara_kg: vehicle.tara_kg,
      gross_weight_kg: vehicle.gross_weight_kg,
      net_capacity_kg: vehicle.net_capacity_kg,
      length_m: vehicle.length_m,
      width_m: vehicle.width_m,
      height_m: vehicle.height_m,
      status: this.mapStatusToApi(vehicle.status)
    };
  }

  private mapUpdatePayload(vehicle: VehicleUpdate): Partial<VehicleApi> {
    return {
      plate_number: vehicle.license_plate,
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      year: vehicle.year,
      vehicle_type: vehicle.vehicle_type ? this.mapVehicleTypeToApi(vehicle.vehicle_type) : undefined,
      body_type: vehicle.body_type,
      tara_kg: vehicle.tara_kg,
      gross_weight_kg: vehicle.gross_weight_kg,
      net_capacity_kg: vehicle.net_capacity_kg,
      length_m: vehicle.length_m,
      width_m: vehicle.width_m,
      height_m: vehicle.height_m,
      status: vehicle.status ? this.mapStatusToApi(vehicle.status) : undefined
    };
  }

  private mapVehicleType(type?: string): Vehicle['vehicle_type'] {
    switch ((type || '').toUpperCase()) {
      case 'TRUCK':
        return 'truck';
      case 'VAN':
        return 'van';
      case 'MOTORCYCLE':
        return 'motorcycle';
      case 'TRACTOR_TRAILER':
      case 'TRACTOR-TRAILER':
        return 'tractor-trailer';
      default:
        return 'truck';
    }
  }

  private mapVehicleTypeToApi(type?: Vehicle['vehicle_type']): string | undefined {
    switch (type) {
      case 'truck':
        return 'TRUCK';
      case 'van':
        return 'VAN';
      case 'motorcycle':
        return 'MOTORCYCLE';
      case 'tractor-trailer':
        return 'TRACTOR_TRAILER';
      default:
        return undefined;
    }
  }

  private mapStatus(status?: string): Vehicle['status'] {
    switch ((status || '').toUpperCase()) {
      case 'ACTIVE':
      case 'AVAILABLE':
        return 'available';
      case 'IN_ROUTE':
        return 'in_route';
      case 'MAINTENANCE':
        return 'maintenance';
      case 'INACTIVE':
        return 'inactive';
      default:
        return 'available';
    }
  }

  private mapStatusToApi(status?: Vehicle['status']): string | undefined {
    switch (status) {
      case 'available':
        return 'ACTIVE';
      case 'in_route':
        return 'IN_ROUTE';
      case 'maintenance':
        return 'MAINTENANCE';
      case 'inactive':
        return 'INACTIVE';
      default:
        return undefined;
    }
  }
}






