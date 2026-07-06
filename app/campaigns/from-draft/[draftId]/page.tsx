'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Header from '@/components/Header'

interface Draft {
  id: string
  campaign_name: string
  purpose: string
  channel: string
  selected_executive_ids: string[]
  messages: any[]
}

interface Executive {
  id: string
  name: string
  email: string
  title: string
}

// Generate a v4 UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export default function FromDraftPage() {
  const params = useParams()
  const router = useRouter()
  const draftId = params.draftId as string
  const [draft, setDraft] = useState<Draft | null>(null)
  const [executives, setExecutives] = useState<Executive[]>([])
  const [allExecutives, setAllExecutives] = useState<Executive[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [testMode, setTestMode] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadData()
  }, [draftId])

  const loadData = async () => {
    try {
      const { data: draftData, error: draftError } = await supabase
        .from('campaign_drafts')
        .select('*')
        .eq('id', draftId)
        .single()

      if (draftError) throw draftError
      setDraft(draftData)
      setSelectedIds(new Set(draftData.selected_executive_ids))

      const { data: execData } = await supabase
        .from('executives')
        .select('id, name, email, title')

      setAllExecutives(execData || [])

      const { data: selectedExecs } = await supabase
        .from('executives')
        .select('id, name, email, title')
        .in('id', draftData.selected_executive_ids)

      setExecutives(selectedExecs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load draft')
    } finally {
      setLoading(false)
    }
  }

  const toggleExecutive = (id: string) => {
    const newIds = new Set(selectedIds)
    if (newIds.has(id)) {
      newIds.delete(id)
    } else {
      newIds.add(id)
    }
    setSelectedIds(newIds)
    const updated = allExecutives.filter((e) => newIds.has(e.id))
    setExecutives(updated)
  }

  const handleSend = async () => {
    setSending(true)
    setError('')

    try {
      if (!testMode && selectedIds.size === 0) {
        throw new Error('Select at least one executive')
      }

      if (testMode && !testEmail.trim()) {
        throw new Error('Test email required')
      }

      console.log('Creating campaign...')
      
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert([{
          user_id: 'demo-user-001',
          name: draft?.campaign_name,
          channel: draft?.channel,
          purpose: draft?.purpose,
          status: 'sent',
          total_recipients: testMode ? 1 : selectedIds.size,
        }])
        .select()

      if (campaignError) {
        console.error('Campaign error:', campaignError)
        throw campaignError
      }

      const campaignId = campaign[0].id
      console.log('Campaign created:', campaignId)

      let messagesToAdd: any[] = []
      
      if (testMode) {
        console.log('Test mode - creating 1 message for:', testEmail)
        messagesToAdd = [{
          campaign_id: campaignId,
          executive_id: generateUUID(),
          executive_name: 'Test Recipient',
          executive_email: testEmail,
          message_content: draft?.messages[0]?.emailMessage || 'Test message',
          channel: draft?.channel || 'email',
          status: 'pending',
        }]
      } else {
        console.log('Regular mode - creating', selectedIds.size, 'messages')
        messagesToAdd = (draft?.messages || [])
          .filter((msg: any) => selectedIds.has(msg.executiveId))
          .map((msg: any) => ({
            campaign_id: campaignId,
            executive_id: msg.executiveId,
            executive_name: msg.executiveName,
            executive_email: msg.email,
            message_content: msg.emailMessage,
            channel: draft?.channel || 'email',
            status: 'pending',
          }))
      }

      console.log('Messages to insert:', messagesToAdd.length)

      const { data: insertedMessages, error: messagesError } = await supabase
        .from('campaign_messages')
        .insert(messagesToAdd)
        .select()

      if (messagesError) {
        console.error('Messages error details:', messagesError)
        throw messagesError
      }

      console.log('Messages inserted:', insertedMessages?.length)
      router.push(`/campaigns/${campaignId}`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : JSON.stringify(err)
      console.error('Full error:', errorMsg)
      setError(errorMsg)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-red-600">Draft not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header title={draft.campaign_name} subtitle="Ready to Send - Override Targets" />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-red-800 font-semibold">❌ Error: {error}</p>
            <p className="text-red-700 text-sm mt-2">Check F12 console for details</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-10 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Campaign Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm">Purpose</p>
                <p className="font-semibold text-gray-900">{draft.purpose}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Channel</p>
                <p className="font-semibold text-gray-900">📧 {draft.channel}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Messages</p>
                <p className="font-semibold text-gray-900">{draft.messages.length}</p>
              </div>
            </div>

            <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-5">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className="ml-3 text-purple-900 font-semibold">🧪 Test Mode</span>
              </label>
            </div>

            {testMode && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-900 mb-2">Test Email</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900"
                />
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-10 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Targets ({selectedIds.size})</h3>
            <p className="text-gray-600 text-sm mb-4">Select executives or keep draft selections</p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allExecutives.map((exec) => (
                <label
                  key={exec.id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(exec.id)}
                    onChange={() => toggleExecutive(exec.id)}
                    className="w-4 h-4 rounded"
                  />
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{exec.name}</p>
                    <p className="text-xs text-gray-600">{exec.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSend}
            disabled={sending || (!testMode && selectedIds.size === 0)}
            className="flex-1 bg-green-600 text-white py-4 font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            {sending ? '⏳ Sending...' : `✉️ Send to ${testMode ? '1' : selectedIds.size} Target(s)`}
          </button>
          <Link
            href="/campaigns"
            className="flex-1 border-2 border-gray-300 text-gray-900 py-4 font-bold rounded-lg hover:bg-gray-50 text-center"
          >
            Cancel
          </Link>
        </div>
      </main>
    </div>
  )
}
