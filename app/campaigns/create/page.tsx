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
      // Create campaign
      const { data, error } = await supabase
        .from('campaigns')
        .insert([{
          user_id: 'demo-user-001', // Replace with actual user ID
          name: formData.name,
          channel: formData.channel,
          purpose: formData.purpose,
          status: 'draft',
        }])
        .select()

      if (error) throw error

      // Redirect to campaign detail
      router.push(`/campaigns/${data[0].id}`)
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/campaigns" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Campaigns
        </Link>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-2">Create New Campaign</h1>
          <p className="text-gray-600 mb-8">Set up a new outreach campaign to your selected executives</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Campaign Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Healthcare Q3 Outreach"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Channel</label>
              <select
                name="channel"
                value={formData.channel}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="email">📧 Email</option>
                <option value="linkedin">💼 LinkedIn</option>
                <option value="sms">📱 SMS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Campaign Purpose</label>
              <textarea
                name="purpose"
                placeholder="What is the goal of this campaign? e.g., Introduce partnership opportunity"
                value={formData.purpose}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </button>
              <Link
                href="/campaigns"
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-medium text-center"
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
