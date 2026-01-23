# HIGH HIKERS Design Guidelines

## Design Approach: Reference-Based Outdoor Experience

**Primary References**: Airbnb (experiential storytelling), AllTrails (trail discovery), Patagonia (outdoor authenticity)

**Design Principles**:
- **Nature-First Visuals**: Large, immersive photography that transports users to the trails
- **Adventure Accessibility**: Clear pathways to discover, plan, and join hikes
- **Community Connection**: Warm, inviting design that fosters belonging among hikers
- **Authentic Outdoor Aesthetic**: Avoid corporate polish; embrace natural, organic elements

## Color Palette

**Light Mode**:
- Primary: `140 45% 35%` (Forest Green - navigation, CTAs, headers)
- Secondary: `30 35% 45%` (Earthy Brown - section backgrounds, cards)
- Accent: `200 70% 50%` (Mountain Sky Blue - links, highlights, badges)
- Background: `45 20% 96%` (Warm Off-White)
- Text: `140 20% 15%` (Deep Forest for body text)
- Muted Text: `140 10% 45%` (for secondary information)

**Dark Mode**:
- Primary: `140 40% 55%` (Sage Green)
- Secondary: `30 25% 35%` (Dark Earth)
- Accent: `200 60% 60%` (Lighter Sky Blue)
- Background: `140 15% 12%` (Deep Forest Night)
- Surface: `140 10% 18%` (Card backgrounds)
- Text: `45 15% 92%` (Warm White)

## Typography

**Font Stack**:
- Headers: 'Inter', system-ui, sans-serif (700, 600 weights)
- Body: 'Inter', system-ui, sans-serif (400, 500 weights)
- Accent/Stats: 'Space Grotesk', monospace (600 weight for trail stats, difficulty badges)

**Scale**:
- Hero H1: text-6xl (mobile) / text-7xl (desktop), font-bold, tracking-tight
- Section H2: text-4xl / text-5xl, font-semibold
- Card H3: text-xl / text-2xl, font-semibold
- Body: text-base / text-lg
- Small/Meta: text-sm

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16, 20, 24** (e.g., p-8, gap-12, my-20)

**Section Rhythm**:
- Mobile: py-12 to py-16
- Desktop: py-20 to py-32
- Generous whitespace between major sections (mb-24)

**Grid Patterns**:
- Trail Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-8
- Featured Content: 2-column asymmetric (60/40 split on desktop)
- Blog Posts: grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-6
- Stats/Metrics: grid-cols-2 md:grid-cols-4

## Component Library

**Navigation**:
- Sticky header with backdrop-blur effect when scrolling
- Logo left, navigation center, CTA button right
- Mobile: Hamburger menu with full-screen overlay
- Background: bg-white/90 (light) / bg-surface/90 (dark) with backdrop-blur-md

**Hero Section** (Home Page):
- Full-width immersive background image (mountain landscape, hikers on trail)
- Height: min-h-[85vh]
- Overlay: gradient from transparent to bg-black/40 for text readability
- Content: Centered, max-w-4xl, large headline + subheadline + dual CTAs
- CTAs: Primary solid button + Secondary outline button with backdrop-blur-sm bg-white/10

**Trail Cards**:
- Rounded corners (rounded-xl), overflow-hidden
- Image: aspect-video, object-cover with subtle hover scale
- Content padding: p-6
- Difficulty badge: Top-right absolute position, pill-shaped, color-coded (green=easy, yellow=moderate, red=hard)
- Stats row: Distance, elevation, time (icons + text)
- CTA: "View Details" link with arrow icon

**Events Section**:
- Timeline-style layout with date markers on left
- Cards with event image thumbnail, title, description, "Register" button
- Upcoming events highlighted with accent border

**Blog Cards**:
- Featured image, category tag, title, excerpt, author avatar + name, read time
- Hover effect: subtle shadow lift
- Card background: bg-white (light) / bg-surface (dark)

**Contact Form**:
- 2-column layout on desktop (form left, contact info + map right)
- Input styling: border-2, rounded-lg, focus:ring-2 focus:ring-primary
- Large textarea for message
- Submit button: Full-width on mobile, auto on desktop

**Search Bar**:
- Prominent in navigation or hero section
- Icon left, placeholder "Search trails, tips, stories..."
- Rounded-full design for friendliness

**Footer**:
- 4-column grid: About, Quick Links, Contact Info, Newsletter Signup
- Social media icons (circular, hover lift effect)
- Bottom copyright bar with muted background

## Images Strategy

**Critical Image Placements**:

1. **Hero Image**: Full-width panoramic mountain/forest landscape with hikers (sunrise/golden hour preferred) - conveys adventure and scale
2. **Trail Cards**: Each trail needs distinctive landscape photo showing terrain type
3. **About Section**: Team photo outdoors or candid hiking moments
4. **Blog Posts**: Featured images for each article (gear, trail photos, action shots)
5. **Events**: Activity photos from previous hikes

**Image Treatment**:
- Aspect ratios: 16:9 for heroes, 4:3 for cards, 1:1 for avatars
- Overlay gradients on hero images for text contrast
- Subtle saturation boost (+10%) to make nature colors pop
- Border-radius: rounded-xl for cards, rounded-full for avatars

## Special Elements

**Difficulty Badges**: Pill-shaped with icon (Easy: green hiking boot, Moderate: yellow mountain, Hard: red peak)

**Trail Statistics**: Icon + number combinations using Space Grotesk font (e.g., 🥾 5.2 mi, ⛰️ 1,240 ft, ⏱️ 3h 15m)

**Testimonials**: Large quote marks, italic text, author with small circular photo

**Map Integration**: Embedded Leaflet.js maps with custom green/brown marker pins, trail overlays

**Call-to-Action Sections**: Full-width with background image, overlay, centered content, large headline, single focused CTA

## Animation Philosophy

**Minimal & Purposeful**:
- Smooth page transitions (opacity fade)
- Hover scale on images (scale-105)
- Stagger fade-in for trail cards on scroll (50ms delay between each)
- NO: Parallax, complex scroll animations, auto-playing carousels

This design creates an authentic outdoor experience that balances visual storytelling with practical trail information, fostering community while maintaining ease of navigation and content updates.