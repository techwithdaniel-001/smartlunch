'use client'

import { useState, useEffect } from 'react'
import { X, Save, LogOut, Users, Baby, Heart, AlertCircle, ChefHat } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserPreferences, saveUserPreferences, UserPreferences } from '@/lib/firestore'

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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietaryRestrictions: [],
    numberOfPeople: 2,
    hasKids: false,
    hasPartner: false,
    kidsAges: [],
    preferences: [],
    kitchenEquipment: []
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

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut()
      onClose()
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="glass-effect rounded-2xl p-8">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass-effect rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border-slate-800/80 shadow-2xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800/50">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Profile & Settings</h2>
            <p className="text-sm text-slate-400 mt-1">{user?.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800/50 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Family Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary-400" />
              <span>Family Information</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Number of People Eating
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={preferences.numberOfPeople}
                  onChange={(e) => setPreferences(prev => ({ ...prev, numberOfPeople: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-100 focus:border-primary-500/50 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.hasPartner}
                    onChange={(e) => setPreferences(prev => ({ ...prev, hasPartner: e.target.checked }))}
                    className="w-4 h-4 text-primary-500 bg-slate-800 border-slate-700 rounded focus:ring-primary-500"
                  />
                  <Heart className="w-4 h-4 text-primary-400" />
                  <span className="text-slate-300">Have a partner</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.hasKids}
                    onChange={(e) => setPreferences(prev => ({ ...prev, hasKids: e.target.checked }))}
                    className="w-4 h-4 text-primary-500 bg-slate-800 border-slate-700 rounded focus:ring-primary-500"
                  />
                  <Baby className="w-4 h-4 text-primary-400" />
                  <span className="text-slate-300">Have kids</span>
                </label>
              </div>

              {preferences.hasKids && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
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
                    className="w-full px-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:border-primary-500/50 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-primary-400" />
              <span>Dietary Restrictions & Preferences</span>
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DIETARY_OPTIONS.map((option) => (
                <label
                  key={option}
                  className={`flex items-center space-x-2 p-3 rounded-xl border cursor-pointer transition-all ${
                    preferences.dietaryRestrictions.includes(option)
                      ? 'bg-primary-500/20 border-primary-500/50'
                      : 'bg-slate-800/60 border-slate-700/50 hover:border-primary-500/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={preferences.dietaryRestrictions.includes(option)}
                    onChange={() => toggleDietaryRestriction(option)}
                    className="w-4 h-4 text-primary-500 bg-slate-800 border-slate-700 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-300">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Kitchen Equipment */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <ChefHat className="w-5 h-5 text-primary-400" />
              <span>Kitchen Equipment</span>
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Select the cooking equipment you have available. This helps us suggest recipes you can actually make!
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {KITCHEN_EQUIPMENT.map((equipment) => (
                <label
                  key={equipment.id}
                  className={`flex items-start space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    preferences.kitchenEquipment?.includes(equipment.id)
                      ? 'bg-primary-500/20 border-primary-500/50'
                      : 'bg-slate-800/60 border-slate-700/50 hover:border-primary-500/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={preferences.kitchenEquipment?.includes(equipment.id) || false}
                    onChange={() => toggleKitchenEquipment(equipment.id)}
                    className="w-4 h-4 mt-0.5 text-primary-500 bg-slate-800 border-slate-700 rounded focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-200 block">{equipment.label}</span>
                    <span className="text-xs text-slate-400">{equipment.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-slate-800/50">
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

