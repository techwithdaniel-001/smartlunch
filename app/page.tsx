'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import LandingPage from '@/components/LandingPage'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // Show loading state
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
          <p className="text-black/70">Loading...</p>
        </div>
      </div>
    )
  }

  // Show landing page if not logged in
  if (!user) {
    return <LandingPage />
  }

  return null
}
