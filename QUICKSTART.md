# ⚡ Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` File

**Option A: Local PostgreSQL**
```bash
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:password@localhost:5432/high_hikers
SESSION_SECRET=dev-secret-key-change-this-in-production
NODE_ENV=development
PORT=5000
EOF
```

**Option B: Cloud Database (Neon)**
```bash
# Go to https://neon.tech, create project, copy connection string
cat > .env << 'EOF'
DATABASE_URL=postgresql://user:pass@ep-xyz.neon.tech/high_hikers
SESSION_SECRET=dev-secret-key-change-this-in-production
NODE_ENV=development
PORT=5000
EOF
```

### 3. Set Up Database
```bash
npm run db:push
```

### 4. Start Server
```bash
npm run dev
```

Visit: **http://localhost:5000**

---

## 🔐 Create Admin Account

### Via API (cURL)

```bash
# 1. Register as admin user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "AdminPassword123",
    "firstName": "Admin",
    "lastName": "User"
  }'

# 2. Get admin user ID from response, then update role via database
# Use a database client to run:
UPDATE users SET role = 'admin' WHERE username = 'admin';
```

### Via Database Client

Use DBeaver, pgAdmin, or psql:

```sql
-- Find your admin user ID first
SELECT id, username FROM users WHERE username = 'admin' LIMIT 1;

-- Update role
UPDATE users SET role = 'admin' WHERE username = 'admin';
```

---

## 📍 Access Points

| Page | URL | Requires |
|------|-----|----------|
| Home | http://localhost:5000 | None |
| Trails | http://localhost:5000/trails | None |
| Events | http://localhost:5000/events | None |
| Blog | http://localhost:5000/blog | None |
| Register | http://localhost:5000/register | None |
| Login | http://localhost:5000/login | None |
| **Profile** | http://localhost:5000/profile | **Logged In** |
| **Admin Dashboard** | http://localhost:5000/admin | **Admin User** |

---

## 🎯 First Admin Actions

1. **Login** as admin at http://localhost:5000/login
2. **Visit** http://localhost:5000/admin
3. **Create a Trail**:
   - Click "Trails" tab
   - Click "+ New Trail"
   - Fill in details (name, description, difficulty, etc)
   - Save
4. **Create an Event**:
   - Click "Events" tab
   - Click "+ New Event"
   - Set date, time, location
   - Save
5. **Write a Blog Post**:
   - Click "Blog" tab
   - Click "+ New Post"
   - Add content
   - Save

---

## 🧪 Test Features

### Register a User
```bash
# 1. Go to http://localhost:5000/register
# 2. Create account with test data
# 3. You'll be logged in automatically
```

### Register for Trail
```bash
# 1. Login as regular user
# 2. Go to /trails
# 3. Click trail
# 4. Click "Register" button (appears when logged in)
```

### Submit Review
```bash
# 1. Go to trail detail page
# 2. Scroll to reviews section
# 3. Submit 1-5 star rating with comment
# 4. See average rating update
```

### View Dashboard
```bash
# 1. Click your username (top right)
# 2. Select "My Profile"
# 3. See registrations, reviews, edit profile
```

---

## 🔧 Useful Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# TypeScript check
npm run check

# Update database schema
npm run db:push
```

---

## 📊 Database Tables

Run queries directly in your database client:

```sql
-- See all users
SELECT id, username, email, role FROM users;

-- See all trails
SELECT id, name, difficulty, location FROM trails;

-- See all registrations
SELECT u.username, t.name, tr.registered_at 
FROM trail_registrations tr
JOIN users u ON tr.user_id = u.id
JOIN trails t ON tr.trail_id = t.id;

-- See reviews
SELECT u.username, t.name, tr.rating, tr.title, tr.comment
FROM trail_reviews tr
JOIN users u ON tr.user_id = u.id
JOIN trails t ON tr.trail_id = t.id;
```

---

## 🆘 Troubleshooting

### "Cannot connect to database"
```
✓ Check DATABASE_URL is correct
✓ Test: psql <your-connection-string>
✓ Make sure database exists
```

### "Session not working"
```
✓ Restart server after setting SESSION_SECRET
✓ Make sure .env file is in root directory
```

### "Routes not found / 404 errors"
```
✓ Check spelling of routes
✓ Restart dev server
✓ Clear browser cache
```

### "Admin dashboard shows nothing"
```
✓ Make sure user has role: 'admin'
✓ Update: UPDATE users SET role='admin' WHERE ...
✓ Refresh page
✓ Check browser console for errors
```

### "Can't register for trail"
```
✓ Make sure you're logged in
✓ Check browser console for errors
✓ Try different trail
```

---

## 🎓 Key API Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"Password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"Password123"}'
```

### Get Trails
```bash
curl http://localhost:5000/api/trails
```

### Create Trail (Admin)
```bash
curl -X POST http://localhost:5000/api/trails \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Eagle Peak",
    "description":"Mountain trail",
    "difficulty":"Hard",
    "distance":"8.7 mi",
    "elevation":"2840 ft",
    "duration":"5h 30m",
    "location":"Rocky Mountains",
    "imageUrl":"/assets/image.jpg"
  }'
```

---

## 📞 Need Help?

1. Check `FULL_SETUP_GUIDE.md` for detailed documentation
2. Check `ENHANCEMENTS_SUMMARY.md` for feature list
3. Review `server/routes.ts` for all API endpoints
4. Check `shared/schema.ts` for database structure

---

**You're ready to go! Happy hiking! 🏔️**
