'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import MealPlans from '@/components/MealPlans'
import RecipeDetail from '@/components/RecipeDetail'
import { Recipe } from '@/data/recipes'
import { getUserPreferences, getUserSavedRecipes, saveRecipeToFirestore, removeRecipeFromFirestore } from '@/lib/firestore'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function MealPlansPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [userPreferences, setUserPreferences] = useState<any>(null)
  const [initialMealPlanId, setInitialMealPlanId] = useState<string | null>(null)
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const loadPreferences = useCallback(async () => {
    if (!user) return
    try {
      const prefs = await getUserPreferences(user.uid)
      setUserPreferences(prefs)
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
  }, [user])

  const loadSavedRecipes = useCallback(async () => {
    if (!user) return
    try {
      const recipes = await getUserSavedRecipes(user.uid)
      setSavedRecipes(recipes)
    } catch (error) {
      console.error('Error loading saved recipes:', error)
    }
  }, [user])

  const saveRecipe = useCallback(async (recipe: Recipe) => {
    if (!user) return
    
    try {
      await saveRecipeToFirestore(user.uid, recipe)
      setSavedRecipes((prev) => {
        if (prev.some(r => r.id === recipe.id)) return prev
        return [recipe, ...prev]
      })
    } catch (error) {
      console.error('Error saving recipe:', error)
      alert('Failed to save recipe. Please try again.')
    }
  }, [user])

  const unsaveRecipe = useCallback(async (recipeId: string) => {
    if (!user) return
    
    try {
      await removeRecipeFromFirestore(user.uid, recipeId)
      setSavedRecipes((prev) => prev.filter(r => r.id !== recipeId))
    } catch (error) {
      console.error('Error removing recipe:', error)
      alert('Failed to remove recipe. Please try again.')
    }
  }, [user])

  const isRecipeSaved = useCallback((recipeId: string) => {
    return savedRecipes.some(r => r.id === recipeId)
  }, [savedRecipes])

  useEffect(() => {
    if (user) {
      loadPreferences()
      loadSavedRecipes()
    }
  }, [user, loadPreferences, loadSavedRecipes])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const mealPlanId = params.get('id')
      if (mealPlanId) {
        setInitialMealPlanId(mealPlanId)
        // Clear the query parameter
        router.replace('/meal-plans', { scroll: false })
      }
    }
  }, [router])

  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-white'}`}>
        <div className="text-center">
          <p className={`transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipe(null)}
        availableIngredients={[]}
        userPreferences={userPreferences}
      />
    )
  }

  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-white'}`}>
      {/* Navigation Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ${isDark ? 'bg-slate-950/95 backdrop-blur-xl border-slate-800/50' : 'bg-white/95 backdrop-blur-xl border-primary-200/50'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex items-center h-14 sm:h-16 md:h-20">
            <Link href="/dashboard" className="flex items-center space-x-1.5 sm:space-x-2 transition-colors touch-manipulation">
              <ArrowLeft className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-black/70 hover:text-black'}`} />
              <span className={`font-medium text-xs sm:text-sm md:text-base transition-colors duration-300 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-black/70 hover:text-black'} hidden sm:inline`}>Back</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="h-14 sm:h-16 md:h-20"></div>

      {/* Coming Soon Message */}
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] px-4">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-500/10 border-4 border-primary-500/20 mb-6">
              <span className="text-5xl">🍽️</span>
            </div>
            <h1 className={`text-4xl sm:text-5xl font-bold mb-4 transition-colors duration-300 ${isDark ? 'text-white' : 'text-primary-900'}`}>
              Meal Plans
            </h1>
            <h2 className={`text-2xl sm:text-3xl font-medium mb-6 transition-colors duration-300 ${isDark ? 'text-primary-300' : 'text-primary-600'}`}>
              Coming Soon
            </h2>
            <p className={`text-lg sm:text-xl leading-relaxed transition-colors duration-300 ${isDark ? 'text-primary-200' : 'text-primary-700'}`}>
              We're working hard to bring you personalized meal planning! This feature will help you plan your meals for the week or month ahead.
            </p>
            <p className={`mt-4 text-base transition-colors duration-300 ${isDark ? 'text-primary-300' : 'text-primary-600'}`}>
              If you'd like to see this feature sooner, let us know! We release features based on user requests.
            </p>
          </div>
          <Link
            href="/dashboard"
            className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-colors duration-300 ${
              isDark 
                ? 'bg-primary-500 hover:bg-primary-600 text-white' 
                : 'bg-primary-500 hover:bg-primary-600 text-white'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

