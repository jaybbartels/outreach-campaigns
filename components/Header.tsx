'use client'

import Link from 'next/link'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center border-b border-blue-700">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="text-2xl">🎯</div>
          <h1 className="text-2xl font-bold group-hover:text-blue-100 transition">OutreachCampaigns</h1>
        </Link>
        <div className="flex gap-8 items-center">
          <Link href="/campaigns" className="hover:text-blue-100 transition font-medium">
            Campaigns
          </Link>
          <a 
            href="https://outreach-iq-ruby.vercel.app" 
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-100 transition font-medium"
          >
            OutreachIQ →
          </a>
        </div>
      </nav>
      {title && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-4xl font-bold mb-2">{title}</h2>
          {subtitle && <p className="text-blue-100 text-lg">{subtitle}</p>}
        </div>
      )}
    </header>
  )
}
