import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Smart Lunch - Intelligent Recipe Ideas for Busy Families',
  description: 'Discover fun, easy, and healthy lunch recipes personalized to your ingredients. Make meals that kids love with step-by-step guidance.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

