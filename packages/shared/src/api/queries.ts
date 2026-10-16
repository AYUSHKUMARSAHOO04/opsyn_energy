import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { Order } from '../types/order';
import { Trip, TripStopStatus } from '../types/trip';
import { PendingAction } from '../types/pendingAction';

export const queryKeys = {
  orders: (customerId?: string) => ['orders', customerId] as const,
  order: (orderId: string) => ['order', orderId] as const,
  trips: (driverId?: string) => ['trips', driverId] as const,
  trip: (tripId: string) => ['trip', tripId] as const,
  pendingActions: (adminId?: string, priority?: string) => ['pendingActions', adminId, priority] as const,
  pendingAction: (actionId: string) => ['pendingAction', actionId] as const,
};

export function useCustomerOrders(customerId: string = 'CUST-101') {
  return useQuery<Order[]>({
    queryKey: queryKeys.orders(customerId),
    queryFn: ({ signal }) => apiClient.getOrders(customerId, { signal }),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useOrderDetails(orderId: string) {
  return useQuery<Order>({
    queryKey: queryKeys.order(orderId),
    queryFn: ({ signal }) => apiClient.getOrderById(orderId, { signal }),
    enabled: !!orderId,
  });
}

export function useDriverTrip(driverId: string = 'DRV-301') {
  return useQuery<Trip | null>({
    queryKey: queryKeys.trips(driverId),
    queryFn: async ({ signal }) => {
      const trips = await apiClient.getTrips(driverId, { signal });
      return trips && trips.length > 0 ? trips[0] : null;
    },
    staleTime: 1000 * 30,
  });
}

export function useUpdateStopStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tripId,
      stopId,
      status,
    }: {
      tripId: string;
      stopId: string;
      status: TripStopStatus;
    }) => apiClient.updateTripStopStatus(tripId, stopId, status),
    onSuccess: (data, variables) => {
      // Invalidate queries so all apps reflect the live status update
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function usePendingActions(adminId: string = 'OPS-001', priority?: string) {
  return useQuery<PendingAction[]>({
    queryKey: queryKeys.pendingActions(adminId, priority),
    queryFn: ({ signal }) => apiClient.getPendingActions(adminId, priority, { signal }),
    staleTime: 1000 * 30,
  });
}

export function usePendingActionDetails(actionId: string) {
  return useQuery<PendingAction>({
    queryKey: queryKeys.pendingAction(actionId),
    queryFn: ({ signal }) => apiClient.getPendingActionById(actionId, { signal }),
    enabled: !!actionId,
  });
}
