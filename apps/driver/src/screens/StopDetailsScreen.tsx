import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  ScreenHeader,
  StatusBadge,
  ActionButton,
  colors,
  typography,
  shadows,
  formatCurrency,
  useUpdateStopStatus,
  TripStop,
  TripStopStatus,
} from '@opsyn/shared';

export const StopDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { tripId, stopId, initialStop, vehicleId } = route.params || {};

  const [currentStatus, setCurrentStatus] = useState<TripStopStatus>(
    initialStop?.status || 'PENDING'
  );
  const [completedAtTime, setCompletedAtTime] = useState<string | null>(
    initialStop?.completedAt || null
  );

  const updateMutation = useUpdateStopStatus();
  const stop: TripStop = initialStop || {};

  const handleUpdateStatus = async (nextStatus: TripStopStatus) => {
    try {
      await updateMutation.mutateAsync({
        tripId,
        stopId,
        status: nextStatus,
      });

      setCurrentStatus(nextStatus);
      if (nextStatus === 'DELIVERED') {
        const timeStr =
          new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          }) + ' IST';
        setCompletedAtTime(timeStr);
      }

      Alert.alert(
        'Stop Status Synchronized',
        `Stop #${stop.stopNumber} successfully transitioned to ${nextStatus}. Operations Command Center and Customer app updated in real-time.`
      );
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Network error updating stop status');
    }
  };

  const isPending = currentStatus === 'PENDING';
  const isInTransit = currentStatus === 'IN_TRANSIT';
  const isDelivered = currentStatus === 'DELIVERED';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScreenHeader
        title={`Stop #${stop.stopNumber || 1}`}
        subtitle={`Order ${stop.orderId}`}
        showLogo={false}
        onBackPress={() => navigation.goBack()}
        rightAction={<StatusBadge status={currentStatus} size="md" />}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Transition Stepper */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>DELIVERY STATUS LIFECYCLE</Text>

          <View style={styles.stepperRow}>
            {/* Step 1: PENDING */}
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isPending
                    ? styles.stepActive
                    : styles.stepCompleted,
                ]}
              >
                <Feather
                  name={isPending ? 'clock' : 'check'}
                  size={14}
                  color={isPending ? colors.primary : '#FFFFFF'}
                />
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  (isPending || isInTransit || isDelivered) && styles.stepLabelHighlight,
                ]}
              >
                Pending
              </Text>
            </View>

            <View style={[styles.stepConnector, (isInTransit || isDelivered) && styles.stepConnectorActive]} />

            {/* Step 2: IN TRANSIT */}
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isInTransit
                    ? styles.stepActive
                    : isDelivered
                    ? styles.stepCompleted
                    : styles.stepInactive,
                ]}
              >
                <Feather
                  name={isDelivered ? 'check' : 'truck'}
                  size={14}
                  color={isInTransit ? colors.primary : isDelivered ? '#FFFFFF' : colors.textMuted}
                />
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  (isInTransit || isDelivered) && styles.stepLabelHighlight,
                ]}
              >
                In Transit
              </Text>
            </View>

            <View style={[styles.stepConnector, isDelivered && styles.stepConnectorActive]} />

            {/* Step 3: DELIVERED */}
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isDelivered ? styles.stepCompleted : styles.stepInactive,
                ]}
              >
                <Feather
                  name="check-circle"
                  size={14}
                  color={isDelivered ? '#FFFFFF' : colors.textMuted}
                />
              </View>
              <Text style={[styles.stepLabel, isDelivered && styles.stepLabelHighlight]}>
                Delivered
              </Text>
            </View>
          </View>

          {/* Stepper Interactive Action Button */}
          <View style={styles.stepperActionArea}>
            {isPending && (
              <ActionButton
                title="Mark In Transit"
                icon="truck"
                variant="primary"
                loading={updateMutation.isPending}
                onPress={() => handleUpdateStatus('IN_TRANSIT')}
              />
            )}

            {isInTransit && (
              <ActionButton
                title="Mark Delivered & Discharge Cargo"
                icon="check-circle"
                variant="secondary"
                loading={updateMutation.isPending}
                onPress={() => handleUpdateStatus('DELIVERED')}
              />
            )}

            {isDelivered && (
              <View style={styles.deliveredCompleteNotice}>
                <Feather name="check" size={16} color={colors.secondary} style={{ marginRight: 6 }} />
                <Text style={styles.deliveredNoticeText}>
                  Delivered successfully at {completedAtTime || '11:22 IST'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Destination & Facility Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>DESTINATION FACILITY</Text>

          <View style={styles.detailRow}>
            <Feather name="briefcase" size={16} color={colors.primary} style={styles.iconStyle} />
            <View style={styles.detailTextCol}>
              <Text style={styles.facilityName}>{stop.customerName}</Text>
              <Text style={styles.contactPerson}>{stop.contactPerson || 'Site Safety Manager'}</Text>
              <Text style={styles.contactPhone}>{stop.contactPhone || '+91 98480 99221'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Feather name="map-pin" size={16} color={colors.secondary} style={styles.iconStyle} />
            <View style={styles.detailTextCol}>
              <Text style={styles.addressText}>{stop.address}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Feather name="clock" size={16} color={colors.primary} style={styles.iconStyle} />
            <View style={styles.detailTextCol}>
              <Text style={styles.etaText}>Target ETA: {stop.eta}</Text>
            </View>
          </View>
        </View>

        {/* Cargo Specification */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CARGO & MANIFEST DATA</Text>

          <View style={styles.cargoGrid}>
            <View style={styles.cargoCol}>
              <Text style={styles.metaLabel}>COMMODITY SKU</Text>
              <Text style={styles.metaValue}>{stop.sku}</Text>
            </View>
            <View style={styles.cargoCol}>
              <Text style={styles.metaLabel}>DISPATCH QUANTITY</Text>
              <Text style={styles.metaValue}>{stop.quantity || 'Standard Volumetric Pack'}</Text>
            </View>
            <View style={styles.cargoCol}>
              <Text style={styles.metaLabel}>CONSIGNMENT VALUE</Text>
              <Text style={styles.metaValueHighlight}>
                {formatCurrency(stop.amountInPaise)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Driver Action Controls */}
        <View style={styles.actionRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <ActionButton
              title="Navigation GPS"
              icon="navigation"
              variant="outline"
              onPress={() => {
                Alert.alert('GPS Route', `Launching navigation to ${stop.address}...`);
              }}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <ActionButton
              title="Call Facility"
              icon="phone"
              variant="outline"
              onPress={() => {
                Alert.alert('Call Facility', `Calling ${stop.contactPhone || '+91 98480 99221'}...`);
              }}
            />
          </View>
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
  cardTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepActive: {
    backgroundColor: 'rgba(0, 210, 255, 0.18)',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  stepCompleted: {
    backgroundColor: colors.secondary,
  },
  stepInactive: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
  },
  stepLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  stepLabelHighlight: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.surfaceBorder,
    marginHorizontal: 8,
    marginBottom: 18,
  },
  stepConnectorActive: {
    backgroundColor: colors.secondary,
  },
  stepperActionArea: {
    marginTop: 4,
  },
  deliveredCompleteNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  deliveredNoticeText: {
    color: colors.secondary,
    fontSize: typography.sizes.sm,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  iconStyle: {
    marginTop: 2,
    marginRight: 10,
  },
  detailTextCol: {
    flex: 1,
  },
  facilityName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  contactPerson: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  contactPhone: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  addressText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },
  etaText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: '700',
  },
  cargoGrid: {
    gap: 12,
  },
  cargoCol: {
    marginBottom: 4,
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  metaValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  metaValueHighlight: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
});
