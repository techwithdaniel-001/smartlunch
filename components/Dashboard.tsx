'use client'

import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { BookmarkCheck, Plus, Search, Sparkles, X, User, Send, Loader2, Calendar } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import RecipeCard from './RecipeCard'
import RecipeSearch from './RecipeSearch'
import RecipeLoading from './RecipeLoading'
import MealPlanLoading from './MealPlanLoading'
import { Recipe } from '@/data/recipes'
import { playRecipeCompleteSound } from '@/lib/sounds'

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
  onMealPlanCreated?: () => void
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
  onRecipeGenerated,
  onMealPlanCreated
}: DashboardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [showRecipeSearch, setShowRecipeSearch] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [mealPlanDuration, setMealPlanDuration] = useState<'day' | 'week' | 'month' | null>(null)
  const [creatingMealPlan, setCreatingMealPlan] = useState(false)
  const [isCreatingMealPlan, setIsCreatingMealPlan] = useState(false)
  const [showComingSoonModal, setShowComingSoonModal] = useState(false)
  
  // Check for meal plan query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const mealPlan = params.get('mealPlan')
      if (mealPlan && ['day', 'week', 'month'].includes(mealPlan)) {
        setMealPlanDuration(mealPlan as 'day' | 'week' | 'month')
        // Clear the query parameter
        router.replace('/dashboard', { scroll: false })
      }
    }
  }, [router])
  
  const getUserName = useMemo(() => {
    if (!user) return 'there'
    if (user.displayName) return user.displayName.split(' ')[0]
    if (user.email) return user.email.split('@')[0]
    return 'there'
  }, [user])

  const detectMealPlanRequest = (query: string): { isMealPlan: boolean; duration?: 'day' | 'week' | 'month' } => {
    const lowerQuery = query.toLowerCase()
    const mealPlanKeywords = ['meal plan', 'meal planning', 'plan meals', 'weekly meal', 'monthly meal', 'daily meal', 'meal prep']
    const isMealPlan = mealPlanKeywords.some(keyword => lowerQuery.includes(keyword))
    
    if (!isMealPlan) return { isMealPlan: false }
    
    // Detect duration
    if (lowerQuery.includes('month') || lowerQuery.includes('monthly')) {
      return { isMealPlan: true, duration: 'month' }
    } else if (lowerQuery.includes('week') || lowerQuery.includes('weekly')) {
      return { isMealPlan: true, duration: 'week' }
    } else if (lowerQuery.includes('day') || lowerQuery.includes('daily')) {
      return { isMealPlan: true, duration: 'day' }
    }
    
    return { isMealPlan: true, duration: 'week' }
  }

  const handleAiSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!aiInput.trim() || isAiLoading) return

    const query = aiInput.trim()
    const mealPlanCheck = detectMealPlanRequest(query)
    
    // If it's a meal plan request, show coming soon message
    if (mealPlanCheck.isMealPlan || mealPlanDuration) {
      setAiInput('')
      setMealPlanDuration(null)
      setShowComingSoonModal(true)
      return
    }

    // Otherwise, generate a recipe
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
        // Play success sound when recipe is generated
        playRecipeCompleteSound()
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
    <div className={`min-h-screen relative transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-white'}`}>
      {/* Header */}
      <header className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] sm:w-[90%] max-w-7xl floating-nav">
        <div className={`rounded-xl sm:rounded-2xl border backdrop-blur-xl transition-all duration-300 ${isDark ? 'glass-effect border-slate-800/20' : 'bg-white border-primary-200/50'}`}>
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
                  href="/meal-plans"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowComingSoonModal(true)
                  }}
                  className={`flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 border hover:border-primary-500/50 hover:bg-primary-500/10 ${isDark ? 'bg-slate-800/60 border-slate-700/50 text-slate-200' : 'bg-white border-primary-200 text-black'}`}
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Meal Plans</span>
                </Link>
                <Link
                  href="/saved"
                  className={`flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 border hover:border-primary-500/50 hover:bg-primary-500/10 ${isDark ? 'bg-slate-800/60 border-slate-700/50 text-slate-200' : 'bg-white border-primary-200 text-black'}`}
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
      <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Personalized Greeting & AI Input */}
        <div className="mb-8 sm:mb-12">
          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-medium mb-3 leading-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}>
              Hey {getUserName}! 👋
            </h2>
            <p className={`text-lg sm:text-xl font-medium transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-black/80'}`}>
              What would you like to make today?
            </p>
          </div>

          {/* AI Input Field - Enhanced Design */}
          <form onSubmit={handleAiSubmit} className="relative" id="ai-input">
            <div className={`relative rounded-2xl sm:rounded-3xl border p-4 sm:p-6 md:p-8 backdrop-blur-xl transition-colors duration-300 ${isDark ? 'glass-effect border-slate-800/20' : 'bg-white border-primary-200/50'}`}>
              {/* Meal Plan Duration Pill - Above textarea */}
              {mealPlanDuration && (
                <div className="mb-4 flex items-center justify-center">
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-primary-500/20 border border-primary-500/50 shadow-sm">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                      {mealPlanDuration.charAt(0).toUpperCase() + mealPlanDuration.slice(1)} Meal Plan (Coming Soon)
                    </span>
                    <button
                      onClick={() => setMealPlanDuration(null)}
                      className="ml-2 hover:bg-primary-500/30 rounded-full p-1 transition-colors"
                      type="button"
                    >
                      <X className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    </button>
                  </div>
                </div>
              )}
              {/* Input field */}
              <div className="relative">
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAiSubmit()
                    }
                  }}
                  placeholder={mealPlanDuration 
                    ? `Meal plans coming soon! Try: 'quick pasta for kids' or 'healthy wraps with chicken'`
                    : "Describe what you'd like to make... e.g., 'quick pasta for kids', 'healthy wraps with chicken'"
                  }
                  className={`w-full border-2 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 md:py-5 pb-20 sm:pb-24 md:pb-28 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/70 resize-none transition-all text-sm sm:text-base md:text-lg leading-relaxed ${isDark ? 'bg-slate-800/70 border-slate-700/50 text-white placeholder-slate-500' : 'bg-white border-primary-200 text-black placeholder-black/40'}`}
                  rows={3}
                  disabled={isAiLoading}
                />
                {/* Bottom section with shortcuts and button */}
                <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 left-3 sm:left-4 md:left-5 right-3 sm:right-4 md:right-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  {/* Keyboard shortcuts - hidden on very small screens */}
                  <div className={`hidden xs:flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-xs transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/50'}`}>
                    <div className="flex items-center space-x-1">
                      <kbd className={`px-1 sm:px-1.5 py-0.5 border rounded font-mono text-[10px] sm:text-xs transition-colors duration-300 ${isDark ? 'bg-slate-800/50 border-slate-700/50 text-slate-300' : 'bg-white border-primary-200 text-black'}`}>Enter</kbd>
                      <span className="hidden sm:inline">to send</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <div className="hidden sm:flex items-center space-x-1">
                      <kbd className={`px-1 sm:px-1.5 py-0.5 border rounded font-mono text-[10px] sm:text-xs transition-colors duration-300 ${isDark ? 'bg-slate-800/50 border-slate-700/50 text-slate-300' : 'bg-white border-primary-200 text-black'}`}>Shift</kbd>
                      <span>+</span>
                      <kbd className={`px-1 sm:px-1.5 py-0.5 border rounded font-mono text-[10px] sm:text-xs transition-colors duration-300 ${isDark ? 'bg-slate-800/50 border-slate-700/50 text-slate-300' : 'bg-white border-primary-200 text-black'}`}>Enter</kbd>
                      <span>for new line</span>
                    </div>
                  </div>
                  {/* Generate button - full width on mobile */}
                  <button
                    type="submit"
                    disabled={!aiInput.trim() || isAiLoading}
                    className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation"
                  >
                    {isAiLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span className="hidden sm:inline">Creating...</span>
                        <span className="sm:hidden">Creating...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Generate Recipe</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Saved Recipes Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BookmarkCheck className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-300 ${isDark ? 'text-primary-400' : 'text-primary-500'}`} />
            <h3 className={`text-xl sm:text-2xl md:text-3xl font-medium transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}>
              Saved Recipes ({savedRecipes.length})
            </h3>
          </div>

          {savedRecipesLoading ? (
            <div className="text-center py-12">
              <div className="inline-block mb-4">
                <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
              </div>
              <p className={`transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-black/80'}`}>Loading your saved recipes...</p>
            </div>
          ) : savedRecipes.length === 0 ? (
            <div className={`text-center py-12 rounded-2xl border transition-colors duration-300 ${isDark ? 'glass-effect border-slate-800/20' : 'bg-white border-primary-200/50'}`}>
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl"></div>
                <BookmarkCheck className="w-16 h-16 text-primary-400 relative z-10" />
              </div>
              <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}>No saved recipes yet</h3>
              <p className={`mb-6 transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-black/80'}`}>Save recipes by clicking the bookmark icon</p>
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
        {isAiLoading && !isCreatingMealPlan && <RecipeLoading />}
        {isCreatingMealPlan && <MealPlanLoading />}
      </AnimatePresence>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoonModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowComingSoonModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-2xl sm:rounded-3xl border border-primary-500/30 p-6 sm:p-8 max-w-md w-full shadow-2xl transition-colors duration-300 ${isDark ? 'glass-effect' : 'bg-white'}`}
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/20 border-4 border-primary-500/30 mb-4">
                  <Calendar className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-primary-900'}`}>
                  Meal Plans
                </h3>
                <h4 className={`text-xl font-medium mb-4 transition-colors duration-300 ${isDark ? 'text-primary-300' : 'text-primary-600'}`}>
                  Coming Soon!
                </h4>
              </div>

              <div className={`space-y-4 mb-6 transition-colors duration-300 ${isDark ? 'text-primary-200' : 'text-primary-700'}`}>
                <p className="text-base leading-relaxed">
                  We're working hard to bring you personalized meal planning! This feature will help you plan your meals for the week or month ahead.
                </p>
                <p className="text-sm">
                  If you'd like to see this feature sooner, let us know! We release features based on user requests.
                </p>
                <p className="text-sm font-medium">
                  For now, you can use our recipe search to find individual recipes! 🍽️
                </p>
              </div>

              <button
                onClick={() => setShowComingSoonModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

