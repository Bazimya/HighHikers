interface LocationCoordinates {
  latitude: number;
  longitude: number;
  name?: string;
}

interface GoogleMapEmbedProps {
  center?: LocationCoordinates;
  startPoint?: LocationCoordinates;
  endPoint?: LocationCoordinates;
  markers?: LocationCoordinates[];
  zoom?: number;
  height?: string;
  title?: string;
}

export function GoogleMapEmbed({
  center,
  startPoint,
  endPoint,
  markers = [],
  zoom = 12,
  height = "h-96",
  title,
}: GoogleMapEmbedProps) {
  // Build the map URL with markers
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className={`${height} bg-gray-100 rounded-lg border border-border flex items-center justify-center`}>
        <p className="text-gray-500">Google Maps API key not configured</p>
      </div>
    );
  }

  // Determine the center point
  let mapCenter = center;
  if (!mapCenter && startPoint && endPoint) {
    mapCenter = {
      latitude: (startPoint.latitude + endPoint.latitude) / 2,
      longitude: (startPoint.longitude + endPoint.longitude) / 2,
    };
  }
  if (!mapCenter && startPoint) {
    mapCenter = startPoint;
  }

  const allMarkers = [...markers];
  if (startPoint && !markers.find(m => m.latitude === startPoint.latitude && m.longitude === startPoint.longitude)) {
    allMarkers.unshift(startPoint);
  }
  if (endPoint && !markers.find(m => m.latitude === endPoint.latitude && m.longitude === endPoint.longitude)) {
    allMarkers.push(endPoint);
  }

  // Build marker query params
  let markerParams = '';
  allMarkers.forEach((marker, index) => {
    if (index === 0) {
      markerParams += `&markers=color:green|label:S|${marker.latitude},${marker.longitude}`;
    } else if (index === allMarkers.length - 1) {
      markerParams += `&markers=color:red|label:E|${marker.latitude},${marker.longitude}`;
    } else {
      markerParams += `&markers=color:blue|${marker.latitude},${marker.longitude}`;
    }
  });

  const mapUrl = new URL('https://www.google.com/maps/embed/v1/staticmap');
  mapUrl.searchParams.append('key', apiKey);
  
  if (mapCenter) {
    mapUrl.searchParams.append('center', `${mapCenter.latitude},${mapCenter.longitude}`);
    mapUrl.searchParams.append('zoom', zoom.toString());
  }
  
  // Use the embed API
  const embedUrl = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${mapCenter?.latitude},${mapCenter?.longitude}&zoom=${zoom}`;

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <iframe
        title="Google Map"
        width="100%"
        height={height.replace('h-', '')}
        frameBorder="0"
        src={embedUrl}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="rounded-lg border border-border"
      ></iframe>
      {startPoint && endPoint && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-green-700 font-semibold">Start Point</p>
            <p className="text-green-600 text-xs">{startPoint.name || 'Start'}</p>
            <p className="text-gray-600">
              {startPoint.latitude.toFixed(4)}, {startPoint.longitude.toFixed(4)}
            </p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-red-700 font-semibold">End Point</p>
            <p className="text-red-600 text-xs">{endPoint.name || 'End'}</p>
            <p className="text-gray-600">
              {endPoint.latitude.toFixed(4)}, {endPoint.longitude.toFixed(4)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
