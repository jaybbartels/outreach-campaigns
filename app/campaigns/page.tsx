'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
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
            + Create Campaign
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-10 border-2 border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Campaigns ({campaigns.length})</h2>

          {loading ? (
            <p className="text-gray-800 font-semibold">Loading campaigns...</p>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-700 font-semibold mb-4">No campaigns yet</p>
              <Link
                href="/campaigns/create"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
              >
                Create your first campaign
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="block p-6 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{campaign.name}</h3>
                      <p className="text-gray-700 text-sm mb-3">
                        Created: {new Date(campaign.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-6">
                        <div>
                          <p className="text-gray-700 text-xs font-semibold">Recipients</p>
                          <p className="text-2xl font-bold text-gray-900">{campaign.total_recipients}</p>
                        </div>
                        <div>
                          <p className="text-gray-700 text-xs font-semibold">Sent</p>
                          <p className="text-2xl font-bold text-green-700">{campaign.sent_count || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-700 text-xs font-semibold">Opened</p>
                          <p className="text-2xl font-bold text-purple-700">{campaign.opened_count || 0}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-lg font-bold text-white text-sm ${
                      campaign.status === 'sent' ? 'bg-green-600' : 'bg-yellow-600'
                    }`}>
                      {campaign.status.toUpperCase()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
