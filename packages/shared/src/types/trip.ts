import { OrderStatus } from './order';

export type TripStopStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  assignedVehicle: string;
}

export interface TripStop {
  id: string;
  stopNumber: number;
  orderId: string;
  customerId: string;
  customerName: string;
  contactPerson?: string;
  contactPhone?: string;
  address: string;
  eta: string;
  status: TripStopStatus;
  sku: string;
  quantity?: string;
  amountInPaise: number;
  completedAt?: string | null;
}

export interface Trip {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehicleId: string;
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'COMPLETED';
  totalStops: number;
  completedStops: number;
  remainingStops: number;
  estimatedCompletion: string;
  currentFuelLevel?: string;
  cryoPressure?: string;
  stops: TripStop[];
}
