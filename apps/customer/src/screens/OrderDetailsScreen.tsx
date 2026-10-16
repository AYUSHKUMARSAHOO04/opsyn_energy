import React from 'react';
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
  PriorityBadge,
  Timeline,
  ActionButton,
  colors,
  typography,
  shadows,
  formatCurrency,
  useOrderDetails,
  Order,
  TimelineItem,
} from '@opsyn/shared';

export const OrderDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId, initialOrder } = route.params || {};

  const { data: orderData, isLoading } = useOrderDetails(orderId);
  const order: Order = orderData || initialOrder || {};

  const isDelivered = order.status === 'DELIVERED';
  const isInTransit = order.status === 'IN_TRANSIT';
  const isDelayed = order.status === 'DELAYED';

  // Construct operational timeline based on real status
  const timelineItems: TimelineItem[] = [
    {
      id: 'step-1',
      title: 'Order Confirmed & Staged',
      subtitle: 'Central Cryo-Depot Hub 1',
      time: '08:30 IST',
      status: 'completed',
      description: 'Quality verification completed. Valve seals certified.',
    },
    {
      id: 'step-2',
      title: 'Dispatched to Transport Vehicle',
      subtitle: order.vehicleNumber || 'TS-08-EN-5092 (Cryo-Tanker IV)',
      time: '09:45 IST',
      status: 'completed',
      description: `Driver ${order.driverName || 'Manoj Kumar'} assigned with hazardous materials clearance.`,
    },
    {
      id: 'step-3',
      title: isDelayed ? 'Route Delay Alert' : 'En Route to Destination',
      subtitle: order.deliveryAddress,
      time: order.currentEta,
      status: isDelivered ? 'completed' : isDelayed ? 'alert' : isInTransit ? 'current' : 'pending',
      description: isDelayed
        ? `Telemetry alert: +${order.etaDeviationMinutes || 45}m deviation. Boil-off vent monitoring active.`
        : 'Telemetry link active. GPS coordinates syncing at 30s interval.',
    },
    {
      id: 'step-4',
      title: 'Facility Intake & Manifold Offloading',
      subtitle: order.customerName,
      time: isDelivered ? 'Completed' : `Expected ${order.expectedEta}`,
      status: isDelivered ? 'completed' : 'pending',
      description: isDelivered
        ? 'Digital transfer custody sign-off verified.'
        : 'Awaiting tanker arrival at offloading bay.',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScreenHeader
        title={order.id || 'Order Details'}
        subtitle="Consignment Manifest"
        showLogo={false}
        onBackPress={() => navigation.goBack()}
        rightAction={<StatusBadge status={order.status || 'PENDING'} size="md" />}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Highlight Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.sectionLabel}>ENERGY SKU</Text>
              <Text style={styles.skuTitle}>{order.sku}</Text>
            </View>
            {order.priority && (
              <PriorityBadge priority={order.priority} size="md" />
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.metaLabel}>TOTAL VALUE</Text>
              <Text style={styles.metaValueHighlight}>
                {formatCurrency(order.amountInPaise)}
              </Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.metaLabel}>QUANTITY</Text>
              <Text style={styles.metaValue}>
                {order.quantity || '450 Liters'}
              </Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.metaLabel}>CURRENT ETA</Text>
              <Text
                style={[
                  styles.metaValue,
                  isDelayed && { color: colors.status.delayed, fontWeight: '800' },
                ]}
              >
                {order.currentEta || '16:45 IST'}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer & Delivery Destination Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>DELIVERY DESTINATION</Text>

          <View style={styles.infoRow}>
            <Feather name="briefcase" size={16} color={colors.primary} style={styles.rowIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoPrimary}>{order.customerName}</Text>
              <Text style={styles.infoSecondary}>{order.contactPerson || 'Facility Operations Head'}</Text>
              <Text style={styles.infoPhone}>{order.contactPhone || '+91 98490 12834'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Feather name="map-pin" size={16} color={colors.secondary} style={styles.rowIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoAddress}>{order.deliveryAddress}</Text>
            </View>
          </View>

          {order.driverName && (
            <View style={styles.infoRow}>
              <Feather name="truck" size={16} color={colors.primary} style={styles.rowIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoPrimary}>Assigned Hauler: {order.driverName}</Text>
                <Text style={styles.infoSecondary}>{order.vehicleNumber}</Text>
                <Text style={styles.infoPhone}>{order.driverPhone}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Operational Notes */}
        {order.operationalNotes && (
          <View style={[styles.card, isDelayed && styles.alertCard]}>
            <View style={styles.notesHeader}>
              <MaterialCommunityIcons
                name="information-outline"
                size={18}
                color={isDelayed ? colors.status.delayed : colors.primary}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.cardTitle, isDelayed && { color: colors.status.delayed }]}>
                OPERATIONAL TELEMETRY NOTES
              </Text>
            </View>
            <Text style={styles.notesText}>{order.operationalNotes}</Text>
          </View>
        )}

        {/* Real-Time Delivery Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>DELIVERY PROGRESS TIMELINE</Text>
          <Timeline items={timelineItems} />
        </View>

        {/* Action Controls */}
        <View style={styles.buttonStack}>
          <ActionButton
            title="Call Assigned Hauler"
            icon="phone"
            variant="primary"
            onPress={() => {
              Alert.alert(
                'Contact Hauler',
                `Dialing ${order.driverName || 'driver'} at ${order.driverPhone || '+91 98481 44521'}...`
              );
            }}
          />
          <ActionButton
            title="Download Waybill / BoL"
            icon="download"
            variant="outline"
            style={{ marginTop: 10 }}
            onPress={() => {
              Alert.alert(
                'Digital Consignment Note',
                `Cryptographic Waybill for ${order.id} downloaded successfully.`
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
  alertCard: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  skuTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    maxWidth: 240,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorderSubtle,
    marginVertical: 14,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCol: {
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
    fontSize: typography.sizes.sm,
    fontWeight: '700',
  },
  metaValueHighlight: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: '800',
  },
  cardTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rowIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoPrimary: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: '700',
  },
  infoSecondary: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  infoPhone: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  infoAddress: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },
  buttonStack: {
    marginTop: 10,
  },
});
