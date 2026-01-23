import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Trail } from "@shared/schema";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface TrailMapProps {
  trails: Trail[];
}

const trailCoordinates: Record<string, [number, number]> = {
  "Pine Forest Loop": [-2.0469, 29.8739],
  "Summit Ridge Trail": [-1.9536, 29.9433],
  "Crystal Lake Path": [-1.9456, 30.0596],
  "Cascade Falls Trail": [-2.1408, 29.7382],
  "Mountain View Loop": [-2.0859, 29.8550],
  "Eagle Peak Ascent": [-1.8885, 30.3885],
};

export function TrailMap({ trails }: TrailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([-1.9705, 29.8739], 8);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    trails.forEach((trail) => {
      const coords = trailCoordinates[trail.name];
      if (coords) {
        const marker = L.marker(coords).addTo(map);
        
        const difficultyColor = 
          trail.difficulty === "Easy" ? "#22c55e" :
          trail.difficulty === "Moderate" ? "#eab308" :
          "#ef4444";

        marker.bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">${trail.name}</h3>
            <p style="margin-bottom: 4px;"><span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${difficultyColor}; margin-right: 4px;"></span>${trail.difficulty}</p>
            <p style="margin-bottom: 4px;">Location: ${trail.location}</p>
            <p style="margin-bottom: 4px;">Distance: ${trail.distance} • Elevation: ${trail.elevation}</p>
            <p>Duration: ${trail.duration}</p>
          </div>
        `);
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [trails]);

  return (
    <div ref={mapRef} className="w-full h-96 rounded-lg overflow-hidden border border-border" data-testid="trail-map" />
  );
}
