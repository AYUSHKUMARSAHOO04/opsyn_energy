import { PriorityLevel } from './order';

export type ActionStatus = 'REQUIRES_REVIEW' | 'IN_PROGRESS' | 'RESOLVED';

export interface PendingActionTelemetry {
  cryoTankPressureBar?: number;
  boilOffRatePercentPerHour?: number;
  elapsedTransitMinutes?: number;
  trafficCongestionIndex?: string;
  facilityGateStatus?: string;
  calibrationStatus?: string;
  temperatureCelsius?: number;
  riskScore: number;
}

export interface PendingAction {
  id: string;
  adminId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  issue: string;
  priority: PriorityLevel;
  status: ActionStatus;
  timestamp: string;
  currentEta: string;
  expectedEta: string;
  etaDeviationMinutes: number;
  recommendedAction: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  sku?: string;
  amountInPaise?: number;
  telemetry?: PendingActionTelemetry;
}

export interface OperationalMetrics {
  activeDeliveries: number;
  delayedDeliveries: number;
  pendingActionsCount: number;
  highPriorityCount: number;
}
