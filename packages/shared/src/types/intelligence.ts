import { PriorityLevel } from './order';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface OperationalInsightInput {
  orderId: string;
  sku?: string;
  currentStatus: string;
  expectedEta: string;
  currentEta: string;
  etaDeviationMinutes: number;
  priority: PriorityLevel;
  amountInPaise?: number;
  driverName?: string;
  elapsedTransitMinutes?: number;
  telemetryNotes?: string;
}

export interface OperationalInsight {
  orderId: string;
  riskLevel: RiskLevel;
  confidenceScore: number; // e.g. 96 (%)
  potentialCause: string;
  recommendedAction: string;
  supportingSignals: Array<{
    label: string;
    value: string;
    status: 'alert' | 'warning' | 'normal';
  }>;
  reasoningIndex: string;
  generatedAt: string;
  provider: 'local_deterministic' | 'external_llm';
}
