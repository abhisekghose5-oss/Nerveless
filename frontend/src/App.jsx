import React from 'react'
import AlumniDashboard from '../src/components/AlumniDashboard'
import Features from './components/Features'

export default function App(){
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-6">
        <Features />
        <AlumniDashboard useMock={true} />
      </div>
    </div>
  )
}
