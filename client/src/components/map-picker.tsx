import { useState, useEffect, useRef } from "react";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LocationCoordinates {
  latitude: number;
  longitude: number;
  name?: string;
}

interface MapPickerProps {
  onSelectLocation: (location: LocationCoordinates) => void;
  label?: string;
  placeholder?: string;
  initialValue?: LocationCoordinates;
}

declare global {
  interface Window {
    google: any;
  }
}

export function MapPicker({ 
  onSelectLocation, 
  label = "Select Location",
  placeholder = "Search location or click on map...",
  initialValue,
}: MapPickerProps) {
  const [searchInput, setSearchInput] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(initialValue || null);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current || !apiKey || mapInstanceRef.current) return;

    const google = window.google;
    if (!google) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 10,
      center: initialValue 
        ? { lat: initialValue.latitude, lng: initialValue.longitude }
        : { lat: -1.9705, lng: 29.8739 }, // Default Rwanda center
      mapTypeControl: true,
      fullscreenControl: true,
    });

    mapInstanceRef.current = map;

    // Add click listener to map
    map.addListener("click", (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      const newLocation: LocationCoordinates = {
        latitude: lat,
        longitude: lng,
      };

      setSelectedLocation(newLocation);
      updateMarker(map, lat, lng);
      onSelectLocation(newLocation);
    });

    // Add initial marker if provided
    if (initialValue) {
      updateMarker(map, initialValue.latitude, initialValue.longitude);
    }
  }, [apiKey, initialValue]);

  const updateMarker = (map: any, lat: number, lng: number) => {
    const google = window.google;
    if (!google) return;

    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      draggable: true,
      title: "Location marker",
    });

    // Update location when marker is dragged
    marker.addListener("dragend", () => {
      const newPosition = marker.getPosition();
      if (newPosition) {
        const newLocation: LocationCoordinates = {
          latitude: newPosition.lat(),
          longitude: newPosition.lng(),
        };
        setSelectedLocation(newLocation);
        onSelectLocation(newLocation);
      }
    });

    markerRef.current = marker;
  };

  const searchLocation = async () => {
    if (!searchInput.trim()) return;

    setIsLoading(true);
    try {
      const google = window.google;
      if (!google) throw new Error("Google Maps API not available");

      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: searchInput });

      if (result.results.length > 0) {
        const location = result.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        const newLocation: LocationCoordinates = {
          latitude: lat,
          longitude: lng,
          name: result.results[0].formatted_address,
        };

        setSelectedLocation(newLocation);
        onSelectLocation(newLocation);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(13);
          updateMarker(mapInstanceRef.current, lat, lng);
        }
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Could not find location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!apiKey) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Google Maps API key not configured. Contact administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">{label}</label>
        
        {/* Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchLocation()}
              placeholder={placeholder}
              className="pl-10"
            />
          </div>
          <Button
            onClick={searchLocation}
            disabled={isLoading || !searchInput.trim()}
            variant="outline"
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Map */}
        <div
          ref={mapRef}
          className="w-full h-96 rounded-lg border border-border shadow-sm"
        />

        {/* Selected Location Info */}
        {selectedLocation && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900">Selected Location</p>
                {selectedLocation.name && (
                  <p className="text-sm text-blue-700">{selectedLocation.name}</p>
                )}
                <p className="text-sm text-blue-600 font-mono">
                  {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
