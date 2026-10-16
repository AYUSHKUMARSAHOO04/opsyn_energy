import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  ScreenHeader,
  MetricCard,
  ProgressIndicator,
  SectionHeader,
  LoadingState,
  EmptyState,
  ErrorState,
  OrderCard,
  colors,
  typography,
  shadows,
  getCurrentDateHeader,
  useDriverTrip,
  TripStop,
} from '@opsyn/shared';

export const DriverTripScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Fetch active trip via TanStack Query
  const { data: trip, isLoading, isError, error, refetch, isRefetching } = useDriverTrip('DRV-301');

  const stops = trip?.stops || [];
  const completedStops = stops.filter((s) => s.status === 'DELIVERED').length;
  const totalStops = stops.length;
  const remainingStops = totalStops - completedStops;

  const handleStopPress = (stop: TripStop) => {
    if (!trip) return;
    navigation.navigate('StopDetails', {
      tripId: trip.id,
      stopId: stop.id,
      initialStop: stop,
      vehicleId: trip.vehicleId,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScreenHeader
        title="Today's Trip"
        subtitle={getCurrentDateHeader()}
        showLogo
      />

      <FlatList
        data={stops}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          trip ? (
            <View style={styles.headerBlock}>
              {/* Trip Vehicle & Route Banner */}
              <View style={styles.routeBanner}>
                <View style={styles.bannerLeft}>
                  <View style={styles.tripBadge}>
                    <Text style={styles.tripBadgeText}>{trip.id}</Text>
                  </View>
                  <Text style={styles.vehicleText}>{trip.vehicleId}</Text>
                </View>
                <View style={styles.bannerRight}>
                  <Feather name="clock" size={13} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.completionEtaText}>Est. {trip.estimatedCompletion}</Text>
                </View>
              </View>

              {/* Progress Indicator */}
              <View style={styles.progressCard}>
                <ProgressIndicator
                  current={completedStops}
                  total={totalStops}
                  label="Trip Delivery Progress"
                />

                <View style={styles.telemetryMiniRow}>
                  <View style={styles.telemetryPill}>
                    <MaterialCommunityIcons name="gas-cylinder" size={13} color={colors.primary} />
                    <Text style={styles.telemetryPillText}>Pressure: 4.2 Bar</Text>
                  </View>
                  <View style={styles.telemetryPill}>
                    <MaterialCommunityIcons name="gas-station" size={13} color={colors.secondary} />
                    <Text style={styles.telemetryPillText}>Fuel: 78%</Text>
                  </View>
                </View>
              </View>

              {/* KPI Metrics */}
              <View style={styles.metricsRow}>
                <MetricCard
                  label="Total Stops"
                  value={totalStops}
                  icon="map-pin"
                  variant="default"
                />
                <MetricCard
                  label="Completed"
                  value={completedStops}
                  icon="check-circle"
                  variant="success"
                />
                <MetricCard
                  label="Remaining"
                  value={remainingStops}
                  icon="navigation"
                  variant={remainingStops > 0 ? 'cyan' : 'success'}
                />
              </View>

              <SectionHeader
                title="Delivery Stops Sequence"
                count={`${completedStops}/${totalStops}`}
              />
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <OrderCard
            mode="driver"
            id={item.id}
            orderId={item.orderId}
            stopNumber={index + 1}
            title={item.customerName}
            address={item.address}
            status={item.status}
            sku={item.sku}
            quantity={item.quantity}
            eta={item.eta}
            onPress={() => handleStopPress(item)}
            actionLabel="Update Stop"
            onActionPress={() => handleStopPress(item)}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <LoadingState count={4} />
          ) : isError ? (
            <ErrorState
              message={(error as any)?.message || 'Unable to load trip manifest'}
              onRetry={refetch}
            />
          ) : (
            <EmptyState
              title="No Trip Assigned"
              message="No delivery trips currently assigned to driver DRV-301 for today."
              icon="map"
            />
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  headerBlock: {
    paddingTop: 12,
  },
  routeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    ...shadows.subtle,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tripBadge: {
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 10,
  },
  tripBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  vehicleText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    flex: 1,
  },
  bannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionEtaText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  telemetryMiniRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorderSubtle,
  },
  telemetryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  telemetryPillText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
});
