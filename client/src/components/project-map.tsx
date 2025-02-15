import { useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { Project } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

export default function ProjectMap({ projects }: { projects: Project[] }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "" // Google Maps will work in development mode without an API key
  });

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [center, setCenter] = useState(defaultCenter);

  useEffect(() => {
    // Get user's location
    navigator.geolocation.getCurrentPosition((pos) => {
      setCenter({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={11}
      options={{
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#242f3e" }],
          },
        ],
      }}
    >
      {projects.map((project) => (
        <Marker
          key={project.id}
          position={{
            lat: project.location.lat,
            lng: project.location.lng,
          }}
          onClick={() => setSelectedProject(project)}
        />
      ))}

      {selectedProject && (
        <InfoWindow
          position={{
            lat: selectedProject.location.lat,
            lng: selectedProject.location.lng,
          }}
          onCloseClick={() => setSelectedProject(null)}
        >
          <Card className="w-64">
            <CardContent className="p-4">
              <Badge className="mb-2">{selectedProject.category}</Badge>
              <h3 className="font-semibold mb-1">{selectedProject.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {selectedProject.description.substring(0, 100)}...
              </p>
              <Link href={`/projects/${selectedProject.id}`}>
                <a className="text-sm text-primary hover:underline">
                  View Details →
                </a>
              </Link>
            </CardContent>
          </Card>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}