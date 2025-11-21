'use client'

import { useState } from 'react'
import { Send, Sparkles, ChefHat, Loader2 } from 'lucide-react'
import { Recipe } from '@/data/recipes'

interface LandingChatProps {
  onRecipeGenerated: (recipe: Recipe) => void
  userPreferences?: any
}

export default function LandingChat({ onRecipeGenerated, userPreferences }: LandingChatProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your Smart Lunch assistant. What would you like to make today? I can help you create fun, healthy, kid-friendly recipes!"
    }
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage,
          availableIngredients: [],
          userPreferences: userPreferences,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.recipe) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Great! I've created a recipe for "${data.recipe.name}". Let me show you the details! 🎉`
        }])
        // Small delay to show the message before navigating
        setTimeout(() => {
          onRecipeGenerated(data.recipe)
        }, 500)
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I had trouble creating that recipe. Could you try describing it differently?'
        }])
      }
    } catch (error) {
      console.error('Error generating recipe:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again!'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl mb-4 premium-glow">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3">
            Smart Lunch
          </h1>
          <p className="text-slate-400 text-lg">Your AI-powered recipe assistant</p>
        </div>

        {/* Chat Interface */}
        <div className="glass-effect rounded-2xl p-6 sm:p-8 border-slate-800/80 h-[500px] sm:h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-500/20 border border-primary-500/30 text-white'
                      : 'bg-slate-800/60 border border-slate-700/50 text-slate-200'
                  }`}
                >
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                    <span className="text-slate-400 text-sm">Creating your recipe...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., 'quick pasta for kids' or 'healthy wraps'..."
                className="w-full px-4 py-3 pr-12 bg-slate-800/60 border-2 border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:border-primary-500/50 focus:outline-none transition-colors text-sm sm:text-base"
                disabled={isLoading}
              />
              <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="btn-primary flex items-center justify-center space-x-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">Generate</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Suggestions */}
          <div className="mt-4 pt-4 border-t border-slate-800/50">
            <p className="text-xs text-slate-500 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Quick 15-minute pasta",
                "Fun animal sandwiches",
                "Healthy wraps for kids",
                "Colorful fruit snacks"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 bg-slate-800/40 border border-slate-700/30 rounded-lg text-slate-400 hover:border-primary-500/50 hover:text-primary-400 transition-colors disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

