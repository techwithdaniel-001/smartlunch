'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Image from 'next/image'
import { ArrowLeft, Clock, Users, ChefHat, Sparkles, CheckCircle2, XCircle, Star, Heart, MessageSquare, Play, Pause, RotateCcw, RotateCw, CheckCircle, Circle, Timer, ShoppingCart, UtensilsCrossed, Wand2, Scissors, Flame, ChefHat as ChefIcon, Droplets, Zap, Layers, Bookmark, BookmarkCheck, Download, Loader2, Plus, Minus, X, Send } from 'lucide-react'
import { Recipe } from '@/data/recipes'
import { motion, AnimatePresence } from 'framer-motion'
import AIChat from './AIChat'
import { useTheme } from '@/contexts/ThemeContext'

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
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [currentRecipe, setCurrentRecipe] = useState<Recipe>(recipe)
  const [internalShowAIChat, setInternalShowAIChat] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Use external state if provided, otherwise use internal state
  const showAIChat = externalShowAIChat !== undefined ? externalShowAIChat : internalShowAIChat
  const setShowAIChat = externalSetShowAIChat || setInternalShowAIChat
  const [cookingMode, setCookingMode] = useState(false)
  
  // Update currentRecipe when recipe prop changes
  useEffect(() => {
    setCurrentRecipe(recipe)
  }, [recipe])

  // Don't auto-start timer - user will click start button when ready
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())
  const [removedIngredients, setRemovedIngredients] = useState<Set<number>>(new Set())
  const [autoSendMessage, setAutoSendMessage] = useState<string | null>(null)
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null)
  const [timerActive, setTimerActive] = useState(false)
  const [servingMultiplier, setServingMultiplier] = useState(1)
  const [showTimerPicker, setShowTimerPicker] = useState(false)
  const [timerPickerStep, setTimerPickerStep] = useState<string | null>(null)
  const [showAIHelpPopup, setShowAIHelpPopup] = useState(false)
  const [hasSeenAIHelp, setHasSeenAIHelp] = useState(false)
  const [recipeUpdateNotification, setRecipeUpdateNotification] = useState<{ show: boolean; message: string }>({ show: false, message: '' })
  const cookingStepsRef = useRef<HTMLDivElement>(null)

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

  const removeIngredient = async (index: number, ingredientName: string) => {
    // Add to removed ingredients
    const newRemoved = new Set(removedIngredients)
    newRemoved.add(index)
    setRemovedIngredients(newRemoved)
    
    // Open AI chat if not already open
    if (!showAIChat) {
      setShowAIChat(true)
    }
    
    // Auto-send message to AI asking for alternatives
    const message = `I don't have ${ingredientName}. What can I use instead or how can I modify this recipe? Please provide alternatives and suggestions.`
    setAutoSendMessage(message)
    
    // Clear the message after a brief delay to allow it to be sent
    setTimeout(() => {
      setAutoSendMessage(null)
    }, 1000)
  }

  // Timer effect with sound notification
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (timerActive && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            setTimerActive(false)
            // Play notification sound when timer completes (multiple beeps for attention)
            if (typeof window !== 'undefined' && 'Audio' in window) {
              try {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
                
                // Play 3 beeps for better attention
                for (let i = 0; i < 3; i++) {
                  setTimeout(() => {
                    const oscillator = audioContext.createOscillator()
                    const gainNode = audioContext.createGain()
                    
                    oscillator.connect(gainNode)
                    gainNode.connect(audioContext.destination)
                    
                    oscillator.frequency.value = 800 + (i * 100) // Slightly different pitch each time
                    oscillator.type = 'sine'
                    
                    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)
                    
                    oscillator.start(audioContext.currentTime)
                    oscillator.stop(audioContext.currentTime + 0.6)
                  }, i * 200) // Stagger the beeps
                }
              } catch (e) {
                console.log('Audio notification not available')
              }
            }
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

  const extractTimeRangeFromStep = (step: string): { min: number; max: number } | null => {
    // Look for time ranges like "5 to 10 minutes", "3-4 minutes", "2-3 min"
    const rangePatterns = [
      /(\d+)\s*(?:to|-)\s*(\d+)\s*(?:min|minutes|minute)/i,
      /(\d+)-(\d+)\s*(?:min|minutes|minute)/i,
    ]
    
    for (const pattern of rangePatterns) {
      const match = step.match(pattern)
      if (match && match[1] && match[2]) {
        return {
          min: parseInt(match[1]),
          max: parseInt(match[2])
        }
      }
    }
    
    // Check for single time
    const singlePattern = /(\d+)\s*(?:min|minutes|minute)/i
    const singleMatch = step.match(singlePattern)
    if (singleMatch) {
      const time = parseInt(singleMatch[1])
      return { min: time, max: time }
    }
    
    return null
  }

  const getTimerOptions = (step: string): number[] => {
    const range = extractTimeRangeFromStep(step)
    if (!range) return []
    
    // If it's a range, offer smart options
    if (range.min !== range.max) {
      const options: number[] = []
      const diff = range.max - range.min
      
      // Always include min and max
      options.push(range.min)
      
      // Add middle option if range is large enough
      if (diff >= 3) {
        const middle = Math.round((range.min + range.max) / 2)
        if (middle !== range.min && middle !== range.max) {
          options.push(middle)
        }
      }
      
      // Add max
      options.push(range.max)
      
      return options
    } else {
      // Single time, just return it
      return [range.min]
    }
  }

  const startTimerForStep = (step: string) => {
    const options = getTimerOptions(step)
    if (options.length > 1) {
      // Show picker for ranges
      setTimerPickerStep(step)
      setShowTimerPicker(true)
    } else if (options.length === 1) {
      // Single time, start immediately
      setTimerSeconds(options[0] * 60)
      setTimerActive(true)
    }
  }

  const startTimerWithMinutes = (minutes: number) => {
    setTimerSeconds(minutes * 60)
    setTimerActive(true)
    setShowTimerPicker(false)
    setTimerPickerStep(null)
  }

  const startCustomTimer = (minutes: number) => {
    setTimerSeconds(minutes * 60)
    setTimerActive(true)
  }

  const presetTimers = [1, 5, 10, 15, 30]

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
    const wasInCookingMode = cookingMode
    setCurrentRecipe(updatedRecipe)
    // Exit cooking mode when recipe is updated so user can start fresh
    setCookingMode(false)
    setCurrentStep(0)
    setCompletedSteps(new Set())
    setCheckedIngredients(new Set())
    setTimerActive(false)
    setTimerSeconds(null)
    if (onRecipeUpdated) {
      onRecipeUpdated(updatedRecipe)
    }
    
    // Show notification that recipe was updated
    if (wasInCookingMode) {
      setRecipeUpdateNotification({
        show: true,
        message: '✨ Recipe updated! Cooking mode has been reset. Click "Start Cooking" to begin with the new recipe.'
      })
      // Auto-hide notification after 8 seconds
      setTimeout(() => {
        setRecipeUpdateNotification({ show: false, message: '' })
      }, 8000)
    } else {
      setRecipeUpdateNotification({
        show: true,
        message: '✨ Recipe updated successfully!'
      })
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setRecipeUpdateNotification({ show: false, message: '' })
      }, 5000)
    }
    
    // Scroll to top to show the updated recipe
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Only close on mobile/tablet (when onClose is provided), keep open on desktop since sidebar is always visible
    if (externalSetShowAIChat && window.innerWidth < 1280) {
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
    <div className={`min-h-screen relative transition-colors duration-300 overflow-y-auto ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-white'}`} style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Recipe Update Notification */}
      <AnimatePresence>
        {recipeUpdateNotification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[200] max-w-md w-full mx-4"
          >
            <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 shadow-2xl backdrop-blur-xl ${
              isDark 
                ? 'bg-gradient-to-r from-primary-500/90 via-primary-600/90 to-primary-500/90 border-primary-400/50 text-white' 
                : 'bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 border-primary-400 text-white'
            }`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-base sm:text-lg">{recipeUpdateNotification.message}</p>
                </div>
                <button
                  onClick={() => setRecipeUpdateNotification({ show: false, message: '' })}
                  className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6 max-w-[1600px] mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        {/* Main Recipe Content */}
        <div className="flex-1 min-w-0 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2 sm:gap-3">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onBack()
            }}
            className={`flex items-center space-x-1.5 sm:space-x-2 transition-colors z-10 relative ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-black/60 hover:text-black'}`}
            style={{ touchAction: 'manipulation' }}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base">Back to recipes</span>
          </button>
          <div className="flex items-center space-x-2">
            {/* Save/Unsave Button */}
            {(onSave || onUnsave) && (
          <button
                onClick={async (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (saving) return
                  
                  setSaving(true)
                  try {
                    if (isSaved && onUnsave) {
                      await onUnsave()
                    } else if (!isSaved && onSave) {
                      await onSave()
                    }
                    // Small delay to show success feedback
                    await new Promise(resolve => setTimeout(resolve, 300))
                  } catch (error: any) {
                    console.error('Error in save button:', error)
                    alert(`Failed to save recipe: ${error?.message || 'Unknown error'}. Please check the browser console for details.`)
                  } finally {
                    setSaving(false)
                  }
                }}
                disabled={saving}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSaved
                    ? 'bg-primary-500/20 border border-primary-500/50 text-primary-300 hover:bg-primary-500/30'
                    : isDark
                    ? 'bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:border-primary-500/50 hover:bg-primary-500/10'
                    : 'bg-white border border-primary-200 text-black hover:border-primary-500/50 hover:bg-primary-50/50'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save recipe'}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Saving...</span>
                  </>
                ) : isSaved ? (
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
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                isDark
                  ? 'bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:border-primary-500/50 hover:bg-primary-500/10'
                  : 'bg-slate-100 border border-slate-300 text-slate-700 hover:border-primary-500/50 hover:bg-primary-500/10'
              }`}
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
            className="xl:hidden fixed bottom-8 right-8 z-50 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white p-5 rounded-full shadow-2xl premium-glow hover:scale-110 transition-all duration-300 group animate-pulse hover:animate-none"
            title="Modify recipe with AI"
          >
            <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-2 -right-2 w-3 h-3 bg-primary-400 rounded-full animate-ping"></span>
          </button>
        )}

        {/* Recipe Header */}
        <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 border transition-colors duration-300 ${
          isDark 
            ? 'glass-effect border-slate-800/80' 
            : 'bg-white border-primary-200/50'
        }`}>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-accent-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden border border-primary-500/20 relative">
                {currentRecipe.imageUrl ? (
                  <Image 
                    src={currentRecipe.imageUrl} 
                    alt={currentRecipe.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="128px"
                  />
                ) : (
                  <div className="text-4xl sm:text-5xl md:text-6xl">{currentRecipe.emoji}</div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-medium mb-2 sm:mb-3 transition-colors duration-300 ${isDark ? 'text-slate-100' : 'text-black'}`}>{currentRecipe.name}</h1>
              <p className={`text-base sm:text-lg mb-3 sm:mb-4 transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-black/80'}`}>{currentRecipe.description}</p>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                <div className={`flex items-center space-x-2 transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-black/70'}`}>
                  <Clock className="w-5 h-5 text-primary-400" />
                  <span className="font-medium">{currentRecipe.time}</span>
                </div>
                <div className={`flex items-center space-x-2 transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-black/70'}`}>
                  <Users className="w-5 h-5 text-primary-400" />
                  <span className="font-medium">
                    {servingMultiplier !== 1 
                      ? `${Math.round(parseFloat(currentRecipe.servings) * servingMultiplier)} servings`
                      : currentRecipe.servings
                    }
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 fill-primary-400 text-primary-400" />
                  <span className={`font-medium transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-black'}`}>{currentRecipe.rating}</span>
                </div>
                <div className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 text-primary-300 rounded-full text-sm font-medium">
                  {currentRecipe.difficulty}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {currentRecipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors duration-300 ${isDark ? 'bg-slate-800/60 text-slate-300 border-slate-700/50' : 'bg-primary-50 text-black border-primary-200'}`}
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
                    // Scroll to cooking steps after a brief delay to ensure DOM is updated
                    setTimeout(() => {
                      cookingStepsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      // Show AI help popup on first time entering cooking mode
                      if (!hasSeenAIHelp) {
                        setTimeout(() => {
                          setShowAIHelpPopup(true)
                          setHasSeenAIHelp(true)
                        }, 500)
                      }
                    }, 100)
                  }}
                  className="btn-primary flex items-center space-x-2 text-lg px-8 py-4"
                >
                  <UtensilsCrossed className="w-6 h-6" />
                  <span>Start Cooking</span>
                </button>
              )}

              {cookingMode && (
                <div className="flex items-center space-x-4 flex-wrap gap-3">
                  <div className="px-4 py-2 bg-primary-500/20 border border-primary-500/30 text-primary-300 rounded-xl font-medium flex items-center space-x-2">
                    <UtensilsCrossed className="w-5 h-5" />
                    <span>Cooking Mode Active</span>
            </div>
                  {!showAIChat && (
                    <button
                      onClick={() => setShowAIHelpPopup(true)}
                      className="px-4 py-2 bg-primary-500/20 border border-primary-500/30 text-primary-300 rounded-xl font-medium hover:bg-primary-500/30 transition-colors flex items-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline">Need Help?</span>
                      <span className="sm:hidden">Help</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setCookingMode(false)
                      setTimerActive(false)
                      setTimerSeconds(null)
                    }}
                    className={`px-4 py-2 border-2 rounded-xl font-medium transition-colors duration-300 ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800/60' : 'border-primary-300 text-black hover:bg-primary-50'}`}
                  >
                    Exit Cooking Mode
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border transition-colors duration-300 ${isDark ? 'glass-effect border-slate-800/80' : 'bg-white border-primary-200/50'}`}>
          <h2 className={`text-xl sm:text-2xl font-medium mb-3 sm:mb-4 flex items-center space-x-2 transition-colors duration-300 ${isDark ? 'text-slate-100' : 'text-black'}`}>
            {cookingMode ? (
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
            ) : (
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
            )}
            <span className="text-base sm:text-xl md:text-2xl font-medium">
              {cookingMode ? 'Get Your Ingredients' : 'Ingredients Needed'}
              {cookingMode && <span className={`hidden sm:inline text-sm ml-2 font-normal transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>(Check off as you gather)</span>}
            </span>
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
                      : isDark ? 'bg-slate-800/40 border-2 border-slate-700/50' : 'bg-white border-2 border-primary-200'
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
                        <Circle className={`w-6 h-6 transition-colors duration-300 ${isDark ? 'text-slate-500' : 'text-primary-400'}`} />
                      )}
                    </button>
                  ) : hasIt ? (
                    <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  ) : removedIngredients.has(index) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const newRemoved = new Set(removedIngredients)
                        newRemoved.delete(index)
                        setRemovedIngredients(newRemoved)
                      }}
                      className="flex-shrink-0 hover:scale-110 transition-transform"
                      title="Restore ingredient"
                    >
                      <XCircle className="w-5 h-5 text-red-400" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeIngredient(index, ingredient.name)
                      }}
                      className="flex-shrink-0 hover:scale-110 transition-transform"
                      title="Remove ingredient - Get alternatives"
                    >
                      <XCircle className={`w-5 h-5 hover:text-red-400 transition-colors duration-300 ${isDark ? 'text-slate-500' : 'text-primary-400'}`} />
                    </button>
                  )}
                  <div className="flex-1">
                    <span className={`font-medium text-lg transition-colors duration-300 ${
                      isChecked 
                        ? `line-through ${isDark ? 'text-slate-500' : 'text-black/40'}` 
                        : removedIngredients.has(index)
                        ? 'line-through text-red-400/60'
                        : hasIt 
                        ? (isDark ? 'text-slate-100' : 'text-black')
                        : (isDark ? 'text-slate-400' : 'text-black/60')
                    }`}>
                      {ingredient.name}
                    </span>
                    {ingredient.amount && (
                      <span className={`ml-2 text-base transition-colors duration-300 ${cookingMode ? 'font-medium' : ''} ${isDark ? 'text-slate-400' : 'text-black/60'}`}>
                        • {servingMultiplier !== 1 ? calculateAdjustedAmount(ingredient.amount) : ingredient.amount}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {cookingMode && (
            <div className={`mt-4 pt-4 border-t transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-primary-200'}`}>
              <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-black/70'}`}>
                Progress: {checkedIngredients.size} of {currentRecipe.ingredients.length} ingredients gathered
              </p>
              <div className={`mt-2 w-full rounded-full h-3 transition-colors duration-300 ${isDark ? 'bg-slate-800' : 'bg-primary-100'}`}>
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
          <div className={`rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 bg-gradient-to-br from-primary-500/10 via-primary-600/10 to-primary-700/10 border transition-colors duration-300 ${isDark ? 'glass-effect border-primary-500/20' : 'border-primary-200/50'}`}>
            <h2 className={`text-xl sm:text-2xl font-medium mb-3 sm:mb-4 flex items-center space-x-2 transition-colors duration-300 ${isDark ? 'text-slate-100' : 'text-black'}`}>
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
              <span>Quick Prep Guide for Busy Parents</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
              <div className={`p-3 sm:p-4 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-primary-200'}`}>
                <p className={`text-sm mb-1 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>Total Time</p>
                <p className={`text-xl sm:text-2xl font-medium transition-colors duration-300 ${isDark ? 'text-slate-100' : 'text-black'}`}>{currentRecipe.time}</p>
                  </div>
              <div className={`p-3 sm:p-4 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-primary-200'}`}>
                <p className={`text-sm mb-1 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>Difficulty</p>
                <p className={`text-xl sm:text-2xl font-medium transition-colors duration-300 ${isDark ? 'text-slate-100' : 'text-black'}`}>{currentRecipe.difficulty}</p>
                </div>
              <div className={`p-3 sm:p-4 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-primary-200'}`}>
                <p className={`text-sm mb-1 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>Servings</p>
                <p className={`text-xl sm:text-2xl font-medium transition-colors duration-300 ${isDark ? 'text-slate-100' : 'text-black'}`}>{currentRecipe.servings}</p>
              </div>
            </div>
            <div className={`p-4 sm:p-5 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-primary-200'}`}>
              <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-slate-100' : 'text-black'}`}>💡 Parent Tips:</p>
              <ul className={`space-y-1 text-sm transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-black/80'}`}>
                <li>• Gather all ingredients first to save time</li>
                <li>• Most steps can be done while multitasking</li>
                <li>• Use cooking mode for step-by-step guidance</li>
                <li>• Adjust servings using the +/- buttons above</li>
              </ul>
              {/* Presentation Tips - Added under Parent Tips */}
              {!cookingMode && currentRecipe.presentationTips && currentRecipe.presentationTips.length > 0 && (
                <div className={`mt-4 pt-4 border-t transition-colors duration-300 ${isDark ? 'border-slate-700/50' : 'border-primary-200'}`}>
                  <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-slate-100' : 'text-black'}`}>✨ Make It Look Amazing:</p>
                  <ul className={`space-y-1 text-sm transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-black/80'}`}>
                    {currentRecipe.presentationTips.map((tip, index) => (
                      <li key={index}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Start Cooking Button after Quick Prep Guide */}
            <div className="mt-6">
              <button
                onClick={() => {
                  setCookingMode(true)
                  setCurrentStep(0)
                  setCompletedSteps(new Set())
                  setCheckedIngredients(new Set())
                  // Scroll to cooking steps after a brief delay to ensure DOM is updated
                  setTimeout(() => {
                    cookingStepsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    // Show AI help popup on first time entering cooking mode
                    if (!hasSeenAIHelp) {
                      setTimeout(() => {
                        setShowAIHelpPopup(true)
                        setHasSeenAIHelp(true)
                      }, 500)
                    }
                  }, 100)
                }}
                className="btn-primary flex items-center justify-center space-x-2 text-lg px-8 py-4 w-full"
              >
                <UtensilsCrossed className="w-6 h-6" />
                <span>Start Cooking</span>
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border transition-colors duration-300 ${isDark ? 'glass-effect border-slate-800/80' : 'bg-white border-primary-200/50'}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <h2 className={`text-xl sm:text-2xl font-medium flex items-center space-x-2 transition-colors duration-300 ${isDark ? 'text-slate-100' : 'text-black'}`}>
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
                  <div key={idx} className={`flex items-center space-x-1 px-2 py-1 rounded-lg border transition-colors duration-300 ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-primary-50 border-primary-200'}`}>
                    {type === 'cut' && <span className="text-sm">🔪</span>}
                    {type === 'mix' && <RotateCw className="w-3 h-3 text-purple-400" />}
                    {type === 'cook' && <Flame className="w-3 h-3 text-orange-400" />}
                    {type === 'wash' && <Droplets className="w-3 h-3 text-cyan-400" />}
                    <span className={`text-xs capitalize transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-black'}`}>{type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visual Step Flow Overview */}
          {!cookingMode && (
            <div className={`mb-6 p-4 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-primary-50/50 border-primary-200'}`}>
              <p className={`text-sm mb-3 font-medium text-center transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-black'}`}>Recipe Flow:</p>
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 overflow-x-auto pb-2">
                {currentRecipe.instructions.map((instruction, index) => {
                  const isCompleted = completedSteps.has(index)
                  const isCurrent = currentStep === index
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all font-medium text-sm sm:text-base ${
                        isCompleted
                          ? 'bg-primary-500 text-white'
                          : isCurrent
                          ? `bg-gradient-to-br ${getStepColor(instruction.step)} text-white ring-2 ring-primary-400`
                          : isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                      }`}
                      title={instruction.step.substring(0, 50) + '...'}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Enhanced Timer Widget - Always Available */}
          <div className="mb-4 sm:mb-6">
            {timerSeconds !== null ? (
              // Active Timer Display
              <div className="p-4 sm:p-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl sm:rounded-2xl text-white shadow-2xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Timer className="w-6 h-6 sm:w-8 sm:h-8" />
                    <div>
                      <p className="text-xs sm:text-sm opacity-90">Cooking Timer</p>
                      <p className={`text-3xl sm:text-4xl font-medium ${timerSeconds === 0 ? 'animate-pulse' : ''}`}>
                        {formatTime(timerSeconds)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {timerActive ? (
                      <button
                        onClick={() => setTimerActive(false)}
                        className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl transition-colors"
                        title="Pause timer"
                      >
                        <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    ) : (
                      <button
                        onClick={() => timerSeconds > 0 && setTimerActive(true)}
                        className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50"
                        title="Resume timer"
                        disabled={timerSeconds === 0}
                      >
                        <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const timeInSeconds = currentRecipe.instructions[currentStep] ? extractTimeFromStep(currentRecipe.instructions[currentStep].step) : null
                        if (timeInSeconds) {
                          setTimerSeconds(timeInSeconds)
                          setTimerActive(false)
                        } else {
                          setTimerSeconds(5 * 60) // Default to 5 minutes if no time found
                          setTimerActive(false)
                        }
                      }}
                      className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl transition-colors"
                      title="Reset timer"
                    >
                      <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button
                      onClick={() => {
                        setTimerSeconds(null)
                        setTimerActive(false)
                      }}
                      className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl transition-colors"
                      title="Close timer"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                </div>
                {timerSeconds === 0 && (
                  <div className="mt-3 sm:mt-4 p-3 bg-white/20 rounded-lg text-center animate-pulse">
                    <p className="font-medium text-base sm:text-lg">⏰ Time's up! Move to next step.</p>
                  </div>
                )}
              </div>
            ) : (
              // No Timer - Show Start Timer Button if step has time, otherwise show Quick Timer Options
              cookingMode && currentRecipe.instructions[currentStep] && extractTimeFromStep(currentRecipe.instructions[currentStep].step) ? (
                <div className={`p-4 sm:p-6 border rounded-xl sm:rounded-2xl text-center transition-colors duration-300 ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-primary-200'}`}>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
                    <h3 className={`text-lg sm:text-xl font-medium transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}>Ready to Start?</h3>
                  </div>
                  <p className={`text-sm mb-4 transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-black/70'}`}>This step has a timer. Click start when you're ready!</p>
                  <button
                    onClick={() => currentRecipe.instructions[currentStep] && startTimerForStep(currentRecipe.instructions[currentStep].step)}
                    className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Timer className="w-5 h-5" />
                    <span>Start Timer</span>
                  </button>
                </div>
              ) : (
                <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border transition-colors duration-300 ${isDark ? 'glass-effect border-slate-800/50' : 'bg-white border-primary-200'}`}>
                  <div className="flex items-center space-x-2 mb-4">
                    <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
                    <h3 className={`text-lg sm:text-xl font-medium transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`}>Quick Timer</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {presetTimers.map((minutes) => (
                      <button
                        key={minutes}
                        onClick={() => startCustomTimer(minutes)}
                        className={`px-4 py-2 border rounded-lg font-medium hover:border-primary-500/50 hover:bg-primary-500/10 transition-all duration-300 ${isDark ? 'bg-slate-800/60 border-slate-700/50 text-slate-200' : 'bg-white border-primary-200 text-black'}`}
                      >
                        {minutes} min
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
          
          <div className="space-y-4">
            {cookingMode && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-gradient-to-r from-primary-500/20 via-primary-600/20 to-primary-500/20 border border-primary-500/30 rounded-xl"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary-500/30 rounded-lg">
                    <UtensilsCrossed className="w-5 h-5 text-primary-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white mb-1">Guided Cooking Mode</h3>
                    <p className={`text-xs transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-black/70'}`}>
                      Follow each step one at a time. Use the timer for steps that need timing. Click "Next" when you're done with each step.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            <AnimatePresence mode="wait">
              {cookingMode && currentRecipe.instructions[currentStep] ? (
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
                      <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${currentRecipe.instructions[currentStep] ? getStepColor(currentRecipe.instructions[currentStep].step) : 'from-primary-500 to-primary-600'} text-white mb-2 sm:mb-4 premium-glow relative`}>
                        <div className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl">
                          {currentRecipe.instructions[currentStep] ? getStepIcon(currentRecipe.instructions[currentStep].step) : '🍳'}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-primary-500 flex items-center justify-center text-xs sm:text-sm font-medium transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                          {currentStep + 1}
                        </div>
                      </div>
                    </div>
                    
                    {/* Visual Food Preparation */}
                    {currentRecipe.instructions[currentStep] && getStepVisuals(currentRecipe.instructions[currentStep].step).length > 0 && (
                      <div className={`mb-6 p-6 rounded-xl border-2 border-primary-500/20 shadow-lg transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80' : 'bg-gradient-to-br from-primary-50 to-primary-100/50'}`}>
                        <p className="text-center text-sm text-primary-300 mb-4 font-medium uppercase tracking-wide">Visual Preparation Guide</p>
                        <div className="flex items-center justify-center space-x-2 sm:space-x-3 text-3xl sm:text-4xl md:text-5xl mb-2 flex-wrap">
                          {getStepVisuals(currentRecipe.instructions[currentStep].step).map((visual, idx) => (
                            <div key={idx} className="flex items-center space-x-1">
                              <span className="font-mono leading-none">{visual}</span>
                              {idx < getStepVisuals(currentRecipe.instructions[currentStep].step).length - 1 && (
                                <span className={`text-2xl sm:text-3xl mx-1 sm:mx-2 transition-colors duration-300 ${isDark ? 'text-slate-500' : 'text-primary-400'}`}>+</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className={`text-center text-xs mt-2 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>See how the ingredients transform</p>
                      </div>
                    )}
                    
                    {/* Step Text */}
                    <p className={`text-xl sm:text-2xl md:text-3xl font-normal leading-relaxed mb-4 sm:mb-6 px-2 transition-colors duration-300 ${isDark ? 'text-slate-100' : 'text-black'}`}>
                      {currentRecipe.instructions[currentStep]?.step || 'No step available'}
                    </p>
                    
                    {/* Show final result preview on last step - Enhanced with AI-generated image */}
                    {currentStep === currentRecipe.instructions.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-4 sm:mb-6 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-primary-500/20 rounded-xl sm:rounded-2xl border-2 border-primary-500/40 shadow-2xl"
                      >
                        <div className="text-center mb-4 sm:mb-6">
                          <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-primary-300 mb-2 uppercase tracking-wide">
                            🎉 Final Result Preview
                          </h3>
                          <p className={`text-xs sm:text-sm transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-black/70'}`}>This is what your {currentRecipe.name} will look like when done!</p>
                        </div>
                        {currentRecipe.imageUrl ? (
                          <div className="w-full max-w-2xl mx-auto mb-4 relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-2 border-primary-500/30">
                            <Image 
                              src={currentRecipe.imageUrl} 
                              alt={`Final result: ${currentRecipe.name}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 800px"
                              priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center space-y-4 py-8">
                            <div className="flex items-center justify-center space-x-4">
                              <div className="text-6xl sm:text-7xl md:text-8xl">{currentRecipe.emoji}</div>
                              {currentRecipe.presentationTips && currentRecipe.presentationTips.length > 0 && (
                                <>
                                  <span className="text-4xl sm:text-5xl text-primary-400">+</span>
                                  <div className="text-5xl sm:text-6xl animate-pulse">✨</div>
                                </>
                              )}
                            </div>
                            <p className={`text-sm sm:text-base italic transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>AI image generating...</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                    
                    {/* Visual Progress Bar */}
                    <div className="w-full max-w-md mx-auto mb-6">
                      <div className={`flex items-center justify-between text-sm mb-2 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>
                        <span>Step {currentStep + 1} of {currentRecipe.instructions.length}</span>
                        <span>{Math.round(((currentStep + 1) / currentRecipe.instructions.length) * 100)}%</span>
                      </div>
                      <div className={`w-full rounded-full h-3 overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-800' : 'bg-primary-100'}`}>
                        <div 
                          className={`h-full bg-gradient-to-r ${currentRecipe.instructions[currentStep] ? getStepColor(currentRecipe.instructions[currentStep].step) : 'from-primary-500 to-primary-600'} transition-all duration-500`}
                          style={{ width: `${((currentStep + 1) / currentRecipe.instructions.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    {currentRecipe.instructions[currentStep]?.tip && (
                      <div className="mt-6 p-4 bg-primary-500/20 border-2 border-primary-500/40 rounded-xl">
                        <p className={`text-xl transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-black'}`}>
                          <strong className="text-primary-300">💡 Pro Tip:</strong> {currentRecipe.instructions[currentStep].tip}
                        </p>
                      </div>
                    )}
                    {currentRecipe.instructions[currentStep] && extractTimeFromStep(currentRecipe.instructions[currentStep].step) && timerSeconds === null && (
                      <button
                        onClick={() => currentRecipe.instructions[currentStep] && startTimerForStep(currentRecipe.instructions[currentStep].step)}
                        className="mt-4 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors flex items-center space-x-2 mx-auto"
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
                          : isDark ? 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600/50' : 'bg-white border-primary-200 hover:border-primary-300'
                    }`}
                    onClick={() => toggleStep(index)}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-medium text-lg bg-gradient-to-br ${getStepColor(instruction.step)} text-white relative ${
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
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-xs transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                            {index + 1}
                          </div>
                      </div>
                      <div className="flex-1">
                          {/* Visual Food Preparation for each step */}
                          {getStepVisuals(instruction.step).length > 0 && (
                            <div className={`mb-3 p-3 rounded-lg border border-primary-500/20 transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-slate-800/60 to-slate-800/40' : 'bg-gradient-to-r from-primary-50 to-primary-100/50'}`}>
                              <div className="flex items-center space-x-2 text-2xl">
                                {getStepVisuals(instruction.step).map((visual, idx) => (
                                  <span key={idx} className="font-mono leading-none">{visual}</span>
                                ))}
                              </div>
                              <p className={`text-xs mt-1 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>Visual guide</p>
                            </div>
                          )}
                          <p className={`text-lg font-medium transition-colors duration-300 ${isCompleted ? `line-through ${isDark ? 'text-slate-500' : 'text-black/40'}` : (isDark ? 'text-slate-200' : 'text-black')}`}>
                          {instruction.step}
                        </p>
                        {instruction.tip && (
                            <div className="mt-2 p-3 bg-primary-500/20 border border-primary-500/30 rounded-lg">
                              <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-black/80'}`}>
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
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-primary-200'}`}>
            <button
              onClick={() => {
                setCurrentStep(Math.max(0, currentStep - 1))
                if (cookingMode) {
                  setTimerActive(false)
                  setTimerSeconds(null)
                }
              }}
              disabled={currentStep === 0}
              className={`w-full sm:w-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl border-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base ${
                cookingMode ? 'md:text-lg lg:text-xl' : ''
              } ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800/60' : 'border-primary-300 text-black hover:bg-primary-50'}`}
            >
              ← Previous
            </button>
            <div className="text-center w-full sm:w-auto">
              <span className={`font-medium text-sm sm:text-base transition-colors duration-300 ${cookingMode ? 'md:text-lg lg:text-xl' : ''} ${isDark ? 'text-slate-300' : 'text-black'}`}>
              Step {currentStep + 1} of {currentRecipe.instructions.length}
            </span>
              {cookingMode && (
                <div className={`mt-2 w-full sm:w-64 mx-auto rounded-full h-2 transition-colors duration-300 ${isDark ? 'bg-slate-800' : 'bg-primary-100'}`}>
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
              className={`w-full sm:w-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-primary-600 hover:to-primary-700 transition-colors shadow-lg hover:shadow-primary-500/25 text-sm sm:text-base ${
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
                  <div className="w-full max-w-md mx-auto mb-3 sm:mb-4 relative aspect-video">
                    <Image 
                      src={currentRecipe.imageUrl} 
                      alt={currentRecipe.name}
                      fill
                      className="object-cover rounded-xl shadow-2xl border-2 sm:border-4 border-white/20"
                      sizes="(max-width: 768px) 100vw, 512px"
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
              <h3 className="text-2xl sm:text-3xl font-medium mb-2">🎉 Recipe Complete!</h3>
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
              
              {/* Presentation Tips - Show in cooking mode after completion */}
              {currentRecipe.presentationTips && currentRecipe.presentationTips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 sm:mt-8 glass-effect rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-primary-500/20 border-2 border-primary-500/40 shadow-xl"
                >
                  <h2 className={`text-xl sm:text-2xl font-medium mb-4 flex items-center space-x-2 transition-colors duration-300 ${isDark ? 'text-slate-100' : 'text-black'}`}>
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
                    <span>Make It Look Amazing! (Quick & Easy)</span>
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    {currentRecipe.presentationTips.map((tip, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-start space-x-3 sm:space-x-4"
                      >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center flex-shrink-0 text-sm sm:text-base font-medium shadow-lg">
                          {index + 1}
                        </div>
                        <p className={`flex-1 text-sm sm:text-base leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-200' : 'text-black'}`}>{tip}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Nutritional Info */}
        {currentRecipe.nutrition && (
          <div className={`rounded-2xl p-6 border transition-colors duration-300 ${isDark ? 'glass-effect border-slate-800/80' : 'bg-white border-primary-200/50'}`}>
            <h2 className={`text-2xl font-medium mb-4 transition-colors duration-300 ${isDark ? 'text-slate-100' : 'text-black'}`}>Nutritional Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(currentRecipe.nutrition).map(([key, value]) => (
                <div key={key} className={`text-center p-4 border rounded-xl transition-colors duration-300 ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-primary-200'}`}>
                  <div className="text-2xl font-medium text-primary-400">{value}</div>
                  <div className={`text-sm capitalize transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>{key}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

        {/* AI Chat Sidebar - Always Visible on Desktop */}
        <div className="hidden xl:block w-full xl:w-80 2xl:w-96 flex-shrink-0 relative">
          <div className="sticky top-4 sm:top-8 h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)]">
            <div className={`h-full backdrop-blur-xl border rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-900/95 border-slate-800/50' : 'bg-white border-primary-200'}`}>
              <AIChat
                onRecipeGenerated={handleRecipeUpdated}
                currentRecipe={currentRecipe}
                availableIngredients={availableIngredients.filter((_, idx) => !removedIngredients.has(idx))}
                userPreferences={userPreferences}
                onClose={undefined}
                removedIngredients={Array.from(removedIngredients).map(idx => currentRecipe.ingredients[idx]?.name).filter(Boolean)}
                autoSendMessage={autoSendMessage}
              />
            </div>
          </div>
          
        </div>

        {/* Tablet & Mobile AI Chat Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('AI Chat button clicked, current state:', showAIChat)
            setShowAIChat(true)
            console.log('Set showAIChat to true')
          }}
          className="xl:hidden fixed bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 z-[100] bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white p-3 sm:p-4 md:p-5 rounded-full shadow-2xl premium-glow hover:scale-110 active:scale-95 transition-all duration-300 touch-manipulation cursor-pointer"
          title="Open AI Assistant"
          type="button"
        >
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 pointer-events-none" />
        </button>

        {/* Tablet & Mobile AI Chat Sidebar */}
        <div className={`xl:hidden fixed right-0 top-0 h-full z-[90] transition-transform duration-300 ease-in-out ${
          showAIChat ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className={`h-full w-full sm:max-w-sm md:max-w-md lg:max-w-lg backdrop-blur-xl border-l shadow-2xl transition-colors duration-300 ${isDark ? 'bg-slate-900/95 border-slate-800/50' : 'bg-white border-primary-200'}`}>
            <AIChat
              onRecipeGenerated={handleRecipeUpdated}
              currentRecipe={currentRecipe}
              availableIngredients={availableIngredients.filter((_, idx) => !removedIngredients.has(idx))}
              userPreferences={userPreferences}
              onClose={() => setShowAIChat(false)}
              removedIngredients={Array.from(removedIngredients).map(idx => currentRecipe.ingredients[idx]?.name).filter(Boolean)}
              autoSendMessage={autoSendMessage}
            />
          </div>
        </div>
        {showAIChat && (
          <div 
            className="xl:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowAIChat(false)
            }}
          />
        )}
      </div>

      {/* Floating Magic Button in Cooking Mode (Tablet & Mobile Only) */}
      {cookingMode && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('Cooking mode AI button clicked')
            setShowAIChat(true)
          }}
          className="xl:hidden fixed bottom-16 sm:bottom-20 md:bottom-24 right-4 sm:right-6 md:right-8 z-[100] bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white p-4 sm:p-5 md:p-6 rounded-full shadow-2xl premium-glow hover:scale-110 active:scale-95 transition-all duration-300 group animate-pulse hover:animate-none touch-manipulation cursor-pointer"
          title="Modify recipe with AI"
          type="button"
        >
          <Wand2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:rotate-12 transition-transform pointer-events-none" />
          <span className="absolute -top-2 -right-2 w-3 h-3 bg-primary-400 rounded-full animate-ping pointer-events-none"></span>
        </button>
      )}

      {/* AI Help Popup */}
      <AnimatePresence>
        {showAIHelpPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowAIHelpPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect rounded-2xl sm:rounded-3xl border border-primary-500/30 p-6 sm:p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary-500/20 rounded-xl">
                    <Sparkles className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-white">AI Recipe Assistant</h3>
                    <p className="text-sm text-slate-400">I can help you modify recipes!</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIHelpPopup(false)}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
                  <p className="text-sm text-slate-200 mb-3">
                    <strong className="text-primary-300">💡 What I can do:</strong>
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start space-x-2">
                      <span className="text-primary-400">•</span>
                      <span>Modify ingredients (e.g., "change chicken to turkey")</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-primary-400">•</span>
                      <span>Adjust steps (e.g., "break step 2 into two steps")</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-primary-400">•</span>
                      <span>Make dietary changes (e.g., "make it vegan")</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-primary-400">•</span>
                      <span>Answer cooking questions</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAIHelpPopup(false)
                    setShowAIChat(true)
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Open AI Chat</span>
                </button>
                <button
                  onClick={() => setShowAIHelpPopup(false)}
                  className="px-6 py-3 border border-slate-700 text-slate-300 rounded-xl font-medium hover:bg-slate-800/60 transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Timer Picker Modal */}
      <AnimatePresence>
        {showTimerPicker && timerPickerStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => {
              setShowTimerPicker(false)
              setTimerPickerStep(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect rounded-2xl sm:rounded-3xl border border-primary-500/30 p-6 sm:p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary-500/20 rounded-xl">
                    <Timer className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-white">Choose Timer Duration</h3>
                    <p className="text-sm text-slate-400">Select how long you want to wait</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowTimerPicker(false)
                    setTimerPickerStep(null)
                  }}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {getTimerOptions(timerPickerStep).map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => startTimerWithMinutes(minutes)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-primary-500/20 to-primary-600/20 border-2 border-primary-500/30 text-white rounded-xl font-medium hover:border-primary-500/60 hover:from-primary-500/30 hover:to-primary-600/30 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary-500/30 flex items-center justify-center group-hover:bg-primary-500/50 transition-colors">
                        <Timer className="w-5 h-5 text-primary-300" />
                      </div>
                      <span className="text-lg">{minutes} {minutes === 1 ? 'minute' : 'minutes'}</span>
                    </div>
                    <Play className="w-5 h-5 text-primary-400 group-hover:text-primary-300 transition-colors" />
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <p className="text-xs text-slate-400 text-center">
                  💡 The timer will sound when it's done, so you know when to take your food out!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

