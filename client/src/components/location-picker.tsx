import { useState, useCallback } from "react";
import { GoogleMap, Marker, DrawingManager, Polygon } from "@react-google-maps/api";
import { useMapsLoader } from "@/lib/googleMaps";

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  position: "absolute" as const,
  top: 0,
  left: 0
};

type Location = {
  lat: number;
  lng: number;
};

type Area = {
  coordinates: Location[];
  color: string;
};

interface LocationPickerProps {
  value: Location;
  area?: Area;
  onChange: (location: Location) => void;
  onAreaChange?: (area: Area) => void;
  enableAreaSelection?: boolean;
}

const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"];

export default function LocationPicker({ 
  value, 
  area, 
  onChange, 
  onAreaChange, 
  enableAreaSelection = false 
}: LocationPickerProps) {
  const { isLoaded } = useMapsLoader();
  console.log('Maps loaded:', isLoaded, 'API Key:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);



  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);
  const [color] = useState(colors[Math.floor(Math.random() * colors.length)]);

  const handleClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      onChange({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  }, [onChange]);

  const handlePolygonComplete = useCallback((poly: google.maps.Polygon) => {
    if (polygon) {
      polygon.setMap(null);
    }
    setPolygon(poly);

    const path = poly.getPath();
    const coordinates: Location[] = [];
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push({ lat: point.lat(), lng: point.lng() });
    }

    onAreaChange?.({
      coordinates,
      color
    });
  }, [polygon, onAreaChange, color]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div style={{ width: '100%', height: '300px', position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={value}
        zoom={5}
        onClick={handleClick}
      >
        <Marker position={value} />
        
        {enableAreaSelection && (
          <DrawingManager
            options={{
              drawingControl: true,
              drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [google.maps.drawing.OverlayType.POLYGON],
              },
              polygonOptions: {
                fillColor: color,
                fillOpacity: 0.3,
                strokeWeight: 2,
                editable: true,
                draggable: true,
              },
            }}
            onPolygonComplete={handlePolygonComplete}
          />
        )}

        {area && (
          <Polygon
            paths={area.coordinates}
            options={{
              fillColor: area.color,
              fillOpacity: 0.3,
              strokeWeight: 2,
              editable: enableAreaSelection,
              draggable: enableAreaSelection,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
