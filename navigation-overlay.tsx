'use client'

import React from 'react'
import { Clock, ChevronRight, X } from 'lucide-react'
import { useLocation } from './location-provider'

interface NavigationOverlayProps {
  destination: { name: string } | null;
  directions: google.maps.DirectionsResult | null;
  onCancel: () => void;
}

export function NavigationOverlay({ destination, directions, onCancel }: NavigationOverlayProps) {
  const { latitude, longitude, error } = useLocation()

  if (!destination || !directions) return null

  const route = directions.routes[0];
  const leg = route.legs[0];

  return (
    <div className="absolute inset-0 p-4">
      <div className="flex items-center justify-between rounded-lg bg-black/70 p-3 text-white backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span className="text-lg">{new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-300">ETA {leg.arrival_time?.text}</span>
          <span className="text-sm font-medium">{leg.duration?.text}</span>
        </div>
        <button 
          onClick={onCancel}
          className="ml-4 bg-red-500 p-2 rounded-full"
          aria-label="Cancel navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="absolute bottom-32 left-4 right-4 rounded-lg bg-black/70 p-4 text-white backdrop-blur-sm">
        <h2 className="mb-2 text-lg font-semibold">Turn-by-Turn Directions</h2>
        <ul className="space-y-2">
          {leg.steps.map((step, index) => (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium" dangerouslySetInnerHTML={{ __html: step.instructions }} />
                <p className="text-sm text-gray-300">{step.distance?.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="absolute bottom-4 left-4 rounded-lg bg-black/70 p-2 text-white backdrop-blur-sm">
        <p className="text-sm">
          Lat: {latitude?.toFixed(6)}, Lon: {longitude?.toFixed(6)}
        </p>
      </div>
    </div>
  )
}

