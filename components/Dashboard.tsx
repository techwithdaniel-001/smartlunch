'use client'

import { useState, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence } from 'framer-motion'
import { BookmarkCheck, Plus, Search, Sparkles, X, MessageSquare, User, Send, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import RecipeCard from './RecipeCard'
import RecipeSearch from './RecipeSearch'
import RecipeLoading from './RecipeLoading'
import { Recipe } from '@/data/recipes'

interface DashboardProps {
  onRecipeClick: (recipe: Recipe) => void
  onNewRecipe: () => void
  savedRecipes: Recipe[]
  savedRecipesLoading: boolean
  onSaveRecipe: (recipe: Recipe) => void
  onUnsaveRecipe: (recipeId: string) => void
  isRecipeSaved: (recipeId: string) => boolean
  selectedIngredients: string[]
  onIngredientsChange: (ingredients: string[]) => void
  userPreferences?: any
  onPreferencesUpdated?: () => void
  onRecipeGenerated: (recipe: Recipe) => void
}

export default function Dashboard({
  onRecipeClick,
  onNewRecipe,
  savedRecipes,
  savedRecipesLoading,
  onSaveRecipe,
  onUnsaveRecipe,
  isRecipeSaved,
  selectedIngredients,
  onIngredientsChange,
  userPreferences,
  onPreferencesUpdated,
  onRecipeGenerated
}: DashboardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [showRecipeSearch, setShowRecipeSearch] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  
  const getUserName = useMemo(() => {
    if (!user) return 'there'
    if (user.displayName) return user.displayName.split(' ')[0]
    if (user.email) return user.email.split('@')[0]
    return 'there'
  }, [user])

  const handleAiSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!aiInput.trim() || isAiLoading) return

    const query = aiInput.trim()
    setAiInput('')
    setIsAiLoading(true)

    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          availableIngredients: selectedIngredients,
          userPreferences: userPreferences,
        }),
      })

      const data = await response.json()

      if (data.error) {
        alert(data.error)
        return
      }

      if (data.recipe) {
        console.log('Recipe received from API:', data.recipe)
        console.log('Recipe imageUrl:', data.recipe.imageUrl)
        // Ensure imageUrl is preserved
        const recipeWithImage = {
          ...data.recipe,
          imageUrl: data.recipe.imageUrl,
        }
        onRecipeGenerated(recipeWithImage)
        onRecipeClick(recipeWithImage)
      }
    } catch (error) {
      console.error('Error generating recipe:', error)
      alert('Failed to generate recipe. Please try again.')
    } finally {
      setIsAiLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      {/* Header */}
      <header className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] sm:w-[90%] max-w-7xl floating-nav">
        <div className="glass-effect rounded-xl sm:rounded-2xl border border-slate-800/50 backdrop-blur-xl shadow-2xl hover:shadow-[0_8px_40px_rgba(16,185,129,0.15)] transition-shadow duration-300">
          <div className="px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                  <Image
                    src="/assets/smartlunchlogo.png"
                    alt="Smart Lunch Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold gradient-text truncate">
                    Smart Lunch
                  </h1>
                </div>
              </Link>
              <div className="flex items-center space-x-2">
                <Link
                  href="/saved"
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 bg-slate-800/60 border border-slate-700/50 text-slate-200 hover:border-primary-500/50 hover:bg-primary-500/10"
                >
                  <BookmarkCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Saved</span>
                  {savedRecipes.length > 0 && (
                    <span className="bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-1">
                      {savedRecipes.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/account"
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/30 text-primary-400 hover:border-primary-500/50 transition-all"
                  title="Profile & Settings"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for header */}
      <div className="h-20 sm:h-24"></div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Personalized Greeting & AI Input */}
        <div className="mb-8 sm:mb-12">
          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
              Hey {getUserName}! 👋
            </h2>
            <p className="text-slate-200 text-lg sm:text-xl font-medium">
              What would you like to make today?
            </p>
          </div>

          {/* AI Input Field - Enhanced Design */}
          <form onSubmit={handleAiSubmit} className="relative group">
            {/* Animated gradient border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 rounded-3xl opacity-20 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/10 via-primary-600/10 to-primary-500/10 rounded-3xl blur-2xl"></div>
            
            <div className="relative glass-effect rounded-3xl border border-primary-500/20 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              {/* Header with icon */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-500/30 rounded-xl blur-lg"></div>
                  <div className="relative bg-gradient-to-br from-primary-500/30 via-primary-600/30 to-primary-500/30 p-3 rounded-xl border border-primary-500/40">
                    <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-primary-300" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">AI Recipe Generator</h3>
                </div>
              </div>

              {/* Input field */}
              <div className="relative mb-4">
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAiSubmit()
                    }
                  }}
                  placeholder="Describe what you'd like to make... e.g., 'quick pasta for kids' or 'healthy wraps with chicken'"
                  className="w-full bg-slate-800/70 border-2 border-slate-700/50 rounded-2xl px-5 py-4 sm:py-5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/70 resize-none transition-all text-base sm:text-lg leading-relaxed"
                  rows={4}
                  disabled={isAiLoading}
                />
                {aiInput && (
                  <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                    {aiInput.length} characters
                  </div>
                )}
              </div>

              {/* Footer with button and hint */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pt-2 border-t border-slate-700/50">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-400">
                  <div className="flex items-center space-x-1">
                    <kbd className="px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-slate-300 font-mono text-xs">Enter</kbd>
                    <span className="text-slate-500">to send</span>
                  </div>
                  <span className="text-slate-600">•</span>
                  <div className="flex items-center space-x-1">
                    <kbd className="px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-slate-300 font-mono text-xs">Shift</kbd>
                    <span className="text-slate-500">+</span>
                    <kbd className="px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-slate-300 font-mono text-xs">Enter</kbd>
                    <span className="text-slate-500">for new line</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!aiInput.trim() || isAiLoading}
                  className="btn-primary flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Recipe...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Generate Recipe</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Saved Recipes Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              Saved Recipes ({savedRecipes.length})
            </h3>
          </div>

          {savedRecipesLoading ? (
            <div className="text-center py-12">
              <div className="inline-block mb-4">
                <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-200">Loading your saved recipes...</p>
            </div>
          ) : savedRecipes.length === 0 ? (
            <div className="text-center py-12 glass-effect rounded-2xl border-slate-800/80">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl"></div>
                <BookmarkCheck className="w-16 h-16 text-primary-400 relative z-10" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No saved recipes yet</h3>
              <p className="text-slate-200 mb-6">Save recipes by clicking the bookmark icon</p>
              <button
                onClick={() => setShowRecipeSearch(true)}
                className="btn-primary"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Create Your First Recipe
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {savedRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => onRecipeClick(recipe)}
                  availableIngredients={selectedIngredients}
                  isSaved={isRecipeSaved(recipe.id)}
                  onSave={() => onSaveRecipe(recipe)}
                  onUnsave={() => onUnsaveRecipe(recipe.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Recipe Loading Overlay */}
      <AnimatePresence>
        {isAiLoading && <RecipeLoading />}
      </AnimatePresence>
    </div>
  )
}

