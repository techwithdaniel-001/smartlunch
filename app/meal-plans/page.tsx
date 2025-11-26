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
import Image from 'next/image'
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
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            <Link href="/dashboard" className="flex items-center space-x-1.5 sm:space-x-2 transition-colors touch-manipulation flex-shrink-0">
              <ArrowLeft className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-black/70 hover:text-black'}`} />
              <span className={`font-medium text-xs sm:text-sm md:text-base transition-colors duration-300 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-black/70 hover:text-black'} hidden sm:inline`}>Back</span>
            </Link>
            <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 justify-center sm:justify-start">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex-shrink-0">
                <Image
                  src="/assets/smartlunchlogo.png"
                  alt="Smart Lunch Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="min-w-0 hidden sm:block">
                <h1 className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold transition-colors duration-300 ${isDark ? 'gradient-text' : 'text-black'} truncate`}>
                  Smart Lunch
                </h1>
              </div>
            </Link>
            <div className="w-12 sm:w-16"></div>
          </div>
        </div>
      </header>

      <div className="h-14 sm:h-16 md:h-20"></div>

      <MealPlans
        onRecipeClick={(recipe) => setSelectedRecipe(recipe)}
        userPreferences={userPreferences}
        initialMealPlanId={initialMealPlanId}
        onSaveRecipe={saveRecipe}
        onUnsaveRecipe={unsaveRecipe}
        isRecipeSaved={isRecipeSaved}
      />
    </div>
  )
}

