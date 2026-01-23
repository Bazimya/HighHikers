# MongoDB Migration Complete ✅

Your HIGH HIKERS project has been successfully migrated from PostgreSQL to MongoDB!

## What Changed

| Feature | Before | After |
|---------|--------|-------|
| **Database** | PostgreSQL (Neon) | MongoDB (Atlas/Local) |
| **ORM** | Drizzle ORM | Mongoose ODM |
| **Connection** | SQL queries | JavaScript objects |
| **Schema** | Strict tables | Flexible documents |
| **Installation** | `npm run db:push` | Auto-created on first use |

## Quick Start

### 1. Choose Your Database

**Option A: Local MongoDB (Development)**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Then in your .env
MONGODB_URI=mongodb://localhost:27017/high-hikers
```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create cluster → Get connection string → Add to .env
- No installation needed!

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MONGODB_URI
```

### 3. Install & Run
```bash
npm install
npm run dev
```

### 4. Access the App
- Open http://localhost:5000
- Register → Set as admin in MongoDB → Access admin dashboard

## What Still Works

✅ All authentication (login, register, logout)
✅ User profiles with registrations history  
✅ Trail and event management
✅ Reviews and ratings system
✅ Admin dashboard for content control
✅ Blog posts
✅ Contact messages
✅ Photo galleries
✅ Activity logging

## File Changes

### Updated Files:
- `package.json` - Removed Drizzle/PostgreSQL, added Mongoose
- `shared/schema.ts` - Changed to Mongoose models
- `server/db.ts` - MongoDB connection instead of Drizzle
- `server/auth.ts` - Uses Mongoose queries
- `server/routes.ts` - Rewritten with MongoDB operations
- `server/middleware.ts` - Updated for MongoDB ObjectId
- `server/index.ts` - Connects to MongoDB on startup
- `tsconfig.json` - Added mongoose types
- `.env.example` - MongoDB connection string

### New Files:
- `MONGODB_SETUP.md` - Complete MongoDB setup guide

## API Changes (Mostly Internal)

The API endpoints remain the same! However, internally:

**Before (Drizzle/PostgreSQL):**
```typescript
const user = await db.select().from(users).where(eq(users.id, id));
```

**After (Mongoose/MongoDB):**
```typescript
const user = await User.findById(id);
```

## Database URLs

### Local Development
```
MONGODB_URI=mongodb://localhost:27017/high-hikers
```

### Production (Atlas)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/high-hikers
```

### Test Database
```
MONGODB_URI=mongodb://localhost:27017/high-hikers-test
```

## Common Tasks

### View all trails in database
```javascript
// Terminal/MongoDB Shell
db.trails.find()
```

### Make user an admin
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

### Check all event registrations
```javascript
db.eventRegistrations.find().populate('userId', 'eventId')
```

### Clear all test data
```javascript
db.trails.deleteMany({})
db.events.deleteMany({})
db.users.deleteMany({})
```

## Troubleshooting

**MongoDB won't connect:**
```bash
# Check if running (local)
brew services list | grep mongodb

# Check if connection string is correct
echo $MONGODB_URI
```

**Collections don't exist:**
- Don't worry! They'll be created automatically when first document is inserted
- No migration scripts needed

**Object ID errors:**
- MongoDB uses `_id` (ObjectId) instead of `id` (string)
- In code use `user._id` instead of `user.id`
- Already updated in middleware!

## Performance Comparison

| Operation | PostgreSQL | MongoDB |
|-----------|-----------|---------|
| Insert User | SQL Prepare → Execute | Direct document insert |
| Complex Query | JOIN multiple tables | Single collection lookup |
| Scaling | Vertical (bigger server) | Horizontal (sharding) |
| Development | Schema must be defined first | Add fields on the fly |

## Next: Deploy to Production

When ready to deploy:

1. **Database:** Get MongoDB Atlas URI
2. **Environment:** Add MONGODB_URI to production .env
3. **Security:** Restrict IP whitelist, use strong passwords
4. **Backup:** Enable daily backups in MongoDB Atlas
5. **Monitoring:** Set up performance alerts

See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed production setup.

## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Best Practices](https://docs.mongodb.com/manual/administration/production-checklist/)

---

**Ready to go!** 🚀

Your app now uses MongoDB. Install MongoDB locally (or connect to Atlas), configure `.env`, and run `npm run dev`.

Any questions? Check `MONGODB_SETUP.md` for detailed guides!
