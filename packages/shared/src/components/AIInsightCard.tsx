import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { OperationalInsight } from '../types/intelligence';

export interface AIInsightCardProps {
  insight: OperationalInsight;
  style?: ViewStyle;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ insight, style }) => {
  const isHighRisk = insight.riskLevel === 'HIGH' || insight.riskLevel === 'CRITICAL';
  const riskColor =
    insight.riskLevel === 'CRITICAL'
      ? colors.priority.critical
      : insight.riskLevel === 'HIGH'
      ? colors.priority.high
      : insight.riskLevel === 'MEDIUM'
      ? colors.priority.medium
      : colors.priority.low;

  return (
    <View style={[styles.card, style]}>
      {/* Header with Opsyn Intelligence Glow */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.sparkleWrap}>
            <MaterialCommunityIcons name="lightning-bolt" size={16} color={colors.primary} />
          </View>
          <Text style={styles.brandText}>OPSYN INTELLIGENCE</Text>
        </View>

        <View style={[styles.riskBadge, { borderColor: riskColor, backgroundColor: riskColor + '18' }]}>
          <Text style={[styles.riskLabel, { color: riskColor }]}>
            {insight.riskLevel} RISK
          </Text>
        </View>
      </View>

      {/* Confidence & Reasoning Score */}
      <View style={styles.telemetryMeta}>
        <View style={styles.confidenceRow}>
          <Feather name="shield" size={13} color={colors.secondary} style={{ marginRight: 5 }} />
          <Text style={styles.confidenceText}>
            Confidence: <Text style={styles.boldText}>{insight.confidenceScore}%</Text>
          </Text>
        </View>
        <Text style={styles.reasoningText}>
          Deterministic Telemetry Engine
        </Text>
      </View>

      {/* Potential Cause Section */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionTitleRow}>
          <Feather name="alert-circle" size={14} color={isHighRisk ? colors.status.delayed : colors.primary} />
          <Text style={styles.sectionTitle}>POTENTIAL CAUSE</Text>
        </View>
        <Text style={styles.bodyText}>{insight.potentialCause}</Text>
      </View>

      {/* Recommended Action Section */}
      <View style={[styles.sectionBlock, styles.actionBlock]}>
        <View style={styles.sectionTitleRow}>
          <Feather name="check-circle" size={14} color={colors.secondary} />
          <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
            RECOMMENDED ACTION
          </Text>
        </View>
        <Text style={[styles.bodyText, styles.actionBodyText]}>
          {insight.recommendedAction}
        </Text>
      </View>

      {/* Supporting Signals */}
      {insight.supportingSignals && insight.supportingSignals.length > 0 && (
        <View style={styles.signalsContainer}>
          <Text style={styles.signalsHeader}>SUPPORTING SIGNALS</Text>
          <View style={styles.signalsGrid}>
            {insight.supportingSignals.map((sig, idx) => {
              const sigColor =
                sig.status === 'alert'
                  ? colors.status.delayed
                  : sig.status === 'warning'
                  ? colors.status.pending
                  : colors.secondary;

              return (
                <View key={idx} style={styles.signalChip}>
                  <View style={[styles.sigDot, { backgroundColor: sigColor }]} />
                  <View style={styles.sigContent}>
                    <Text style={styles.sigLabel}>{sig.label}</Text>
                    <Text style={[styles.sigVal, { color: sigColor }]} numberOfLines={1}>
                      {sig.value}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Reasoning Index Footer */}
      <View style={styles.footerRow}>
        <Feather name="cpu" size={12} color={colors.textMuted} style={{ marginRight: 6 }} />
        <Text style={styles.footerText} numberOfLines={1}>
          Signature: {insight.reasoningIndex}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderColor: 'rgba(0, 210, 255, 0.45)',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    ...shadows.glowCyan,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkleWrap: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  brandText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  riskLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  telemetryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorderSubtle,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  boldText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  reasoningText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },
  sectionBlock: {
    marginBottom: 12,
  },
  actionBlock: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginLeft: 6,
  },
  bodyText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  actionBodyText: {
    color: '#F0FDF4',
    fontWeight: '500',
  },
  signalsContainer: {
    marginTop: 4,
    marginBottom: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorderSubtle,
  },
  signalsHeader: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  signalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  signalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: '48%',
  },
  sigDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  sigContent: {
    flex: 1,
  },
  sigLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sigVal: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorderSubtle,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 10,
    flex: 1,
  },
});
