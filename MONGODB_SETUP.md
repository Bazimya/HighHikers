# MongoDB Setup Guide for HIGH HIKERS

## 🎯 MongoDB Configuration

Your project now uses **MongoDB** instead of PostgreSQL! Here's how to set it up:

### Option 1: Local MongoDB (Recommended for Development)

**macOS:**
```bash
# Install MongoDB Community Edition via Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start the MongoDB service
brew services start mongodb-community

# Verify it's running
mongo --version
```

**Linux (Ubuntu/Debian):**
```bash
# Install MongoDB
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb

# Verify it's running
mongo --version
```

**Windows:**
1. Download from: https://www.mongodb.com/try/download/community
2. Run the installer
3. MongoDB will start automatically

### Option 2: MongoDB Atlas (Cloud Database)

**Best for Production:**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster:
   - Choose free tier
   - Select your region
   - Click "Create"
4. Add IP Whitelist:
   - Go to Network Access
   - Add `0.0.0.0/0` (for development only!)
5. Create database user:
   - Go to Database Access
   - Click "Add New Database User"
   - Create username and password
6. Get connection string:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

## 🔧 Environment Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **For Local MongoDB:**
   ```
   MONGODB_URI=mongodb://localhost:27017/high-hikers
   SESSION_SECRET=your-super-secret-key
   NODE_ENV=development
   PORT=5000
   ```

3. **For MongoDB Atlas:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/high-hikers
   SESSION_SECRET=your-super-secret-key
   NODE_ENV=development
   PORT=5000
   ```

## 🚀 Starting the Application

### Development Mode:
```bash
npm run dev
```

### Production Build:
```bash
npm run build
npm start
```

## 📊 Database Schema

MongoDB collections are automatically created when you first insert data. Your app uses these collections:

### Users
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  passwordHash: String,
  firstName: String,
  lastName: String,
  avatar: String,
  bio: String,
  role: String ('user' or 'admin'),
  createdAt: Date,
  updatedAt: Date
}
```

### Trails
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  difficulty: String,
  distance: String,
  elevation: String,
  duration: String,
  location: String,
  latitude: Number,
  longitude: Number,
  imageUrl: String,
  images: Array,
  featured: Boolean,
  averageRating: Number,
  reviewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Events
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  date: String,
  time: String,
  location: String,
  latitude: Number,
  longitude: Number,
  difficulty: String,
  maxParticipants: Number,
  currentParticipants: Number,
  imageUrl: String,
  featured: Boolean,
  averageRating: Number,
  reviewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Blog Posts
```javascript
{
  _id: ObjectId,
  title: String,
  slug: String (unique),
  content: String,
  excerpt: String,
  imageUrl: String,
  author: ObjectId (ref: User),
  category: String,
  tags: Array,
  featured: Boolean,
  published: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Event Registrations
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  eventId: ObjectId (ref: Event),
  status: String ('registered' or 'cancelled'),
  registeredAt: Date
}
```

### Trail Reviews
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  trailId: ObjectId (ref: Trail),
  rating: Number (1-5),
  reviewText: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Photo Gallery
```javascript
{
  _id: ObjectId,
  trailId: ObjectId (ref: Trail, optional),
  eventId: ObjectId (ref: Event, optional),
  userId: ObjectId (ref: User),
  imageUrl: String,
  caption: String,
  uploadedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Activity Log
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  action: String,
  resourceType: String,
  resourceId: String,
  metadata: Mixed,
  createdAt: Date,
  updatedAt: Date
}
```

### Contact Messages
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  message: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🛠️ Creating Your First Admin User

1. Start the application: `npm run dev`
2. Register a new user via `/register`
3. Connect to MongoDB and update the user's role:

**Using MongoDB Shell:**
```bash
# Local MongoDB
mongo
use high-hikers
db.users.updateOne({ username: "your-username" }, { $set: { role: "admin" } })

# MongoDB Atlas
mongosh "mongodb+srv://username:password@cluster.mongodb.net/high-hikers"
db.users.updateOne({ username: "your-username" }, { $set: { role: "admin" } })
```

## 🔍 Connecting to Your Database

### Local MongoDB - MongoDB Shell/Mongosh:
```bash
# Start MongoDB shell
mongosh

# Select database
use high-hikers

# View collections
show collections

# View users (first 5)
db.users.find().limit(5)

# View trails
db.trails.find().limit(5)

# Find specific user
db.users.findOne({ email: "user@example.com" })
```

### MongoDB Atlas - MongoDB Compass:
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Create new connection with your Atlas URI
3. Browse collections visually

### Via VS Code:
1. Install "MongoDB for VS Code" extension
2. Connect with your MongoDB URI
3. Browse and query directly in the editor

## 📝 Useful MongoDB Commands

```bash
# Count documents
db.users.countDocuments()

# Delete a user
db.users.deleteOne({ email: "user@example.com" })

# Update multiple documents
db.trails.updateMany({ featured: false }, { $set: { featured: true } })

# Bulk insert
db.trails.insertMany([
  { name: "Trail 1", difficulty: "easy" },
  { name: "Trail 2", difficulty: "hard" }
])

# Aggregate (get stats)
db.trails.aggregate([
  { $group: { _id: "$difficulty", count: { $sum: 1 } } }
])
```

## 🔐 Security Notes

**Development:**
- Use `mongodb://localhost:27017` locally
- No authentication needed for local dev

**Production (MongoDB Atlas):**
- ✅ Always use strong passwords (25+ characters)
- ✅ Restrict IP whitelist to your server IP only
- ✅ Use environment variables for connection strings
- ✅ Enable Database Encryption
- ✅ Enable Database Audit Logging
- ✅ Use VPC peering instead of open access

## ⚡ Performance Tips

1. **Add Indexes** for frequently queried fields:
```bash
db.users.createIndex({ email: 1 })
db.trails.createIndex({ difficulty: 1 })
db.eventRegistrations.createIndex({ userId: 1, eventId: 1 })
```

2. **Monitor Performance:**
- Check slow queries in MongoDB Atlas dashboard
- Use Compass's explain function for query analysis

3. **Backup Strategy:**
- MongoDB Atlas auto-backups daily (free tier has 7-day retention)
- Export important data regularly using `mongodump`

## 🐛 Troubleshooting

**Connection Refused:**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Restart MongoDB
brew services restart mongodb-community
```

**Authentication Failed (Atlas):**
- Verify username and password
- Check IP whitelist includes your current IP
- Try temporarily adding `0.0.0.0/0` to test

**Port Already in Use:**
```bash
# Stop other MongoDB instances
lsof -i :27017
kill -9 <PID>
```

**Connection String Issues:**
- Passwords with special characters need URL encoding
- Example: `password@123` becomes `password%40123`
- Use MongoDB Compass's URI builder to validate

## 📚 Next Steps

1. ✅ MongoDB installed and running
2. ✅ `.env` configured with MONGODB_URI
3. Start app: `npm run dev`
4. Visit http://localhost:5000
5. Register first admin user
6. Start managing content in admin dashboard!

Need help? Check the troubleshooting section above or consult [MongoDB Documentation](https://docs.mongodb.com/).
