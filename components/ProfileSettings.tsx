'use client'

import { useState, useEffect } from 'react'
import { X, Save, LogOut, Users, Baby, Heart, AlertCircle, ChefHat, Check, Sun, Moon, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserPreferences, saveUserPreferences, UserPreferences } from '@/lib/firestore'
import { useTheme } from '@/contexts/ThemeContext'

interface ProfileSettingsProps {
  onClose: () => void
  onPreferencesUpdated?: () => void
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

const HEALTH_GOALS = [
  'Eat more vegetables',
  'Increase protein intake',
  'More balanced meals',
  'Weight management',
  'Build healthy habits',
  'Energy boost',
  'Better nutrition for kids'
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

export default function ProfileSettings({ onClose, onPreferencesUpdated }: ProfileSettingsProps) {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customAllergy, setCustomAllergy] = useState('')
  const [customDietary, setCustomDietary] = useState('')
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietaryRestrictions: [],
    allergies: [],
    numberOfPeople: 2,
    hasKids: false,
    hasPartner: false,
    kidsAges: [],
    preferences: [],
    kitchenEquipment: [],
    healthGoals: []
  })

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const saved = await getUserPreferences(user.uid)
      if (saved) {
        setPreferences({
          ...saved,
          allergies: saved.allergies || [],
          kitchenEquipment: saved.kitchenEquipment || []
        })
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      await saveUserPreferences(user.uid, preferences)
      if (onPreferencesUpdated) {
        onPreferencesUpdated()
      }
      alert('Settings saved successfully!')
      onClose()
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Failed to save settings. Please try again.')
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

  const toggleKitchenEquipment = (equipment: string) => {
    setPreferences(prev => ({
      ...prev,
      kitchenEquipment: prev.kitchenEquipment?.includes(equipment)
        ? prev.kitchenEquipment.filter(e => e !== equipment)
        : [...(prev.kitchenEquipment || []), equipment]
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

  const toggleHealthGoal = (goal: string) => {
    setPreferences(prev => ({
      ...prev,
      healthGoals: prev.healthGoals?.includes(goal)
        ? prev.healthGoals.filter(g => g !== goal)
        : [...(prev.healthGoals || []), goal]
    }))
  }

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut()
      onClose()
    }
  }

  const isDark = theme === 'dark'
  
  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 transition-colors duration-300 ${isDark ? '' : ''}`}>
        <div className={`rounded-2xl p-8 transition-colors duration-300 ${isDark ? 'glass-effect' : 'bg-white border border-slate-200'}`}>
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`w-full transition-colors duration-300 ${isDark ? '' : ''}`}>
      <div className={`rounded-xl sm:rounded-2xl w-full overflow-hidden flex flex-col relative z-10 transition-colors duration-300 ${isDark ? 'glass-effect border-slate-800/30' : 'bg-white border border-slate-200'}`}>
        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 transition-colors duration-300 ${isDark ? '' : 'bg-white'}`}>
          {/* Theme Settings */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-primary-400" />
              ) : (
                <Sun className="w-5 h-5 text-primary-400" />
              )}
              <span>Theme</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`group relative flex items-center justify-center space-x-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                  theme === 'light'
                    ? 'bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-primary-500/20 border-primary-500/40'
                    : isDark
                    ? 'bg-slate-800/40 border-slate-700/30 hover:border-primary-500/30 hover:bg-slate-800/60'
                    : 'bg-slate-100 border-slate-300 hover:border-primary-500/30 hover:bg-slate-200'
                }`}
              >
                <div className={`relative flex items-center justify-center w-5 h-5 rounded-lg border-2 transition-all duration-300 flex-shrink-0 ${
                  theme === 'light'
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-400'
                    : isDark
                    ? 'bg-slate-800/60 border-slate-600 group-hover:border-primary-500/50'
                    : 'bg-slate-200 border-slate-400 group-hover:border-primary-500/50'
                }`}>
                  {theme === 'light' && (
                    <Check className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <Sun className="w-5 h-5 text-primary-400" />
                <span className={`text-sm font-medium transition-colors flex-1 ${
                  theme === 'light' ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-300 group-hover:text-slate-200' : 'text-slate-600 group-hover:text-slate-700')
                }`}>Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`group relative flex items-center justify-center space-x-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-primary-500/20 border-primary-500/40'
                    : isDark
                    ? 'bg-slate-800/40 border-slate-700/30 hover:border-primary-500/30 hover:bg-slate-800/60'
                    : 'bg-slate-100 border-slate-300 hover:border-primary-500/30 hover:bg-slate-200'
                }`}
              >
                <div className={`relative flex items-center justify-center w-5 h-5 rounded-lg border-2 transition-all duration-300 flex-shrink-0 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-400'
                    : isDark
                    ? 'bg-slate-800/60 border-slate-600 group-hover:border-primary-500/50'
                    : 'bg-slate-200 border-slate-400 group-hover:border-primary-500/50'
                }`}>
                  {theme === 'dark' && (
                    <Check className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <Moon className="w-5 h-5 text-primary-400" />
                <span className={`text-sm font-medium transition-colors flex-1 ${
                  theme === 'dark' ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-300 group-hover:text-slate-200' : 'text-slate-600 group-hover:text-slate-700')
                }`}>Dark</span>
              </button>
            </div>
          </div>

          {/* Family Information */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Users className="w-5 h-5 text-primary-400" />
              <span>Family Information</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Number of People Eating
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={preferences.numberOfPeople}
                  onChange={(e) => setPreferences(prev => ({ ...prev, numberOfPeople: parseInt(e.target.value) || 1 }))}
                  className={`w-full px-4 py-2 rounded-xl focus:border-primary-500/50 focus:outline-none transition-colors duration-300 ${
                    isDark 
                      ? 'bg-slate-800/60 border border-slate-700/50 text-slate-100' 
                      : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="space-y-3">
                <label 
                  className={`group relative flex items-center space-x-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    preferences.hasPartner
                      ? 'bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-primary-500/20 border-primary-500/60 shadow-lg shadow-primary-500/20'
                      : isDark
                      ? 'bg-slate-800/40 border-slate-700/50 hover:border-primary-500/40 hover:bg-slate-800/60'
                      : 'bg-slate-50 border-slate-300 hover:border-primary-500/40 hover:bg-slate-100'
                  }`}
                >
                  <div className={`relative flex items-center justify-center w-5 h-5 rounded-lg border-2 transition-all duration-300 ${
                    preferences.hasPartner
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-400 shadow-lg shadow-primary-500/30'
                      : isDark
                      ? 'bg-slate-800/60 border-slate-600 group-hover:border-primary-500/50'
                      : 'bg-slate-200 border-slate-400 group-hover:border-primary-500/50'
                  }`}>
                    {preferences.hasPartner && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <div className="flex items-center space-x-3 flex-1">
                    <Heart className={`w-4 h-4 transition-colors ${
                      preferences.hasPartner ? 'text-primary-400' : (isDark ? 'text-slate-500 group-hover:text-primary-500/70' : 'text-slate-400 group-hover:text-primary-500/70')
                    }`} />
                    <span className={`text-sm font-medium transition-colors ${
                      preferences.hasPartner ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-300 group-hover:text-slate-200' : 'text-slate-700 group-hover:text-slate-900')
                    }`}>
                      Have a partner
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
                  className={`group relative flex items-center space-x-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    preferences.hasKids
                      ? 'bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-primary-500/20 border-primary-500/60 shadow-lg shadow-primary-500/20'
                      : isDark
                      ? 'bg-slate-800/40 border-slate-700/50 hover:border-primary-500/40 hover:bg-slate-800/60'
                      : 'bg-slate-50 border-slate-300 hover:border-primary-500/40 hover:bg-slate-100'
                  }`}
                >
                  <div className={`relative flex items-center justify-center w-5 h-5 rounded-lg border-2 transition-all duration-300 ${
                    preferences.hasKids
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-400 shadow-lg shadow-primary-500/30'
                      : isDark
                      ? 'bg-slate-800/60 border-slate-600 group-hover:border-primary-500/50'
                      : 'bg-slate-200 border-slate-400 group-hover:border-primary-500/50'
                  }`}>
                    {preferences.hasKids && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <div className="flex items-center space-x-3 flex-1">
                    <Baby className={`w-4 h-4 transition-colors ${
                      preferences.hasKids ? 'text-primary-400' : (isDark ? 'text-slate-500 group-hover:text-primary-500/70' : 'text-slate-400 group-hover:text-primary-500/70')
                    }`} />
                    <span className={`text-sm font-medium transition-colors ${
                      preferences.hasKids ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-300 group-hover:text-slate-200' : 'text-slate-700 group-hover:text-slate-900')
                    }`}>
                      Have kids
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
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Kids' Ages (comma-separated, e.g., "5, 8, 12")
                  </label>
                  <input
                    type="text"
                    value={preferences.kidsAges?.join(', ') || ''}
                    onChange={(e) => setPreferences(prev => ({ 
                      ...prev, 
                      kidsAges: e.target.value.split(',').map(age => age.trim()).filter(Boolean)
                    }))}
                    placeholder="5, 8, 12"
                    className={`w-full px-4 py-2 rounded-xl focus:border-primary-500/50 focus:outline-none transition-colors duration-300 ${
                      isDark 
                        ? 'bg-slate-800/60 border border-slate-700/50 text-slate-100 placeholder-slate-500' 
                        : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <AlertCircle className="w-5 h-5 text-primary-400" />
              <span>Dietary Restrictions & Preferences</span>
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DIETARY_OPTIONS.map((option) => (
                <label
                  key={option}
                  className={`group relative flex items-center space-x-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    preferences.dietaryRestrictions.includes(option)
                      ? 'bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-primary-500/20 border-primary-500/60 shadow-lg shadow-primary-500/20'
                      : isDark
                      ? 'bg-slate-800/40 border-slate-700/50 hover:border-primary-500/40 hover:bg-slate-800/60'
                      : 'bg-slate-50 border-slate-300 hover:border-primary-500/40 hover:bg-slate-100'
                  }`}
                >
                  <div className={`relative flex items-center justify-center w-5 h-5 rounded-lg border-2 transition-all duration-300 flex-shrink-0 ${
                    preferences.dietaryRestrictions.includes(option)
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-400 shadow-lg shadow-primary-500/30'
                      : isDark
                      ? 'bg-slate-800/60 border-slate-600 group-hover:border-primary-500/50'
                      : 'bg-slate-200 border-slate-400 group-hover:border-primary-500/50'
                  }`}>
                    {preferences.dietaryRestrictions.includes(option) && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <span className={`text-sm font-medium transition-colors flex-1 ${
                    preferences.dietaryRestrictions.includes(option) ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-300 group-hover:text-slate-200' : 'text-slate-700 group-hover:text-slate-900')
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
            <div className="mt-4 flex space-x-2">
              <input
                type="text"
                value={customDietary}
                onChange={(e) => setCustomDietary(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomDietary()}
                placeholder="Add custom dietary restriction..."
                className={`flex-1 px-4 py-3 rounded-xl focus:border-primary-500/50 focus:outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'bg-slate-800/60 border border-slate-700/50 text-slate-100 placeholder-slate-500' 
                    : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                onClick={addCustomDietary}
                className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Allergies */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span>Allergies</span>
            </h3>
            <p className="text-sm text-red-400 mb-4">
              ⚠️ Critical: We will NEVER include these ingredients in your recipes
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ALLERGY_OPTIONS.map((allergy) => (
                <label
                  key={allergy}
                  className={`group relative flex items-center space-x-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    preferences.allergies?.includes(allergy)
                      ? 'bg-gradient-to-br from-red-500/20 via-red-600/20 to-red-500/20 border-red-500/60 shadow-lg shadow-red-500/20'
                      : isDark
                      ? 'bg-slate-800/40 border-slate-700/50 hover:border-red-500/40 hover:bg-slate-800/60'
                      : 'bg-slate-50 border-slate-300 hover:border-red-500/40 hover:bg-slate-100'
                  }`}
                >
                  <div className={`relative flex items-center justify-center w-5 h-5 rounded-lg border-2 transition-all duration-300 flex-shrink-0 ${
                    preferences.allergies?.includes(allergy)
                      ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-400 shadow-lg shadow-red-500/30'
                      : isDark
                      ? 'bg-slate-800/60 border-slate-600 group-hover:border-red-500/50'
                      : 'bg-slate-200 border-slate-400 group-hover:border-red-500/50'
                  }`}>
                    {preferences.allergies?.includes(allergy) && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <span className={`text-sm font-medium transition-colors flex-1 ${
                    preferences.allergies?.includes(allergy) ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-300 group-hover:text-slate-200' : 'text-slate-700 group-hover:text-slate-900')
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
            <div className="mt-4 flex space-x-2">
              <input
                type="text"
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomAllergy()}
                placeholder="Add custom allergy..."
                className={`flex-1 px-4 py-3 rounded-xl focus:border-red-500/50 focus:outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'bg-slate-800/60 border border-slate-700/50 text-slate-100 placeholder-slate-500' 
                    : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                onClick={addCustomAllergy}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Add
              </button>
            </div>
            {preferences.allergies && preferences.allergies.length > 0 && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-sm text-red-400">
                  <strong>Selected allergies:</strong> {preferences.allergies.join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Health Goals */}
          <div>
            <h3 className={`text-lg font-medium mb-4 flex items-center space-x-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Heart className="w-5 h-5 text-primary-400" />
              <span>Health Goals</span>
            </h3>
            <p className={`text-sm mb-4 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Select your health goals and we'll tailor recipes to help you achieve them
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {HEALTH_GOALS.map((goal) => (
                <label
                  key={goal}
                  className={`group relative flex items-center space-x-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    preferences.healthGoals?.includes(goal)
                      ? 'bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-primary-500/20 border-primary-500/60 shadow-lg shadow-primary-500/20'
                      : isDark
                      ? 'bg-slate-800/40 border-slate-700/50 hover:border-primary-500/40 hover:bg-slate-800/60'
                      : 'bg-slate-50 border-slate-300 hover:border-primary-500/40 hover:bg-slate-100'
                  }`}
                >
                  <div className={`relative flex items-center justify-center w-5 h-5 rounded-lg border-2 transition-all duration-300 flex-shrink-0 ${
                    preferences.healthGoals?.includes(goal)
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-400 shadow-lg shadow-primary-500/30'
                      : isDark
                      ? 'bg-slate-800/60 border-slate-600 group-hover:border-primary-500/50'
                      : 'bg-slate-200 border-slate-400 group-hover:border-primary-500/50'
                  }`}>
                    {preferences.healthGoals?.includes(goal) && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <span className={`text-sm font-medium transition-colors flex-1 ${
                    preferences.healthGoals?.includes(goal) ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-300 group-hover:text-slate-200' : 'text-slate-700 group-hover:text-slate-900')
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

          {/* Kitchen Equipment */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <ChefHat className="w-5 h-5 text-primary-400" />
              <span>Kitchen Equipment</span>
            </h3>
            <p className={`text-sm mb-4 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Select the cooking equipment you have available. This helps us suggest recipes you can actually make!
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {KITCHEN_EQUIPMENT.map((equipment) => (
                <label
                  key={equipment.id}
                  className={`group relative flex items-start space-x-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    preferences.kitchenEquipment?.includes(equipment.id)
                      ? 'bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-primary-500/20 border-primary-500/60 shadow-lg shadow-primary-500/20'
                      : isDark
                      ? 'bg-slate-800/40 border-slate-700/50 hover:border-primary-500/40 hover:bg-slate-800/60'
                      : 'bg-slate-50 border-slate-300 hover:border-primary-500/40 hover:bg-slate-100'
                  }`}
                >
                  <div className={`relative flex items-center justify-center w-5 h-5 rounded-lg border-2 transition-all duration-300 flex-shrink-0 mt-0.5 ${
                    preferences.kitchenEquipment?.includes(equipment.id)
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-400 shadow-lg shadow-primary-500/30'
                      : isDark
                      ? 'bg-slate-800/60 border-slate-600 group-hover:border-primary-500/50'
                      : 'bg-slate-200 border-slate-400 group-hover:border-primary-500/50'
                  }`}>
                    {preferences.kitchenEquipment?.includes(equipment.id) && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm font-medium block transition-colors ${
                      preferences.kitchenEquipment?.includes(equipment.id) ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-200 group-hover:text-slate-100' : 'text-slate-700 group-hover:text-slate-900')
                    }`}>{equipment.label}</span>
                    <span className={`text-xs transition-colors ${
                      preferences.kitchenEquipment?.includes(equipment.id) ? (isDark ? 'text-slate-300' : 'text-slate-600') : (isDark ? 'text-slate-400' : 'text-slate-500')
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
        </div>

        {/* Footer */}
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 p-4 sm:p-6 border-t transition-colors duration-300 ${isDark ? 'border-slate-800/20' : 'border-slate-200'}`}>
          <button
            onClick={handleSignOut}
            className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-semibold transition-all touch-manipulation ${isDark ? 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20' : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'}`}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 w-full sm:w-auto"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

