'use client'

import React, { useState, useEffect } from 'react'
import { ArCamera } from './ar-camera'
import { NavigationOverlay } from './navigation-overlay'
import { MapControls } from './map-controls'
import { SearchBar } from './search-bar'
import { ArPathOverlay } from './ar-path-overlay'
import { LocationProvider, useLocation } from './location-provider'
import { initGoogleMaps, getDirections, calculateDistance } from './utils/google-maps'
import { ThreeDCharacter } from './3d-character'
import Link from 'next/link'

interface Destination {
  name: string;
  lat: number;
  lon: number;
}

function ARNavigationContent() {
  const [destination, setDestination] = useState<Destination | null>(null)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isNearDestination, setIsNearDestination] = useState(false)
  const { latitude, longitude, error } = useLocation()

  useEffect(() => {
    async function loadGoogleMaps() {
      try {
        await initGoogleMaps();
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
        setApiError("Failed to load Google Maps. Please check your API key and permissions.");
      }
    }
    loadGoogleMaps();
  }, []);

  useEffect(() => {
    async function fetchDirections() {
      if (latitude && longitude && destination) {
        try {
          const result = await getDirections(
            { lat: latitude, lng: longitude },
            { lat: destination.lat, lng: destination.lon }
          );
          setDirections(result);

          // Check if user is near destination
          const distance = calculateDistance(
            { lat: latitude, lng: longitude },
            { lat: destination.lat, lng: destination.lon }
          );
          setIsNearDestination(distance <= 50); // 50 meters threshold
        } catch (error) {
          console.error("Error fetching directions:", error);
          setApiError("Failed to fetch directions. Please try again.");
        }
      }
    }
    fetchDirections();
  }, [latitude, longitude, destination]);

  const handleCancelNavigation = () => {
    setDestination(null);
    setDirections(null);
    setIsNearDestination(false);
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black">
      <ArCamera />
      <ArPathOverlay destination={destination} directions={directions} />
      <NavigationOverlay 
        destination={destination} 
        directions={directions} 
        onCancel={handleCancelNavigation}
      />
      <MapControls />
      <SearchBar onSelectDestination={setDestination} />
      <ThreeDCharacter isNearDestination={isNearDestination} />
      {(error || apiError) && (
        <div className="absolute bottom-4 left-4 bg-red-500 p-2 text-white rounded">
          Error: {error || apiError}
        </div>
      )}
      <Link 
        href="/"
        className="absolute top-4 left-4 bg-white text-black px-4 py-2 rounded-lg z-20"
      >
        Back to Home
      </Link>
    </main>
  )
}

export default function ARNavigation() {
  return (
    <LocationProvider>
      <ARNavigationContent />
    </LocationProvider>
  )
}

