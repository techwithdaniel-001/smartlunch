'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Clock, Users, ChefHat, Sparkles, CheckCircle2, XCircle, Star, Heart, MessageSquare, Play, Pause, RotateCcw, RotateCw, CheckCircle, Circle, Timer, ShoppingCart, UtensilsCrossed, TrendingUp, TrendingDown, Wand2, Scissors, Flame, ChefHat as ChefIcon, Droplets, Zap, Layers, Bookmark, BookmarkCheck, Download } from 'lucide-react'
import { Recipe } from '@/data/recipes'
import { motion, AnimatePresence } from 'framer-motion'
import AIChat from './AIChat'

interface RecipeDetailProps {
  recipe: Recipe
  onBack: () => void
  availableIngredients: string[]
  onRecipeUpdated?: (recipe: Recipe) => void
  showAIChat?: boolean
  setShowAIChat?: (show: boolean) => void
  isSaved?: boolean
  onSave?: () => void
  onUnsave?: () => void
  userPreferences?: any
}

export default function RecipeDetail({ recipe, onBack, availableIngredients, onRecipeUpdated, showAIChat: externalShowAIChat, setShowAIChat: externalSetShowAIChat, isSaved, onSave, onUnsave, userPreferences }: RecipeDetailProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [currentRecipe, setCurrentRecipe] = useState<Recipe>(recipe)
  const [internalShowAIChat, setInternalShowAIChat] = useState(false)
  
  // Use external state if provided, otherwise use internal state
  const showAIChat = externalShowAIChat !== undefined ? externalShowAIChat : internalShowAIChat
  const setShowAIChat = externalSetShowAIChat || setInternalShowAIChat
  const [cookingMode, setCookingMode] = useState(false)
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null)
  const [timerActive, setTimerActive] = useState(false)
  const [servingMultiplier, setServingMultiplier] = useState(1)

  const toggleStep = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex)
    } else {
      newCompleted.add(stepIndex)
    }
    setCompletedSteps(newCompleted)
  }

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedIngredients(newChecked)
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (timerActive && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            setTimerActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, timerSeconds])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const extractTimeFromStep = (step: string): number | null => {
    // Look for time patterns like "3-4 minutes", "15 minutes", "2-3 min"
    const patterns = [
      /(\d+)-(\d+)\s*(?:min|minutes|minute)/i,
      /(\d+)\s*(?:min|minutes|minute)/i,
    ]
    
    for (const pattern of patterns) {
      const match = step.match(pattern)
      if (match) {
        if (match[2]) {
          // Range: take the higher number
          return parseInt(match[2]) * 60
        } else {
          return parseInt(match[1]) * 60
        }
      }
    }
    return null
  }

  const startTimerForStep = (step: string) => {
    const timeInSeconds = extractTimeFromStep(step)
    if (timeInSeconds) {
      setTimerSeconds(timeInSeconds)
      setTimerActive(true)
    }
  }

  const adjustServings = (direction: 'up' | 'down') => {
    if (direction === 'up' && servingMultiplier < 4) {
      setServingMultiplier(servingMultiplier + 0.5)
    } else if (direction === 'down' && servingMultiplier > 0.5) {
      setServingMultiplier(servingMultiplier - 0.5)
    }
  }

  const calculateAdjustedAmount = (amount: string): string => {
    if (!amount || servingMultiplier === 1) return amount
    
    // Simple fraction parsing - handle common cases
    const parts = amount.split(' ')
    const numberPart = parts[0]
    const unitPart = parts.slice(1).join(' ')
    
    // Handle fractions
    if (numberPart.includes('/')) {
      const [num, den] = numberPart.split('/').map(Number)
      const decimal = (num / den) * servingMultiplier
      const rounded = Math.round(decimal * 2) / 2 // Round to nearest 0.5
      return `${rounded} ${unitPart}`.trim()
    }
    
    // Handle whole numbers
    const num = parseFloat(numberPart)
    if (!isNaN(num)) {
      const result = num * servingMultiplier
      const rounded = Math.round(result * 2) / 2
      return `${rounded} ${unitPart}`.trim()
    }
    
    return amount
  }

  // Get visual representation of ingredients in step
  const getStepVisuals = (step: string) => {
    const lowerStep = step.toLowerCase()
    const visuals: string[] = []
    
    // Detect ingredients mentioned in the step
    if (lowerStep.includes('chicken') || lowerStep.includes('turkey') || lowerStep.includes('meat')) {
      if (lowerStep.includes('cut') || lowerStep.includes('slice') || lowerStep.includes('chop') || lowerStep.includes('dice')) {
        visuals.push('🍗 → 🔪 → 🍗🍗🍗') // Whole chicken to sliced
      } else if (lowerStep.includes('cook') || lowerStep.includes('fry') || lowerStep.includes('sauté')) {
        visuals.push('🍗 → 🔥 → ✅')
      } else {
        visuals.push('🍗')
      }
    }
    if (lowerStep.includes('banana') || lowerStep.includes('bananas')) {
      if (lowerStep.includes('slice')) {
        visuals.push('🍌 → 🔪 → 🍌🍌🍌')
      } else if (lowerStep.includes('dice') || lowerStep.includes('chop')) {
        visuals.push('🍌 → 🔪 → 🟡🟡🟡')
      } else if (lowerStep.includes('mash')) {
        visuals.push('🍌 → 🥄 → 🟨')
      } else {
        visuals.push('🍌')
      }
    }
    if (lowerStep.includes('apple') || lowerStep.includes('apples')) {
      if (lowerStep.includes('slice')) {
        visuals.push('🍎 → 🔪 → 🍎🍎🍎')
      } else if (lowerStep.includes('dice') || lowerStep.includes('chop')) {
        visuals.push('🍎 → 🔪 → 🔴🔴🔴')
      } else {
        visuals.push('🍎')
      }
    }
    if (lowerStep.includes('carrot') || lowerStep.includes('carrots')) {
      if (lowerStep.includes('slice') || lowerStep.includes('cut')) {
        visuals.push('🥕 → 🔪 → 🥕🥕🥕')
      } else if (lowerStep.includes('dice') || lowerStep.includes('chop')) {
        visuals.push('🥕 → 🔪 → 🟠🟠🟠')
      } else if (lowerStep.includes('peel')) {
        visuals.push('🥕 → 🗑️ → ✨')
      } else {
        visuals.push('🥕')
      }
    }
    if (lowerStep.includes('cucumber') || lowerStep.includes('cucumbers')) {
      if (lowerStep.includes('slice') || lowerStep.includes('cut')) {
        visuals.push('🥒 → 🔪 → 🥒🥒🥒')
      } else if (lowerStep.includes('dice')) {
        visuals.push('🥒 → 🔪 → 🟢🟢🟢')
      } else {
        visuals.push('🥒')
      }
    }
    if (lowerStep.includes('tomato') || lowerStep.includes('tomatoes') || lowerStep.includes('cherry tomato')) {
      if (lowerStep.includes('slice') || lowerStep.includes('cut')) {
        visuals.push('🍅 → 🔪 → 🍅🍅🍅')
      } else if (lowerStep.includes('dice') || lowerStep.includes('chop')) {
        visuals.push('🍅 → 🔪 → 🔴🔴🔴')
      } else if (lowerStep.includes('halve') || lowerStep.includes('half')) {
        visuals.push('🍅 → 🔪 → 🍅🍅')
      } else {
        visuals.push('🍅')
      }
    }
    if (lowerStep.includes('lettuce') || lowerStep.includes('spinach') || lowerStep.includes('greens') || lowerStep.includes('salad')) {
      if (lowerStep.includes('wash') || lowerStep.includes('rinse') || lowerStep.includes('clean')) {
        visuals.push('🥬 → 💧 → ✨')
      } else if (lowerStep.includes('chop') || lowerStep.includes('cut') || lowerStep.includes('tear')) {
        visuals.push('🥬 → 🔪 → 🟢🟢🟢')
      } else {
        visuals.push('🥬')
      }
    }
    if (lowerStep.includes('bread') || lowerStep.includes('tortilla') || lowerStep.includes('wrap')) {
      if (lowerStep.includes('spread')) {
        visuals.push('🍞 → 🧈 → ✅')
      } else if (lowerStep.includes('cut') || lowerStep.includes('slice')) {
        visuals.push('🍞 → 🔪 → 🍞🍞🍞')
      } else if (lowerStep.includes('roll') || lowerStep.includes('wrap')) {
        visuals.push('🍞 → 🔄 → 🌯')
      } else {
        visuals.push('🍞')
      }
    }
    if (lowerStep.includes('cheese')) {
      if (lowerStep.includes('slice') || lowerStep.includes('cut')) {
        visuals.push('🧀 → 🔪 → 🧀🧀🧀')
      } else if (lowerStep.includes('shred') || lowerStep.includes('grate')) {
        visuals.push('🧀 → 🧀 → 🟡🟡🟡')
      } else {
        visuals.push('🧀')
      }
    }
    if (lowerStep.includes('egg') || lowerStep.includes('eggs')) {
      if (lowerStep.includes('cook') || lowerStep.includes('boil')) {
        visuals.push('🥚 → 🔥 → ✅')
      } else if (lowerStep.includes('crack') || lowerStep.includes('break')) {
        visuals.push('🥚 → 💥 → 🟡')
      } else if (lowerStep.includes('slice') || lowerStep.includes('cut')) {
        visuals.push('🥚 → 🔪 → 🥚🥚')
      } else {
        visuals.push('🥚')
      }
    }
    if (lowerStep.includes('pasta') || lowerStep.includes('rice')) {
      if (lowerStep.includes('cook')) {
        visuals.push('🍝 → 💧🔥 → ✅')
      } else if (lowerStep.includes('drain') || lowerStep.includes('rinse')) {
        visuals.push('🍝 → 💧 → ✨')
      } else {
        visuals.push('🍝')
      }
    }
    if (lowerStep.includes('pepper') || lowerStep.includes('bell pepper')) {
      if (lowerStep.includes('slice') || lowerStep.includes('cut') || lowerStep.includes('dice')) {
        visuals.push('🫑 → 🔪 → 🟢🟢🟢')
      } else {
        visuals.push('🫑')
      }
    }
    if (lowerStep.includes('avocado')) {
      if (lowerStep.includes('slice') || lowerStep.includes('cut')) {
        visuals.push('🥑 → 🔪 → 🥑🥑')
      } else if (lowerStep.includes('mash')) {
        visuals.push('🥑 → 🥄 → 🟢')
      } else {
        visuals.push('🥑')
      }
    }
    if (lowerStep.includes('onion')) {
      if (lowerStep.includes('slice') || lowerStep.includes('cut') || lowerStep.includes('dice')) {
        visuals.push('🧅 → 🔪 → ⚪⚪⚪')
      } else {
        visuals.push('🧅')
      }
    }
    if (lowerStep.includes('strawberr') || lowerStep.includes('berry')) {
      if (lowerStep.includes('slice') || lowerStep.includes('cut') || lowerStep.includes('halve')) {
        visuals.push('🍓 → 🔪 → 🍓🍓')
      } else if (lowerStep.includes('wash')) {
        visuals.push('🍓 → 💧 → ✨')
      } else {
        visuals.push('🍓')
      }
    }
    
    return visuals
  }

  // Get visual icon for step type
  const getStepIcon = (step: string) => {
    const lowerStep = step.toLowerCase()
    if (lowerStep.includes('cut') || lowerStep.includes('slice') || lowerStep.includes('chop') || lowerStep.includes('dice')) {
      return <span className="text-2xl">🔪</span>
    }
    if (lowerStep.includes('mix') || lowerStep.includes('stir') || lowerStep.includes('combine') || lowerStep.includes('toss')) {
      return <RotateCw className="w-6 h-6" />
    }
    if (lowerStep.includes('cook') || lowerStep.includes('heat') || lowerStep.includes('fry') || lowerStep.includes('sauté') || lowerStep.includes('bake') || lowerStep.includes('roast')) {
      return <Flame className="w-6 h-6" />
    }
    if (lowerStep.includes('wash') || lowerStep.includes('rinse') || lowerStep.includes('clean')) {
      return <Droplets className="w-6 h-6" />
    }
    if (lowerStep.includes('spread') || lowerStep.includes('layer') || lowerStep.includes('arrange') || lowerStep.includes('place')) {
      return <Layers className="w-6 h-6" />
    }
    if (lowerStep.includes('roll') || lowerStep.includes('wrap') || lowerStep.includes('fold')) {
      return <ChefIcon className="w-6 h-6" />
    }
    return <Zap className="w-6 h-6" />
  }

  // Get step type color
  const getStepColor = (step: string) => {
    const lowerStep = step.toLowerCase()
    if (lowerStep.includes('cut') || lowerStep.includes('slice') || lowerStep.includes('chop')) {
      return 'from-blue-500 to-blue-600'
    }
    if (lowerStep.includes('mix') || lowerStep.includes('stir') || lowerStep.includes('combine')) {
      return 'from-purple-500 to-purple-600'
    }
    if (lowerStep.includes('cook') || lowerStep.includes('heat') || lowerStep.includes('fry') || lowerStep.includes('bake')) {
      return 'from-orange-500 to-orange-600'
    }
    if (lowerStep.includes('wash') || lowerStep.includes('rinse')) {
      return 'from-cyan-500 to-cyan-600'
    }
    return 'from-primary-500 to-primary-600'
  }

  const hasIngredient = (ingredientName: string) => {
    return availableIngredients.some(ai =>
      ingredientName.toLowerCase().includes(ai.toLowerCase()) ||
      ai.toLowerCase().includes(ingredientName.toLowerCase())
    )
  }

  const handleRecipeUpdated = (updatedRecipe: Recipe) => {
    setCurrentRecipe(updatedRecipe)
    if (onRecipeUpdated) {
      onRecipeUpdated(updatedRecipe)
    }
    // Only close on mobile (when onClose is provided), keep open on desktop since sidebar is always visible
    if (externalSetShowAIChat && window.innerWidth < 1024) {
    setShowAIChat(false)
    }
  }

  const downloadPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 20
    const margin = 20
    const maxWidth = pageWidth - 2 * margin

    // Title
    doc.setFontSize(24)
    doc.setTextColor(16, 185, 129) // primary-500 color
    doc.text(currentRecipe.name, margin, yPosition)
    yPosition += 15

    // Description
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    const descriptionLines = doc.splitTextToSize(currentRecipe.description, maxWidth)
    doc.text(descriptionLines, margin, yPosition)
    yPosition += descriptionLines.length * 7 + 10

    // Recipe Info
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(`Time: ${currentRecipe.time}`, margin, yPosition)
    yPosition += 8
    doc.text(`Servings: ${currentRecipe.servings}`, margin, yPosition)
    yPosition += 8
    doc.text(`Difficulty: ${currentRecipe.difficulty}`, margin, yPosition)
    yPosition += 8
    doc.text(`Rating: ${currentRecipe.rating}/5`, margin, yPosition)
    yPosition += 15

    // Ingredients
    doc.setFontSize(18)
    doc.setTextColor(16, 185, 129)
    doc.text('Ingredients', margin, yPosition)
    yPosition += 10

    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    currentRecipe.ingredients.forEach((ingredient) => {
      const text = `• ${ingredient.amount} ${ingredient.name}`
      const lines = doc.splitTextToSize(text, maxWidth)
      doc.text(lines, margin + 5, yPosition)
      yPosition += lines.length * 6
      
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        yPosition = 20
      }
    })
    yPosition += 10

    // Instructions
    doc.setFontSize(18)
    doc.setTextColor(16, 185, 129)
    doc.text('Instructions', margin, yPosition)
    yPosition += 10

    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    currentRecipe.instructions.forEach((instruction, index) => {
      const stepText = `${index + 1}. ${instruction.step}`
      const lines = doc.splitTextToSize(stepText, maxWidth)
      doc.text(lines, margin + 5, yPosition)
      yPosition += lines.length * 6 + 3
      
      if (instruction.tip) {
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        const tipLines = doc.splitTextToSize(`Tip: ${instruction.tip}`, maxWidth - 10)
        doc.text(tipLines, margin + 10, yPosition)
        yPosition += tipLines.length * 5 + 5
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
      }
      
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        yPosition = 20
      }
    })

    // Nutrition (if available)
    if (currentRecipe.nutrition) {
      yPosition += 10
      if (yPosition > pageHeight - 50) {
        doc.addPage()
        yPosition = 20
      }
      
      doc.setFontSize(18)
      doc.setTextColor(16, 185, 129)
      doc.text('Nutrition', margin, yPosition)
      yPosition += 10

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text(`Calories: ${currentRecipe.nutrition.calories}`, margin + 5, yPosition)
      yPosition += 7
      doc.text(`Protein: ${currentRecipe.nutrition.protein}`, margin + 5, yPosition)
      yPosition += 7
      doc.text(`Carbs: ${currentRecipe.nutrition.carbs}`, margin + 5, yPosition)
      yPosition += 7
      doc.text(`Fat: ${currentRecipe.nutrition.fat}`, margin + 5, yPosition)
    }

    // Footer
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Page ${i} of ${totalPages} - Smart Lunch`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }

    doc.save(`${currentRecipe.name.replace(/[^a-z0-9]/gi, '_')}.pdf`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Main Recipe Content */}
        <div className="flex-1 min-w-0 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to recipes</span>
          </button>
          <div className="flex items-center space-x-2">
            {/* Save/Unsave Button */}
            {(onSave || onUnsave) && (
              <button
                onClick={() => {
                  if (isSaved && onUnsave) {
                    onUnsave()
                  } else if (!isSaved && onSave) {
                    onSave()
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  isSaved
                    ? 'bg-primary-500/20 border border-primary-500/50 text-primary-300 hover:bg-primary-500/30'
                    : 'bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:border-primary-500/50'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save recipe'}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </>
                )}
              </button>
            )}
            {/* Download PDF Button */}
            <button
              onClick={downloadPDF}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:border-primary-500/50 hover:bg-primary-500/10 transition-all duration-300"
              title="Download recipe as PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </div>
        </div>

        {/* Floating Magic Button in Cooking Mode */}
        {cookingMode && (
          <button
            onClick={() => setShowAIChat(true)}
            className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white p-5 rounded-full shadow-2xl premium-glow hover:scale-110 transition-all duration-300 group animate-pulse hover:animate-none"
            title="Modify recipe with AI"
          >
            <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-2 -right-2 w-3 h-3 bg-primary-400 rounded-full animate-ping"></span>
          </button>
        )}

        {/* Recipe Header */}
        <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 border-slate-800/80">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex-shrink-0 flex flex-row sm:flex-col gap-3 sm:gap-4 items-center sm:items-start">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-accent-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden border border-primary-500/20 relative">
                {currentRecipe.imageUrl ? (
                  <img 
                    src={currentRecipe.imageUrl} 
                    alt={currentRecipe.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl sm:text-5xl md:text-6xl">{currentRecipe.emoji}</div>
                )}
              </div>
              {/* Final Dish Preview */}
              <div className="w-24 sm:w-28 md:w-32 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-primary-500/30 overflow-hidden">
                <p className="text-[10px] sm:text-xs text-slate-400 mb-1 sm:mb-2 text-center font-medium">Final Result</p>
                {currentRecipe.imageUrl ? (
                  <div className="w-full aspect-square rounded-lg overflow-hidden mb-1 sm:mb-2">
                    <img 
                      src={currentRecipe.imageUrl} 
                      alt={currentRecipe.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="text-3xl sm:text-4xl text-center leading-none">
                {currentRecipe.emoji}
                    {currentRecipe.presentationTips && currentRecipe.presentationTips.length > 0 && (
                      <span className="text-xl sm:text-2xl ml-1">✨</span>
                    )}
                  </div>
                )}
                <p className="text-[10px] sm:text-xs text-slate-300 mt-1 sm:mt-2 text-center">Ready to serve!</p>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-2 sm:mb-3">{currentRecipe.name}</h1>
              <p className="text-base sm:text-lg text-slate-300 mb-3 sm:mb-4">{currentRecipe.description}</p>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Clock className="w-5 h-5 text-primary-400" />
                  <span className="font-medium">{currentRecipe.time}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <Users className="w-5 h-5 text-primary-400" />
                  <span className="font-medium">
                    {servingMultiplier !== 1 
                      ? `${Math.round(parseFloat(currentRecipe.servings) * servingMultiplier)} servings`
                      : currentRecipe.servings
                    }
                  </span>
                  {!cookingMode && (
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={() => adjustServings('down')}
                        disabled={servingMultiplier <= 0.5}
                        className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-slate-200"
                        title="Decrease servings"
                      >
                        <TrendingDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => adjustServings('up')}
                        disabled={servingMultiplier >= 4}
                        className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-slate-200"
                        title="Increase servings"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 fill-primary-400 text-primary-400" />
                  <span className="font-semibold text-slate-200">{currentRecipe.rating}</span>
                </div>
                <div className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 text-primary-300 rounded-full text-sm font-semibold">
                  {currentRecipe.difficulty}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {currentRecipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-slate-800/60 text-slate-300 rounded-full text-sm border border-slate-700/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {!cookingMode && (
                <button
                  onClick={() => {
                    setCookingMode(true)
                    setCurrentStep(0)
                    setCompletedSteps(new Set())
                    setCheckedIngredients(new Set())
                  }}
                  className="btn-primary flex items-center space-x-2 text-lg px-8 py-4"
                >
                  <UtensilsCrossed className="w-6 h-6" />
                  <span>Start Cooking Mode</span>
                </button>
              )}

              {cookingMode && (
                <div className="flex items-center space-x-4">
                  <div className="px-4 py-2 bg-primary-500/20 border border-primary-500/30 text-primary-300 rounded-xl font-semibold flex items-center space-x-2">
                    <UtensilsCrossed className="w-5 h-5" />
                    <span>Cooking Mode Active</span>
                  </div>
                  <button
                    onClick={() => {
                      setCookingMode(false)
                      setTimerActive(false)
                      setTimerSeconds(null)
                    }}
                    className="px-4 py-2 border-2 border-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-800/60 transition-colors"
                  >
                    Exit Cooking Mode
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border-slate-800/80">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-3 sm:mb-4 flex items-center space-x-2">
            {cookingMode ? (
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
            ) : (
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
            )}
            <span className="text-base sm:text-xl md:text-2xl">Ingredients {cookingMode && <span className="hidden sm:inline">(Check off as you gather)</span>}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {currentRecipe.ingredients.map((ingredient, index) => {
              const hasIt = hasIngredient(ingredient.name)
              const isChecked = checkedIngredients.has(index)
              return (
                <div
                  key={index}
                  onClick={() => cookingMode && toggleIngredient(index)}
                  className={`flex items-center space-x-3 p-4 rounded-xl transition-all cursor-pointer ${
                    cookingMode && isChecked
                      ? 'bg-primary-500/20 border-2 border-primary-500/50'
                      : hasIt
                      ? 'bg-primary-500/10 border-2 border-primary-500/30'
                      : 'bg-slate-800/40 border-2 border-slate-700/50'
                  } ${cookingMode ? 'hover:border-primary-400/50' : ''}`}
                >
                  {cookingMode ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleIngredient(index)
                      }}
                      className="flex-shrink-0"
                    >
                      {isChecked ? (
                        <CheckCircle className="w-6 h-6 text-primary-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-500" />
                      )}
                    </button>
                  ) : hasIt ? (
                    <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <span className={`font-medium text-lg ${isChecked ? 'line-through text-slate-500' : hasIt ? 'text-slate-100' : 'text-slate-400'}`}>
                      {ingredient.name}
                    </span>
                    {ingredient.amount && (
                      <span className={`text-slate-400 ml-2 text-base ${cookingMode ? 'font-semibold' : ''}`}>
                        • {servingMultiplier !== 1 ? calculateAdjustedAmount(ingredient.amount) : ingredient.amount}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {cookingMode && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-sm text-slate-300">
                Progress: {checkedIngredients.size} of {currentRecipe.ingredients.length} ingredients gathered
              </p>
              <div className="mt-2 w-full bg-slate-800 rounded-full h-3">
                <div
                  className="bg-primary-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(checkedIngredients.size / currentRecipe.ingredients.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick Prep Info for Parents */}
        {!cookingMode && (
          <div className="glass-effect rounded-2xl p-6 mb-8 bg-gradient-to-br from-primary-500/10 via-primary-600/10 to-primary-700/10 border-primary-500/20">
            <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center space-x-2">
              <Clock className="w-6 h-6 text-primary-400" />
              <span>Quick Prep Guide for Busy Parents</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl">
                <p className="text-sm text-slate-400 mb-1">Total Time</p>
                <p className="text-2xl font-bold text-slate-100">{currentRecipe.time}</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl">
                <p className="text-sm text-slate-400 mb-1">Difficulty</p>
                <p className="text-2xl font-bold text-slate-100">{currentRecipe.difficulty}</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl">
                <p className="text-sm text-slate-400 mb-1">Servings</p>
                <p className="text-2xl font-bold text-slate-100">{currentRecipe.servings}</p>
              </div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl">
              <p className="text-sm font-semibold text-slate-100 mb-2">💡 Parent Tips:</p>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>• Gather all ingredients first to save time</li>
                <li>• Most steps can be done while multitasking</li>
                <li>• Use cooking mode for step-by-step guidance</li>
                <li>• Adjust servings using the +/- buttons above</li>
              </ul>
            </div>
          </div>
        )}

        {/* Presentation Tips */}
        {currentRecipe.presentationTips && currentRecipe.presentationTips.length > 0 && (
          <div className="glass-effect rounded-2xl p-6 mb-8 bg-gradient-to-br from-primary-500/10 via-accent-500/10 to-primary-600/10 border-primary-500/20">
            <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-primary-400" />
              <span>Make It Look Amazing! (Quick & Easy)</span>
            </h2>
            <div className="space-y-3">
              {currentRecipe.presentationTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-slate-300 flex-1">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border-slate-800/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center space-x-2">
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
            <span>Step-by-Step Instructions</span>
          </h2>
            {/* Visual Step Type Summary */}
            {!cookingMode && (
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                {Array.from(new Set(currentRecipe.instructions.map(inst => {
                  const step = inst.step.toLowerCase()
                  if (step.includes('cut') || step.includes('slice') || step.includes('chop')) return 'cut'
                  if (step.includes('mix') || step.includes('stir') || step.includes('combine')) return 'mix'
                  if (step.includes('cook') || step.includes('heat') || step.includes('bake')) return 'cook'
                  if (step.includes('wash') || step.includes('rinse')) return 'wash'
                  return 'other'
                }))).map((type, idx) => (
                  <div key={idx} className="flex items-center space-x-1 px-2 py-1 bg-slate-800/60 rounded-lg border border-slate-700/50">
                    {type === 'cut' && <span className="text-sm">🔪</span>}
                    {type === 'mix' && <RotateCw className="w-3 h-3 text-purple-400" />}
                    {type === 'cook' && <Flame className="w-3 h-3 text-orange-400" />}
                    {type === 'wash' && <Droplets className="w-3 h-3 text-cyan-400" />}
                    <span className="text-xs text-slate-300 capitalize">{type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visual Step Flow Overview */}
          {!cookingMode && (
            <div className="mb-6 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <p className="text-sm text-slate-300 mb-3 font-medium">Recipe Flow:</p>
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                {currentRecipe.instructions.map((instruction, index) => {
                  const step = instruction.step.toLowerCase()
                  const isCompleted = completedSteps.has(index)
                  const isCurrent = currentStep === index
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-primary-500 text-white'
                          : isCurrent
                          ? `bg-gradient-to-br ${getStepColor(instruction.step)} text-white ring-2 ring-primary-400`
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                      title={instruction.step.substring(0, 50) + '...'}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <div className="w-5 h-5">
                          {getStepIcon(instruction.step)}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Timer Display */}
          {cookingMode && timerSeconds !== null && (
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl sm:rounded-2xl text-white">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Timer className="w-6 h-6 sm:w-8 sm:h-8" />
                  <div>
                    <p className="text-xs sm:text-sm opacity-90">Cooking Timer</p>
                    <p className="text-3xl sm:text-4xl font-bold">{formatTime(timerSeconds)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {timerActive ? (
                    <button
                      onClick={() => setTimerActive(false)}
                      className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl transition-colors"
                    >
                      <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setTimerActive(true)}
                      className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl transition-colors"
                    >
                      <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const timeInSeconds = extractTimeFromStep(currentRecipe.instructions[currentStep].step)
                      if (timeInSeconds) {
                        setTimerSeconds(timeInSeconds)
                        setTimerActive(false)
                      }
                    }}
                    className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>
              {timerSeconds === 0 && (
                <div className="mt-3 sm:mt-4 p-3 bg-white/20 rounded-lg text-center">
                  <p className="font-semibold text-base sm:text-lg">⏰ Time's up! Move to next step.</p>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {cookingMode ? (
                // Cooking Mode: Show only current step with large text and visuals
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border-2 sm:border-4 bg-primary-500/10 border-primary-500/50 shadow-2xl premium-glow"
                >
                  <div className="text-center mb-4 sm:mb-6">
                    {/* Visual Step Indicator */}
                    <div className="flex items-center justify-center mb-4 sm:mb-6">
                      <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${getStepColor(currentRecipe.instructions[currentStep].step)} text-white mb-2 sm:mb-4 premium-glow relative`}>
                        <div className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl">
                          {getStepIcon(currentRecipe.instructions[currentStep].step)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-900 border-2 border-primary-500 flex items-center justify-center text-xs sm:text-sm font-bold">
                          {currentStep + 1}
                        </div>
                      </div>
                    </div>
                    
                    {/* Visual Food Preparation */}
                    {getStepVisuals(currentRecipe.instructions[currentStep].step).length > 0 && (
                      <div className="mb-6 p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl border-2 border-primary-500/20 shadow-lg">
                        <p className="text-center text-sm text-primary-300 mb-4 font-semibold uppercase tracking-wide">Visual Preparation Guide</p>
                        <div className="flex items-center justify-center space-x-2 sm:space-x-3 text-3xl sm:text-4xl md:text-5xl mb-2 flex-wrap">
                          {getStepVisuals(currentRecipe.instructions[currentStep].step).map((visual, idx) => (
                            <div key={idx} className="flex items-center space-x-1">
                              <span className="font-mono leading-none">{visual}</span>
                              {idx < getStepVisuals(currentRecipe.instructions[currentStep].step).length - 1 && (
                                <span className="text-2xl sm:text-3xl text-slate-500 mx-1 sm:mx-2">+</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-2">See how the ingredients transform</p>
                      </div>
                    )}
                    
                    {/* Step Text */}
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-100 leading-relaxed mb-4 sm:mb-6 px-2">
                      {currentRecipe.instructions[currentStep].step}
                    </p>
                    
                    {/* Show final result preview on last step */}
                    {currentStep === currentRecipe.instructions.length - 1 && (
                      <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl border-2 border-primary-500/40">
                        <p className="text-center text-xs sm:text-sm text-primary-300 mb-2 sm:mb-3 font-semibold uppercase tracking-wide">Final Result Preview</p>
                        {currentRecipe.imageUrl ? (
                          <div className="w-full max-w-md mx-auto mb-2 sm:mb-3">
                            <img 
                              src={currentRecipe.imageUrl} 
                              alt={currentRecipe.name}
                              className="w-full h-auto rounded-xl shadow-2xl"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                            <div className="text-4xl sm:text-5xl md:text-6xl">{currentRecipe.emoji}</div>
                            {currentRecipe.presentationTips && currentRecipe.presentationTips.length > 0 && (
                              <>
                                <span className="text-2xl sm:text-3xl text-slate-400">+</span>
                                <div className="text-3xl sm:text-4xl">✨</div>
                              </>
                            )}
                          </div>
                        )}
                        <p className="text-center text-xs sm:text-sm text-slate-300 mt-2 sm:mt-3 px-2">This is what your {currentRecipe.name} will look like when done!</p>
                      </div>
                    )}
                    
                    {/* Visual Progress Bar */}
                    <div className="w-full max-w-md mx-auto mb-6">
                      <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                        <span>Step {currentStep + 1} of {currentRecipe.instructions.length}</span>
                        <span>{Math.round(((currentStep + 1) / currentRecipe.instructions.length) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${getStepColor(currentRecipe.instructions[currentStep].step)} transition-all duration-500`}
                          style={{ width: `${((currentStep + 1) / currentRecipe.instructions.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    {currentRecipe.instructions[currentStep].tip && (
                      <div className="mt-6 p-4 bg-primary-500/20 border-2 border-primary-500/40 rounded-xl">
                        <p className="text-xl text-slate-200">
                          <strong className="text-primary-300">💡 Pro Tip:</strong> {currentRecipe.instructions[currentStep].tip}
                        </p>
                      </div>
                    )}
                    {extractTimeFromStep(currentRecipe.instructions[currentStep].step) && (
                      <button
                        onClick={() => startTimerForStep(currentRecipe.instructions[currentStep].step)}
                        className="mt-4 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors flex items-center space-x-2 mx-auto"
                      >
                        <Timer className="w-5 h-5" />
                        <span>Start Timer for This Step</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                // Normal Mode: Show all steps
                currentRecipe.instructions.map((instruction, index) => {
                const isCompleted = completedSteps.has(index)
                const isCurrent = currentStep === index
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer ${
                      isCompleted
                          ? 'bg-primary-500/10 border-primary-500/30'
                        : isCurrent
                          ? 'bg-primary-500/20 border-primary-500/50 shadow-lg'
                          : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600/50'
                    }`}
                    onClick={() => toggleStep(index)}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg bg-gradient-to-br ${getStepColor(instruction.step)} text-white relative ${
                            isCompleted ? 'opacity-50' : ''
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <div className="flex items-center justify-center">
                              {getStepIcon(instruction.step)}
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center text-xs">
                            {index + 1}
                          </div>
                      </div>
                      <div className="flex-1">
                          {/* Visual Food Preparation for each step */}
                          {getStepVisuals(instruction.step).length > 0 && (
                            <div className="mb-3 p-3 bg-gradient-to-r from-slate-800/60 to-slate-800/40 rounded-lg border border-primary-500/20">
                              <div className="flex items-center space-x-2 text-2xl">
                                {getStepVisuals(instruction.step).map((visual, idx) => (
                                  <span key={idx} className="font-mono leading-none">{visual}</span>
                                ))}
                              </div>
                              <p className="text-xs text-slate-400 mt-1">Visual guide</p>
                            </div>
                          )}
                          <p className={`text-lg font-medium ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {instruction.step}
                        </p>
                        {instruction.tip && (
                            <div className="mt-2 p-3 bg-primary-500/20 border border-primary-500/30 rounded-lg">
                              <p className="text-sm text-slate-300">
                                <strong className="text-primary-300">💡 Tip:</strong> {instruction.tip}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
                })
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-800">
            <button
              onClick={() => {
                setCurrentStep(Math.max(0, currentStep - 1))
                if (cookingMode) {
                  setTimerActive(false)
                  setTimerSeconds(null)
                }
              }}
              disabled={currentStep === 0}
              className={`w-full sm:w-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl border-2 border-slate-700 text-slate-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800/60 transition-colors text-sm sm:text-base ${
                cookingMode ? 'md:text-lg lg:text-xl' : ''
              }`}
            >
              ← Previous
            </button>
            <div className="text-center w-full sm:w-auto">
              <span className={`text-slate-300 font-medium text-sm sm:text-base ${cookingMode ? 'md:text-lg lg:text-xl' : ''}`}>
              Step {currentStep + 1} of {currentRecipe.instructions.length}
            </span>
              {cookingMode && (
                <div className="mt-2 w-full sm:w-64 mx-auto bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / currentRecipe.instructions.length) * 100}%` }}
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (cookingMode && !completedSteps.has(currentStep)) {
                  const newCompleted = new Set(completedSteps)
                  newCompleted.add(currentStep)
                  setCompletedSteps(newCompleted)
                }
                setCurrentStep(Math.min(currentRecipe.instructions.length - 1, currentStep + 1))
                if (cookingMode) {
                  setTimerActive(false)
                  setTimerSeconds(null)
                }
              }}
              disabled={currentStep === currentRecipe.instructions.length - 1}
              className={`w-full sm:w-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-primary-600 hover:to-primary-700 transition-colors shadow-lg hover:shadow-primary-500/25 text-sm sm:text-base ${
                cookingMode ? 'md:text-lg lg:text-xl' : ''
              }`}
            >
              {currentStep === currentRecipe.instructions.length - 1 ? 'Complete!' : 'Next →'}
            </button>
          </div>

          {cookingMode && currentStep === currentRecipe.instructions.length - 1 && completedSteps.has(currentStep) && (
            <div className="mt-4 sm:mt-6 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl sm:rounded-2xl text-white text-center premium-glow">
              <div className="mb-3 sm:mb-4">
                {currentRecipe.imageUrl ? (
                  <div className="w-full max-w-md mx-auto mb-3 sm:mb-4">
                    <img 
                      src={currentRecipe.imageUrl} 
                      alt={currentRecipe.name}
                      className="w-full h-auto rounded-xl shadow-2xl border-2 sm:border-4 border-white/20"
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-3 sm:mb-4">{currentRecipe.emoji}</div>
                    {currentRecipe.presentationTips && currentRecipe.presentationTips.length > 0 && (
                      <div className="text-3xl sm:text-4xl mb-2">✨</div>
                    )}
                  </>
                )}
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">🎉 Recipe Complete!</h3>
              <p className="text-lg sm:text-xl mb-3 sm:mb-4">Great job! Your meal is ready to serve.</p>
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-xs sm:text-sm opacity-90 mb-2">This is what your {currentRecipe.name} should look like!</p>
                {!currentRecipe.imageUrl && (
                  <div className="flex items-center justify-center space-x-2 text-xl sm:text-2xl">
                    {currentRecipe.emoji}
                    {currentRecipe.presentationTips && currentRecipe.presentationTips.length > 0 && (
                      <>
                        <span>+</span>
                        <span>✨</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Nutritional Info */}
        {currentRecipe.nutrition && (
          <div className="glass-effect rounded-2xl p-6 border-slate-800/80">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">Nutritional Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(currentRecipe.nutrition).map(([key, value]) => (
                <div key={key} className="text-center p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl">
                  <div className="text-2xl font-bold text-primary-400">{value}</div>
                  <div className="text-sm text-slate-400 capitalize">{key}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

        {/* AI Chat Sidebar - Always Visible */}
        <div className="hidden lg:block w-full lg:w-80 xl:w-96 flex-shrink-0">
          <div className="sticky top-4 sm:top-8 h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)]">
            <div className="h-full bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
              <AIChat
                onRecipeGenerated={handleRecipeUpdated}
                currentRecipe={currentRecipe}
                availableIngredients={availableIngredients}
                userPreferences={userPreferences}
                onClose={undefined}
              />
            </div>
          </div>
        </div>

        {/* Mobile AI Chat Button */}
        <button
          onClick={() => setShowAIChat(true)}
          className="lg:hidden fixed bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 z-50 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white p-3 sm:p-4 rounded-full shadow-2xl premium-glow hover:scale-110 transition-all duration-300"
          title="Open AI Assistant"
        >
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Mobile AI Chat Sidebar */}
        <div className={`lg:hidden fixed right-0 top-0 h-full z-40 transition-transform duration-300 ease-in-out ${
          showAIChat ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="h-full w-full sm:max-w-sm bg-slate-900/95 backdrop-blur-xl border-l border-slate-800/50 shadow-2xl">
            <AIChat
              onRecipeGenerated={handleRecipeUpdated}
              currentRecipe={currentRecipe}
              availableIngredients={availableIngredients}
              userPreferences={userPreferences}
              onClose={() => setShowAIChat(false)}
            />
          </div>
        </div>
        {showAIChat && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
            onClick={() => setShowAIChat(false)}
          />
        )}
      </div>

      {/* Floating Magic Button in Cooking Mode (Mobile Only) */}
      {cookingMode && (
        <button
          onClick={() => setShowAIChat(true)}
          className="lg:hidden fixed bottom-16 sm:bottom-20 md:bottom-24 right-4 sm:right-6 md:right-8 z-50 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white p-4 sm:p-5 rounded-full shadow-2xl premium-glow hover:scale-110 transition-all duration-300 group animate-pulse hover:animate-none"
          title="Modify recipe with AI"
        >
          <Wand2 className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-2 -right-2 w-3 h-3 bg-primary-400 rounded-full animate-ping"></span>
        </button>
      )}
    </div>
  )
}

