'use client'

import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Canvas, useFrame } from '@react-three/fiber'

function Character({ position }: { position: [number, number, number] }) {
  const gltf = useLoader(GLTFLoader, '/assets/3d/duck.glb')
  const modelRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01
      modelRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1 + 0.1
    }
  })

  return (
    <primitive 
      object={gltf.scene} 
      position={position}
      scale={[0.5, 0.5, 0.5]}
      ref={modelRef}
    />
  )
}

interface ThreeDCharacterProps {
  isNearDestination: boolean
}

export function ThreeDCharacter({ isNearDestination }: ThreeDCharacterProps) {
  if (!isNearDestination) return null

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <Canvas>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <Character position={[0, 0, -5]} />
      </Canvas>
    </div>
  )
}

