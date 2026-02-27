# Map & Location Integration Guide

## Overview
The High Hikers platform now includes Google Maps integration for displaying trails and events with:
- **Automatic location pinning** when admins create trails/events
- **Start and end point visualization** for trails
- **Interactive map picker** for admins to set precise coordinates
- **User-friendly map displays** showing trail routes and event locations

## Features

### 1. Admin Trail Creation
When creating a new trail, admins can now:
- Set **main location** (latitude, longitude)
- Set **start point** with coordinates and name
- Set **end point** with coordinates and name
- Use interactive map picker to search and select locations
- See the trail route visualized on the map

### 2. Admin Event Creation
When creating events, admins can:
- Set **event location** (latitude, longitude)
- Set **start point** for gathering location
- Use map picker to search and find venues
- Subscribers automatically see the event pinned on a map

### 3. User Experience
Users can:
- View trails/events on interactive Google Maps
- See start and end points for trails
- Understand distance visually
- Access location details before registering

## Setup

### Getting Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "HighHikers")
3. Enable these APIs:
   - Maps Embed API
   - Geocoding API
   - Static Maps API
4. Go to **Credentials** → Create API Key
5. Restrict key to **HTTP referrers** for security:
   - Add: `http://localhost:5173/*` (development)
   - Add: `https://yourdomain.com/*` (production)
6. Copy the API key

### Configure Environment Variable

Add to `.env`:
```bash
VITE_GOOGLE_MAPS_API_KEY=your-api-key-here
```

## Components

### 1. MapPicker Component
**File:** `client/src/components/map-picker.tsx`

Used in admin forms to select locations:
```tsx
import { MapPicker } from "@/components/map-picker";

<MapPicker
  onSelectLocation={(location) => {
    setStartPoint(location);
  }}
  label="Select Start Point"
  placeholder="Search location or click on map"
/>
```

Features:
- Search location by address
- Click on map to select
- Draggable marker
- Shows selected coordinates

### 2. GoogleMapEmbed Component
**File:** `client/src/components/google-map.tsx`

Display maps on public pages:
```tsx
import { GoogleMapEmbed } from "@/components/google-map";

<GoogleMapEmbed
  startPoint={{ latitude: -1.95, longitude: 29.87, name: "Kigali" }}
  endPoint={{ latitude: -2.05, longitude: 29.90, name: "Musanze" }}
  title="Trail Route"
/>
```

Features:
- Embedded interactive map
- Green marker for start point
- Red marker for end point
- Responsive height
- Shows coordinates

### 3. TrailMap Component
**File:** `client/src/components/trail-map.tsx`

Display multiple trails on map (Leaflet-based):
- Shows all trails with location-based markers
- Color-coded by difficulty
- Popup details for each trail

## Database Schema

### Trail (Updated)
```typescript
{
  // ... existing fields
  startPoint?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  endPoint?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
}
```

### Event (Updated)
```typescript
{
  // ... existing fields
  startPoint?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
}
```

## API Endpoints

All existing endpoints continue to work. The new fields are optional:

**POST /api/trails**
```json
{
  "name": "Mountain Trail",
  "description": "Beautiful mountain hike",
  "difficulty": "Moderate",
  "distance": "15 km",
  "elevation": "500m",
  "duration": "4 hours",
  "location": "Kigali, Rwanda",
  "latitude": -1.9536,
  "longitude": 29.9433,
  "startPoint": {
    "latitude": -1.9536,
    "longitude": 29.9433,
    "name": "Start at Kigali"
  },
  "endPoint": {
    "latitude": -2.0469,
    "longitude": 29.8739,
    "name": "End at Musanze"
  },
  "imageUrl": "https://..."
}
```

**POST /api/events**
```json
{
  "title": "Hiking Event",
  "description": "Group hike",
  "date": "2026-02-15",
  "time": "09:00",
  "location": "Volcanoes National Park",
  "latitude": -1.4977,
  "longitude": 29.4677,
  "startPoint": {
    "latitude": -1.4977,
    "longitude": 29.4677,
    "name": "Meet at Park Entrance"
  },
  "difficulty": "Moderate",
  "imageUrl": "https://..."
}
```

## Security Considerations

1. **API Key Security**:
   - Use HTTP referrer restrictions
   - Never commit API key to git
   - Rotate keys regularly
   - Use separate keys for development/production

2. **Data Privacy**:
   - Coordinates are public (needed for maps)
   - Users can't see other users' full trail data
   - No tracking of user movements

3. **Rate Limiting**:
   - Google Maps has usage quotas
   - Set up billing alerts
   - Monitor API usage in Google Cloud Console

## Customization

### Change Default Map Center
In `map-picker.tsx`, change the default center:
```typescript
center: { lat: -1.9705, lng: 29.8739 }, // Rwanda center
// Change to your preferred location
```

### Customize Map Colors
Update marker colors in `google-map.tsx`:
```typescript
// Green for start, red for end, blue for other markers
markers=color:green|label:S|...
markers=color:red|label:E|...
```

### Add Zoom Controls
Already included in both components, can be customized:
```typescript
map.setZoom(13);
```

## Troubleshooting

### Maps not displaying?
1. Check Google Maps API key is set in `.env`
2. Verify API is enabled in Google Cloud Console
3. Check browser console for errors
4. Ensure referrer restrictions allow your domain

### "API key not configured" message?
- Add `VITE_GOOGLE_MAPS_API_KEY` to `.env`
- Restart development server
- Clear browser cache

### Markers not appearing?
- Verify latitude/longitude values are valid
- Check coordinates are in correct format (decimal)
- Ensure startPoint/endPoint objects are properly structured

### Search not working?
- Geocoding API must be enabled
- Verify API key has geocoding permission
- Check for JavaScript errors in console

## Future Enhancements

- [ ] Route optimization (shortest path between points)
- [ ] Elevation profile display
- [ ] Real-time user location tracking (with permission)
- [ ] Multiple trail segment support
- [ ] Weather overlay for trails
- [ ] Trail difficulty heatmap
- [ ] User review locations on map

## Support

For issues with Google Maps API:
- Check [Google Maps API documentation](https://developers.google.com/maps)
- Review API quotas and limits
- Contact Google Cloud support for billing issues
