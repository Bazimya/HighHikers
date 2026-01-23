# HIGH HIKERS - Hiking Community Website

## Overview
HIGH HIKERS is a modern, responsive hiking community website designed to help outdoor enthusiasts discover trails, join events, and connect with fellow hikers. Built with React, TypeScript, and Tailwind CSS, the site features a beautiful outdoor-themed design with earth tones and stunning nature photography.

## Project Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Wouter (routing)
- **Styling**: Tailwind CSS, Shadcn UI components
- **Backend**: Express.js, Node.js
- **Storage**: In-memory storage (MemStorage)
- **State Management**: TanStack Query v5
- **Forms**: React Hook Form with Zod validation

### Design System
- **Color Scheme**: Earth tones with forest green primary (#2d5a3d), earthy brown secondary, and mountain sky blue accent
- **Typography**: Inter for body/headers, Space Grotesk for stats/accent text
- **Dark Mode**: Full dark mode support with theme toggle
- **Responsive**: Mobile-first design, works flawlessly on all devices

## Features Implemented

### Pages
1. **Home** (`/`)
   - Immersive hero section with mountain landscape
   - Featured trails showcase
   - Community statistics
   - Call-to-action sections

2. **Trails** (`/trails`)
   - Browse all hiking trails with search functionality
   - Filter by difficulty (Easy, Moderate, Hard)
   - Trail cards with difficulty badges, distance, elevation, and duration
   - Beautiful trail photography

3. **Events** (`/events`)
   - Upcoming hiking events in timeline layout
   - Event details with date, time, location, and participant counts
   - Registration functionality
   - Difficulty-based color coding

4. **Blog** (`/blog`)
   - Hiking tips, gear reviews, and trail stories
   - Search functionality for articles
   - Category filtering (Tips, Gear Reviews, Trail Stories)
   - Author information and read times

5. **About Us** (`/about`)
   - Mission statement and team values
   - Team member profiles
   - Community statistics
   - Company history and vision

6. **Contact** (`/contact`)
   - Contact form with validation
   - Contact information cards
   - Office hours
   - Embedded Google Maps location

### Components
- **Navigation**: Sticky header with mobile menu, theme toggle, and responsive navigation
- **Footer**: Multi-column footer with quick links, social media, and newsletter signup
- **Theme Provider**: Light/dark mode support with localStorage persistence
- **Trail Cards**: Reusable trail display components with images, badges, and stats
- **Event Cards**: Timeline-style event cards with registration status

## Data Models

### Trail
- id, name, description, difficulty, distance, elevation, duration, location, imageUrl, featured

### Event
- id, title, description, date, time, location, difficulty, maxParticipants, imageUrl

### Blog Post
- id, title, excerpt, content, category, author, authorAvatar, readTime, imageUrl, publishedAt

### Contact Message
- id, name, email, subject, message, createdAt

## File Structure
```
client/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   ├── navigation.tsx   # Main navigation component
│   │   ├── footer.tsx       # Footer component
│   │   └── theme-provider.tsx
│   ├── pages/
│   │   ├── home.tsx
│   │   ├── trails.tsx
│   │   ├── events.tsx
│   │   ├── blog.tsx
│   │   ├── about.tsx
│   │   └── contact.tsx
│   ├── App.tsx              # Main app with routing
│   └── index.css            # Global styles and design tokens
├── index.html               # HTML entry point with SEO meta tags
└── attached_assets/         # Generated hiking images

server/
├── routes.ts                # API routes (to be implemented)
└── storage.ts               # In-memory storage interface

shared/
└── schema.ts                # Shared data models and Zod schemas
```

## Design Guidelines
See `design_guidelines.md` for detailed design specifications including:
- Color palette for light and dark modes
- Typography scale and font choices
- Layout system and spacing primitives
- Component specifications
- Image strategy and treatment
- Animation philosophy

## Current Status
✅ Phase 1: Schema & Frontend - COMPLETE
- All data models defined with TypeScript interfaces
- Hero and trail images generated
- All pages built with beautiful, responsive designs
- Navigation and footer implemented
- Dark mode support added
- Search and filtering functionality added

✅ Phase 2: Backend - COMPLETE
- API endpoints for trails, events, blog posts, and contact messages
- In-memory storage with seed data
- Zod validation for all endpoints
- Error handling and proper HTTP status codes

✅ Phase 3: Integration - COMPLETE
- All frontend pages connected to backend APIs
- TanStack Query for data fetching
- Loading states with skeleton components
- Error handling with toast notifications
- Contact form submission working
- Real data flowing through entire application

🚀 Ready for Testing and Deployment

## Key Features to Highlight
- **Beautiful Design**: Stunning outdoor photography with professional design
- **Fully Responsive**: Works perfectly on mobile, tablet, and desktop
- **Dark Mode**: Complete dark mode support with smooth theme transitions
- **Search & Filters**: Powerful search and filtering for trails and blog posts
- **Accessibility**: Proper semantic HTML, ARIA labels, and keyboard navigation
- **SEO Optimized**: Comprehensive meta tags and Open Graph support
- **Fast Performance**: Optimized images and efficient component rendering

## Next Steps
1. Implement backend API routes
2. Connect frontend to backend with TanStack Query
3. Add Leaflet.js map integration for trail visualization
4. Add loading skeletons and error states
5. Test all user journeys
6. Deploy to production
