import { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

type Location = {
  lat: number;
  lng: number;
};

interface LocationPickerProps {
  value: Location;
  onChange: (location: Location) => void;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "" // Google Maps will work in development mode without an API key
  });

  const handleClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      onChange({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  }, [onChange]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="h-[300px] w-full rounded-md border">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={value}
        zoom={13}
        onClick={handleClick}
      >
        <Marker position={value} />
      </GoogleMap>
    </div>
  );
}
