export type OrderStatus = 'DELIVERED' | 'IN_TRANSIT' | 'PENDING' | 'DELAYED' | 'CANCELLED';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Customer {
  id: string;
  name: string;
  contactPerson?: string;
  contactPhone?: string;
  facilityAddress?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  contactPerson?: string;
  contactPhone?: string;
  deliveryAddress: string;
  amountInPaise: number;
  sku: string;
  quantity?: string;
  status: OrderStatus;
  priority: PriorityLevel;
  timestamp: string;
  expectedEta: string;
  currentEta: string;
  etaDeviationMinutes: number;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  operationalNotes?: string;
}

export interface OrderSummaryMetrics {
  totalOrders: number;
  deliveredOrders: number;
  inTransitOrders: number;
  delayedOrders: number;
  pendingOrders: number;
  totalValueInPaise: number;
}
