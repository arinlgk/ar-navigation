import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  version: "weekly",
  libraries: ["places", "geometry"]
});

export async function initGoogleMaps() {
  try {
    return await loader.load();
  } catch (error) {
    console.error("Error loading Google Maps:", error);
    throw error;
  }
}

export async function getDirections(origin: google.maps.LatLngLiteral, destination: google.maps.LatLngLiteral) {
  const { maps } = await initGoogleMaps();
  const directionsService = new maps.DirectionsService();
  const result = await directionsService.route({
    origin,
    destination,
    travelMode: maps.TravelMode.WALKING,
  });
  return result;
}

export function calculateDistance(point1: google.maps.LatLngLiteral, point2: google.maps.LatLngLiteral) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = point1.lat * Math.PI / 180;
  const φ2 = point2.lat * Math.PI / 180;
  const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
  const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

export function calculateBearing(point1: google.maps.LatLngLiteral, point2: google.maps.LatLngLiteral) {
  const { maps } = window.google;
  return maps.geometry.spherical.computeHeading(point1, point2);
}

