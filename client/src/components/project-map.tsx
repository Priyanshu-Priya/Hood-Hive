import { useEffect, useState } from "react";
import { GoogleMap, Marker, InfoWindow, Polygon } from "@react-google-maps/api";
import { useMapsLoader } from "@/lib/googleMaps";
import { Project } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

type Location = {
  lat: number;
  lng: number;
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  position: "absolute" as const,
  top: 0,
  left: 0
};

const defaultCenter = {
  lat: 28.6139, lng: 77.2088
};

export default function ProjectMap({ projects }: { projects: Project[] }) {
  const { isLoaded } = useMapsLoader();
  console.log('Maps loaded:', isLoaded, 'API Key:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);



  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [infoPosition, setInfoPosition] = useState<Location | null>(null);
  const [center, setCenter] = useState(defaultCenter);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setCenter({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  const handleMarkerClick = (project: Project) => {
    setSelectedProject(project);
    setInfoPosition(project.location as Location);
  };

  const handlePolygonClick = (project: Project, event: google.maps.PolyMouseEvent) => {
    setSelectedProject(project);
    if (event.latLng) {
      setInfoPosition({
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      });
    }
  };

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={6}
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
        <div key={project.id}>
          <Marker
            position={project.location as Location}
            onClick={() => handleMarkerClick(project)}
          />
          
          {project.area && (
            <Polygon
              paths={project.area.coordinates}
              options={{
                fillColor: project.area.color,
                fillOpacity: 0.3,
                strokeWeight: 2,
                clickable: true,
              }}
              onClick={(e) => handlePolygonClick(project, e)}
            />
          )}
        </div>
      ))}

      {selectedProject && infoPosition && (
        <InfoWindow
          position={infoPosition}
          onCloseClick={() => {
            setSelectedProject(null);
            setInfoPosition(null);
          }}
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
    </div>
  );
}