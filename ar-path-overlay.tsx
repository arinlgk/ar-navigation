'use client'

import React, { useEffect, useRef } from 'react'
import { useLocation } from './location-provider'
import { calculateDistance, calculateBearing } from './utils/google-maps'

interface ArPathOverlayProps {
  destination: { lat: number; lon: number } | null;
  directions: google.maps.DirectionsResult | null;
}

export function ArPathOverlay({ destination, directions }: ArPathOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { latitude, longitude } = useLocation()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !latitude || !longitude || !destination || !directions) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    function drawPath() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const route = directions.routes[0];
      if (!route) return;

      const path = route.overview_path;
      const startPoint = path[0];
      const endPoint = path[path.length - 1];

      const distance = calculateDistance(
        { lat: latitude, lng: longitude },
        { lat: endPoint.lat(), lng: endPoint.lng() }
      );
      const bearing = calculateBearing(
        { lat: latitude, lng: longitude },
        { lat: endPoint.lat(), lng: endPoint.lng() }
      );

      // Draw path
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height);
      for (let i = 1; i < path.length; i++) {
        const point = path[i];
        const x = (canvas.width / 2) + (point.lng() - startPoint.lng()) * 1000;
        const y = canvas.height - (point.lat() - startPoint.lat()) * 1000;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
      ctx.lineWidth = 5;
      ctx.stroke();

      // Draw arrow
      const arrowSize = 40;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(bearing * Math.PI / 180);

      ctx.beginPath();
      ctx.moveTo(0, -arrowSize / 2);
      ctx.lineTo(arrowSize / 2, arrowSize / 2);
      ctx.lineTo(-arrowSize / 2, arrowSize / 2);
      ctx.closePath();

      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      ctx.fill();

      ctx.restore();

      // Draw distance
      ctx.font = '20px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(`${Math.round(distance)}m`, 10, 30);
    }

    function animate() {
      drawPath();
      requestAnimationFrame(animate);
    }

    animate();

    return () => cancelAnimationFrame(animate);
  }, [latitude, longitude, destination, directions]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none" />
}

