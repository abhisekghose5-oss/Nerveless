import React from 'react'
import AlumniDashboard from '../src/components/AlumniDashboard'

export default function App(){
  return (
    <div className="min-h-screen bg-gray-100">
      <AlumniDashboard useMock={true} />
    </div>
  )
}
