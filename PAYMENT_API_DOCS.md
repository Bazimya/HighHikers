# Payment API Documentation

## Base URL
```
http://localhost:5000/api/payments
```

## Authentication
All endpoints require user authentication. Include `credentials: 'include'` in fetch requests.

---

## Endpoints

### 1. Create Payment Intent

**Endpoint**: `POST /api/payments/create-intent`

**Purpose**: Initiate payment for a paid event registration

**Auth**: Required (user must be logged in)

**Request Body**:
```json
{
  "eventId": "507f1f77bcf86cd799439011"
}
```

**Success Response** (200):
```json
{
  "clientSecret": "pi_test_xxxxx_secret_xxxxx",
  "paymentId": "507f1f77bcf86cd799439012",
  "amount": 50000,
  "currency": "RWF"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid event ID
  ```json
  { "error": "Invalid event ID" }
  ```

- `404 Not Found`: Event doesn't exist
  ```json
  { "error": "Event not found" }
  ```

- `400 Bad Request`: Event not paid/has no price
  ```json
  { "error": "This event is not a paid event" }
  ```

- `400 Bad Request`: User already registered
  ```json
  { "error": "Already registered for this event" }
  ```

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{"eventId": "507f1f77bcf86cd799439011"}' \
  --cookie "connect.sid=xxxxx"
```

---

### 2. Confirm Payment

**Endpoint**: `POST /api/payments/confirm`

**Purpose**: Confirm Stripe payment and complete event registration

**Auth**: Required

**Request Body**:
```json
{
  "paymentId": "507f1f77bcf86cd799439012",
  "paymentIntentId": "pi_test_xxxxx"
}
```

**Success Response** (200):
```json
{
  "message": "Payment confirmed and registered for event",
  "registration": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439001",
    "eventId": "507f1f77bcf86cd799439011",
    "status": "registered",
    "paymentId": "507f1f77bcf86cd799439012",
    "registeredAt": "2026-01-23T19:10:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid payment ID
  ```json
  { "error": "Invalid payment ID" }
  ```

- `404 Not Found`: Payment not found
  ```json
  { "error": "Payment not found" }
  ```

- `400 Bad Request`: Payment not successful
  ```json
  { "error": "Payment not successful" }
  ```

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/payments/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "507f1f77bcf86cd799439012",
    "paymentIntentId": "pi_test_xxxxx"
  }' \
  --cookie "connect.sid=xxxxx"
```

---

### 3. Get Payment Details

**Endpoint**: `GET /api/payments/:paymentId`

**Purpose**: Retrieve details of a specific payment

**Auth**: Required (can only view own payments)

**Parameters**:
- `paymentId` (URL path): Payment MongoDB ObjectId

**Success Response** (200):
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439001",
  "eventId": "507f1f77bcf86cd799439011",
  "amount": 50000,
  "currency": "RWF",
  "status": "completed",
  "stripePaymentIntentId": "pi_test_xxxxx",
  "stripeChargeId": "ch_test_xxxxx",
  "paidAt": "2026-01-23T19:10:30.000Z",
  "createdAt": "2026-01-23T19:10:00.000Z",
  "updatedAt": "2026-01-23T19:10:30.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid payment ID
  ```json
  { "error": "Invalid payment ID" }
  ```

- `404 Not Found`: Payment not found
  ```json
  { "error": "Payment not found" }
  ```

- `403 Forbidden`: Trying to view another user's payment
  ```json
  { "error": "Unauthorized" }
  ```

**Example cURL**:
```bash
curl http://localhost:5000/api/payments/507f1f77bcf86cd799439012 \
  --cookie "connect.sid=xxxxx"
```

---

### 4. List User's Payments

**Endpoint**: `GET /api/payments`

**Purpose**: Get all payments made by the current user (payment history)

**Auth**: Required

**Query Parameters**: None

**Success Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439001",
    "eventId": "507f1f77bcf86cd799439011",
    "amount": 50000,
    "currency": "RWF",
    "status": "completed",
    "stripePaymentIntentId": "pi_test_xxxxx",
    "stripeChargeId": "ch_test_xxxxx",
    "paidAt": "2026-01-23T19:10:30.000Z",
    "createdAt": "2026-01-23T19:10:00.000Z",
    "updatedAt": "2026-01-23T19:10:30.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439015",
    "userId": "507f1f77bcf86cd799439001",
    "eventId": "507f1f77bcf86cd799439014",
    "amount": 30000,
    "currency": "RWF",
    "status": "completed",
    "stripePaymentIntentId": "pi_test_yyyyy",
    "stripeChargeId": "ch_test_yyyyy",
    "paidAt": "2026-01-22T18:00:00.000Z",
    "createdAt": "2026-01-22T17:45:00.000Z",
    "updatedAt": "2026-01-22T18:00:00.000Z"
  }
]
```

**Error Response** (500):
```json
{ "error": "Failed to fetch payments" }
```

**Example cURL**:
```bash
curl http://localhost:5000/api/payments \
  --cookie "connect.sid=xxxxx"
```

---

## Payment Object Schema

```typescript
{
  _id: ObjectId;              // MongoDB ID
  userId: ObjectId;           // User making payment
  eventId: ObjectId;          // Event being paid for
  amount: number;             // Payment amount
  currency: string;           // ISO 4217 code (RWF, USD, EUR, etc.)
  status: string;             // pending | completed | failed | refunded
  stripePaymentIntentId: string;     // Stripe PI reference
  stripeChargeId: string;     // Stripe charge reference (when completed)
  paidAt: Date;               // When payment succeeded
  refundedAt?: Date;          // When refund processed
  metadata?: Record;          // Additional data
  createdAt: Date;            // Record creation time
  updatedAt: Date;            // Last update time
}
```

---

## Complete Payment Flow Example

### Step 1: Create Intent
```javascript
const response = await fetch('/api/payments/create-intent', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ eventId: 'abc123' })
});
const { clientSecret, paymentId } = await response.json();
```

### Step 2: Process with Stripe
```javascript
// In real app, redirect to Stripe Checkout or show payment form
// For now, simulate successful payment
const paymentIntent = {
  id: clientSecret.split('_secret_')[0],
  status: 'succeeded'
};
```

### Step 3: Confirm Payment
```javascript
const confirmResponse = await fetch('/api/payments/confirm', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    paymentId,
    paymentIntentId: paymentIntent.id
  })
});
const { registration } = await confirmResponse.json();
// User is now registered for the event!
```

### Step 4: Get Payment History
```javascript
const historyResponse = await fetch('/api/payments', {
  credentials: 'include'
});
const payments = await historyResponse.json();
// Show payment receipts/history to user
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request / validation error |
| 401 | Not authenticated |
| 403 | Forbidden (unauthorized access) |
| 404 | Resource not found |
| 500 | Server error |

---

## Error Handling Best Practices

```javascript
try {
  const response = await fetch('/api/payments/create-intent', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Payment error:', error.error);
    // Show user-friendly error message
    throw new Error(error.error);
  }

  const data = await response.json();
  return data;
} catch (error) {
  console.error('Payment failed:', error.message);
  // Display to user
}
```

---

## Testing Payments

### Test Mode (Development)
- Use Stripe test API keys (sk_test_, pk_test_)
- Use test card numbers (see PAYMENT_QUICK_START.md)
- No real charges
- Payments auto-confirm in development

### Live Mode (Production)
- Use live Stripe keys (sk_live_, pk_live_)
- Real card processing
- Real charges to user's card
- Requires PCI compliance

---

## Webhooks (Future Feature)

Stripe webhooks will handle:
- `payment_intent.succeeded` - Auto-confirm payments
- `charge.refunded` - Update refund status
- `charge.dispute.created` - Handle chargebacks

---

## Rate Limiting (To Implement)

Recommended:
- Payment endpoints: 10 requests per minute per user
- Prevent abuse and fraud

---

## Database Queries

### Find all payments for an event
```javascript
const payments = await Payment.find({ eventId });
```

### Find all payments by status
```javascript
const completed = await Payment.find({ status: 'completed' });
```

### Calculate total revenue
```javascript
const revenue = await Payment.aggregate([
  { $match: { status: 'completed' } },
  { $group: { _id: '$currency', total: { $sum: '$amount' } } }
]);
```

---

## Integration Checklist

- [ ] Get Stripe account
- [ ] Add API keys to `.env`
- [ ] Test with test keys
- [ ] Implement Stripe.js frontend
- [ ] Add webhook handling
- [ ] Implement refund system
- [ ] Add analytics dashboard
- [ ] Email receipts
- [ ] Rate limiting
- [ ] PCI compliance audit
- [ ] Switch to live keys
- [ ] Monitor in production

