import React from 'react'

export default function Features(){
  return (
    <section className="p-6 bg-white rounded shadow mb-6">
      <h2 className="text-2xl font-semibold mb-4">Career & Event Ecosystem</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-medium">Job & Internship Board</h3>
          <p className="text-sm text-gray-600 mt-2">The app features a dedicated board for alumni-exclusive postings, designed to yield higher conversion rates.</p>
        </div>

        <div className="p-4 border rounded">
          <h3 className="font-medium">Event Management</h3>
          <p className="text-sm text-gray-600 mt-2">Built-in tools for organizing virtual webinars, reunions, and AMA sessions, complete with RSVP tracking.</p>
        </div>

        <div className="p-4 border rounded">
          <h3 className="font-medium">Donation Portal</h3>
          <p className="text-sm text-gray-600 mt-2">A transparent gateway to facilitate financial support and donations for college initiatives.</p>
        </div>
      </div>
    </section>
  )
}
