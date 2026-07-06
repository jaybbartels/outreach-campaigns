'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <nav className="max-w-7xl mx-auto mb-12">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">OutreachCampaigns</h1>
          <div className="flex gap-6">
            <Link href="/campaigns" className="text-gray-700 hover:text-blue-600">My Campaigns</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">Send Campaigns at Scale</h2>
        <p className="text-gray-600 mb-8">Execute your outreach strategy with automated email sending and tracking</p>
        
        <div className="flex gap-4 justify-center mb-12">
          <Link href="/campaigns/create" className="bg-blue-600 text-white px-6 py-3 rounded-lg">Create Campaign</Link>
          <Link href="/campaigns" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg">View Campaigns</Link>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-4xl mb-2">📧</p>
            <h3 className="font-bold mb-2">Email Sending</h3>
            <p className="text-sm text-gray-600">Send via SendGrid with tracking</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-4xl mb-2">📊</p>
            <h3 className="font-bold mb-2">Open Tracking</h3>
            <p className="text-sm text-gray-600">See who opened your emails</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-4xl mb-2">🔄</p>
            <h3 className="font-bold mb-2">Auto Follow-ups</h3>
            <p className="text-sm text-gray-600">Schedule automatic follow-ups</p>
          </div>
        </div>
      </div>
    </div>
  )
}
