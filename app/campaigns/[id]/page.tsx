'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  channel: string
  status: string
  purpose: string
  total_recipients: number
  sent_count: number
  opened_count: number
  clicked_count: number
  replied_count: number
  created_at: string
}

interface CampaignMessage {
  id: string
  executive_name: string
  executive_email: string
  status: string
  sent_at: string
  opened_at: string | null
  replied_at: string | null
}

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.id as string
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [messages, setMessages] = useState<CampaignMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCampaignData()
  }, [campaignId])

  const loadCampaignData = async () => {
    try {
      // Load campaign
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

      if (campaignError) throw campaignError
      setCampaign(campaignData)

      // Load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('campaign_messages')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })

      if (messagesError) throw messagesError
      setMessages(messagesData || [])
    } catch (error) {
      console.error('Error loading campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'opened':
        return 'bg-blue-100 text-blue-800'
      case 'replied':
        return 'bg-purple-100 text-purple-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading campaign...</p>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 mb-4">Campaign not found</p>
          <Link href="/campaigns" className="text-blue-600 hover:underline">
            Back to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  const openRate = campaign.total_recipients > 0 ? ((campaign.opened_count / campaign.sent_count) * 100).toFixed(1) : 0
  const replyRate = campaign.total_recipients > 0 ? ((campaign.replied_count / campaign.sent_count) * 100).toFixed(1) : 0

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/campaigns" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Campaigns
        </Link>

        {/* Campaign Header */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{campaign.name}</h1>
              <p className="text-gray-600">{campaign.purpose}</p>
            </div>
            <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(campaign.status)}`}>
              {campaign.status.toUpperCase()}
            </span>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Recipients</p>
              <p className="text-2xl font-bold">{campaign.total_recipients}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Sent</p>
              <p className="text-2xl font-bold">{campaign.sent_count}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Opened</p>
              <p className="text-2xl font-bold">{campaign.opened_count} ({openRate}%)</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Replied</p>
              <p className="text-2xl font-bold">{campaign.replied_count} ({replyRate}%)</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-600 text-sm">Channel</p>
              <p className="text-2xl font-bold">{campaign.channel === 'email' ? '📧' : campaign.channel === 'linkedin' ? '💼' : '📱'}</p>
            </div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-8 py-6 border-b">
            <h2 className="text-xl font-bold">Messages ({messages.length})</h2>
          </div>

          {messages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No messages sent yet
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Executive</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Sent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Opened</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Replied</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{msg.executive_name}</td>
                    <td className="px-6 py-4 text-sm">{msg.executive_email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(msg.status)}`}>
                        {msg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{msg.sent_at ? new Date(msg.sent_at).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 text-sm">{msg.opened_at ? '✓' : '-'}</td>
                    <td className="px-6 py-4 text-sm">{msg.replied_at ? '✓' : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
