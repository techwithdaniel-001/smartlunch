'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Users, Baby, Heart, AlertCircle, ChefHat, Check, CheckCircle2, Target, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { saveUserPreferences, UserPreferences } from '@/lib/firestore'
import Image from 'next/image'

interface OnboardingProps {
  onComplete: () => void
}

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Kosher',
  'Halal',
  'Low-Carb',
  'Keto',
  'Paleo'
]

const ALLERGY_OPTIONS = [
  'Peanuts',
  'Tree Nuts',
  'Dairy',
  'Eggs',
  'Fish',
  'Shellfish',
  'Soy',
  'Wheat',
  'Sesame',
  'Other'
]

const KITCHEN_EQUIPMENT = [
  { id: 'oven', label: 'Oven', description: 'For baking and roasting' },
  { id: 'stovetop', label: 'Stovetop', description: 'Gas or electric burner' },
  { id: 'microwave', label: 'Microwave', description: 'Quick heating' },
  { id: 'toaster', label: 'Toaster', description: 'For toasting bread' },
  { id: 'air_fryer', label: 'Air Fryer', description: 'Healthier frying option' },
  { id: 'slow_cooker', label: 'Slow Cooker', description: 'Crockpot for slow cooking' },
  { id: 'instant_pot', label: 'Instant Pot', description: 'Pressure cooker' },
  { id: 'blender', label: 'Blender', description: 'For smoothies and purees' },
  { id: 'food_processor', label: 'Food Processor', description: 'For chopping and mixing' },
  { id: 'grill', label: 'Grill', description: 'Outdoor or indoor grill' },
  { id: 'rice_cooker', label: 'Rice Cooker', description: 'For perfect rice' },
  { id: 'steamer', label: 'Steamer', description: 'For steaming vegetables' },
]

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  const [step, setStep] = useState(1)
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietaryRestrictions: [],
    allergies: [],
    numberOfPeople: 2,
    hasKids: false,
    hasPartner: false,
    kidsAges: [],
    preferences: [],
    kitchenEquipment: [],
    healthGoals: [],
    theme: 'light'
  })
  const [customAllergy, setCustomAllergy] = useState('')
  const [customDietary, setCustomDietary] = useState('')
  const [saving, setSaving] = useState(false)

  const totalSteps = 7

  const HEALTH_GOALS = [
    'Eat more vegetables',
    'Increase protein intake',
    'More balanced meals',
    'Weight management',
    'Build healthy habits',
    'Energy boost',
    'Better nutrition for kids'
  ]

  const handleThemeSelect = (selectedTheme: 'light' | 'dark') => {
    setPreferences(prev => ({ ...prev, theme: selectedTheme }))
    setTheme(selectedTheme)
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      await saveUserPreferences(user.uid, {
        ...preferences,
        onboardingCompleted: true
      })
      onComplete()
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Failed to save preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const toggleDietaryRestriction = (restriction: string) => {
    setPreferences(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }))
  }

  const toggleAllergy = (allergy: string) => {
    setPreferences(prev => ({
      ...prev,
      allergies: prev.allergies?.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...(prev.allergies || []), allergy]
    }))
  }

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !preferences.allergies?.includes(customAllergy.trim())) {
      setPreferences(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), customAllergy.trim()]
      }))
      setCustomAllergy('')
    }
  }

  const addCustomDietary = () => {
    if (customDietary.trim() && !preferences.dietaryRestrictions.includes(customDietary.trim())) {
      setPreferences(prev => ({
        ...prev,
        dietaryRestrictions: [...prev.dietaryRestrictions, customDietary.trim()]
      }))
      setCustomDietary('')
    }
  }

  const toggleKitchenEquipment = (equipmentId: string) => {
    setPreferences(prev => ({
      ...prev,
      kitchenEquipment: prev.kitchenEquipment?.includes(equipmentId)
        ? prev.kitchenEquipment.filter(e => e !== equipmentId)
        : [...(prev.kitchenEquipment || []), equipmentId]
    }))
  }

  const toggleHealthGoal = (goal: string) => {
    setPreferences(prev => ({
      ...prev,
      healthGoals: prev.healthGoals?.includes(goal)
        ? prev.healthGoals.filter(g => g !== goal)
        : [...(prev.healthGoals || []), goal]
    }))
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-white'}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-2xl sm:rounded-3xl border border-primary-500/30 p-4 sm:p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-colors duration-300 ${isDark ? 'glass-effect' : 'bg-white'}`}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 relative">
            <Image
              src="/assets/smartlunchlogo.png"
              alt="Smart Lunch Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h2 className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Welcome to Smart Lunch! 👋
          </h2>
          <p className={`text-sm sm:text-base transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Let's personalize your experience (Step {step} of {totalSteps})
          </p>
          {/* Progress Bar */}
          <div className={`mt-4 h-2 rounded-full overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-800/50' : 'bg-slate-200'}`}>
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Theme Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  {preferences.theme === 'dark' ? (
                    <Moon className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                  ) : (
                    <Sun className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                  )}
                  <h3 className="text-xl font-bold text-white mb-2">Choose Your Theme</h3>
                  <p className="text-slate-400 text-sm">Pick a theme that's comfortable for you. You can change this anytime in settings.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleThemeSelect('light')}
                    className={`group relative flex flex-col items-center justify-center space-y-3 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      preferences.theme === 'light'
                        ? 'bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-primary-500/20 border-primary-500/60 shadow-lg shadow-primary-500/20'
                        : 'bg-slate-800/40 border-slate-700/50 hover:border-primary-500/40 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg border-2 transition-all duration-300 ${
                      preferences.theme === 'light'
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-400 shadow-lg shadow-primary-500/30'
                        : 'bg-slate-800/60 border-slate-600 group-hover:border-primary-500/50'
                    }`}>
                      {preferences.theme === 'light' && (
                        <Check className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <Sun className="w-10 h-10 text-primary-400" />
                    <span className={`text-base font-medium transition-colors ${
                      preferences.theme === 'light' ? 'text-white' : 'text-slate-300 group-hover:text-slate-200'
                    }`}>Light</span>
                    <p className={`text-xs text-center transition-colors ${
                      preferences.theme === 'light' ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-400'
                    }`}>Clean and bright</p>
                  </button>
                  <button
                    onClick={() => handleThemeSelect('dark')}
                    className={`group relative flex flex-col items-center justify-center space-y-3 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      preferences.theme === 'dark'
                        ? 'bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-primary-500/20 border-primary-500/60 shadow-lg shadow-primary-500/20'
                        : 'bg-slate-800/40 border-slate-700/50 hover:border-primary-500/40 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg border-2 transition-all duration-300 ${
                      preferences.theme === 'dark'
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-400 shadow-lg shadow-primary-500/30'
                        : 'bg-slate-800/60 border-slate-600 group-hover:border-primary-500/50'
                    }`}>
                      {preferences.theme === 'dark' && (
                        <Check className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <Moon className="w-10 h-10 text-primary-400" />
                    <span className={`text-base font-medium transition-colors ${
                      preferences.theme === 'dark' ? 'text-white' : 'text-slate-300 group-hover:text-slate-200'
                    }`}>Dark</span>
                    <p className={`text-xs text-center transition-colors ${
                      preferences.theme === 'dark' ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-400'
                    }`}>Easy on the eyes</p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Number of People */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Users className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">How many people are you cooking for?</h3>
                  <p className="text-slate-400 text-sm">This helps us adjust serving sizes</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <button
                      key={num}
                      onClick={() => setPreferences(prev => ({ ...prev, numberOfPeople: num }))}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        preferences.numberOfPeople === num
                          ? 'border-primary-500 bg-primary-500/20 text-white'
                          : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-primary-500/50'
                      }`}
                    >
                      <div className="text-2xl font-bold">{num}</div>
                      <div className="text-xs mt-1">{num === 1 ? 'person' : 'people'}</div>
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  <label 
                    className={`group relative flex items-center space-x-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      preferences.hasPartner
                        ? 'bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-primary-500/20 border-primary-500/60 shadow-lg shadow-primary-500/20'
                        : 'bg-slate-800/40 border-slate-700/50 hover:border-primary-500/40 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className={`relative flex items-center justify-center w-6 h-6 rounded-lg border-2 transition-all duration-300 ${
                      preferences.hasPartner
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-400 shadow-lg shadow-primary-500/30'
                        : 'bg-slate-800/60 border-slate-600 group-hover:border-primary-500/50'
                    }`}>
                      {preferences.hasPartner && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-white"
                        >
                          <Check className="w-4 h-4" />
                        </motion.div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 flex-1">
                      <Heart className={`w-5 h-5 transition-colors ${
                        preferences.hasPartner ? 'text-primary-400' : 'text-slate-500 group-hover:text-primary-500/70'
                      }`} />
                      <span className={`font-medium transition-colors ${
                        preferences.hasPartner ? 'text-white' : 'text-slate-300 group-hover:text-slate-200'
                      }`}>
                        I'm cooking for a partner/spouse
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.hasPartner}
                      onChange={(e) => setPreferences(prev => ({ ...prev, hasPartner: e.target.checked }))}
                      className="sr-only"
                    />
                  </label>
                  <label 
                    className={`group relative flex items-center space-x-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      preferences.hasKids
                        ? 'bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-primary-500/20 border-primary-500/60 shadow-lg shadow-primary-500/20'
                        : 'bg-slate-800/40 border-slate-700/50 hover:border-primary-500/40 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className={`relative flex items-center justify-center w-6 h-6 rounded-lg border-2 transition-all duration-300 ${
                      preferences.hasKids
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-400 shadow-lg shadow-primary-500/30'
                        : 'bg-slate-800/60 border-slate-600 group-hover:border-primary-500/50'
                    }`}>
                      {preferences.hasKids && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-white"
                        >
                          <Check className="w-4 h-4" />
                        </motion.div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 flex-1">
                      <Baby className={`w-5 h-5 transition-colors ${
                        preferences.hasKids ? 'text-primary-400' : 'text-slate-500 group-hover:text-primary-500/70'
                      }`} />
                      <span className={`font-medium transition-colors ${
                        preferences.hasKids ? 'text-white' : 'text-slate-300 group-hover:text-slate-200'
                      }`}>
                        I'm cooking for kids
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.hasKids}
                      onChange={(e) => setPreferences(prev => ({ ...prev, hasKids: e.target.checked }))}
                      className="sr-only"
                    />
                  </label>
                </div>
                {preferences.hasKids && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Kids' ages (comma-separated, e.g., "5, 8, 12")
                    </label>
                    <input
                      type="text"
                      value={preferences.kidsAges?.join(', ') || ''}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        kidsAges: e.target.value.split(',').map(a => a.trim()).filter(a => a)
                      }))}
                      placeholder="e.g., 5, 8, 12"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Dietary Restrictions */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Heart className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Any dietary restrictions?</h3>
                  <p className="text-slate-400 text-sm">Select all that apply</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {DIETARY_OPTIONS.map(option => (
                    <label
                      key={option}
                      className={`group relative flex items-center space-x-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        preferences.dietaryRestrictions.includes(option)
                          ? 'bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-primary-500/20 border-primary-500/60 shadow-lg shadow-primary-500/20'
                          : 'bg-slate-800/40 border-slate-700/50 hover:border-primary-500/40 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className={`relative flex items-center justify-center w-5 h-5 rounded-lg border-2 transition-all duration-300 flex-shrink-0 ${
                        preferences.dietaryRestrictions.includes(option)
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-400 shadow-lg shadow-primary-500/30'
                          : 'bg-slate-800/60 border-slate-600 group-hover:border-primary-500/50'
                      }`}>
                        {preferences.dietaryRestrictions.includes(option) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-white"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </motion.div>
                        )}
                      </div>
                      <span className={`text-sm font-medium transition-colors flex-1 ${
                        preferences.dietaryRestrictions.includes(option) ? 'text-white' : 'text-slate-300 group-hover:text-slate-200'
                      }`}>{option}</span>
                      <input
                        type="checkbox"
                        checked={preferences.dietaryRestrictions.includes(option)}
                        onChange={() => toggleDietaryRestriction(option)}
                        className="sr-only"
                      />
                    </label>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customDietary}
                    onChange={(e) => setCustomDietary(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomDietary()}
                    placeholder="Add custom dietary restriction..."
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
                  />
                  <button
                    onClick={addCustomDietary}
                    className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Health Goals */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Target className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">What are your health goals?</h3>
                  <p className="text-slate-400 text-sm">We'll tailor recipes to help you achieve them</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {HEALTH_GOALS.map(goal => (
                    <label
                      key={goal}
                      className={`group relative flex items-center space-x-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        preferences.healthGoals?.includes(goal)
                          ? 'bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-primary-500/20 border-primary-500/60 shadow-lg shadow-primary-500/20'
                          : 'bg-slate-800/40 border-slate-700/50 hover:border-primary-500/40 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className={`relative flex items-center justify-center w-5 h-5 rounded-lg border-2 transition-all duration-300 flex-shrink-0 ${
                        preferences.healthGoals?.includes(goal)
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-400 shadow-lg shadow-primary-500/30'
                          : 'bg-slate-800/60 border-slate-600 group-hover:border-primary-500/50'
                      }`}>
                        {preferences.healthGoals?.includes(goal) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-white"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </motion.div>
                        )}
                      </div>
                      <span className={`text-sm font-medium transition-colors flex-1 ${
                        preferences.healthGoals?.includes(goal) ? 'text-white' : 'text-slate-300 group-hover:text-slate-200'
                      }`}>{goal}</span>
                      <input
                        type="checkbox"
                        checked={preferences.healthGoals?.includes(goal) || false}
                        onChange={() => toggleHealthGoal(goal)}
                        className="sr-only"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Allergies */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Any allergies?</h3>
                  <p className="text-slate-400 text-sm">Important for your safety</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ALLERGY_OPTIONS.map(allergy => (
                    <label
                      key={allergy}
                      className={`group relative flex items-center space-x-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        preferences.allergies?.includes(allergy)
                          ? 'bg-gradient-to-br from-red-500/20 via-red-600/20 to-red-500/20 border-red-500/60 shadow-lg shadow-red-500/20'
                          : 'bg-slate-800/40 border-slate-700/50 hover:border-red-500/40 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className={`relative flex items-center justify-center w-5 h-5 rounded-lg border-2 transition-all duration-300 flex-shrink-0 ${
                        preferences.allergies?.includes(allergy)
                          ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-400 shadow-lg shadow-red-500/30'
                          : 'bg-slate-800/60 border-slate-600 group-hover:border-red-500/50'
                      }`}>
                        {preferences.allergies?.includes(allergy) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-white"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </motion.div>
                        )}
                      </div>
                      <span className={`text-sm font-medium transition-colors flex-1 ${
                        preferences.allergies?.includes(allergy) ? 'text-white' : 'text-slate-300 group-hover:text-slate-200'
                      }`}>{allergy}</span>
                      <input
                        type="checkbox"
                        checked={preferences.allergies?.includes(allergy) || false}
                        onChange={() => toggleAllergy(allergy)}
                        className="sr-only"
                      />
                    </label>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customAllergy}
                    onChange={(e) => setCustomAllergy(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomAllergy()}
                    placeholder="Add custom allergy..."
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
                  />
                  <button
                    onClick={addCustomAllergy}
                    className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {preferences.allergies && preferences.allergies.length > 0 && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-sm text-red-400">
                      <strong>Selected allergies:</strong> {preferences.allergies.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Kitchen Equipment */}
            {step === 6 && (
              <div className="space-y-6">
                <div className="text-center">
                  <ChefHat className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">What kitchen equipment do you have?</h3>
                  <p className="text-slate-400 text-sm">We'll only suggest recipes you can make</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {KITCHEN_EQUIPMENT.map(equipment => (
                    <label
                      key={equipment.id}
                      className={`group relative flex items-start space-x-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        preferences.kitchenEquipment?.includes(equipment.id)
                          ? 'bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-primary-500/20 border-primary-500/60 shadow-lg shadow-primary-500/20'
                          : 'bg-slate-800/40 border-slate-700/50 hover:border-primary-500/40 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className={`relative flex items-center justify-center w-5 h-5 rounded-lg border-2 transition-all duration-300 flex-shrink-0 mt-0.5 ${
                        preferences.kitchenEquipment?.includes(equipment.id)
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-400 shadow-lg shadow-primary-500/30'
                          : 'bg-slate-800/60 border-slate-600 group-hover:border-primary-500/50'
                      }`}>
                        {preferences.kitchenEquipment?.includes(equipment.id) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-white"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </motion.div>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm font-medium block transition-colors ${
                          preferences.kitchenEquipment?.includes(equipment.id) ? 'text-white' : 'text-slate-200 group-hover:text-slate-100'
                        }`}>{equipment.label}</span>
                        <span className={`text-xs transition-colors ${
                          preferences.kitchenEquipment?.includes(equipment.id) ? 'text-slate-300' : 'text-slate-400'
                        }`}>{equipment.description}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.kitchenEquipment?.includes(equipment.id) || false}
                        onChange={() => toggleKitchenEquipment(equipment.id)}
                        className="sr-only"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Review */}
            {step === 7 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Check className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Review Your Preferences</h3>
                  <p className="text-slate-400 text-sm">Everything looks good?</p>
                </div>
                <div className="space-y-4 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                  <div>
                    <strong className="text-primary-400">People:</strong>
                    <span className="text-slate-200 ml-2">
                      {preferences.numberOfPeople} {preferences.numberOfPeople === 1 ? 'person' : 'people'}
                      {preferences.hasPartner && ' (with partner)'}
                      {preferences.hasKids && ` (with kids${preferences.kidsAges && preferences.kidsAges.length > 0 ? ` ages ${preferences.kidsAges.join(', ')}` : ''})`}
                    </span>
                  </div>
                  {preferences.dietaryRestrictions.length > 0 && (
                    <div>
                      <strong className="text-primary-400">Dietary Restrictions:</strong>
                      <span className="text-slate-200 ml-2">{preferences.dietaryRestrictions.join(', ')}</span>
                    </div>
                  )}
                  {preferences.allergies && preferences.allergies.length > 0 && (
                    <div>
                      <strong className="text-red-400">Allergies:</strong>
                      <span className="text-slate-200 ml-2">{preferences.allergies.join(', ')}</span>
                    </div>
                  )}
                  {preferences.healthGoals && preferences.healthGoals.length > 0 && (
                    <div>
                      <strong className="text-primary-400">Health Goals:</strong>
                      <span className="text-slate-200 ml-2">{preferences.healthGoals.join(', ')}</span>
                    </div>
                  )}
                  {preferences.kitchenEquipment && preferences.kitchenEquipment.length > 0 && (
                    <div>
                      <strong className="text-primary-400">Kitchen Equipment:</strong>
                      <span className="text-slate-200 ml-2">
                        {preferences.kitchenEquipment.length} {preferences.kitchenEquipment.length === 1 ? 'item' : 'items'} selected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700/50">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <button
            onClick={handleNext}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{step === totalSteps ? (saving ? 'Saving...' : 'Complete Setup') : 'Next'}</span>
            {step < totalSteps && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

