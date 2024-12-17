'use client'

import React from 'react'
import { Search } from 'lucide-react'
import Link from 'next/link'

export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">AR Navigation System</h1>
      <p className="text-xl mb-8 text-center">Explore UMPSA campus with augmented reality navigation</p>
      <Link 
        href="/navigation" 
        className="flex items-center justify-center bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
      >
        <Search className="mr-2" />
        Start Navigation
      </Link>
    </div>
  )
}

