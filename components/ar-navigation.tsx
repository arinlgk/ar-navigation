'use client'

import { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Line, Environment } from '@react-three/drei'
import { Vector3 } from 'three'
import { DeviceOrientationControls } from 'three/examples/jsm/controls/DeviceOrientationControls'

// Sample waypoints for UMP Pekan Campus
const waypoints = [
  {
    id: 1,
    name: 'Main Entrance',
    position: new Vector3(0, 0, -5),
    coordinates: { lat: 3.5439, lng: 103.4277 }
  },
  {
    id: 2,
    name: 'Library',
    position: new Vector3(5, 0, -5),
    coordinates: { lat: 3.5442, lng: 103.4280 }
  }
]

function NavigationArrows({ currentPosition, destination }) {
  if (!currentPosition || !destination) return null

  return (
    <Line
      points={[currentPosition, destination]}
      color="blue"
      lineWidth={5}
      dashed={true}
    />
  )
}

function Waypoint({ position, name }) {
  return (
    <group position={position}>
      <Text
        position={[0, 1, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </group>
  )
}

function CameraControls() {
  const controlsRef = useRef()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      // Request device orientation permissions on iOS
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(response => {
            if (response === 'granted') {
              enableControls()
            }
          })
          .catch(console.error)
      } else {
        enableControls()
      }
    }

    function enableControls() {
      if (controlsRef.current) {
        const controls = new DeviceOrientationControls(controlsRef.current)
        controls.connect()
        return () => controls.disconnect()
      }
    }
  }, [])

  return <OrbitControls ref={controlsRef} enableZoom={false} />
}

export default function ARNavigation() {
  const [userLocation, setUserLocation] = useState(null)
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      )
    }
  }, [])

  const requestPermissions = async () => {
    try {
      // Request device orientation permissions
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission()
        setHasPermission(permission === 'granted')
      } else {
        setHasPermission(true)
      }
    } catch (error) {
      console.error('Error requesting permissions:', error)
    }
  }

  if (!hasPermission) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={requestPermissions}
        >
          Enable AR Navigation
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen">
      <Canvas camera={{ position: [0, 0, 0], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Environment preset="city" />
        
        <CameraControls />
        
        {waypoints.map((waypoint) => (
          <Waypoint
            key={waypoint.id}
            position={waypoint.position}
            name={waypoint.name}
          />
        ))}

        {userLocation && selectedDestination && (
          <NavigationArrows
            currentPosition={new Vector3(0, 0, 0)}
            destination={selectedDestination.position}
          />
        )}
      </Canvas>

      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
        <select
          className="w-full p-2 rounded-lg"
          onChange={(e) => {
            const selected = waypoints.find(w => w.id === Number(e.target.value))
            setSelectedDestination(selected)
          }}
        >
          <option value="">Select Destination</option>
          {waypoints.map((waypoint) => (
            <option key={waypoint.id} value={waypoint.id}>
              {waypoint.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

