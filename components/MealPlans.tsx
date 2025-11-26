'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Users, Sparkles, X, Trash2, Edit3, ChevronLeft, ChevronRight, Loader2, Plus, MessageSquare, UtensilsCrossed, AlertTriangle, Bookmark, BookmarkCheck } from 'lucide-react'
import { MealPlan, MealPlanItem, MealPlanDuration } from '@/data/mealPlans'
import { Recipe } from '@/data/recipes'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { getUserMealPlans, saveMealPlanToFirestore, removeMealPlanFromFirestore, updateMealPlan } from '@/lib/firestore'
import { useRouter } from 'next/navigation'
import AIChat from './AIChat'
import Image from 'next/image'

interface MealPlansProps {
  onRecipeClick: (recipe: Recipe) => void
  userPreferences?: any
  initialMealPlanId?: string | null
  onSaveRecipe?: (recipe: Recipe) => void
  onUnsaveRecipe?: (recipeId: string) => void
  isRecipeSaved?: (recipeId: string) => boolean
}

export default function MealPlans({ onRecipeClick, userPreferences, initialMealPlanId, onSaveRecipe, onUnsaveRecipe, isRecipeSaved }: MealPlansProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { user } = useAuth()
  const router = useRouter()
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null)
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [duration, setDuration] = useState<MealPlanDuration>('week')
  const [showAIChat, setShowAIChat] = useState(false)
  const [editingItem, setEditingItem] = useState<MealPlanItem | null>(null)
  const [loadingRecipeId, setLoadingRecipeId] = useState<string | null>(null)
  const [showSaveWarning, setShowSaveWarning] = useState(false)

  useEffect(() => {
    if (user) {
      loadMealPlans()
    }
  }, [user])

  useEffect(() => {
    // Check for temporary meal plan from sessionStorage after loading completes
    if (!loading && typeof window !== 'undefined') {
      const tempMealPlanId = sessionStorage.getItem('tempMealPlanId')
      const saveFailed = sessionStorage.getItem('mealPlanSaveFailed')
      
      if (tempMealPlanId && !selectedPlan) {
        const tempMealPlanStr = sessionStorage.getItem(`mealPlan-${tempMealPlanId}`)
        if (tempMealPlanStr) {
          try {
            const tempMealPlan = JSON.parse(tempMealPlanStr)
            // Add to meal plans list temporarily
            setMealPlans(prev => {
              if (!prev.find(p => p.id === tempMealPlan.id)) {
                return [tempMealPlan, ...prev]
              }
              return prev
            })
            setSelectedPlan(tempMealPlan)
            if (saveFailed === 'true') {
              setShowSaveWarning(true)
              // Clear the flag
              sessionStorage.removeItem('mealPlanSaveFailed')
            }
            return
          } catch (error) {
            console.error('Error parsing temp meal plan:', error)
          }
        }
      }
      
      // If we have an initialMealPlanId and meal plans are loaded, select it
      if (initialMealPlanId && mealPlans.length > 0 && !selectedPlan) {
        const plan = mealPlans.find(p => p.id === initialMealPlanId)
        if (plan) {
          setSelectedPlan(plan)
        }
      }
    }
  }, [loading, initialMealPlanId, mealPlans, selectedPlan])

  const loadMealPlans = async () => {
    if (!user) return
    setLoading(true)
    try {
      const plans = await getUserMealPlans(user.uid)
      setMealPlans(plans)
      // Auto-select plan if initialMealPlanId is provided, otherwise select first
      if (plans.length > 0) {
        if (initialMealPlanId) {
          const plan = plans.find(p => p.id === initialMealPlanId)
          if (plan) {
            setSelectedPlan(plan)
          } else if (!selectedPlan) {
            setSelectedPlan(plans[0])
          }
        } else if (!selectedPlan) {
          setSelectedPlan(plans[0])
        }
      }
    } catch (error) {
      console.error('Error loading meal plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMealPlan = async () => {
    if (!user) return
    setCreating(true)
    try {
      const response = await fetch('/api/ai-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration,
          userPreferences,
        }),
      })

      const data = await response.json()
      if (data.error) {
        alert(data.error)
        return
      }

      if (data.mealPlan) {
        const mealPlan = {
          ...data.mealPlan,
          userId: user.uid,
        }
        await saveMealPlanToFirestore(user.uid, mealPlan)
        await loadMealPlans()
        setSelectedPlan(mealPlan)
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Error creating meal plan:', error)
      alert('Failed to create meal plan. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteMealPlan = async (planId: string) => {
    if (!user || !confirm('Are you sure you want to delete this meal plan?')) return
    try {
      await removeMealPlanFromFirestore(user.uid, planId)
      await loadMealPlans()
      if (selectedPlan?.id === planId) {
        setSelectedPlan(mealPlans.find(p => p.id !== planId) || null)
      }
    } catch (error) {
      console.error('Error deleting meal plan:', error)
      alert('Failed to delete meal plan.')
    }
  }

  const handleRemoveItem = async (item: MealPlanItem) => {
    if (!selectedPlan || !user) return
    const updatedItems = selectedPlan.items.filter(
      i => !(i.date === item.date && i.mealType === item.mealType)
    )
    try {
      await updateMealPlan(user.uid, selectedPlan.id, { items: updatedItems })
      setSelectedPlan({ ...selectedPlan, items: updatedItems })
      await loadMealPlans()
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const getWeeks = (plan: MealPlan) => {
    const weeks: MealPlanItem[][] = []
    const itemsByDate = plan.items.reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = []
      acc[item.date].push(item)
      return acc
    }, {} as Record<string, MealPlanItem[]>)

    const dates = Object.keys(itemsByDate).sort()
    for (let i = 0; i < dates.length; i += 7) {
      const weekItems: MealPlanItem[] = []
      dates.slice(i, i + 7).forEach(date => {
        weekItems.push(...itemsByDate[date])
      })
      if (weekItems.length > 0) weeks.push(weekItems)
    }
    return weeks
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'lunch': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'dinner': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-medium mb-1.5 sm:mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}>
              Meal Plans
            </h1>
            <p className={`text-sm sm:text-base transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>
              Plan your meals ahead with AI-powered meal planning
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard?mealPlan=week')}
            className="btn-primary flex items-center justify-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base w-full sm:w-auto flex-shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Create Meal Plan</span>
          </button>
        </div>

        {/* Meal Plans List */}
        {mealPlans.length === 0 ? (
          <div className={`text-center py-12 sm:py-16 rounded-xl sm:rounded-2xl border transition-colors duration-300 ${isDark ? 'border-slate-800/20' : 'bg-white border-primary-200/50'}`}>
            <Calendar className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 transition-colors duration-300 ${isDark ? 'text-slate-600' : 'text-primary-400'}`} />
            <h3 className={`text-lg sm:text-xl font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}>
              No meal plans yet
            </h3>
            <p className={`text-sm sm:text-base mb-6 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>
              Create your first meal plan to get started
            </p>
            <button
              onClick={() => router.push('/dashboard?mealPlan=week')}
              className="btn-primary px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
            >
              Create Meal Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8">
            {mealPlans.map(plan => (
              <motion.div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedPlan?.id === plan.id
                    ? 'border-primary-500 bg-primary-500/10 shadow-md'
                    : isDark
                    ? 'border-slate-800/20 hover:border-slate-700/50 bg-slate-900/40'
                    : 'border-primary-200 bg-white hover:border-primary-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <h3 className={`font-medium text-base sm:text-lg transition-colors duration-300 flex-1 min-w-0 pr-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    {plan.name}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteMealPlan(plan.id)
                    }}
                    className={`flex-shrink-0 p-1.5 rounded-lg transition-colors duration-300 ${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-black/40 hover:text-red-500 hover:bg-red-50'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className={`text-sm mb-2 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/70'}`}>
                  {plan.duration.charAt(0).toUpperCase() + plan.duration.slice(1)} • {plan.items.length} meals
                </p>
                <p className={`text-xs transition-colors duration-300 ${isDark ? 'text-slate-500' : 'text-black/50'}`}>
                  {new Date(plan.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(plan.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Selected Meal Plan View with Sidebar Layout */}
        {selectedPlan && (
          <div className="flex gap-4 sm:gap-6 lg:gap-8">
            {/* Main Meal Plan Content */}
            <div className="flex-1 min-w-0 space-y-4 sm:space-y-6">
            {/* Save Warning Banner */}
            {showSaveWarning && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`rounded-xl border p-4 sm:p-5 transition-colors duration-300 ${
                    isDark ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 transition-colors duration-300 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                    <div className="flex-1">
                      <h4 className={`font-medium mb-1 transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}>
                        Meal Plan Not Saved
                      </h4>
                      <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-black/70'}`}>
                        This meal plan couldn't be saved to your account, but you can still view and use it. It will be available until you refresh the page. You can try saving it again using the "Modify with AI" button.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSaveWarning(false)}
                      className={`flex-shrink-0 p-1 rounded transition-colors ${
                        isDark ? 'text-slate-400 hover:text-slate-200' : 'text-black/40 hover:text-black'
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
            
            {/* Meal Plan Header */}
            <div className={`rounded-xl sm:rounded-2xl border p-4 sm:p-5 md:p-6 transition-colors duration-300 ${isDark ? 'border-slate-800/20 bg-slate-900/40' : 'border-primary-200 bg-white'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="min-w-0 flex-1">
                  <h2 className={`text-xl sm:text-2xl md:text-3xl font-medium mb-1.5 sm:mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}>
                    {selectedPlan.name}
                  </h2>
                  <p className={`text-sm sm:text-base transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>
                    {new Date(selectedPlan.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} to {new Date(selectedPlan.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => setShowAIChat(true)}
                  className="lg:hidden btn-primary flex items-center justify-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base w-full sm:w-auto flex-shrink-0"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Modify with AI</span>
                </button>
              </div>

              {/* Week Overview - Show 3 sample recipes with images */}
              {selectedPlan.duration === 'week' && selectedPlan.items.length > 0 && (
                <div className="mb-6">
                  <h3 className={`text-lg sm:text-xl font-medium mb-4 transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}>
                    Your Week at a Glance
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    {selectedPlan.items.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className={`rounded-xl border overflow-hidden transition-colors duration-300 ${
                          isDark ? 'border-slate-800/20 bg-slate-900/40' : 'border-primary-200 bg-white'
                        }`}
                      >
                        <div className="relative aspect-video bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                          {item.recipe.imageUrl ? (
                            <Image
                              src={item.recipe.imageUrl}
                              alt={item.recipe.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl">
                              {item.recipe.emoji}
                            </div>
                          )}
                          {/* Save Button for Preview Cards */}
                          {(onSaveRecipe || onUnsaveRecipe) && isRecipeSaved && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation()
                                if (!isRecipeSaved) return
                                const saved = isRecipeSaved(item.recipe.id)
                                if (saved && onUnsaveRecipe) {
                                  await onUnsaveRecipe(item.recipe.id)
                                } else if (!saved && onSaveRecipe) {
                                  await onSaveRecipe(item.recipe)
                                }
                              }}
                              className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-all z-10 hover:scale-110 ${
                                isRecipeSaved && isRecipeSaved(item.recipe.id)
                                  ? isDark
                                    ? 'bg-primary-500/90 text-white'
                                    : 'bg-primary-500 text-white'
                                  : isDark
                                  ? 'bg-slate-900/80 text-slate-400 hover:text-primary-400 hover:bg-slate-800/80'
                                  : 'bg-white/90 text-black/40 hover:text-primary-500 hover:bg-white'
                              }`}
                              title={isRecipeSaved && isRecipeSaved(item.recipe.id) ? 'Remove from saved' : 'Save recipe'}
                            >
                              {isRecipeSaved && isRecipeSaved(item.recipe.id) ? (
                                <BookmarkCheck className="w-3.5 h-3.5" />
                              ) : (
                                <Bookmark className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                        <div className="p-3 sm:p-4">
                          <div className={`text-xs px-2 py-1 rounded-full inline-block mb-2 ${getMealTypeColor(item.mealType)}`}>
                            {item.mealType}
                          </div>
                          <h4 className={`font-medium text-sm sm:text-base mb-1 transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}>
                            {item.recipe.name}
                          </h4>
                          <p className={`text-xs transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>
                            {formatDate(item.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-black/80'}`}>
                    This week features {selectedPlan.items.length} delicious meals planned for you. Each meal is carefully selected to match your preferences and dietary needs. Click on any meal below to see full cooking instructions and start preparing!
                  </p>
                </div>
              )}

              {/* Call to Action */}
              <div className={`p-4 sm:p-5 rounded-xl border transition-colors duration-300 ${
                isDark ? 'bg-primary-500/10 border-primary-500/30' : 'bg-primary-50 border-primary-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <UtensilsCrossed className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 transition-colors duration-300 ${isDark ? 'text-primary-400' : 'text-primary-500'}`} />
                  <div>
                    <h4 className={`font-medium mb-1 transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}>
                      Ready to Start Cooking?
                    </h4>
                    <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-black/70'}`}>
                      Click on any meal below to view the full recipe with step-by-step cooking instructions. You can also use AI to modify any meal in your plan!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Week Navigation */}
            {selectedPlan.duration === 'month' && (
              <div className={`rounded-xl sm:rounded-2xl border p-4 sm:p-5 md:p-6 transition-colors duration-300 ${isDark ? 'border-slate-800/20 bg-slate-900/40' : 'border-primary-200 bg-white'}`}>
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
                    className={`p-2 rounded-lg border transition-colors duration-300 ${
                      isDark ? 'border-slate-700/50 hover:bg-primary-500/10' : 'border-primary-200 hover:bg-primary-50'
                    }`}
                  >
                    <ChevronLeft className={`w-5 h-5 transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-black'}`} />
                  </button>
                  <span className={`font-medium text-base sm:text-lg transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}>
                    Week {selectedWeek + 1}
                  </span>
                  <button
                    onClick={() => {
                      const weeks = getWeeks(selectedPlan)
                      setSelectedWeek(Math.min(weeks.length - 1, selectedWeek + 1))
                    }}
                    className={`p-2 rounded-lg border transition-colors duration-300 ${
                      isDark ? 'border-slate-700/50 hover:bg-primary-500/10' : 'border-primary-200 hover:bg-primary-50'
                    }`}
                  >
                    <ChevronRight className={`w-5 h-5 transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-black'}`} />
                  </button>
                </div>
              </div>
            )}

            {/* Meal Plan Calendar Grid */}
            <div className={`rounded-xl sm:rounded-2xl border p-4 sm:p-5 md:p-6 transition-colors duration-300 ${isDark ? 'border-slate-800/20 bg-slate-900/40' : 'border-primary-200 bg-white'}`}>
              <h3 className={`text-lg sm:text-xl font-medium mb-4 sm:mb-6 transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}>
                {selectedPlan.duration === 'week' ? 'Your Week' : selectedPlan.duration === 'month' ? `Week ${selectedWeek + 1} Meals` : 'Your Day'}
              </h3>
            <div className="grid gap-4 sm:gap-5">
              {(() => {
                const weeks = getWeeks(selectedPlan)
                const itemsToShow = selectedPlan.duration === 'month' 
                  ? (weeks[selectedWeek] || [])
                  : selectedPlan.items

                const itemsByDate = itemsToShow.reduce((acc, item) => {
                  if (!acc[item.date]) acc[item.date] = []
                  acc[item.date].push(item)
                  return acc
                }, {} as Record<string, MealPlanItem[]>)

                return Object.entries(itemsByDate)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([date, items]) => (
                    <div key={date} className={`p-4 sm:p-5 rounded-xl border transition-colors duration-300 ${isDark ? 'border-slate-800/20 bg-slate-900/40' : 'border-primary-200 bg-white'}`}>
                      <h3 className={`font-medium mb-3 sm:mb-4 text-base sm:text-lg transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}>
                        {formatDate(date)}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {items.map((item, idx) => {
                          const isLightweight = (item.recipe as any)?._isLightweight || 
                                                !item.recipe.ingredients || 
                                                item.recipe.ingredients.length === 0
                          const isLoading = loadingRecipeId === item.recipe.id
                          
                          return (
                          <motion.div
                            key={`${item.date}-${item.mealType}-${idx}`}
                            onClick={async (e) => {
                              e.stopPropagation()
                              // If recipe is lightweight, generate full details first
                              if (isLightweight) {
                                setLoadingRecipeId(item.recipe.id)
                                // Navigate immediately with lightweight recipe, generate details in background
                                onRecipeClick(item.recipe)
                                
                                // Generate full details in background and update meal plan
                                fetch('/api/ai-meal-plan-detail', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    recipe: item.recipe,
                                    userPreferences,
                                  }),
                                })
                                  .then(response => response.json())
                                  .then(data => {
                                    if (data.recipe && selectedPlan && user) {
                                      // Remove _isLightweight flag if present
                                      const fullRecipe = { ...data.recipe }
                                      if ('_isLightweight' in fullRecipe) {
                                        delete (fullRecipe as any)._isLightweight
                                      }
                                      
                                      // Update the meal plan item with full recipe (in background)
                                      const updatedItems = selectedPlan.items.map(planItem => 
                                        planItem.date === item.date && planItem.mealType === item.mealType
                                          ? { ...planItem, recipe: fullRecipe }
                                          : planItem
                                      )
                                      updateMealPlan(user.uid, selectedPlan.id, { items: updatedItems }).catch(console.error)
                                      setSelectedPlan({ ...selectedPlan, items: updatedItems })
                                      loadMealPlans().catch(console.error)
                                    }
                                  })
                                  .catch(error => {
                                    console.error('Error loading recipe detail:', error)
                                    // Don't show alert, just log - user already navigated
                                  })
                                  .finally(() => {
                                    setLoadingRecipeId(null)
                                  })
                              } else {
                                // Recipe already has full details, just navigate
                                onRecipeClick(item.recipe)
                              }
                            }}
                            className={`rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg relative overflow-hidden group ${
                              isDark ? 'border-slate-700/50 hover:border-primary-500/50 bg-slate-800/40' : 'border-primary-200 hover:border-primary-500/50 bg-white'
                            } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            {/* Recipe Image */}
                            <div className="relative aspect-video bg-gradient-to-br from-primary-500/20 to-primary-600/20 overflow-hidden">
                              {item.recipe.imageUrl ? (
                                <Image
                                  src={item.recipe.imageUrl}
                                  alt={item.recipe.name}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl">
                                  {item.recipe.emoji}
                                </div>
                              )}
                              <div className="absolute top-2 left-2">
                                <span className={`text-xs px-2 py-1 rounded-full border backdrop-blur-sm ${getMealTypeColor(item.mealType)}`}>
                                  {item.mealType}
                                </span>
                              </div>
                              <div className="absolute top-2 right-2 flex items-center space-x-1.5 z-10">
                                {/* Save/Unsave Button */}
                                {(onSaveRecipe || onUnsaveRecipe) && isRecipeSaved && (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation()
                                      if (!isRecipeSaved) return
                                      const saved = isRecipeSaved(item.recipe.id)
                                      if (saved && onUnsaveRecipe) {
                                        await onUnsaveRecipe(item.recipe.id)
                                      } else if (!saved && onSaveRecipe) {
                                        await onSaveRecipe(item.recipe)
                                      }
                                    }}
                                    className={`p-1.5 rounded-full backdrop-blur-sm transition-all z-10 hover:scale-110 ${
                                      isRecipeSaved && isRecipeSaved(item.recipe.id)
                                        ? isDark
                                          ? 'bg-primary-500/90 text-white'
                                          : 'bg-primary-500 text-white'
                                        : isDark
                                        ? 'bg-slate-900/80 text-slate-400 hover:text-primary-400 hover:bg-slate-800/80'
                                        : 'bg-white/90 text-black/40 hover:text-primary-500 hover:bg-white'
                                    }`}
                                    title={isRecipeSaved && isRecipeSaved(item.recipe.id) ? 'Remove from saved' : 'Save recipe'}
                                  >
                                    {isRecipeSaved && isRecipeSaved(item.recipe.id) ? (
                                      <BookmarkCheck className="w-3.5 h-3.5" />
                                    ) : (
                                      <Bookmark className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}
                                {/* Remove from Meal Plan Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveItem(item)
                                  }}
                                  className={`p-1.5 rounded-full backdrop-blur-sm transition-colors z-10 hover:scale-110 ${
                                    isDark ? 'bg-slate-900/80 text-slate-400 hover:text-red-500 hover:bg-slate-800/80' : 'bg-white/90 text-black/40 hover:text-red-500 hover:bg-white'
                                  }`}
                                  title="Remove from meal plan"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {isLightweight && !isLoading && (
                                <div className="absolute bottom-2 right-2 bg-primary-500/90 backdrop-blur-sm rounded-full p-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="p-3 sm:p-4">
                              <h4 className={`font-medium mb-2 text-base sm:text-lg transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}>
                                {item.recipe.name}
                              </h4>
                              <div className={`flex items-center space-x-3 text-xs sm:text-sm transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{item.recipe.time}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Users className="w-3.5 h-3.5" />
                                  <span>{item.recipe.servings}</span>
                                </span>
                              </div>
                            </div>
                            {isLoading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl backdrop-blur-sm z-20">
                                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                              </div>
                            )}
                          </motion.div>
                        )})}
                      </div>
                    </div>
                  ))
              })()}
                </div>
              </div>
            </div>

            {/* AI Chat Sidebar - Always Visible on Desktop */}
            <div className="hidden lg:block w-full lg:w-80 xl:w-96 flex-shrink-0 relative">
              <div className="sticky top-4 sm:top-8 h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)]">
                <div className={`h-full backdrop-blur-xl border rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-900/95 border-slate-800/50' : 'bg-white border-primary-200'}`}>
                  <AIChat
                    onRecipeGenerated={(recipe) => {
                      // Update the selected meal plan with the new recipe
                      if (selectedPlan && user) {
                        const updatedItems = selectedPlan.items.map(item => 
                          item.recipe.id === recipe.id ? { ...item, recipe: recipe } : item
                        )
                        updateMealPlan(user.uid, selectedPlan.id, { items: updatedItems }).catch(console.error)
                        setSelectedPlan({ ...selectedPlan, items: updatedItems })
                        loadMealPlans().catch(console.error)
                      }
                    }}
                    currentRecipe={null}
                    availableIngredients={[]}
                    userPreferences={userPreferences}
                    onClose={undefined}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Meal Plan Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className={`fixed inset-0 transition-colors duration-300 ${isDark ? 'bg-black/60' : 'bg-black/40'}`}
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`relative rounded-2xl border p-6 max-w-md w-full transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800/20' : 'bg-white border-slate-200/30'}`}
            >
              <h2 className={`text-2xl font-medium mb-4 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Create Meal Plan
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Duration
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['day', 'week', 'month'] as MealPlanDuration[]).map(dur => (
                      <button
                        key={dur}
                        onClick={() => setDuration(dur)}
                        className={`p-3 rounded-lg border transition-all duration-300 ${
                          duration === dur
                            ? 'border-primary-500 bg-primary-500/10'
                            : isDark
                            ? 'border-slate-700/50 hover:border-slate-600'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className={`font-medium transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {dur.charAt(0).toUpperCase() + dur.slice(1)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors duration-300 ${
                      isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateMealPlan}
                    disabled={creating}
                    className="btn-primary flex-1 px-4 py-2 flex items-center justify-center space-x-2"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Create</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile AI Chat Button */}
      {selectedPlan && (
        <button
          onClick={() => setShowAIChat(true)}
          className="lg:hidden fixed bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 z-50 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white p-3 sm:p-4 rounded-full shadow-2xl premium-glow hover:scale-110 transition-all duration-300"
          title="Open AI Assistant"
        >
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Mobile AI Chat Sidebar */}
      <div className={`lg:hidden fixed right-0 top-0 h-full z-40 transition-transform duration-300 ease-in-out ${
        showAIChat && selectedPlan ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className={`h-full w-full sm:max-w-sm backdrop-blur-xl border-l shadow-2xl transition-colors duration-300 ${isDark ? 'bg-slate-900/95 border-slate-800/50' : 'bg-white border-primary-200'}`}>
          {selectedPlan && (
            <AIChat
              onRecipeGenerated={(recipe) => {
                // Update the selected meal plan with the new recipe
                if (selectedPlan && user) {
                  const updatedItems = selectedPlan.items.map(item => 
                    item.recipe.id === recipe.id ? { ...item, recipe: recipe } : item
                  )
                  updateMealPlan(user.uid, selectedPlan.id, { items: updatedItems }).catch(console.error)
                  setSelectedPlan({ ...selectedPlan, items: updatedItems })
                  loadMealPlans().catch(console.error)
                }
                setShowAIChat(false)
              }}
              currentRecipe={null}
              availableIngredients={[]}
              userPreferences={userPreferences}
              onClose={() => setShowAIChat(false)}
            />
          )}
        </div>
      </div>
      {showAIChat && selectedPlan && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
          onClick={() => setShowAIChat(false)}
        />
      )}
    </div>
  )
}

