# Payment System - Quick Start Guide

## 🎯 For Admins: Creating Paid Events

### Step 1: Log In as Admin
- Username: `admin` (or any admin user)
- Go to Admin Dashboard

### Step 2: Create New Paid Event
1. Go to **Events** tab
2. Click **+ New Event**
3. Fill in basic details:
   - Event title
   - Location
   - Date & time
   - Difficulty
   - Max participants
   - Description
   - Image URL

### Step 3: Enable Payment
4. Check **"This is a paid event"** checkbox
5. Enter **Price** (in local currency)
6. Select **Currency**: 
   - RWF (Rwandan Franc) - default for Rwanda
   - USD (US Dollar)
   - EUR (Euro)
7. Click **Create Event**

### Example
- Event: "Volcanoes National Park Trek"
- Price: 50,000
- Currency: RWF
- Result: Event shows "Register - 50,000 RWF" button

---

## 👥 For Users: Registering for Paid Events

### Step 1: Browse Events
1. Go to **Events** page
2. Find paid event (shows price in button)

### Step 2: Register
1. Click **"Register - [Price] [Currency]"** button
2. Payment dialog opens

### Step 3: Confirm Payment
1. Review amount and event name
2. Click **"Pay [Amount] [Currency]"**
3. Wait for processing (shows spinner)
4. See success confirmation
5. Page refreshes automatically
6. You're now registered! ✅

---

## 💳 Stripe Integration (For Developers)

### Getting Started with Stripe

#### 1. Create Stripe Account
- Go to https://stripe.com
- Sign up for free
- Complete account setup

#### 2. Get API Keys
- Go to Stripe Dashboard → Developers → API Keys
- Copy:
  - **Publishable Key** → `STRIPE_PUBLISHABLE_KEY`
  - **Secret Key** → `STRIPE_SECRET_KEY`

#### 3. Update `.env`
```bash
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

#### 4. Testing with Stripe Test Cards
Use these test card numbers in development:
- **Visa (Success)**: 4242 4242 4242 4242
- **Visa (Decline)**: 4000 0000 0000 0002
- **Amex**: 3782 822463 10005
- **Exp Date**: Any future date (01/25)
- **CVC**: Any 3 digits (123)

---

## 🔄 Payment Status Flow

```
User starts payment
    ↓
Status: "pending"
    ↓
Processing with Stripe
    ↓
Status: "completed" ✅
    ↓
Event registration created automatically
    ↓
Participant count incremented
```

### Payment States
- **pending** - Payment intent created, awaiting confirmation
- **completed** - Payment successful, registration active
- **failed** - Payment declined or error occurred
- **refunded** - Refund processed successfully

---

## 📊 Admin View - Payment History

### View All Payments (Future Feature)
1. Admin Dashboard → Payments tab (to be added)
2. See all transactions:
   - Amount
   - Currency
   - Event
   - User
   - Date
   - Status

### View User Payments
- Admin Dashboard → Users tab
- Click user → Payment history

---

## 🧪 Testing Payment Flow

### Test Scenario 1: Free Event
1. Create event WITHOUT checking "paid"
2. Button shows "Register Now"
3. No payment dialog appears
4. Direct registration

### Test Scenario 2: Paid Event
1. Create event with:
   - Price: 10,000
   - Currency: RWF
2. Button shows "Register - 10,000 RWF"
3. Payment dialog appears
4. Process payment
5. Registration succeeds

### Test Scenario 3: Multiple Currencies
1. Create event in RWF (50,000)
2. Create event in USD (50)
3. Create event in EUR (40)
4. Payment system handles all automatically

---

## 🐛 Troubleshooting

### Issue: "Payment setup failed"
- **Cause**: Missing Stripe secret key in `.env`
- **Fix**: Add `STRIPE_SECRET_KEY` to `.env` file

### Issue: "Event not found"
- **Cause**: Invalid event ID
- **Fix**: Refresh page, try again

### Issue: "Already registered for this event"
- **Cause**: User already has active registration
- **Fix**: Cannot register twice; unregister first

### Issue: Payment stuck on "Processing"
- **Cause**: Network error or timeout
- **Fix**: Click "Try Again" button in error state

---

## 📈 Revenue Analytics (To Be Implemented)

Coming soon:
- Total revenue by event
- Revenue by currency
- Payment success rate
- Refund rate
- Top revenue events
- Export payment reports

---

## 🔐 Security Best Practices

✅ **Implemented**:
- Backend payment verification with Stripe
- User authentication required
- Payment ownership validation
- Session-based auth

⚠️ **Still Needed**:
- Webhook signature verification
- PCI compliance (use Stripe hosted forms)
- Rate limiting on payment endpoints
- HTTPS enforcement (production)
- Payment data encryption

---

## 📞 Support

For Stripe integration help:
- Stripe Docs: https://stripe.com/docs
- Stripe API Reference: https://stripe.com/docs/api
- Test Mode: Always test payments before going live!

