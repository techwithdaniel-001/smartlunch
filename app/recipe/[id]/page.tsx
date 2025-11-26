'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import RecipeDetail from '@/components/RecipeDetail'
import { Recipe } from '@/data/recipes'
import { recipes } from '@/data/recipes'
import { 
  saveRecipeToFirestore, 
  removeRecipeFromFirestore, 
  getUserSavedRecipes,
  updateSavedRecipe,
  getUserPreferences
} from '@/lib/firestore'

export default function RecipePage() {
  const router = useRouter()
  const params = useParams()
  const recipeId = params?.id as string
  const { user, loading } = useAuth()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [userPreferences, setUserPreferences] = useState<any>(null)
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadSavedRecipes()
      loadUserPreferences()
    }
  }, [user])

  useEffect(() => {
    if (recipeId) {
      loadRecipe()
    }
  }, [recipeId, savedRecipes.length, user])

  const loadRecipe = () => {
    // Try to find in saved recipes first
    if (savedRecipes.length > 0) {
      const saved = savedRecipes.find(r => r.id === recipeId)
      if (saved) {
        setRecipe(saved)
        return
      }
    }

    // Try to find in default recipes
    const defaultRecipe = recipes.find(r => r.id === recipeId)
    if (defaultRecipe) {
      setRecipe(defaultRecipe)
      return
    }

    // Try to load from sessionStorage (for AI-generated recipes)
    if (typeof window !== 'undefined') {
      const storedRecipe = sessionStorage.getItem(`recipe-${recipeId}`)
      if (storedRecipe) {
        try {
          const parsedRecipe = JSON.parse(storedRecipe)
          console.log('Loaded recipe from sessionStorage:', parsedRecipe)
          console.log('Recipe imageUrl:', parsedRecipe.imageUrl)
          setRecipe(parsedRecipe)
          return
        } catch (error) {
          console.error('Error parsing stored recipe:', error)
        }
      }
    }

    // If not found and we have saved recipes loaded, redirect
    if (savedRecipes.length > 0 || !user) {
      router.push('/dashboard')
    }
  }

  const loadSavedRecipes = async () => {
    if (!user) {
      // If no user, try loading from default recipes
      if (recipeId && !recipe) {
        loadRecipe()
      }
      return
    }
    
    try {
      const loadedRecipes = await getUserSavedRecipes(user.uid)
      setSavedRecipes(loadedRecipes)
      
      // Check if current recipe is in saved recipes
      if (recipeId) {
        const saved = loadedRecipes.find(r => r.id === recipeId)
        if (saved && !recipe) {
          setRecipe(saved)
          return
        }
        // If not in saved recipes, try default recipes
        if (!recipe) {
          loadRecipe()
        }
      }
    } catch (error) {
      console.error('Error loading saved recipes:', error)
      // Still try to load from default recipes
      if (recipeId && !recipe) {
        loadRecipe()
      }
    }
  }

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

  const saveRecipe = async (recipe: Recipe) => {
    if (!user) {
      alert('Please log in to save recipes')
      throw new Error('User not logged in')
    }
    
    try {
      // Save to Firestore (Firestore has its own timeout handling)
      await saveRecipeToFirestore(user.uid, recipe)
      
      // Update state immediately after successful save
      setSavedRecipes((prev) => {
        if (prev.some(r => r.id === recipe.id)) return prev
        return [recipe, ...prev]
      })
    } catch (error: any) {
      console.error('Error saving recipe:', error)
      console.error('Error code:', error?.code)
      console.error('Error message:', error?.message)
      
      // Show user-friendly error message
      const errorMessage = error?.message || 'Failed to save recipe. Please try again.'
      alert(`Error: ${errorMessage}`)
      
      throw error // Re-throw to let the button handler know it failed
    }
  }

  const unsaveRecipe = async (recipeId: string) => {
    if (!user) {
      throw new Error('User not logged in')
    }
    
    try {
      // Remove from Firestore (Firestore has its own timeout handling)
      await removeRecipeFromFirestore(user.uid, recipeId)
      
      // Update state immediately after successful removal
      setSavedRecipes((prev) => prev.filter(r => r.id !== recipeId))
    } catch (error: any) {
      console.error('Error removing recipe:', error)
      console.error('Error code:', error?.code)
      console.error('Error message:', error?.message)
      
      // Show user-friendly error message
      const errorMessage = error?.message || 'Failed to remove recipe. Please try again.'
      alert(`Error: ${errorMessage}`)
      
      throw error // Re-throw to let the button handler know it failed
    }
  }

  const isRecipeSaved = (recipeId: string) => {
    return savedRecipes.some(r => r.id === recipeId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white transition-colors duration-300">
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
          <p className="text-slate-600 transition-colors duration-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white transition-colors duration-300">
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
          <p className="text-slate-600 transition-colors duration-300">Loading recipe...</p>
        </div>
      </div>
    )
  }

  return (
    <RecipeDetail
      recipe={recipe}
      onBack={() => router.push('/dashboard')}
      availableIngredients={selectedIngredients}
      onRecipeUpdated={async (updatedRecipe) => {
        // Update the recipe state immediately
        setRecipe(updatedRecipe)
        
        // Update sessionStorage if it's an AI-generated recipe
        if (typeof window !== 'undefined') {
          const storedRecipe = sessionStorage.getItem(`recipe-${updatedRecipe.id}`)
          if (storedRecipe) {
            sessionStorage.setItem(`recipe-${updatedRecipe.id}`, JSON.stringify(updatedRecipe))
            console.log('Updated recipe in sessionStorage:', updatedRecipe.id)
          }
        }
        
        // If the recipe is saved in Firestore, update it there too
        if (user && isRecipeSaved(updatedRecipe.id)) {
          try {
            await updateSavedRecipe(user.uid, updatedRecipe)
            setSavedRecipes((prev) =>
              prev.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r))
            )
            console.log('Updated saved recipe in Firestore:', updatedRecipe.id)
          } catch (error) {
            console.error('Error updating saved recipe:', error)
          }
        }
      }}
      showAIChat={false}
      setShowAIChat={() => {}}
      isSaved={isRecipeSaved(recipe?.id || '')}
      onSave={async () => {
        if (!recipe) return
        await saveRecipe(recipe)
        // Update saved state immediately without reloading all recipes
        // This is faster and more efficient
      }}
      onUnsave={async () => {
        if (!recipe) return
        await unsaveRecipe(recipe.id)
        // Update saved state immediately without reloading all recipes
        // This is faster and more efficient
      }}
      userPreferences={userPreferences}
    />
  )
}

