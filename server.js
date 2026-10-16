const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_FILE = path.join(__dirname, 'mock-api.json');

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'x-request-id']
}));
app.use(express.json());

// Helper to read database
function readDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading mock-api.json:', err);
    return { orders: [], trips: [], 'pending-actions': [] };
  }
}

// Helper to write database
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing mock-api.json:', err);
  }
}

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - Idempotency-Key: ${req.headers['idempotency-key'] || 'none'}`);
  next();
});

// GET /orders?customerId={id}
app.get('/orders', (req, res) => {
  const db = readDb();
  let items = db.orders || [];
  if (req.query.customerId) {
    items = items.filter(o => o.customerId === req.query.customerId);
  }
  if (req.query.status) {
    items = items.filter(o => o.status.toLowerCase() === req.query.status.toLowerCase());
  }
  res.json(items);
});

// GET /orders/:id
app.get('/orders/:id', (req, res) => {
  const db = readDb();
  const order = (db.orders || []).find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND' });
  res.json(order);
});

// GET /trips?driverId={id}
app.get('/trips', (req, res) => {
  const db = readDb();
  let items = db.trips || [];
  if (req.query.driverId) {
    items = items.filter(t => t.driverId === req.query.driverId);
  }
  res.json(items);
});

// GET /trips/:id
app.get('/trips/:id', (req, res) => {
  const db = readDb();
  const trip = (db.trips || []).find(t => t.id === req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found', code: 'NOT_FOUND' });
  res.json(trip);
});

// PATCH /trips/:tripId/stops/:stopId (Update stop status: Pending -> In Transit -> Delivered)
app.patch('/trips/:tripId/stops/:stopId', (req, res) => {
  const { tripId, stopId } = req.params;
  const { status } = req.body;
  const idempotencyKey = req.headers['idempotency-key'];

  if (!status) {
    return res.status(400).json({ error: 'Status is required', code: 'VALIDATION_ERROR' });
  }

  const db = readDb();
  const trip = (db.trips || []).find(t => t.id === tripId);
  if (!trip) return res.status(404).json({ error: 'Trip not found', code: 'NOT_FOUND' });

  const stop = trip.stops.find(s => s.id === stopId);
  if (!stop) return res.status(404).json({ error: 'Stop not found', code: 'NOT_FOUND' });

  stop.status = status;
  if (status === 'DELIVERED') {
    stop.completedAt = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
  }

  // Recalculate trip stats
  const completed = trip.stops.filter(s => s.status === 'DELIVERED').length;
  trip.completedStops = completed;
  trip.remainingStops = trip.stops.length - completed;
  if (completed === trip.stops.length) {
    trip.status = 'COMPLETED';
  } else {
    trip.status = 'IN_TRANSIT';
  }

  // Also sync matching order status in db.orders if present
  if (stop.orderId && db.orders) {
    const order = db.orders.find(o => o.id === stop.orderId);
    if (order) {
      order.status = status;
    }
  }

  writeDb(db);
  console.log(`[STATUS_UPDATE] Trip ${tripId} Stop ${stopId} updated to ${status} (Idempotency: ${idempotencyKey || 'none'})`);
  res.json({ success: true, trip, stop, idempotencyKey });
});

// GET /pending-actions?adminId={id}
app.get('/pending-actions', (req, res) => {
  const db = readDb();
  let items = db['pending-actions'] || [];
  if (req.query.adminId) {
    items = items.filter(a => a.adminId === req.query.adminId);
  }
  if (req.query.priority) {
    items = items.filter(a => a.priority.toLowerCase() === req.query.priority.toLowerCase());
  }
  res.json(items);
});

// GET /pending-actions/:id
app.get('/pending-actions/:id', (req, res) => {
  const db = readDb();
  const action = (db['pending-actions'] || []).find(a => a.id === req.params.id);
  if (!action) return res.status(404).json({ error: 'Pending action not found', code: 'NOT_FOUND' });
  res.json(action);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Opsyn Energy Operations Platform',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n==================================================`);
  console.log(` OPSYN MOCK API SERVER READY`);
  console.log(` Running on: http://localhost:${PORT}`);
  console.log(` Network access: http://0.0.0.0:${PORT}`);
  console.log(` Endpoints:`);
  console.log(`   GET   /orders?customerId=CUST-101`);
  console.log(`   GET   /trips?driverId=DRV-301`);
  console.log(`   PATCH /trips/:tripId/stops/:stopId`);
  console.log(`   GET   /pending-actions?adminId=OPS-001`);
  console.log(`==================================================\n`);
});
