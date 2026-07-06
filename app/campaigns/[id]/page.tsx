'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Header from '@/components/Header'

interface Campaign {
  id: string
  name: string
  purpose: string
  channel: string
  status: string
  total_recipients: number
  sent_count: number
  opened_count: number
  clicked_count: number
  replied_count: number
  created_at: string
}

interface Message {
  id: string
  executive_name: string
  executive_email: string
  message_content: string
  status: string
  created_at: string
}

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.id as string
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState('')

  useEffect(() => {
    loadCampaign()
  }, [campaignId])

  const loadCampaign = async () => {
    try {
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

      if (campaignError) throw campaignError
      setCampaign(campaignData)

      const { data: messagesData, error: messagesError } = await supabase
        .from('campaign_messages')
        .select('*')
        .eq('campaign_id', campaignId)

      if (messagesError) throw messagesError
      setMessages(messagesData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleSendCampaign = async () => {
    setSending(true)
    setError('')
    setSendSuccess('')

    try {
      console.log('Sending campaign:', campaignId)
      
      const response = await fetch('/api/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaignId,
          sendAll: false,
        }),
      })

      const result = await response.json()
      console.log('Send result:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send campaign')
      }

      setSendSuccess(`✅ ${result.message}`)
      
      setTimeout(() => {
        loadCampaign()
      }, 1000)
    } catch (err) {
      console.error('Send error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send campaign')
    } finally {
      setSending(false)
    }
  }

  const handleSendAllPending = async () => {
    if (!window.confirm('Send all pending emails across ALL campaigns? This cannot be undone.')) {
      return
    }

    setSending(true)
    setError('')
    setSendSuccess('')

    try {
      console.log('Sending all pending emails')
      
      const response = await fetch('/api/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: null,
          sendAll: true,
        }),
      })

      const result = await response.json()
      console.log('Send all result:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send emails')
      }

      setSendSuccess(`✅ ${result.message}`)
      
      setTimeout(() => {
        loadCampaign()
      }, 1000)
    } catch (err) {
      console.error('Send all error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send emails')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-gray-900 font-semibold">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-red-700 font-bold">Campaign not found</p>
        </div>
      </div>
    )
  }

  const pendingMessages = messages.filter((m) => m.status === 'pending')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header title={campaign.name} subtitle={campaign.purpose} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <p className="text-red-900 font-bold">❌ Error: {error}</p>
          </div>
        )}

        {sendSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <p className="text-green-900 font-bold">{sendSuccess}</p>
          </div>
        )}

        {/* Campaign Overview */}
        <div className="bg-white rounded-xl shadow-lg p-10 border-2 border-gray-200 mb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-gray-700 text-sm font-semibold">Status</p>
              <span className={`inline-block px-4 py-2 rounded-lg font-bold text-white ${
                campaign.status === 'sent' ? 'bg-green-600' : 'bg-yellow-600'
              }`}>
                {campaign.status.toUpperCase()}
              </span>
            </div>
            <Link
              href="/campaigns"
              className="text-blue-600 hover:text-blue-800 font-bold text-lg"
            >
              ← Back to Campaigns
            </Link>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <p className="text-gray-700 font-semibold text-sm mb-2">Recipients</p>
              <p className="text-4xl font-bold text-blue-900">{campaign.total_recipients}</p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <p className="text-gray-700 font-semibold text-sm mb-2">Sent</p>
              <p className="text-4xl font-bold text-green-900">{campaign.sent_count || 0}</p>
            </div>
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
              <p className="text-gray-700 font-semibold text-sm mb-2">Opened</p>
              <p className="text-4xl font-bold text-purple-900">{campaign.opened_count || 0}</p>
            </div>
            <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-6">
              <p className="text-gray-700 font-semibold text-sm mb-2">Replied</p>
              <p className="text-4xl font-bold text-pink-900">{campaign.replied_count || 0}</p>
            </div>
          </div>

          {/* Send Buttons */}
          {pendingMessages.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-8">
              <p className="text-yellow-900 font-bold mb-4">
                ⚠️ {pendingMessages.length} pending message(s) ready to send
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleSendCampaign}
                  disabled={sending}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg text-lg"
                >
                  {sending ? '⏳ Sending...' : `📧 Send Campaign (${pendingMessages.length})`}
                </button>
                <button
                  onClick={handleSendAllPending}
                  disabled={sending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg text-lg"
                >
                  {sending ? '⏳ Sending...' : '🚀 Send All Pending'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Messages Table */}
        <div className="bg-white rounded-xl shadow-lg p-10 border-2 border-gray-200">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">Messages ({messages.length})</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left px-4 py-4 font-bold text-gray-900">Executive</th>
                  <th className="text-left px-4 py-4 font-bold text-gray-900">Email</th>
                  <th className="text-left px-4 py-4 font-bold text-gray-900">Message Preview</th>
                  <th className="text-left px-4 py-4 font-bold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-4 font-semibold text-gray-900">{msg.executive_name}</td>
                    <td className="px-4 py-4 text-gray-800 text-sm">{msg.executive_email}</td>
                    <td className="px-4 py-4 text-gray-800 text-sm max-w-xs truncate">
                      {msg.message_content.substring(0, 60)}...
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                        msg.status === 'sent' ? 'bg-green-100 text-green-900' :
                        msg.status === 'pending' ? 'bg-yellow-100 text-yellow-900' :
                        msg.status === 'failed' ? 'bg-red-100 text-red-900' :
                        'bg-gray-100 text-gray-900'
                      }`}>
                        {msg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {messages.length === 0 && (
            <p className="text-gray-700 font-semibold text-center py-8">No messages yet</p>
          )}
        </div>
      </main>
    </div>
  )
}
