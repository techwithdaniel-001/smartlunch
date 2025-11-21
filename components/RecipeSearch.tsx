'use client'

import { useState } from 'react'
import { Search, Sparkles, Loader2 } from 'lucide-react'
import { Recipe } from '@/data/recipes'

interface RecipeSearchProps {
  onRecipeGenerated: (recipe: Recipe) => void
  availableIngredients?: string[]
  userPreferences?: any
}

export default function RecipeSearch({ onRecipeGenerated, availableIngredients = [], userPreferences }: RecipeSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim() || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          availableIngredients,
          userPreferences: userPreferences,
        }),
      })

      const data = await response.json()

      if (data.error) {
        alert(data.error)
        return
      }

      if (data.recipe) {
        onRecipeGenerated(data.recipe)
        setSearchQuery('')
      }
    } catch (error) {
      console.error('Search error:', error)
      alert('Failed to generate recipe. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch()
    }
  }

  return (
    <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 border-slate-800/80">
      <div className="flex items-center space-x-2 mb-3 sm:mb-4">
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
        <h3 className="text-base sm:text-lg font-semibold text-slate-100">AI Recipe Search</h3>
      </div>
      
      <p className="text-slate-100 mb-3 sm:mb-4 text-xs sm:text-sm font-medium">
        Describe what you'd like to make, and AI will generate a custom recipe perfect for busy parents! 
        <span className="block mt-1 text-[10px] sm:text-xs text-slate-300">💡 Examples: "quick 15-minute pasta", "fun animal sandwiches", "healthy wraps for kids"</span>
      </p>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 sm:space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., 'quick 15-minute pasta for kids'..."
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-slate-800/60 border-2 border-slate-700/50 text-slate-100 placeholder-slate-500 focus:border-primary-500/50 focus:outline-none transition-colors backdrop-blur-sm text-sm sm:text-base"
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={!searchQuery.trim() || isLoading}
          className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Generate</span>
            </>
          )}
        </button>
      </div>

      {availableIngredients.length > 0 && (
        <p className="text-xs text-slate-200 mt-3 font-medium">
          💡 AI will consider your available ingredients: {availableIngredients.join(', ')}
        </p>
      )}
    </div>
  )
}

