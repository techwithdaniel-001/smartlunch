'use client'

import { useState, KeyboardEvent } from 'react'
import { Plus, X, Search } from 'lucide-react'

interface IngredientInputProps {
  selectedIngredients: string[]
  onChange: (ingredients: string[]) => void
}

const commonIngredients = [
  'Bread', 'Chicken', 'Cheese', 'Tomato', 'Lettuce', 'Eggs',
  'Carrots', 'Cucumber', 'Avocado', 'Turkey', 'Ham', 'Mayonnaise',
  'Butter', 'Peanut Butter', 'Jelly', 'Banana', 'Apple', 'Strawberries',
  'Yogurt', 'Pasta', 'Rice', 'Beans', 'Corn', 'Peas', 'Broccoli',
  'Spinach', 'Bell Pepper', 'Onion', 'Potato', 'Sweet Potato'
]

export default function IngredientInput({ selectedIngredients, onChange }: IngredientInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const addIngredient = (ingredient: string) => {
    const trimmed = ingredient.trim()
    if (trimmed && !selectedIngredients.includes(trimmed)) {
      onChange([...selectedIngredients, trimmed])
      setInputValue('')
    }
  }

  const removeIngredient = (ingredient: string) => {
    onChange(selectedIngredients.filter(i => i !== ingredient))
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      addIngredient(inputValue)
    }
  }

  const filteredSuggestions = commonIngredients.filter(
    ing => ing.toLowerCase().includes(inputValue.toLowerCase()) &&
           !selectedIngredients.includes(ing)
  )

  return (
    <div className="glass-effect rounded-2xl p-6 border-slate-800/80">
      <div className="flex items-center space-x-2 mb-4">
        <Search className="w-5 h-5 text-primary-400" />
        <h3 className="text-lg font-semibold text-white">What ingredients do you have? <span className="text-sm font-normal text-slate-300">(Optional)</span></h3>
      </div>
      
      <div className="relative mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setShowSuggestions(true)
          }}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Type an ingredient and press Enter..."
          className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border-2 border-slate-700/50 text-slate-100 placeholder-slate-500 focus:border-primary-500/50 focus:outline-none transition-colors backdrop-blur-sm"
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700/50 max-h-60 overflow-y-auto">
            {filteredSuggestions.slice(0, 8).map((ingredient) => (
              <button
                key={ingredient}
                onClick={() => {
                  addIngredient(ingredient)
                  setShowSuggestions(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-primary-500/20 text-slate-200 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                {ingredient}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedIngredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIngredients.map((ingredient) => (
            <span
              key={ingredient}
              className="inline-flex items-center space-x-2 bg-primary-500/20 border border-primary-500/30 text-primary-300 px-4 py-2 rounded-full font-medium"
            >
              <span>{ingredient}</span>
              <button
                onClick={() => removeIngredient(ingredient)}
                className="hover:bg-primary-500/30 rounded-full p-0.5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-800">
        <p className="text-sm text-slate-200 mb-2 font-medium">Quick add:</p>
        <div className="flex flex-wrap gap-2">
          {commonIngredients.slice(0, 10).map((ingredient) => (
            <button
              key={ingredient}
              onClick={() => addIngredient(ingredient)}
              disabled={selectedIngredients.includes(ingredient)}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-700/50 hover:border-primary-500/50 hover:bg-primary-500/10 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {ingredient}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

