'use client'

import { useState } from 'react'
import { ChefHat, BookmarkCheck, Plus, Search, Sparkles, X } from 'lucide-react'
import RecipeCard from './RecipeCard'
import RecipeSearch from './RecipeSearch'
import IngredientInput from './IngredientInput'
import ProfileSettings from './ProfileSettings'
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
  onPreferencesUpdated
}: DashboardProps) {
  const [showSavedRecipes, setShowSavedRecipes] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showRecipeSearch, setShowRecipeSearch] = useState(false)

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] sm:w-[90%] max-w-7xl floating-nav">
        <div className="glass-effect rounded-xl sm:rounded-2xl border border-slate-800/50 backdrop-blur-xl shadow-2xl hover:shadow-[0_8px_40px_rgba(16,185,129,0.15)] transition-shadow duration-300">
          <div className="px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-2 sm:p-2.5 rounded-lg sm:rounded-xl premium-glow flex-shrink-0">
                  <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold gradient-text truncate">
                    Smart Lunch
                  </h1>
                  <p className="text-[10px] sm:text-xs text-slate-300 hidden xs:block">Dashboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowRecipeSearch(!showRecipeSearch)}
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:border-primary-500/50 hover:bg-primary-500/10"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">New Recipe</span>
                </button>
                <button
                  onClick={() => setShowSavedRecipes(true)}
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:border-primary-500/50 hover:bg-primary-500/10"
                >
                  <BookmarkCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Saved</span>
                  {savedRecipes.length > 0 && (
                    <span className="bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-1">
                      {savedRecipes.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/30 text-primary-400 hover:border-primary-500/50 transition-all"
                  title="Profile & Settings"
                >
                  <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for header */}
      <div className="h-20 sm:h-24"></div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recipe Search Section */}
        {showRecipeSearch && (
          <div className="mb-8 w-full max-w-4xl mx-auto relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 via-primary-600/20 to-primary-500/20 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Create New Recipe</h2>
                <button
                  onClick={() => setShowRecipeSearch(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <RecipeSearch
                onRecipeGenerated={(recipe) => {
                  onRecipeClick(recipe)
                  setShowRecipeSearch(false)
                }}
                availableIngredients={selectedIngredients}
                userPreferences={userPreferences}
              />
            </div>
          </div>
        )}

        {/* Ingredient Input */}
        {!showRecipeSearch && (
          <div className="mb-8 w-full max-w-4xl mx-auto relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/10 via-primary-600/10 to-primary-500/10 rounded-2xl blur-xl opacity-30"></div>
            <div className="relative">
              <IngredientInput 
                selectedIngredients={selectedIngredients}
                onChange={onIngredientsChange}
              />
            </div>
          </div>
        )}

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
              <p className="text-slate-400">Loading your saved recipes...</p>
            </div>
          ) : savedRecipes.length === 0 ? (
            <div className="text-center py-12 glass-effect rounded-2xl border-slate-800/80">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl"></div>
                <BookmarkCheck className="w-16 h-16 text-primary-400 relative z-10" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No saved recipes yet</h3>
              <p className="text-slate-400 mb-6">Save recipes by clicking the bookmark icon</p>
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
                  isSaved={true}
                  onUnsave={() => onUnsaveRecipe(recipe.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Saved Recipes Modal */}
      {showSavedRecipes && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setShowSavedRecipes(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="glass-effect rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border-slate-800/80 shadow-2xl">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800/50">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 p-2 rounded-lg">
                    <BookmarkCheck className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Saved Recipes</h2>
                    <p className="text-sm text-slate-400">{savedRecipes.length} recipe{savedRecipes.length !== 1 ? 's' : ''} saved</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSavedRecipes(false)}
                  className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800/50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {savedRecipes.length === 0 ? (
                  <div className="text-center py-12">
                    <BookmarkCheck className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No saved recipes yet</h3>
                    <p className="text-slate-400">Save recipes by clicking the bookmark icon</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {savedRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onClick={() => {
                          onRecipeClick(recipe)
                          setShowSavedRecipes(false)
                        }}
                        availableIngredients={selectedIngredients}
                        isSaved={true}
                        onUnsave={() => onUnsaveRecipe(recipe.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Profile Settings Modal */}
      {showProfile && (
        <ProfileSettings 
          onClose={() => setShowProfile(false)}
          onPreferencesUpdated={onPreferencesUpdated}
        />
      )}
    </div>
  )
}

