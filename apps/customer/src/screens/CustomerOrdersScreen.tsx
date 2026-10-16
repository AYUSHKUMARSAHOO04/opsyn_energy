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
import { Feather } from '@expo/vector-icons';
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
  formatCurrency,
  getCurrentDateHeader,
  useCustomerOrders,
  Order,
} from '@opsyn/shared';

const FILTER_OPTIONS = ['ALL', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'PENDING'] as const;
type FilterType = typeof FILTER_OPTIONS[number];

export const CustomerOrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // TanStack React Query for Customer Orders
  const { data: orders = [], isLoading, isError, error, refetch, isRefetching } = useCustomerOrders('CUST-101');

  // Compute summary metrics dynamically
  const metrics = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter((o) => o.status === 'DELIVERED').length;
    const inTransit = orders.filter((o) => o.status === 'IN_TRANSIT').length;
    const delayed = orders.filter((o) => o.status === 'DELAYED').length;
    const totalVal = orders.reduce((sum, o) => sum + (o.amountInPaise || 0), 0);

    return { total, delivered, inTransit, delayed, totalVal };
  }, [orders]);

  // Filter & Search
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter =
        filter === 'ALL' || order.status.toUpperCase() === filter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [orders, filter, searchQuery]);

  const handleOrderPress = (order: Order) => {
    navigation.navigate('OrderDetails', { orderId: order.id, initialOrder: order });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScreenHeader
        title="Today's Orders"
        subtitle={getCurrentDateHeader()}
        showLogo
      />

      <FlatList
        data={filteredOrders}
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
          <View style={styles.headerContent}>
            {/* KPI Metrics Grid */}
            <View style={styles.metricsRow}>
              <MetricCard
                label="Total Orders"
                value={metrics.total}
                icon="box"
                variant="cyan"
              />
              <MetricCard
                label="Delivered"
                value={metrics.delivered}
                icon="check-circle"
                variant="success"
              />
              <MetricCard
                label="In Transit"
                value={metrics.inTransit}
                icon="truck"
                variant="cyan"
              />
              <MetricCard
                label="Total Value"
                value={formatCurrency(metrics.totalVal)}
                icon="credit-card"
                variant="default"
              />
            </View>

            {/* Search Input Bar */}
            <View style={styles.searchBar}>
              <Feather name="search" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search orders, SKU, facility..."
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

            {/* Status Filter Chips */}
            <View style={styles.filterRow}>
              {FILTER_OPTIONS.map((opt) => {
                const isActive = filter === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setFilter(opt)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                      {opt.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <SectionHeader
              title="Active Consignments"
              count={filteredOrders.length}
            />
          </View>
        }
        renderItem={({ item }) => (
          <OrderCard
            mode="customer"
            id={item.id}
            title={item.customerName}
            subtitle={item.deliveryAddress}
            status={item.status}
            priority={item.priority}
            sku={item.sku}
            amountInPaise={item.amountInPaise}
            eta={item.currentEta}
            etaDeviationMinutes={item.etaDeviationMinutes}
            onPress={() => handleOrderPress(item)}
            actionLabel="View Details"
            onActionPress={() => handleOrderPress(item)}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <LoadingState count={3} />
          ) : isError ? (
            <ErrorState
              message={(error as any)?.message || 'Failed to connect to energy dispatch server'}
              onRetry={refetch}
            />
          ) : (
            <EmptyState
              title="No Consignments Found"
              message={
                searchQuery
                  ? `No orders matching "${searchQuery}". Try adjusting your search query.`
                  : 'There are no active orders matching this filter today.'
              }
              icon="package"
              actionLabel="Reset Filters"
              onActionPress={() => {
                setFilter('ALL');
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
  headerContent: {
    paddingTop: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
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
    marginBottom: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  filterChipActive: {
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
    borderColor: colors.primary,
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
