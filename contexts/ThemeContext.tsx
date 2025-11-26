'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getUserPreferences, saveUserPreferences } from '@/lib/firestore'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => Promise<void>
  loading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [theme, setThemeState] = useState<Theme>('light')
  const [loading, setLoading] = useState(true)

  // Apply light theme immediately on mount to prevent flash
  useEffect(() => {
    applyTheme('light')
  }, [])

  // Load theme from user preferences or default to light
  useEffect(() => {
    const loadTheme = async () => {
      if (user) {
        try {
          const preferences = await getUserPreferences(user.uid)
          if (preferences?.theme) {
            setThemeState(preferences.theme)
            applyTheme(preferences.theme)
          } else {
            // Default to light for new users
            setThemeState('light')
            applyTheme('light')
          }
        } catch (error) {
          console.error('Error loading theme:', error)
          setThemeState('light')
          applyTheme('light')
        }
      } else {
        // Not logged in, use light mode
        setThemeState('light')
        applyTheme('light')
      }
      setLoading(false)
    }

    loadTheme()
  }, [user])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme)
    applyTheme(newTheme)

    // Save to user preferences if logged in
    if (user) {
      try {
        const preferences = await getUserPreferences(user.uid)
        await saveUserPreferences(user.uid, {
          ...preferences,
          theme: newTheme,
          dietaryRestrictions: preferences?.dietaryRestrictions || [],
          allergies: preferences?.allergies || [],
        } as any)
      } catch (error) {
        console.error('Error saving theme:', error)
      }
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

