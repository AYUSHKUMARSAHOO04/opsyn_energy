import { OperationalInsight, OperationalInsightInput, RiskLevel } from '../types/intelligence';

/**
 * Calculates operational risk level deterministically based on ETA deviation and order priority.
 */
export function calculateOperationalRisk(
  etaDeviationMinutes: number,
  priority: OperationalInsightInput['priority']
): { riskLevel: RiskLevel; riskScore: number } {
  const isCriticalPriority = priority === 'CRITICAL';
  const isHighPriority = priority === 'HIGH';

  if (etaDeviationMinutes > 60 && isCriticalPriority) {
    return { riskLevel: 'CRITICAL', riskScore: 96 };
  }

  if (
    etaDeviationMinutes > 30 ||
    (etaDeviationMinutes >= 20 && (isCriticalPriority || isHighPriority))
  ) {
    return { riskLevel: 'HIGH', riskScore: 88 };
  }

  if (
    etaDeviationMinutes > 10 ||
    (etaDeviationMinutes > 0 && isCriticalPriority)
  ) {
    return { riskLevel: 'MEDIUM', riskScore: 58 };
  }

  return { riskLevel: 'LOW', riskScore: 22 };
}

/**
 * Deterministic Local Operational Intelligence Engine.
 * 
 * Architecture Design:
 * This service implements the Opsyn Operational Intelligence protocol.
 * Consumers rely solely on the `generateOperationalInsight` signature.
 * When an enterprise LLM (e.g., Gemini 1.5 Pro / Claude 3.5 Sonnet / OpenAI) or RAG pipeline
 * is configured with credentials, this adapter can be swapped seamlessly without touching UI components.
 */
export async function generateOperationalInsight(
  input: OperationalInsightInput,
  options?: { simulateLatencyMs?: number }
): Promise<OperationalInsight> {
  const latency = options?.simulateLatencyMs ?? 0;
  if (latency > 0) {
    await new Promise((resolve) => setTimeout(resolve, latency));
  }

  const { riskLevel, riskScore } = calculateOperationalRisk(
    input.etaDeviationMinutes,
    input.priority
  );

  const isCryo = (input.sku || '').toUpperCase().includes('CRYO') || (input.sku || '').toUpperCase().includes('LNG');
  const isMethane = (input.sku || '').toUpperCase().includes('METHANE') || (input.sku || '').toUpperCase().includes('CNG');

  let potentialCause = '';
  let recommendedAction = '';

  if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
    if (isCryo) {
      potentialCause = `Significant ETA deviation (+${input.etaDeviationMinutes}m) detected on heavy transit corridor. Cryogenic boil-off margin decreasing as transit duration extends beyond standard schedule.`;
      recommendedAction = `Immediately contact assigned driver ${input.driverName || 'driver'} to verify tank pressure telemetry (threshold: 4.5 bar). Notify downstream receiving depot to re-sequence boiler staging.`;
    } else {
      potentialCause = `Substantial route delay (+${input.etaDeviationMinutes}m) across industrial corridor with ${input.priority} priority dispatch protocol.`;
      recommendedAction = `Engage driver ${input.driverName || 'driver'} directly. If delay exceeds 60 minutes, evaluate emergency secondary hauler dispatch.`;
    }
  } else if (riskLevel === 'MEDIUM') {
    potentialCause = `Moderate ETA slip (+${input.etaDeviationMinutes}m) detected due to checkpoint clearance or intermediate depot staging.`;
    recommendedAction = `Monitor telemetry checkpoint at next route junction. Ensure site receiving dock is alerted of adjusted window (${input.currentEta}).`;
  } else {
    potentialCause = `Operational telemetry within nominal thresholds. Minor ETA variation (+${input.etaDeviationMinutes}m) absorbed by planned route buffer.`;
    recommendedAction = `No intervention required. Maintain automated GPS telemetry polling.`;
  }

  const supportingSignals: OperationalInsight['supportingSignals'] = [
    {
      label: 'ETA Deviation',
      value: input.etaDeviationMinutes > 0 ? `+${input.etaDeviationMinutes} min delay` : `${input.etaDeviationMinutes} min (nominal)`,
      status: input.etaDeviationMinutes > 20 ? 'alert' : input.etaDeviationMinutes > 10 ? 'warning' : 'normal',
    },
    {
      label: 'Dispatch Priority',
      value: input.priority,
      status: input.priority === 'CRITICAL' ? 'alert' : input.priority === 'HIGH' ? 'warning' : 'normal',
    },
    {
      label: 'Cargo Sensitivity',
      value: isCryo ? 'Cryogenic Gas (-162°C / 4.2 bar)' : isMethane ? 'High-Pressure Gas (200 bar)' : 'Standard Industrial Cargo',
      status: isCryo ? 'alert' : 'normal',
    },
    {
      label: 'Telemetry Status',
      value: input.currentStatus === 'DELAYED' ? 'Route Alert Triggered' : 'Active Telemetry Link',
      status: input.currentStatus === 'DELAYED' ? 'alert' : 'normal',
    },
  ];

  return {
    orderId: input.orderId,
    riskLevel,
    confidenceScore: 94 + (riskScore % 5),
    potentialCause,
    recommendedAction,
    supportingSignals,
    reasoningIndex: `OPSYN-INTELLIGENCE::HYD-CORRIDOR-VAL-SCORE-${riskScore}`,
    generatedAt: new Date().toISOString(),
    provider: 'local_deterministic',
  };
}
