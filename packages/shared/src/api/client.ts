import { ApiError, RequestOptions } from '../types/api';
import { Order } from '../types/order';
import { Trip, TripStop, TripStopStatus } from '../types/trip';
import { PendingAction } from '../types/pendingAction';

// In-memory fallback dataset in case network is unreachable during mobile demos
import mockData from '../../../../mock-api.json';

const DEFAULT_TIMEOUT_MS = 8000;

export interface ApiClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  enableOfflineFallback?: boolean;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private enableOfflineFallback: boolean;
  // Local mutable state for fallback mutations
  private localDb: typeof mockData;

  constructor(config?: Partial<ApiClientConfig>) {
    // Process env in Expo or default localhost:4000
    const envUrl = typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL;
    this.baseUrl = config?.baseUrl || envUrl || 'http://localhost:4000';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(config?.defaultHeaders || {}),
    };
    this.enableOfflineFallback = config?.enableOfflineFallback ?? true;
    this.localDb = JSON.parse(JSON.stringify(mockData));
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Core request wrapper handling timeouts, abort signals, idempotency keys, and error normalization.
   */
  public async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    const controller = new AbortController();
    const timeout = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    // Chain caller's signal if provided
    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(options.headers || {}),
    };

    // Attach Idempotency-Key for mutating requests (POST, PUT, PATCH, DELETE)
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      headers['Idempotency-Key'] =
        options.idempotencyKey ||
        `opsyn-idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: response.statusText };
        }

        const apiError: ApiError = {
          message: errorData.error || errorData.message || `HTTP ${response.status}: Request failed`,
          code: errorData.code || `HTTP_${response.status}`,
          status: response.status,
          details: errorData,
        };
        throw apiError;
      }

      const json = await response.json();
      return json as T;
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        const abortError: ApiError = {
          message: 'Request was aborted or timed out',
          code: 'REQUEST_ABORTED',
          status: 408,
        };
        throw abortError;
      }

      // If network failure occurs and fallback is enabled, gracefully use local dataset
      if (this.enableOfflineFallback && (!err.status || err.name === 'TypeError')) {
        console.warn(`[Opsyn API Client] Network unreachable at ${url}. Operating in resilient fallback mode.`);
        return this.handleFallback<T>(endpoint, method, body, options);
      }

      const normalizedError: ApiError = {
        message: err.message || 'Unknown network error occurred',
        code: err.code || 'NETWORK_ERROR',
        status: err.status || 0,
        details: err,
      };
      throw normalizedError;
    }
  }

  /**
   * Seamless offline fallback router to guarantee demo stability regardless of network state
   */
  private handleFallback<T>(
    endpoint: string,
    method: string,
    body?: any,
    options?: RequestOptions
  ): T {
    const cleanEndpoint = endpoint.split('?')[0].replace(/^\//, '');
    const searchParams = new URLSearchParams(endpoint.includes('?') ? endpoint.split('?')[1] : '');

    if (cleanEndpoint === 'orders') {
      let orders = (this.localDb.orders || []) as Order[];
      const customerId = searchParams.get('customerId');
      if (customerId) {
        orders = orders.filter((o) => o.customerId === customerId);
      }
      return orders as unknown as T;
    }

    if (cleanEndpoint.startsWith('orders/')) {
      const id = cleanEndpoint.replace('orders/', '');
      const order = (this.localDb.orders || []).find((o: any) => o.id === id);
      if (!order) throw { message: 'Order not found', code: 'NOT_FOUND', status: 404 } as ApiError;
      return order as unknown as T;
    }

    if (cleanEndpoint === 'trips') {
      let trips = (this.localDb.trips || []) as Trip[];
      const driverId = searchParams.get('driverId');
      if (driverId) {
        trips = trips.filter((t) => t.driverId === driverId);
      }
      return trips as unknown as T;
    }

    if (cleanEndpoint.startsWith('trips/')) {
      // Check if patch to stop: trips/:tripId/stops/:stopId
      const parts = cleanEndpoint.split('/');
      if (parts.length === 4 && parts[2] === 'stops' && method === 'PATCH') {
        const tripId = parts[1];
        const stopId = parts[3];
        const trip = (this.localDb.trips || []).find((t: any) => t.id === tripId);
        if (!trip) throw { message: 'Trip not found', code: 'NOT_FOUND', status: 404 } as ApiError;
        const stop = trip.stops.find((s: any) => s.id === stopId);
        if (!stop) throw { message: 'Stop not found', code: 'NOT_FOUND', status: 404 } as ApiError;

        stop.status = body.status;
        if (body.status === 'DELIVERED') {
          stop.completedAt = 'Just now';
        }

        const completed = trip.stops.filter((s: any) => s.status === 'DELIVERED').length;
        trip.completedStops = completed;
        trip.remainingStops = trip.stops.length - completed;
        trip.status = completed === trip.stops.length ? 'COMPLETED' : 'IN_TRANSIT';

        return { success: true, trip, stop, idempotencyKey: options?.idempotencyKey } as unknown as T;
      }

      const id = parts[1];
      const trip = (this.localDb.trips || []).find((t: any) => t.id === id);
      if (!trip) throw { message: 'Trip not found', code: 'NOT_FOUND', status: 404 } as ApiError;
      return trip as unknown as T;
    }

    if (cleanEndpoint === 'pending-actions') {
      let actions = (this.localDb['pending-actions'] || []) as PendingAction[];
      const adminId = searchParams.get('adminId');
      const priority = searchParams.get('priority');
      if (adminId) {
        actions = actions.filter((a) => a.adminId === adminId);
      }
      if (priority) {
        actions = actions.filter((a) => a.priority.toLowerCase() === priority.toLowerCase());
      }
      return actions as unknown as T;
    }

    if (cleanEndpoint.startsWith('pending-actions/')) {
      const id = cleanEndpoint.replace('pending-actions/', '');
      const action = (this.localDb['pending-actions'] || []).find((a: any) => a.id === id);
      if (!action) throw { message: 'Pending action not found', code: 'NOT_FOUND', status: 404 } as ApiError;
      return action as unknown as T;
    }

    return [] as unknown as T;
  }

  // Domain Methods

  public async getOrders(customerId?: string, options?: RequestOptions): Promise<Order[]> {
    const query = customerId ? `?customerId=${encodeURIComponent(customerId)}` : '';
    return this.request<Order[]>(`orders${query}`, 'GET', undefined, options);
  }

  public async getOrderById(orderId: string, options?: RequestOptions): Promise<Order> {
    return this.request<Order>(`orders/${encodeURIComponent(orderId)}`, 'GET', undefined, options);
  }

  public async getTrips(driverId?: string, options?: RequestOptions): Promise<Trip[]> {
    const query = driverId ? `?driverId=${encodeURIComponent(driverId)}` : '';
    return this.request<Trip[]>(`trips${query}`, 'GET', undefined, options);
  }

  public async getTripById(tripId: string, options?: RequestOptions): Promise<Trip> {
    return this.request<Trip>(`trips/${encodeURIComponent(tripId)}`, 'GET', undefined, options);
  }

  public async updateTripStopStatus(
    tripId: string,
    stopId: string,
    status: TripStopStatus,
    options?: RequestOptions
  ): Promise<{ success: boolean; trip: Trip; stop: TripStop }> {
    return this.request<{ success: boolean; trip: Trip; stop: TripStop }>(
      `trips/${encodeURIComponent(tripId)}/stops/${encodeURIComponent(stopId)}`,
      'PATCH',
      { status },
      options
    );
  }

  public async getPendingActions(
    adminId?: string,
    priority?: string,
    options?: RequestOptions
  ): Promise<PendingAction[]> {
    const params = new URLSearchParams();
    if (adminId) params.append('adminId', adminId);
    if (priority && priority !== 'ALL') params.append('priority', priority);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<PendingAction[]>(`pending-actions${query}`, 'GET', undefined, options);
  }

  public async getPendingActionById(actionId: string, options?: RequestOptions): Promise<PendingAction> {
    return this.request<PendingAction>(
      `pending-actions/${encodeURIComponent(actionId)}`,
      'GET',
      undefined,
      options
    );
  }
}

// Global Singleton Instance
export const apiClient = new ApiClient();
