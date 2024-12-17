'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface LocationContextType {
  latitude: number | null
  longitude: number | null
  error: string | null
}

const LocationContext = createContext<LocationContextType>({
  latitude: null,
  longitude: null,
  error: null,
})

export function useLocation() {
  return useContext(LocationContext)
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationContextType>({
    latitude: null,
    longitude: null,
    error: null,
  })

  useEffect(() => {
    let watchId: number

    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null,
          })
        },
        (error) => {
          setLocation((prev) => ({ ...prev, error: error.message }))
        }
      )
    } else {
      setLocation((prev) => ({ ...prev, error: 'Geolocation is not supported by your browser' }))
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [])

  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  )
}

