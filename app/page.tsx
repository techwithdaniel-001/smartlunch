'use client'

import { useState, useEffect } from 'react'
import { Search, ChefHat, Heart, Clock, Users, Sparkles, Star, MessageSquare, Bookmark, BookmarkCheck, Download, X, LogOut } from 'lucide-react'
import IngredientInput from '@/components/IngredientInput'
import RecipeCard from '@/components/RecipeCard'
import RecipeDetail from '@/components/RecipeDetail'
import RecipeSearch from '@/components/RecipeSearch'
import AIChat from '@/components/AIChat'
import Auth from '@/components/Auth'
import LandingChat from '@/components/LandingChat'
import Dashboard from '@/components/Dashboard'
import { useAuth } from '@/contexts/AuthContext'
import { recipes, Recipe } from '@/data/recipes'
import { 
  saveRecipeToFirestore, 
  removeRecipeFromFirestore, 
  getUserSavedRecipes,
  isRecipeSaved as checkRecipeSaved,
  updateSavedRecipe,
  getUserPreferences
} from '@/lib/firestore'

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(recipes)
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiGeneratedRecipes, setAiGeneratedRecipes] = useState<Recipe[]>([])
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [showSavedRecipes, setShowSavedRecipes] = useState(false)
  const [savedRecipesLoading, setSavedRecipesLoading] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [userPreferences, setUserPreferences] = useState<any>(null)

  // Load saved recipes and preferences from Firestore when user logs in
  useEffect(() => {
    if (user) {
      loadSavedRecipes()
      loadUserPreferences()
    } else {
      setSavedRecipes([])
      setUserPreferences(null)
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

  // Save recipe to Firestore
  const saveRecipe = async (recipe: Recipe) => {
    if (!user) return
    
    try {
      await saveRecipeToFirestore(user.uid, recipe)
      setSavedRecipes((prev) => {
        // Check if already exists to avoid duplicates
        if (prev.some(r => r.id === recipe.id)) return prev
        return [recipe, ...prev]
      })
    } catch (error) {
      console.error('Error saving recipe:', error)
      alert('Failed to save recipe. Please try again.')
    }
  }

  // Remove recipe from Firestore
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

  // Check if recipe is saved
  const isRecipeSaved = (recipeId: string) => {
    return savedRecipes.some(r => r.id === recipeId)
  }

  const handleIngredientsChange = (ingredients: string[]) => {
    setSelectedIngredients(ingredients)
    
    if (ingredients.length === 0) {
      setFilteredRecipes(recipes)
      return
    }

    // Filter recipes based on available ingredients
    const matching = recipes.filter(recipe => {
      const recipeIngredients = recipe.ingredients.map(i => i.name.toLowerCase())
      const userIngredients = ingredients.map(i => i.toLowerCase())
      
      // Count how many recipe ingredients the user has
      const matchCount = recipeIngredients.filter(ri => 
        userIngredients.some(ui => ri.includes(ui) || ui.includes(ri))
      ).length
      
      // Recipe matches if user has at least 50% of ingredients
      return matchCount >= Math.ceil(recipeIngredients.length * 0.5)
    })

    // Sort by match percentage
    const sorted = matching.sort((a, b) => {
      const aIngredients = a.ingredients.map(i => i.name.toLowerCase())
      const bIngredients = b.ingredients.map(i => i.name.toLowerCase())
      const userIngredients = ingredients.map(i => i.toLowerCase())
      
      const aMatch = aIngredients.filter(ri => 
        userIngredients.some(ui => ri.includes(ui) || ui.includes(ri))
      ).length / aIngredients.length
      
      const bMatch = bIngredients.filter(ri => 
        userIngredients.some(ui => ri.includes(ui) || ui.includes(ri))
      ).length / bIngredients.length
      
      return bMatch - aMatch
    })

    setFilteredRecipes(sorted.length > 0 ? sorted : recipes)
  }

  const handleRecipeGenerated = (recipe: Recipe) => {
    setAiGeneratedRecipes((prev) => {
      // Avoid duplicates
      if (prev.some(r => r.id === recipe.id)) return prev
      return [recipe, ...prev]
    })
    setSelectedRecipe(recipe)
    setShowAIChat(false)
    setShowDashboard(true) // Switch to dashboard after first recipe
  }

  const allRecipes = [...aiGeneratedRecipes, ...filteredRecipes]

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl mb-4 premium-glow animate-pulse">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth if not logged in
  if (!user) {
    return <Auth />
  }

  // Show landing chat if user hasn't generated a recipe yet
  if (!showDashboard && !selectedRecipe) {
    return <LandingChat onRecipeGenerated={handleRecipeGenerated} userPreferences={userPreferences} />
  }

  // Show dashboard or recipe detail
  if (showDashboard && !selectedRecipe) {
    return (
      <Dashboard
        onRecipeClick={(recipe) => setSelectedRecipe(recipe)}
        onNewRecipe={() => setShowDashboard(false)}
        savedRecipes={savedRecipes}
        savedRecipesLoading={savedRecipesLoading}
        onSaveRecipe={saveRecipe}
        onUnsaveRecipe={unsaveRecipe}
        isRecipeSaved={isRecipeSaved}
        selectedIngredients={selectedIngredients}
        onIngredientsChange={setSelectedIngredients}
        userPreferences={userPreferences}
        onPreferencesUpdated={loadUserPreferences}
      />
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Floating Header */}
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
                  <p className="text-[10px] sm:text-xs text-slate-300 hidden xs:block">
                    {user?.email ? `Welcome, ${user.email.split('@')[0]}!` : 'Intelligent recipes for busy families'}
                  </p>
                </div>
              </div>
              <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 text-sm text-slate-200 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-primary-400" />
                  <span className="font-medium">AI-Powered</span>
            </div>
              <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-primary-400" />
                  <span className="font-medium">Kid-Friendly</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
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
                  onClick={() => setShowAIChat(!showAIChat)}
                  className="btn-primary flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 flex-shrink-0"
                >
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">AI Assistant</span>
                </button>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:border-red-500/50 hover:bg-red-500/10"
                  title="Sign out"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for floating header */}
      <div className="h-20 sm:h-24"></div>

      {selectedRecipe ? (
        <RecipeDetail 
          recipe={selectedRecipe} 
          onBack={() => setSelectedRecipe(null)}
          availableIngredients={selectedIngredients}
          onRecipeUpdated={async (updatedRecipe) => {
            setSelectedRecipe(updatedRecipe)
            // Update in the list if it's an AI-generated recipe
            setAiGeneratedRecipes((prev) =>
              prev.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r))
            )
            // Update in saved recipes if it's saved (and sync to Firestore)
            if (user && isRecipeSaved(updatedRecipe.id)) {
              try {
                await updateSavedRecipe(user.uid, updatedRecipe)
                setSavedRecipes((prev) =>
                  prev.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r))
                )
              } catch (error) {
                console.error('Error updating saved recipe:', error)
              }
            }
          }}
          showAIChat={showAIChat}
          setShowAIChat={setShowAIChat}
          isSaved={isRecipeSaved(selectedRecipe.id)}
          onSave={() => saveRecipe(selectedRecipe)}
          onUnsave={() => unsaveRecipe(selectedRecipe.id)}
          userPreferences={userPreferences}
        />
      ) : (
        <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-all duration-300 flex flex-col items-center ${
          showAIChat ? 'mr-0 md:mr-96' : 'mr-0'
        }`}>
          {/* Hero Section - Premium Redesign */}
          <div className="relative w-full mb-12 sm:mb-16 md:mb-20 mt-4 sm:mt-8 overflow-hidden">
            {/* Animated Background Gradients */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-400/10 rounded-full blur-3xl"></div>
            </div>

            <div className="text-center flex flex-col items-center justify-center relative z-10">
              {/* Premium Badge */}
              <div className="mb-6 inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500/20 to-primary-600/20 border border-primary-500/30 px-4 py-2 rounded-full backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary-400" />
                <span className="text-sm font-semibold text-primary-300">AI-Powered Recipe Assistant</span>
              </div>

              <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 sm:mb-8 leading-tight max-w-5xl mx-auto px-4">
                <span className="text-white drop-shadow-lg">Smart Recipes for</span>
              <br />
                <span className="gradient-text drop-shadow-lg">Busy Parents</span>
            </h2>
              
              <p className="text-lg sm:text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 leading-relaxed px-4 font-light">
                Create fun, healthy lunches in minutes! Our AI-powered recipes come with step-by-step cooking mode, 
                timers, and ingredient checklists - making it easy for moms and dads to cook while managing everything else.
              </p>

              {/* Premium Feature Cards */}
              <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-6 px-4 w-full max-w-4xl">
                <div className="group glass-effect rounded-2xl p-4 sm:p-5 md:p-6 border border-primary-500/20 hover:border-primary-500/40 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_40px_rgba(16,185,129,0.2)]">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl">
                      <Clock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-400" />
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-white">15-30 min</span>
                    <span className="text-xs text-slate-400 text-center">Quick recipes</span>
                  </div>
                </div>
                <div className="group glass-effect rounded-2xl p-4 sm:p-5 md:p-6 border border-primary-500/20 hover:border-primary-500/40 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_40px_rgba(16,185,129,0.2)]">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl">
                      <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-400" />
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-white">Step-by-step</span>
                    <span className="text-xs text-slate-400 text-center">Cooking mode</span>
                  </div>
                </div>
                <div className="group glass-effect rounded-2xl p-4 sm:p-5 md:p-6 border border-primary-500/20 hover:border-primary-500/40 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_40px_rgba(16,185,129,0.2)]">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl">
                      <Star className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-400 fill-primary-400" />
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-white">Kid-approved</span>
                    <span className="text-xs text-slate-400 text-center">Family favorite</span>
                  </div>
                </div>
                <div className="group glass-effect rounded-2xl p-4 sm:p-5 md:p-6 border border-primary-500/20 hover:border-primary-500/40 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_40px_rgba(16,185,129,0.2)]">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl">
                      <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-400" />
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-white">AI Visuals</span>
                    <span className="text-xs text-slate-400 text-center">Real photos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Saved Recipes Modal */}
          {showSavedRecipes && (
            <>
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => setShowSavedRecipes(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="glass-effect rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border-slate-800/80 shadow-2xl">
                  {/* Header */}
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
                  
                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {savedRecipesLoading ? (
                      <div className="text-center py-12">
                        <div className="inline-block mb-4">
                          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-slate-400">Loading your saved recipes...</p>
                      </div>
                    ) : savedRecipes.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="relative inline-block mb-4">
                          <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl"></div>
                          <BookmarkCheck className="w-16 h-16 text-primary-400 relative z-10" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No saved recipes yet</h3>
                        <p className="text-slate-400 mb-6">Save your favorite recipes by clicking the bookmark icon on any recipe</p>
                        <button
                          onClick={() => setShowSavedRecipes(false)}
                          className="btn-secondary"
                        >
                          Browse Recipes
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        {savedRecipes.map((recipe) => (
                          <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onClick={() => {
                              setSelectedRecipe(recipe)
                              setShowSavedRecipes(false)
                            }}
                            availableIngredients={selectedIngredients}
                            isSaved={true}
                            onUnsave={() => unsaveRecipe(recipe.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* AI Chat Sidebar */}
          <div className={`fixed right-0 top-0 h-full z-40 transition-transform duration-300 ease-in-out ${
            showAIChat ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="h-full w-full sm:max-w-sm md:max-w-md bg-slate-900/95 backdrop-blur-xl border-l border-slate-800/50 shadow-2xl">
                <AIChat
                  onRecipeGenerated={handleRecipeGenerated}
                  currentRecipe={selectedRecipe}
                  availableIngredients={selectedIngredients}
                  onClose={() => setShowAIChat(false)}
                />
              </div>
            </div>
          {showAIChat && (
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
              onClick={() => setShowAIChat(false)}
            />
          )}

          {/* AI Recipe Search - Enhanced */}
          <div className="mb-8 w-full max-w-4xl mx-auto relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 via-primary-600/20 to-primary-500/20 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative">
            <RecipeSearch
              onRecipeGenerated={handleRecipeGenerated}
              availableIngredients={selectedIngredients}
            />
            </div>
          </div>

          {/* Ingredient Input - Enhanced */}
          <div className="mb-12 w-full max-w-4xl mx-auto relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/10 via-primary-600/10 to-primary-500/10 rounded-2xl blur-xl opacity-30"></div>
            <div className="relative">
            <IngredientInput 
              selectedIngredients={selectedIngredients}
              onChange={handleIngredientsChange}
            />
              <p className="text-sm text-slate-200 mt-3 text-center font-medium">
                💡 Optional: Add ingredients you have to find matching recipes, or let AI create something new from scratch!
            </p>
            </div>
          </div>

          {/* Recipe Grid Header - Enhanced */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between w-full max-w-7xl gap-3 sm:gap-0">
            <div className="flex items-center space-x-3">
              <div className="h-1 w-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              {aiGeneratedRecipes.length > 0 && '✨ '}
              {selectedIngredients.length > 0 
                ? `Found ${allRecipes.length} Recipe${allRecipes.length !== 1 ? 's' : ''}`
                : aiGeneratedRecipes.length > 0
                ? 'Your Recipes'
                : 'Popular Recipes'
              }
            </h3>
            </div>
            {(selectedIngredients.length > 0 || aiGeneratedRecipes.length > 0) && (
              <button
                onClick={() => {
                  setSelectedIngredients([])
                  setFilteredRecipes(recipes)
                  setAiGeneratedRecipes([])
                }}
                className="text-xs sm:text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-500/10"
              >
                Clear all
              </button>
            )}
          </div>

          {allRecipes.length === 0 ? (
            <div className="text-center py-16 w-full glass-effect rounded-2xl border-slate-800/80">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl"></div>
                <ChefHat className="w-16 h-16 text-primary-400 mx-auto relative z-10" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No recipes found</h3>
              <p className="text-slate-200 mb-6">Try searching with AI or adding ingredients</p>
              <button
                onClick={() => setShowAIChat(true)}
                className="btn-primary"
              >
                <MessageSquare className="w-5 h-5 inline mr-2" />
                Ask AI for Recipes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 w-full max-w-7xl mx-auto">
              {allRecipes.map((recipe, index) => (
                <div
                  key={recipe.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <RecipeCard
                  recipe={recipe}
                  onClick={() => setSelectedRecipe(recipe)}
                  availableIngredients={selectedIngredients}
                    isSaved={isRecipeSaved(recipe.id)}
                    onSave={() => saveRecipe(recipe)}
                    onUnsave={() => unsaveRecipe(recipe.id)}
                />
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-800/50 bg-slate-900/30 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p className="mb-2">Made with ❤️ for busy families</p>
          <p className="text-sm">Smart Lunch - Your intelligent recipe companion</p>
        </div>
      </footer>
    </div>
  )
}

