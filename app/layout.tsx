import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Smart Lunch - Personalized Recipe Ideas for Busy Families',
  description: 'Discover fun, easy, and healthy lunch recipes personalized to your ingredients. Make meals that kids love with step-by-step guidance.',
  icons: {
    icon: '/assets/smartlunchfavicon.png',
    apple: '/assets/smartlunchfavicon.png',
  },
  openGraph: {
    title: 'Smart Lunch - Personalized Recipe Ideas for Busy Families',
    description: 'Discover fun, easy, and healthy lunch recipes personalized to your ingredients. Make meals that kids love with step-by-step guidance.',
    images: [
      {
        url: '/assets/websiteimage.png',
        width: 1200,
        height: 630,
        alt: 'Smart Lunch - Recipe Ideas for Busy Families',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Lunch - Personalized Recipe Ideas for Busy Families',
    description: 'Discover fun, easy, and healthy lunch recipes personalized to your ingredients.',
    images: ['/assets/websiteimage.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

