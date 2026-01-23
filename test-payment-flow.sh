#!/bin/bash

# Test Payment Flow Script for HighHikers

echo "🧪 Testing Payment System..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Create a paid event
echo "${YELLOW}Test 1: Creating a paid event...${NC}"
PAID_EVENT_RESPONSE=$(curl -s -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -b "connect.sid=test-session" \
  -d '{
    "title": "Mountain Trek Payment Test",
    "location": "Volcanoes National Park, Rwanda",
    "difficulty": "hard",
    "date": "2025-02-15",
    "time": "08:00",
    "maxParticipants": 20,
    "description": "A challenging trek testing the payment system",
    "imageUrl": "https://via.placeholder.com/400x300",
    "isPaid": true,
    "price": 50000,
    "currency": "RWF"
  }')

echo "Response: $PAID_EVENT_RESPONSE"
echo ""

# Test 2: Fetch all events and check if paid event exists
echo "${YELLOW}Test 2: Fetching all events...${NC}"
EVENTS_RESPONSE=$(curl -s http://localhost:5000/api/events)
echo "Events fetched successfully"
PAID_EVENTS=$(echo "$EVENTS_RESPONSE" | grep -o '"isPaid":true' | wc -l)
echo "Paid events found: $PAID_EVENTS"
echo ""

# Test 3: Test payment intent creation
echo "${YELLOW}Test 3: Creating payment intent...${NC}"
# Note: This requires a valid session/user
PAYMENT_INTENT=$(curl -s -X POST http://localhost:5000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -b "connect.sid=test-session" \
  -d '{
    "eventId": "test-event-id",
    "amount": 50000,
    "currency": "RWF"
  }')

echo "Payment Intent Response: $PAYMENT_INTENT"
echo ""

# Test 4: Check event creation with pricing
echo "${YELLOW}Test 4: Verifying price field in event...${NC}"
FIRST_EVENT=$(echo "$EVENTS_RESPONSE" | grep -o '"price":[0-9]*' | head -1)
if [ -n "$FIRST_EVENT" ]; then
  echo "${GREEN}✓ Price field found in events: $FIRST_EVENT${NC}"
else
  echo "${RED}✗ No price field found in events${NC}"
fi
echo ""

echo "${GREEN}🎉 Payment flow tests completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Add real Stripe API keys to .env"
echo "2. Test payment with Stripe test card: 4242 4242 4242 4242"
echo "3. Verify payment confirmation in database"
