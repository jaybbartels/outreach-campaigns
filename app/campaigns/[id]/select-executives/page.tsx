'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Header from '@/components/Header'

interface Executive {
  id: string
  name: string
  title: string
  company_name: string
  email: string
}

export default function SelectExecutivesPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string
  const [executives, setExecutives] = useState<Executive[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadExecutives()
  }, [])

  const loadExecutives = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('executives')
        .select('id, name, title, company_name, email')
        .limit(50)

      if (fetchError) throw fetchError
      setExecutives(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load executives')
    } finally {
      setLoading(false)
    }
  }

  const toggleExecutive = (id: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelected(newSelected)
  }

  const handleNext = () => {
    if (selected.size === 0) {
      setError('Select at least one executive')
      return
    }
    localStorage.setItem(`campaign-${campaignId}-executives`, JSON.stringify(Array.from(selected)))
    router.push(`/campaigns/${campaignId}/generate-messages`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header title="Select Executives" subtitle="Step 2: Choose Your Targets" />
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <p className="text-gray-500">Loading executives from Outreach 1 MVP...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header title="Select Executives" subtitle="Step 2: Choose Targets from Outreach 1 MVP" />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-red-800 font-semibold">❌ {error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Executives ({executives.length})</h3>
            <span className="text-lg font-semibold text-blue-600">Selected: {selected.size}</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {executives.map((exec) => (
              <label
                key={exec.id}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={selected.has(exec.id)}
                  onChange={() => toggleExecutive(exec.id)}
                  className="w-5 h-5 rounded"
                />
                <div className="ml-4 flex-1">
                  <p className="font-semibold text-gray-900">{exec.name}</p>
                  <p className="text-sm text-gray-600">{exec.title} at {exec.company_name}</p>
                  <p className="text-xs text-gray-500">{exec.email}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleNext}
            className="flex-1 bg-blue-600 text-white py-4 text-lg font-bold rounded-lg hover:bg-blue-700 transition"
          >
            ✓ Next: Generate Messages ({selected.size})
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
