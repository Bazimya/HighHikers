# 🧪 TESTING GUIDE - Create Paid Event Step by Step

## ✅ VERIFICATION: System Status

- Backend API: **✅ Running** (http://localhost:5000)
- Frontend App: **✅ Running** (http://localhost:5173)
- MongoDB: **✅ Connected**
- Database: **✅ Operational** (No events in DB yet)

---

## 📝 STEP-BY-STEP TEST INSTRUCTIONS

### Step 1: Open the App
```
Go to: http://localhost:5173
(App should load with navigation menu)
```

### Step 2: Register as Admin User
```
1. Click "Register" in navigation
2. Fill form:
   - Username: adminuser123
   - Email: admin@example.com
   - Password: Admin123!@#
   - First Name: Test
   - Last Name: Admin
3. Click "Register" button
4. Should redirect to home or dashboard
```

### Step 3: Make User Admin (Temporary - Click on Admin Dashboard)
```
1. Go to: http://localhost:5173/admin
2. If rejected: You need admin role first
3. We'll need to update the user role in the next step
```

**Quick Admin Setup:**
- Option A: Use MongoDB Compass to update user role to "admin"
- Option B: Contact admin to upgrade your account

### Step 4: Navigate to Events Page
```
1. From home page, click "Events" in navigation
2. Should see empty events list (or existing events)
3. Look for "New Event" button in top-right corner
4. Button only appears if you're logged in as admin
```

### Step 5: Click "New Event" Button
```
Location: Events page, top-right corner
Should open a dialog/modal with form
```

### Step 6: Fill Out Event Form - ALL FIELDS

**Required Fields:**
```
Event Title: "Mountain Trek Workshop - Advanced Techniques"
Location: "Volcanoes National Park, Rwanda"
Difficulty: Select "Hard"
Date: 2025-02-20
Time: 08:00 AM
Max Participants: 25
Description: "Expert-led workshop on advanced mountain trekking 
techniques including rope work, navigation, and safety protocols."
Image URL: https://via.placeholder.com/400x300
```

**NEW PRICING FIELDS (THIS IS THE KEY TEST):**
```
☑ Check the box "Paid Event"

When checked, these fields appear:
┌─────────────────────────────────────┐
│ Price:     50000                    │ ← Type this
│                                     │
│ Currency:  ┌─────────────┐          │
│            │ RWF         │ ← Select RWF
│            │ USD         │
│            │ EUR         │
│            └─────────────┘
└─────────────────────────────────────┘
```

### Step 7: Submit Form
```
Click "Create Event" button
Wait for response (should see success message)
```

### Step 8: Verify Event Created
```
After creating event, you should see:

1. Dialog closes
2. Page reloads/refreshes
3. New event appears at top of list
4. Event card shows:
   ├─ Title: "Mountain Trek Workshop - Advanced Techniques"
   ├─ Location: "Volcanoes National Park, Rwanda"
   ├─ Price Badge: "50,000 RWF" ⬅️ THIS IS NEW!
   └─ Button: "Register - 50,000 RWF" ⬅️ THIS IS NEW!
```

### Step 9: Click on Event Card
```
Click anywhere on the event card
Should navigate to: http://localhost:5173/events/[event-id]
```

### Step 10: View Event Detail Page
```
Should see:
├─ Event title and description
├─ Location and date/time
├─ Price: "50,000 RWF" displayed prominently
├─ Button: "Register" (or "Pay for Event")
│  Click this to see 4-step payment dialog
└─ Reviews section (empty initially)
```

### Step 11: Test Payment Dialog (Optional)
```
1. Click "Register" or "Pay for Event" button
2. Should see 4-step payment flow:
   - Step 1: Confirm amount and event details
   - Step 2: Processing spinner
   - Step 3: Success (requires Stripe keys)
   - Step 4: Error handling (if payment fails)
```

---

## ✨ EXPECTED RESULTS

### ✅ If Everything Works:

1. **Form Submission:** Event created successfully
2. **Price Display:** Event card shows "50,000 RWF" badge
3. **Button Update:** Button shows "Register - 50,000 RWF"
4. **Database:** Event stored with:
   - `isPaid: true`
   - `price: 50000`
   - `currency: "RWF"`
5. **Detail Page:** Shows price and payment button
6. **Payment Dialog:** Opens with 4 steps

### ⚠️ If Something Doesn't Work:

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| "New Event" button not visible | Not logged in or not admin | Login and verify admin role |
| Form fields not appearing | JavaScript not loaded | Refresh page, check console |
| Price field hidden | "Paid Event" not checked | Check the checkbox to reveal |
| Event not appearing after creation | Form validation failed | Check console for error message |
| Payment button not working | Stripe keys not configured | Add Stripe keys to .env |

---

## 📋 COMPLETE TEST CHECKLIST

After completing above steps, verify:

- [ ] Can access Events page
- [ ] "New Event" button visible (admin user)
- [ ] Form opens when clicking button
- [ ] All fields in form present
- [ ] "Paid Event" checkbox exists
- [ ] Price field appears when checkbox checked
- [ ] Currency selector appears when checkbox checked
- [ ] Price accepts numbers (50000)
- [ ] Currency has RWF, USD, EUR options
- [ ] Form submits successfully
- [ ] Event appears in list after creation
- [ ] Event card shows price badge
- [ ] Event button shows "Register - 50,000 RWF"
- [ ] Can click event to view detail page
- [ ] Detail page shows price prominently
- [ ] Payment dialog appears when clicking register

---

## 🔧 TROUBLESHOOTING

### Issue: "Authentication required" when creating event
**Solution:** Make sure you're logged in as an admin user
- Check browser console (F12) for errors
- Verify session cookie exists
- Try logging out and back in

### Issue: "New Event" button doesn't appear
**Solution:** You may not have admin role
- Check your user role in MongoDB Compass
- Contact someone to upgrade you to admin
- Or create new admin account

### Issue: Form validation errors
**Solution:** Check all required fields are filled
- Title must not be empty
- Location must not be empty
- Date must be in future
- Price must be number if paid event is checked

### Issue: Event doesn't appear after creation
**Solution:** Check browser console for errors
- Open DevTools: F12 or Right-click → Inspect
- Click Console tab
- Look for red error messages
- Screenshot and share error messages

---

## 🎯 SUCCESS CRITERIA

Event creation is **WORKING** if:

✅ You can fill out the complete form  
✅ Price field appears when "Paid Event" is checked  
✅ You can select RWF as currency  
✅ Event saves to database  
✅ Event appears in list with price displayed  
✅ Price shows as "50,000 RWF" on event card  
✅ Button shows "Register - 50,000 RWF"  

---

## 📸 WHAT TO SCREENSHOT FOR VERIFICATION

1. Events page with "New Event" button visible
2. Event creation form filled out completely
3. Pricing fields visible with price and currency filled
4. Event successfully created message
5. New event appearing in events list with price displayed
6. Event card showing "50,000 RWF" price badge
7. Button showing "Register - 50,000 RWF"
8. Event detail page showing price
9. Payment dialog opening (optional)

---

## 🚀 NEXT STEPS AFTER TESTING

If all tests pass:
1. Create a FREE event (without checking "Paid Event")
2. Verify free events don't show price
3. Create trails and blog posts
4. Test event detail pages
5. Test payment dialog (if Stripe keys are added)

If tests fail:
1. Check console for error messages
2. Verify server is running
3. Check MongoDB connection
4. Verify admin role is set correctly
5. Share error messages in console

---

## 📞 REFERENCE

- **App URL:** http://localhost:5173
- **API URL:** http://localhost:5000
- **Events Page:** http://localhost:5173/events
- **Admin Dashboard:** http://localhost:5173/admin
- **Event Detail:** http://localhost:5173/events/[event-id]

---

**Ready to test? Open http://localhost:5173 and follow the steps above! 🎉**
