'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { initGoogleMaps } from './utils/google-maps'

interface SearchBarProps {
  onSelectDestination: (destination: { name: string; lat: number; lon: number }) => void
}

export function SearchBar({ onSelectDestination }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let autocomplete: google.maps.places.Autocomplete | null = null;

    async function initAutocomplete() {
      await initGoogleMaps();
      if (searchInputRef.current) {
        autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
          fields: ['name', 'geometry']
        });
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete?.getPlace();
          if (place?.geometry?.location) {
            onSelectDestination({
              name: place.name || '',
              lat: place.geometry.location.lat(),
              lon: place.geometry.location.lng()
            });
            setSearchTerm(''); // Clear the search term after selection
          }
        });
      }
    }

    initAutocomplete();

    return () => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [onSelectDestination]);

  return (
    <div className="absolute top-4 left-4 right-4 z-10">
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search for a destination..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg bg-black/70 px-4 py-2 pl-10 text-white placeholder-gray-400 backdrop-blur-sm"
        />
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  )
}

