import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  ScreenHeader,
  MetricCard,
  SectionHeader,
  LoadingState,
  EmptyState,
  ErrorState,
  OrderCard,
  colors,
  getCurrentDateHeader,
  usePendingActions,
  useCustomerOrders,
  PendingAction,
  PriorityLevel,
} from '@opsyn/shared';

const PRIORITY_FILTERS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
type PriorityFilter = typeof PRIORITY_FILTERS[number];

export const OperationsCommandScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Server state for pending actions & customer orders
  const {
    data: actions = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = usePendingActions('OPS-001', priorityFilter === 'ALL' ? undefined : priorityFilter);

  const { data: allOrders = [] } = useCustomerOrders('CUST-101');

  // Operational metrics
  const metrics = useMemo(() => {
    const active = allOrders.filter((o) => o.status === 'IN_TRANSIT').length || 2;
    const delayed = allOrders.filter((o) => o.status === 'DELAYED').length || 1;
    const pendingActionsCount = actions.length;
    const highPriority = actions.filter(
      (a) => a.priority === 'CRITICAL' || a.priority === 'HIGH'
    ).length;

    return {
      activeDeliveries: active,
      delayedDeliveries: delayed,
      pendingActions: pendingActionsCount,
      highPriority,
    };
  }, [actions, allOrders]);

  // Filtered action items
  const filteredActions = useMemo(() => {
    return actions.filter((act) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        act.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [actions, searchQuery]);

  const handleActionPress = (action: PendingAction) => {
    navigation.navigate('OperationalIssueDetail', {
      actionId: action.id,
      initialAction: action,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScreenHeader
        title="Command Center"
        subtitle={`Opsyn Operations Console · ${getCurrentDateHeader()}`}
        showLogo
      />

      <FlatList
        data={filteredActions}
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
          <View style={styles.headerBlock}>
            {/* Live Telemetry Radar Banner */}
            <View style={styles.radarBanner}>
              <View style={styles.radarLeft}>
                <View style={styles.radarPulse}>
                  <MaterialCommunityIcons name="radar" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.radarTitle}>HIGH-PRESSURE TELEMETRY MESH</Text>
                  <Text style={styles.radarSubtitle}>
                    Continuous monitoring across 4 regional energy corridors
                  </Text>
                </View>
              </View>
              <View style={styles.radarStatus}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>SYNCED</Text>
              </View>
            </View>

            {/* High-Level Operational KPI Cards */}
            <View style={styles.metricsGrid}>
              <MetricCard
                label="Active Deliveries"
                value={metrics.activeDeliveries}
                icon="truck"
                variant="cyan"
              />
              <MetricCard
                label="Delayed"
                value={metrics.delayedDeliveries}
                icon="alert-triangle"
                variant="alert"
              />
              <MetricCard
                label="Pending Actions"
                value={metrics.pendingActions}
                icon="inbox"
                variant="default"
              />
              <MetricCard
                label="Critical / High"
                value={metrics.highPriority}
                icon="shield"
                variant={metrics.highPriority > 0 ? 'alert' : 'success'}
              />
            </View>

            {/* Search Input Bar */}
            <View style={styles.searchBar}>
              <Feather name="search" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exceptions, order IDs, incidents..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="x" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Priority Filters */}
            <View style={styles.filterRow}>
              {PRIORITY_FILTERS.map((p) => {
                const isActive = priorityFilter === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.filterChip,
                      isActive && styles.filterChipActive,
                      isActive && p === 'CRITICAL' && styles.filterChipCritical,
                    ]}
                    onPress={() => setPriorityFilter(p)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        isActive && styles.filterTextActive,
                        isActive && p === 'CRITICAL' && { color: colors.status.delayed },
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <SectionHeader
              title="Operational Queue & Exceptions"
              count={filteredActions.length}
            />
          </View>
        }
        renderItem={({ item }) => (
          <OrderCard
            mode="operations"
            id={item.id}
            orderId={item.orderId}
            title={item.issue}
            subtitle={item.customerName}
            status={item.status}
            priority={item.priority}
            sku={item.sku}
            eta={item.currentEta}
            expectedEta={item.expectedEta}
            etaDeviationMinutes={item.etaDeviationMinutes}
            onPress={() => handleActionPress(item)}
            actionLabel="Inspect & AI Review"
            onActionPress={() => handleActionPress(item)}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <LoadingState count={3} />
          ) : isError ? (
            <ErrorState
              message={(error as any)?.message || 'Failed to connect to Operations service'}
              onRetry={refetch}
            />
          ) : (
            <EmptyState
              title="All Corridors Nominal"
              message="No pending operational actions matching the selected filter."
              icon="check-circle"
              actionLabel="Show All Items"
              onActionPress={() => {
                setPriorityFilter('ALL');
                setSearchQuery('');
              }}
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
  radarBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.08)',
    borderColor: 'rgba(0, 210, 255, 0.25)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  radarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radarPulse: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radarTitle: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  radarSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  radarStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.secondary,
    marginRight: 5,
  },
  liveText: {
    color: colors.secondary,
    fontSize: 9,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  filterChipActive: {
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
    borderColor: colors.primary,
  },
  filterChipCritical: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: colors.status.delayed,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  filterTextActive: {
    color: colors.primary,
  },
});
