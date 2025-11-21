'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import Dashboard from '@/components/Dashboard'
import { Recipe } from '@/data/recipes'
import { 
  saveRecipeToFirestore, 
  removeRecipeFromFirestore, 
  getUserSavedRecipes,
  updateSavedRecipe,
  getUserPreferences
} from '@/lib/firestore'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [savedRecipesLoading, setSavedRecipesLoading] = useState(false)
  const [userPreferences, setUserPreferences] = useState<any>(null)
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const loadingRef = useRef(false) // Prevent concurrent loads

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && !loadingRef.current) {
      loadSavedRecipes()
      loadUserPreferences()
    }
  }, [user])

  const loadSavedRecipes = useCallback(async () => {
    if (!user || loadingRef.current) return
    
    loadingRef.current = true
    setSavedRecipesLoading(true)
    try {
      const recipes = await getUserSavedRecipes(user.uid)
      setSavedRecipes(recipes)
    } catch (error) {
      console.error('Error loading saved recipes:', error)
      // Don't show alert on initial load, just log
    } finally {
      setSavedRecipesLoading(false)
      loadingRef.current = false
    }
  }, [user])

  const loadUserPreferences = async () => {
    if (!user) return
    
    try {
      const prefs = await getUserPreferences(user.uid)
      if (prefs) {
        setUserPreferences(prefs)
      }
    } catch (error) {
      console.error('Error loading user preferences:', error)
    }
  }

  const saveRecipe = useCallback(async (recipe: Recipe) => {
    if (!user) return
    
    try {
      await saveRecipeToFirestore(user.uid, recipe)
      // Optimistically update UI immediately
      setSavedRecipes((prev) => {
        if (prev.some(r => r.id === recipe.id)) return prev
        return [recipe, ...prev] // Add to beginning for most recent first
      })
    } catch (error) {
      console.error('Error saving recipe:', error)
      alert('Failed to save recipe. Please try again.')
      // Reload on error to sync state
      loadSavedRecipes()
    }
  }, [user, loadSavedRecipes])

  const unsaveRecipe = useCallback(async (recipeId: string) => {
    if (!user) return
    
    try {
      await removeRecipeFromFirestore(user.uid, recipeId)
      // Optimistically update UI immediately
      setSavedRecipes((prev) => prev.filter(r => r.id !== recipeId))
    } catch (error) {
      console.error('Error removing recipe:', error)
      alert('Failed to remove recipe. Please try again.')
      // Reload on error to sync state
      loadSavedRecipes()
    }
  }, [user, loadSavedRecipes])

  const isRecipeSaved = (recipeId: string) => {
    return savedRecipes.some(r => r.id === recipeId)
  }

  const handleRecipeGenerated = (recipe: Recipe) => {
    // Store recipe in sessionStorage so it's available on the recipe page
    console.log('Storing recipe in sessionStorage:', recipe)
    console.log('Recipe imageUrl:', recipe.imageUrl)
    if (typeof window !== 'undefined') {
      const recipeToStore = {
        ...recipe,
        imageUrl: recipe.imageUrl, // Explicitly ensure imageUrl is included
      }
      sessionStorage.setItem(`recipe-${recipe.id}`, JSON.stringify(recipeToStore))
      // Verify it was stored
      const stored = sessionStorage.getItem(`recipe-${recipe.id}`)
      const parsed = stored ? JSON.parse(stored) : null
      console.log('Stored recipe imageUrl:', parsed?.imageUrl)
    }
    router.push(`/recipe/${recipe.id}`)
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
    <Dashboard
      onRecipeClick={(recipe) => router.push(`/recipe/${recipe.id}`)}
      onNewRecipe={() => {}}
      savedRecipes={savedRecipes}
      savedRecipesLoading={savedRecipesLoading}
      onSaveRecipe={saveRecipe}
      onUnsaveRecipe={unsaveRecipe}
      isRecipeSaved={isRecipeSaved}
      selectedIngredients={selectedIngredients}
      onIngredientsChange={setSelectedIngredients}
      userPreferences={userPreferences}
      onPreferencesUpdated={loadUserPreferences}
      onRecipeGenerated={handleRecipeGenerated}
    />
  )
}

