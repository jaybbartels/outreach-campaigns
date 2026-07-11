'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'
import Header from '@/components/Header'

interface Campaign {
  id: string
  name: string
  status: string
  total_recipients: number
  sent_count: number
  opened_count: number
  created_at: string
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      const response = await api.getCampaigns()
      setCampaigns(response.data?.campaigns || [])
    } catch (err) {
      console.error('Failed to load campaigns:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header title="Campaigns" subtitle="Manage your outreach campaigns" />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-4 mb-8">
          <Link
            href="/campaigns/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
          >
            Create Campaign
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Loading campaigns...</p>
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid gap-6">
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold mb-2">{campaign.name}</h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className="font-semibold capitalize">{campaign.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Recipients</p>
                    <p className="font-semibold">{campaign.total_recipients}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Sent</p>
                    <p className="font-semibold">{campaign.sent_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Opened</p>
                    <p className="font-semibold">{campaign.opened_count}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 mb-4">No campaigns yet</p>
            <Link href="/campaigns/create" className="text-blue-600 hover:underline">
              Create your first campaign
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
