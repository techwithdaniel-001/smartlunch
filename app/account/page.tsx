'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft } from 'lucide-react'
import ProfileSettings from '@/components/ProfileSettings'
import { getUserPreferences } from '@/lib/firestore'
import Link from 'next/link'

export default function AccountPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [showProfile, setShowProfile] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const loadUserPreferences = async () => {
    // Preferences will be loaded by ProfileSettings component
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 relative animate-pulse">
            <Image
              src="/assets/smartlunchlogo.png"
              alt="Smart Lunch Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] sm:w-[90%] max-w-7xl floating-nav">
        <div className="glass-effect rounded-xl sm:rounded-2xl border border-slate-800/50 backdrop-blur-xl shadow-2xl">
          <div className="px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-slate-400 hover:text-slate-200 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </Link>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold gradient-text">Account Settings</h1>
                <p className="text-[10px] sm:text-xs text-slate-300">{user.email}</p>
              </div>
              <div className="w-20"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="h-20 sm:h-24"></div>

      {/* Profile Settings */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileSettings 
          onClose={() => router.push('/dashboard')}
          onPreferencesUpdated={loadUserPreferences}
        />
      </div>
    </div>
  )
}

