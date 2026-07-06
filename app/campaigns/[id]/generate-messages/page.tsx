'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Header from '@/components/Header'

interface Executive {
  id: string
  name: string
  email: string
  title: string
  company_name: string
}

interface MessageState {
  [key: string]: string
}

export default function GenerateMessagesPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string
  const [executives, setExecutives] = useState<Executive[]>([])
  const [messages, setMessages] = useState<MessageState>({})
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [campaignId])

  const loadData = async () => {
    try {
      setLoading(true)
      const selectedIds = JSON.parse(
        localStorage.getItem(`campaign-${campaignId}-executives`) || '[]'
      )

      if (selectedIds.length === 0) {
        router.push(`/campaigns/${campaignId}/select-executives`)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('executives')
        .select('id, name, email, title, company_name')
        .in('id', selectedIds)

      if (fetchError) throw fetchError
      setExecutives(data || [])

      // Initialize empty messages
      const initialMessages: MessageState = {}
      data?.forEach((exec) => {
        initialMessages[exec.id] = ''
      })
      setMessages(initialMessages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const generateMessages = async () => {
    setGenerating(true)
    setError('')

    try {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('purpose, channel')
        .eq('id', campaignId)
        .single()

      if (!campaign) throw new Error('Campaign not found')

      for (const exec of executives) {
        const prompt = `Write a professional ${campaign.channel} message for ${exec.name} at ${exec.company_name}. 
        Campaign goal: ${campaign.purpose}
        Keep it concise and personalized.`

        const response = await fetch('/api/research/company-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        })

        const data = await response.json()
        
        setMessages((prev) => ({
          ...prev,
          [exec.id]: data.message || `Hi ${exec.name},\n\n${campaign.purpose}\n\nBest regards`,
        }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate messages')
    } finally {
      setGenerating(false)
    }
  }

  const handleSend = async () => {
    setLoading(true)
    setError('')

    try {
      const messagesToInsert = executives.map((exec) => ({
        campaign_id: campaignId,
        executive_id: exec.id,
        executive_name: exec.name,
        executive_email: exec.email,
        message_content: messages[exec.id] || `Hi ${exec.name},\n\nLet's connect!`,
        channel: 'email',
        status: 'pending',
      }))

      const { error: insertError } = await supabase
        .from('campaign_messages')
        .insert(messagesToInsert)

      if (insertError) throw insertError

      await supabase
        .from('campaigns')
        .update({
          status: 'sent',
          sent_count: executives.length,
          total_recipients: executives.length,
        })
        .eq('id', campaignId)

      router.push(`/campaigns/${campaignId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send campaign')
    } finally {
      setLoading(false)
    }
  }

  if (loading && executives.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header title="Generate Messages" subtitle="Step 3: Create Outreach Messages" />
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <p className="text-gray-500">Loading executives...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header title="Generate Messages" subtitle="Step 3: Create Outreach Messages" />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-red-800 font-semibold">❌ {error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Messages for {executives.length} Executives</h3>
            <button
              onClick={generateMessages}
              disabled={generating}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-bold"
            >
              {generating ? '⏳ Generating...' : '✨ Generate with AI'}
            </button>
          </div>

          <div className="space-y-6 max-h-96 overflow-y-auto">
            {executives.map((exec) => (
              <div key={exec.id} className="border border-gray-200 rounded-lg p-6">
                <p className="font-bold text-gray-900 mb-2">{exec.name}</p>
                <p className="text-sm text-gray-600 mb-4">{exec.title} at {exec.company_name}</p>
                <textarea
                  value={messages[exec.id] || ''}
                  onChange={(e) =>
                    setMessages((prev) => ({
                      ...prev,
                      [exec.id]: e.target.value,
                    }))
                  }
                  placeholder="Enter message here..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-white"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSend}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-4 text-lg font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
          >
            {loading ? '⏳ Sending...' : '✉️ Send Campaign'}
          </button>
          <Link
            href="/campaigns"
            className="flex-1 border-2 border-gray-300 text-gray-900 py-4 text-lg font-bold rounded-lg hover:bg-gray-50 transition text-center"
          >
            Cancel
          </Link>
        </div>
      </main>
    </div>
  )
}
