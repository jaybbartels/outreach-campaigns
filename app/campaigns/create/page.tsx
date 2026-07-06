'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Header from '@/components/Header'

export default function CreateCampaignPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    channel: 'email',
    purpose: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.name.trim()) {
        throw new Error('Campaign name is required')
      }
      if (!formData.purpose.trim()) {
        throw new Error('Campaign purpose is required')
      }

      const { data, error: supabaseError } = await supabase
        .from('campaigns')
        .insert([{
          user_id: 'demo-user-001',
          name: formData.name,
          channel: formData.channel,
          purpose: formData.purpose,
          status: 'draft',
        }])
        .select()

      if (supabaseError) {
        throw new Error(`Database error: ${supabaseError.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error('Failed to create campaign')
      }

      // Redirect to select executives from OutreachIQ
      router.push(`/campaigns/${data[0].id}/select-executives`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create campaign'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header title="Create Campaign" subtitle="Step 1: Campaign Details" />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-lg p-10 border border-gray-200">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-red-800 font-semibold">❌ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">Campaign Name *</label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Healthcare Q3 Outreach"
                value={formData.name}
                onChange={handleChange}
                autoFocus
                className="w-full px-5 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-900 placeholder-gray-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">Channel *</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'email', label: '📧 Email' },
                  { value: 'linkedin', label: '💼 LinkedIn' },
                  { value: 'sms', label: '📱 SMS' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition text-center ${
                      formData.channel === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="channel"
                      value={option.value}
                      checked={formData.channel === option.value}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <p className="font-bold text-gray-900">{option.label}</p>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">Campaign Purpose *</label>
              <textarea
                name="purpose"
                placeholder="What is the goal of this campaign?"
                value={formData.purpose}
                onChange={handleChange}
                rows={5}
                className="w-full px-5 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-900 placeholder-gray-500 bg-white resize-none"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <p className="text-blue-900 text-sm">
                <span className="font-semibold">📋 Next:</span> You'll select executives from Outreach 1 MVP and use OutreachIQ to generate messages.
              </p>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-4 text-lg font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? '⏳ Creating...' : '✓ Create Campaign'}
              </button>
              <Link
                href="/campaigns"
                className="flex-1 border-2 border-gray-300 text-gray-900 py-4 text-lg font-bold rounded-lg hover:bg-gray-50 transition text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
