'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { BookmarkCheck, ArrowLeft, ChefHat } from 'lucide-react'
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
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 p-2 rounded-lg">
                  <BookmarkCheck className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold gradient-text">Saved Recipes</h1>
                  <p className="text-[10px] sm:text-xs text-slate-300">{savedRecipes.length} recipe{savedRecipes.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="w-20"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="h-20 sm:h-24"></div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {savedRecipesLoading ? (
          <div className="text-center py-12">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-400">Loading your saved recipes...</p>
          </div>
        ) : savedRecipes.length === 0 ? (
          <div className="text-center py-16 glass-effect rounded-2xl border-slate-800/80">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl"></div>
              <BookmarkCheck className="w-16 h-16 text-primary-400 relative z-10" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No saved recipes yet</h3>
            <p className="text-slate-400 mb-6">Save recipes by clicking the bookmark icon on any recipe</p>
            <Link href="/dashboard" className="btn-primary inline-flex items-center">
              <ChefHat className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
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

