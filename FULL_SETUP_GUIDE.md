# HIGH HIKERS - Full Stack Hiking Platform

A modern, fully-featured hiking community platform with authentication, admin controls, user registrations, reviews, and complete database management.

## 🚀 Features

### User Features
- ✅ **User Authentication** - Registration, login, logout with bcrypt password hashing
- ✅ **User Profiles** - Edit profile info, view registrations and reviews
- ✅ **Trail Discovery** - Browse, search, filter trails by difficulty
- ✅ **Trail Registrations** - Register for trails, track your hiking history
- ✅ **Trail Reviews & Ratings** - Rate and review trails (1-5 stars), view aggregate ratings
- ✅ **Event Registration** - Sign up for group hiking events with capacity management
- ✅ **Event Reviews** - Review events you've attended
- ✅ **Blog** - Read hiking tips, gear reviews, trail stories with author profiles
- ✅ **Dark Mode** - Full light/dark theme support with persistence

### Admin Features
- ✅ **Admin Dashboard** - Centralized control panel for all content
- ✅ **Trail Management** - Create, edit, delete trails with full CRUD operations
- ✅ **Event Management** - Create, edit, delete events and view registrations
- ✅ **Blog Management** - Create, edit, delete blog posts
- ✅ **User Management** - View all users, assign/revoke admin roles
- ✅ **Contact Messages** - View and manage contact form submissions
- ✅ **Analytics** - View registrations, participants, reviews per item

### Technical Features
- ✅ **Type-Safe** - Full TypeScript across frontend and backend
- ✅ **Real Database** - PostgreSQL with Drizzle ORM
- ✅ **Session Management** - Express sessions with environment-based cookie settings
- ✅ **Role-Based Access Control** - Admin and user roles with protected routes
- ✅ **Input Validation** - Zod schemas for all API inputs
- ✅ **Responsive Design** - Mobile-first approach, works on all devices

---

## 📋 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- Neon, Supabase, or similar PostgreSQL provider (optional)

### Step 1: Clone & Install Dependencies

```bash
cd HighHikers
npm install
```

### Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database - PostgreSQL connection string
DATABASE_URL=postgresql://username:password@localhost:5432/high_hikers

# Session Secret - Generate a secure random string
SESSION_SECRET=your-super-secret-session-key-change-this

# Node Environment
NODE_ENV=development

# Server Port
PORT=5000
```

**Getting a DATABASE_URL:**

**Option A: Local PostgreSQL**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/high_hikers
```

**Option B: Neon Database (Cloud)**
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string and replace in `.env`

**Option C: Supabase**
1. Go to https://supabase.com
2. Create a new project
3. Copy the connection string from Project Settings

### Step 3: Set Up Database

```bash
# Push schema to database
npm run db:push

# This creates all tables automatically
```

### Step 4: Create Admin User

You'll need to create an initial admin user. For development, you can modify the seed data in the storage or use a database client:

```sql
INSERT INTO users (id, username, email, password_hash, role, first_name, last_name)
VALUES (
  gen_random_uuid(),
  'admin',
  'admin@example.com',
  -- Use bcrypt to hash your password, for now use a placeholder
  '$2b$10$...hashed_password...',
  'admin',
  'Admin',
  'User'
);
```

### Step 5: Start Development Server

```bash
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api/

---

## 🔑 Key API Routes

### Authentication
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
POST   /api/auth/logout        - Logout user
GET    /api/auth/me            - Get current user info
```

### Trails
```
GET    /api/trails             - Get all trails
GET    /api/trails/:id         - Get specific trail
POST   /api/trails             - Create trail (admin)
PUT    /api/trails/:id         - Update trail (admin)
DELETE /api/trails/:id         - Delete trail (admin)
POST   /api/trails/:id/register       - Register for trail (auth)
GET    /api/user/trail-registrations  - Get my trail registrations
```

### Trail Reviews
```
POST   /api/trails/:id/reviews        - Submit review (auth)
GET    /api/trails/:id/reviews        - Get trail reviews
```

### Events
```
GET    /api/events             - Get all events
GET    /api/events/:id         - Get specific event
POST   /api/events             - Create event (admin)
PUT    /api/events/:id         - Update event (admin)
DELETE /api/events/:id         - Delete event (admin)
POST   /api/events/:id/register        - Register for event (auth)
POST   /api/events/:id/unregister      - Unregister from event (auth)
GET    /api/user/event-registrations   - Get my event registrations
```

### Blog
```
GET    /api/blog               - Get all blog posts
GET    /api/blog/:id           - Get specific post with related
POST   /api/blog               - Create post (admin)
PUT    /api/blog/:id           - Update post (admin)
DELETE /api/blog/:id           - Delete post (admin)
```

### User Profile
```
GET    /api/user/profile       - Get my profile (auth)
PUT    /api/user/profile       - Update my profile (auth)
```

### Admin
```
GET    /api/admin/users                - Get all users (admin)
PUT    /api/admin/users/:id/role       - Update user role (admin)
GET    /api/contact/messages           - Get contact messages (admin)
PUT    /api/contact/messages/:id       - Update message status (admin)
```

---

## 📁 Database Schema

### Users Table
- `id` - UUID primary key
- `username` - Unique username
- `email` - Unique email
- `password_hash` - Bcrypt hashed password
- `firstName`, `lastName` - User name
- `avatar` - Avatar image URL
- `bio` - User bio
- `role` - 'user' or 'admin'
- `createdAt`, `updatedAt` - Timestamps

### Trails Table
- `id` - UUID
- `name`, `description` - Trail info
- `difficulty` - 'Easy', 'Moderate', 'Hard'
- `distance`, `elevation`, `duration` - Trail stats
- `location` - Trail location
- `latitude`, `longitude` - Coordinates for mapping
- `imageUrl` - Primary image
- `images` - JSONB array of additional images
- `featured` - Featured status
- `averageRating`, `reviewCount` - Computed fields

### Events Table
- Similar structure to trails
- `date`, `time` - Event timing
- `maxParticipants`, `currentParticipants` - Capacity tracking
- `createdBy` - Reference to creating user

### Registrations Tables
- `trail_registrations` - Links users to trails
- `event_registrations` - Links users to events
- Status tracking: 'registered', 'completed', 'cancelled', 'attended'

### Reviews Tables
- `trail_reviews` - User reviews for trails
- `event_reviews` - User reviews for events
- Fields: `rating` (1-5), `title`, `comment`

### Blog Posts Table
- Standard blog fields
- `category` - 'Tips', 'Gear Reviews', 'Trail Stories'
- `authorId` - Reference to user who created it
- `featured` - Feature on homepage

### Trail Images Table
- `trailId` - Reference to trail
- `imageUrl` - Image URL
- `caption` - Image caption
- `isPrimary` - Primary image flag

---

## 🔐 User Roles & Permissions

### User Role
- View all trails, events, blog posts
- Search and filter trails
- Register for trails/events
- Submit reviews and ratings
- Edit own profile
- View own registrations

### Admin Role
- All user permissions, plus:
- Create, edit, delete trails
- Create, edit, delete events
- Create, edit, delete blog posts
- Manage user roles
- View contact messages
- View all registrations per item
- Analytics dashboard

---

## 🎨 Frontend Structure

```
client/src/
├── pages/
│   ├── home.tsx           - Landing page
│   ├── trails.tsx         - Trail browser with search/filter
│   ├── events.tsx         - Events timeline
│   ├── blog.tsx           - Blog listing with categories
│   ├── login.tsx          - Auth page
│   ├── register.tsx       - Registration page
│   ├── profile.tsx        - User profile dashboard
│   ├── admin.tsx          - Admin dashboard
│   └── ...
├── components/
│   ├── navigation.tsx     - Header with auth UI
│   ├── footer.tsx         - Footer
│   ├── theme-provider.tsx - Dark mode
│   └── ui/                - 30+ Shadcn components
├── contexts/
│   └── auth-context.tsx   - Auth state management
├── hooks/
│   └── use-mobile.tsx     - Mobile detection
└── lib/
    └── queryClient.ts     - TanStack Query setup
```

---

## 🛠️ Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run check

# Push database schema
npm run db:push
```

---

## 🚀 Deployment

### Build Production Bundle

```bash
npm run build
```

Creates:
- Frontend: `dist/public/` (Vite build)
- Backend: `dist/index.js` (esbuild)

### Deploy Steps

1. Set environment variables on your hosting provider
2. Run `npm run build`
3. Start with `npm start`
4. Server runs on port 5000 by default

**Supported Hosting:**
- Replit (pre-configured)
- Railway
- Render
- Heroku
- AWS EC2
- DigitalOcean

---

## 📊 Admin Dashboard Usage

1. **Create Admin User** (one-time setup)
   - Register normally → Give admin role via database or API

2. **Access Dashboard**
   - Navigate to `/admin` when logged in as admin
   - See tabs for Trails, Events, Blog, Users, Messages

3. **Manage Content**
   - Click "New" button to add items
   - Click edit icon to modify
   - Click delete icon to remove

4. **User Management**
   - Toggle user roles with dropdown
   - Promotes users to admin

5. **View Messages**
   - See contact form submissions
   - Mark as read/responded

---

## 🔄 Database Migrations

When you modify the schema in `shared/schema.ts`:

```bash
npm run db:push
```

This automatically:
- Creates new tables
- Adds new columns
- Updates relationships
- Does NOT delete existing data

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: DATABASE_URL not set
```
→ Make sure `.env` file exists and `DATABASE_URL` is set correctly

### Password Hash Error
```
Cannot import bcrypt
```
→ Run `npm install` to install dependencies

### Auth Not Working
```
Session not persisting
```
→ Check `SESSION_SECRET` is set in `.env` and different from default

### Drizzle Errors
```
No database connection
```
→ Test connection: `psql <DATABASE_URL>`

---

## 📝 Next Steps

1. Create an admin account
2. Log in to admin dashboard
3. Start adding trails and events
4. Invite users to register
5. Monitor registrations and reviews
6. Manage content from one place

---

## 📞 Support

For issues or questions:
1. Check API response errors (they include detailed info)
2. Review database schema in `shared/schema.ts`
3. Check middleware authorization in `server/middleware.ts`
4. Verify environment variables are set

---

## 📄 License

MIT

---

Built with ❤️ for hiking enthusiasts!
