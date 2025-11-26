'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { BookmarkCheck, ArrowLeft, ChefHat, Plus } from 'lucide-react'
import RecipeCard from '@/components/RecipeCard'
import { Recipe } from '@/data/recipes'
import { 
  getUserSavedRecipes,
  removeRecipeFromFirestore
} from '@/lib/firestore'
import Link from 'next/link'

export default function SavedPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [savedRecipesLoading, setSavedRecipesLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadSavedRecipes()
    }
  }, [user])

  const loadSavedRecipes = async () => {
    if (!user) return
    
    setSavedRecipesLoading(true)
    try {
      const recipes = await getUserSavedRecipes(user.uid)
      setSavedRecipes(recipes)
    } catch (error) {
      console.error('Error loading saved recipes:', error)
    } finally {
      setSavedRecipesLoading(false)
    }
  }

  const unsaveRecipe = async (recipeId: string) => {
    if (!user) return
    
    try {
      await removeRecipeFromFirestore(user.uid, recipeId)
      setSavedRecipes((prev) => prev.filter(r => r.id !== recipeId))
    } catch (error) {
      console.error('Error removing recipe:', error)
      alert('Failed to remove recipe. Please try again.')
    }
  }

  const isRecipeSaved = (recipeId: string) => {
    return savedRecipes.some(r => r.id === recipeId)
  }

  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-white'}`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 relative animate-pulse">
            <div className={`w-16 h-16 rounded-full transition-colors duration-300 ${isDark ? 'bg-primary-500/20' : 'bg-primary-100'}`}></div>
          </div>
          <p className={`transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-white'}`}>
      {/* Navigation Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ${isDark ? 'bg-slate-950/95 backdrop-blur-xl border-slate-800/50' : 'bg-white/95 backdrop-blur-xl border-primary-200/50'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex items-center h-14 sm:h-16 md:h-20">
            <Link href="/dashboard" className="flex items-center space-x-1.5 sm:space-x-2 transition-colors">
              <ArrowLeft className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-black/70 hover:text-black'}`} />
              <span className={`font-medium text-xs sm:text-sm md:text-base transition-colors duration-300 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-black/70 hover:text-black'} hidden sm:inline`}>Back</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="h-14 sm:h-16 md:h-20"></div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-medium mb-1.5 sm:mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}>
              Saved Recipes
            </h1>
            <p className={`text-sm sm:text-base transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>
              {savedRecipes.length} {savedRecipes.length === 1 ? 'recipe' : 'recipes'} saved
            </p>
          </div>
          <Link
            href="/dashboard"
            className="btn-primary flex items-center justify-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base w-full sm:w-auto flex-shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Create Recipe</span>
          </Link>
        </div>

        {/* Recipes Grid */}
        {savedRecipesLoading ? (
          <div className="text-center py-12 sm:py-16">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
            <p className={`transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>Loading your saved recipes...</p>
          </div>
        ) : savedRecipes.length === 0 ? (
          <div className={`text-center py-12 sm:py-16 rounded-xl sm:rounded-2xl border transition-colors duration-300 ${isDark ? 'glass-effect border-slate-800/20' : 'bg-white border-primary-200/50'}`}>
            <div className="relative inline-block mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl"></div>
              <BookmarkCheck className={`w-12 h-12 sm:w-16 sm:h-16 relative z-10 transition-colors duration-300 ${isDark ? 'text-primary-400' : 'text-primary-500'}`} />
            </div>
            <h3 className={`text-lg sm:text-xl font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}>No saved recipes yet</h3>
            <p className={`text-sm sm:text-base mb-6 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>
              Save recipes by clicking the bookmark icon on any recipe
            </p>
            <Link href="/dashboard" className="btn-primary inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {savedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => router.push(`/recipe/${recipe.id}`)}
                availableIngredients={[]}
                isSaved={isRecipeSaved(recipe.id)}
                onUnsave={() => unsaveRecipe(recipe.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

