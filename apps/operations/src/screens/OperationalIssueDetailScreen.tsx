import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  ScreenHeader,
  PriorityBadge,
  StatusBadge,
  ActionButton,
  AIInsightCard,
  colors,
  typography,
  shadows,
  formatCurrency,
  generateOperationalInsight,
  usePendingActionDetails,
  PendingAction,
  OperationalInsight,
} from '@opsyn/shared';

export const OperationalIssueDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { actionId, initialAction } = route.params || {};

  const { data: serverAction } = usePendingActionDetails(actionId);
  const action: PendingAction = serverAction || initialAction || {};

  const [insight, setInsight] = useState<OperationalInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleGenerateAIInsight = async () => {
    setIsAnalyzing(true);
    try {
      // Calls local deterministic operational intelligence engine with 900ms visual telemetry processing delay
      const generated = await generateOperationalInsight(
        {
          orderId: action.orderId,
          sku: action.sku,
          currentStatus: 'DELAYED',
          expectedEta: action.expectedEta,
          currentEta: action.currentEta,
          etaDeviationMinutes: action.etaDeviationMinutes || 45,
          priority: action.priority,
          amountInPaise: action.amountInPaise,
          driverName: action.driverName,
          elapsedTransitMinutes: action.telemetry?.elapsedTransitMinutes || 165,
        },
        { simulateLatencyMs: 900 }
      );
      setInsight(generated);
    } catch (err: any) {
      Alert.alert('Analysis Failed', err.message || 'Error executing intelligence engine');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScreenHeader
        title={action.id || 'Action Detail'}
        subtitle={`Order ${action.orderId}`}
        showLogo={false}
        onBackPress={() => navigation.goBack()}
        rightAction={<PriorityBadge priority={action.priority || 'CRITICAL'} size="md" />}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Issue Overview Card */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.alertIconWrap}>
              <MaterialCommunityIcons name="alert-octagon" size={20} color={colors.status.delayed} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.issueTitle}>{action.issue}</Text>
              <Text style={styles.customerSub}>{action.customerName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaGrid}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>ORDER ID</Text>
              <Text style={styles.metaValueHighlight}>{action.orderId}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>TARGET ETA</Text>
              <Text style={styles.metaValue}>{action.expectedEta}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>CURRENT ETA</Text>
              <Text style={[styles.metaValue, styles.delayedVal]}>
                {action.currentEta}
              </Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>DELAY</Text>
              <Text style={[styles.metaValue, styles.delayedVal]}>
                +{action.etaDeviationMinutes || 45} min
              </Text>
            </View>
          </View>
        </View>

        {/* Live Telemetry Sensor Mesh */}
        {action.telemetry && (
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Feather name="activity" size={15} color={colors.primary} />
              <Text style={styles.sectionTitle}>REAL-TIME TELEMETRY SENSORS</Text>
            </View>

            <View style={styles.sensorGrid}>
              <View style={styles.sensorBox}>
                <Text style={styles.sensorLabel}>CRYOGENIC PRESSURE</Text>
                <Text style={styles.sensorVal}>
                  {action.telemetry.cryoTankPressureBar ? `${action.telemetry.cryoTankPressureBar} bar` : 'Nominal'}
                </Text>
              </View>
              <View style={styles.sensorBox}>
                <Text style={styles.sensorLabel}>BOIL-OFF RATE</Text>
                <Text style={styles.sensorVal}>
                  {action.telemetry.boilOffRatePercentPerHour ? `${action.telemetry.boilOffRatePercentPerHour}% / hr` : '0.1% / hr'}
                </Text>
              </View>
              <View style={styles.sensorBox}>
                <Text style={styles.sensorLabel}>TRANSIT DURATION</Text>
                <Text style={styles.sensorVal}>
                  {action.telemetry.elapsedTransitMinutes} min
                </Text>
              </View>
              <View style={styles.sensorBox}>
                <Text style={styles.sensorLabel}>RISK INDEX</Text>
                <Text style={[styles.sensorVal, { color: colors.status.delayed }]}>
                  {action.telemetry.riskScore} / 100
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Standard Dispatch Recommendation */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>DISPATCH QUEUE RECOMMENDATION</Text>
          <Text style={styles.recommendationText}>{action.recommendedAction}</Text>

          <View style={styles.driverInfoRow}>
            <Feather name="user" size={14} color={colors.secondary} style={{ marginRight: 6 }} />
            <Text style={styles.driverText}>
              Assigned Hauler: <Text style={styles.driverName}>{action.driverName || 'Manoj Kumar'}</Text> ({action.driverPhone || '+91 98481 44521'})
            </Text>
          </View>
        </View>

        {/* OPSYN INTELLIGENCE SECTION */}
        <View style={styles.intelligenceWrapper}>
          {!insight && !isAnalyzing && (
            <View style={styles.triggerCard}>
              <View style={styles.aiHeader}>
                <MaterialCommunityIcons name="lightning-bolt" size={24} color={colors.primary} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.aiTitle}>Opsyn Intelligence Engine</Text>
                  <Text style={styles.aiSubtitle}>
                    Synthesizes ETA telemetry, traffic congestion corridor, and boil-off thresholds to generate actionable mitigations.
                  </Text>
                </View>
              </View>

              <ActionButton
                title="Generate AI Insight"
                icon="cpu"
                variant="ai"
                style={styles.aiButton}
                onPress={handleGenerateAIInsight}
              />
            </View>
          )}

          {/* Polished Scanning / Analyzing State */}
          {isAnalyzing && (
            <View style={styles.analyzingCard}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.analyzingTitle}>Analyzing operational data...</Text>
              <Text style={styles.analyzingSubtitle}>
                Running deterministic Bayesian telemetry matrix across Hyderabad Industrial Corridor...
              </Text>
            </View>
          )}

          {/* Rendered Opsyn Intelligence Card */}
          {insight && <AIInsightCard insight={insight} />}
        </View>

        {/* Operations Execution Actions */}
        <View style={styles.buttonStack}>
          <ActionButton
            title={`Contact Driver ${action.driverName || 'Manoj Kumar'}`}
            icon="phone"
            variant="primary"
            onPress={() => {
              Alert.alert(
                'Direct Telemetry Call',
                `Connecting encrypted voice link to ${action.driverName} (${action.driverPhone})...`
              );
            }}
          />

          <ActionButton
            title="Dispatch Secondary Escort Hauler"
            icon="truck"
            variant="secondary"
            style={{ marginTop: 10 }}
            onPress={() => {
              Alert.alert(
                'Escort Dispatch Triggered',
                `Auxiliary Cryo-Skid unit dispatched from IDA Pashamylaram Depot to rendezvous with ${action.orderId}.`
              );
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    ...shadows.subtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  issueTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    lineHeight: 20,
  },
  customerSub: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorderSubtle,
    marginVertical: 14,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  metaValueHighlight: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  delayedVal: {
    color: colors.status.delayed,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sensorBox: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSubtle,
  },
  sensorLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sensorVal: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  recommendationText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  driverInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    padding: 10,
  },
  driverText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  driverName: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  intelligenceWrapper: {
    marginVertical: 4,
  },
  triggerCard: {
    backgroundColor: 'rgba(0, 210, 255, 0.06)',
    borderColor: 'rgba(0, 210, 255, 0.35)',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    ...shadows.glowCyan,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  aiTitle: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  aiSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 3,
  },
  aiButton: {
    marginTop: 4,
  },
  analyzingCard: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...shadows.glowCyan,
  },
  analyzingTitle: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: '800',
    marginTop: 12,
  },
  analyzingSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
  },
  buttonStack: {
    marginTop: 6,
  },
});
