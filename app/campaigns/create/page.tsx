'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function CreateCampaignPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([{
          user_id: 'demo-user-001',
          name: formData.name,
          channel: formData.channel,
          purpose: formData.purpose,
          status: 'draft',
        }])
        .select()

      if (error) throw error

      router.push(`/campaigns/${data[0].id}`)
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/campaigns" className="text-blue-600 hover:text-blue-700 font-semibold mb-8 inline-block text-lg">
          ← Back to Campaigns
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Create New Campaign</h1>
          <p className="text-lg text-gray-700 mb-12 pb-6 border-b border-gray-200">Set up a new outreach campaign to your selected executives</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">Campaign Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Healthcare Q3 Outreach"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">Channel</label>
              <select
                name="channel"
                value={formData.channel}
                onChange={handleChange}
                className="w-full px-5 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900"
              >
                <option value="email">📧 Email</option>
                <option value="linkedin">💼 LinkedIn</option>
                <option value="sms">📱 SMS</option>
              </select>
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">Campaign Purpose</label>
              <textarea
                name="purpose"
                placeholder="What is the goal of this campaign? e.g., Introduce partnership opportunity"
                value={formData.purpose}
                onChange={handleChange}
                rows={5}
                className="w-full px-5 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 placeholder-gray-400"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-4 text-lg font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Creating...' : '✓ Create Campaign'}
              </button>
              <Link
                href="/campaigns"
                className="flex-1 bg-gray-300 text-gray-900 py-4 text-lg font-bold rounded-lg hover:bg-gray-400 text-center transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
