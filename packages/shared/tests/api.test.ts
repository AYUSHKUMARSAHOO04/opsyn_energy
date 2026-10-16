import { describe, it, expect } from 'vitest';
import { ApiClient } from '../src/api/client';

describe('ApiClient', () => {
  it('initializes with default URL and configuration', () => {
    const client = new ApiClient({ baseUrl: 'http://localhost:4000' });
    expect(client.getBaseUrl()).toBe('http://localhost:4000');
  });

  it('allows dynamic baseUrl updates', () => {
    const client = new ApiClient({ baseUrl: 'http://localhost:4000' });
    client.setBaseUrl('http://192.168.1.50:4000/');
    expect(client.getBaseUrl()).toBe('http://192.168.1.50:4000');
  });

  it('seamlessly serves local fallback when network is unreachable', async () => {
    // Non-existent port to force network error
    const client = new ApiClient({
      baseUrl: 'http://127.0.0.1:9999',
      enableOfflineFallback: true,
    });

    const orders = await client.getOrders('CUST-101');
    expect(orders).toBeDefined();
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders[0].customerId).toBe('CUST-101');
  });

  it('updates trip stop in fallback mode and marks completion', async () => {
    const client = new ApiClient({
      baseUrl: 'http://127.0.0.1:9999',
      enableOfflineFallback: true,
    });

    const result = await client.updateTripStopStatus('TRIP-204', 'STOP-03', 'DELIVERED');
    expect(result.success).toBe(true);
    expect(result.stop.status).toBe('DELIVERED');
  });
});
