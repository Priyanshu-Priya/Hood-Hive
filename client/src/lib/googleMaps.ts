import { useJsApiLoader } from "@react-google-maps/api";

const libraries: ("drawing" | "places" | "visualization")[] = ["drawing"];

export const useMapsLoader = () => {
	const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
	
	if (!apiKey) {
		console.error('Google Maps API key is missing');
	}
	
	return useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: apiKey || '',
		libraries,
		version: "weekly"
	});
};