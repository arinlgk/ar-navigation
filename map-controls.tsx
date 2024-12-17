'use client'

import React, { useState } from 'react'
import { Compass, Navigation, ZoomIn, ZoomOut } from 'lucide-react'

export function MapControls() {
  const [zoom, setZoom] = useState(1)
  const [compassRotation, setCompassRotation] = useState(0)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5))

  // In a real app, you'd update this based on the device's orientation
  const updateCompassRotation = () => {
    setCompassRotation(prev => (prev + 45) % 360)
  }

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
      <div 
        className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white/20 bg-black/70 backdrop-blur-sm"
        style={{ transform: `scale(${zoom})` }}
      >
        <div className="relative h-full w-full">
          <div className="absolute inset-0 rounded-full border-2 border-white/20" />
          
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Navigation className="h-6 w-6 text-green-500" />
          </div>
          
          <div 
            className="absolute left-1/2 top-0 -translate-x-1/2"
            style={{ transform: `rotate(${compassRotation}deg)` }}
          >
            <Compass className="h-4 w-4 text-white" onClick={updateCompassRotation} />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button 
          className="rounded-full bg-black/70 p-2 text-white backdrop-blur-sm"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-6 w-6" />
        </button>
        <button 
          className="rounded-full bg-black/70 p-2 text-white backdrop-blur-sm"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}

