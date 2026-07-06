'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  channel: string
  status: string
  total_recipients: number
  sent_count: number
  opened_count: number
  clicked_count: number
  replied_count: number
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
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'sending':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getChannelEmoji = (channel: string) => {
    switch (channel) {
      case 'email':
        return '📧'
      case 'linkedin':
        return '💼'
      case 'sms':
        return '📱'
      default:
        return '📨'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading campaigns...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-600">Manage and track your outreach campaigns</p>
          </div>
          <Link
            href="/campaigns/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            + New Campaign
          </Link>
        </div>

        {/* Campaigns Table */}
        {campaigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No campaigns yet</p>
            <Link
              href="/campaigns/create"
              className="text-blue-600 hover:underline"
            >
              Create your first campaign
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Campaign</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Channel</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Recipients</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Sent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Opened</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Replied</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{campaign.name}</td>
                    <td className="px-6 py-4">{getChannelEmoji(campaign.channel)} {campaign.channel}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">{campaign.total_recipients}</td>
                    <td className="px-6 py-4 text-center">{campaign.sent_count}</td>
                    <td className="px-6 py-4 text-center">{campaign.opened_count}</td>
                    <td className="px-6 py-4 text-center">{campaign.replied_count}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
