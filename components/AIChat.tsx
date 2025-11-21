'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, X, Loader2 } from 'lucide-react'
import { Recipe } from '@/data/recipes'

interface Message {
  role: 'user' | 'assistant'
  content: string
  recipe?: Recipe
}

interface AIChatProps {
  onRecipeGenerated?: (recipe: Recipe) => void
  currentRecipe?: Recipe | null
  availableIngredients?: string[]
  userPreferences?: any
  onClose?: () => void
}

export default function AIChat({ onRecipeGenerated, currentRecipe, availableIngredients = [], userPreferences, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: currentRecipe 
        ? `Hi! I can help you modify this recipe! 🍽️\n\nTry saying:\n• "Make it vegan"\n• "Change chicken to turkey"\n• "Make it gluten-free"\n• "Add more vegetables"\n• "Make it spicier"\n\nThe recipe will update automatically!`
        : "Hi! I'm your Smart Lunch AI assistant. 🍽️\n\nI can help you:\n• Generate new recipes\n• Modify recipes\n• Answer cooking questions\n\nJust tell me what you'd like!",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          currentRecipe,
          availableIngredients,
          userPreferences: userPreferences,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        recipe: data.recipe,
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (data.recipe && onRecipeGenerated) {
        onRecipeGenerated(data.recipe)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please make sure you have set up your OpenAI API key in the environment variables. Check the README for instructions.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full border-slate-800/80">
      <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 p-5 flex items-center justify-between premium-glow border-b border-primary-600/50">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold text-white">AI Recipe Assistant</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-5 h-5" />
              ) : (
                <Bot className="w-5 h-5" />
              )}
            </div>
            <div
              className={`flex-1 rounded-xl p-4 ${
                message.role === 'user'
                  ? 'bg-primary-500/20 border border-primary-500/30 text-slate-100'
                  : 'bg-slate-800/60 border border-slate-700/50 text-slate-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.recipe && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <p className="text-sm font-semibold mb-2 text-primary-400">✨ Generated Recipe:</p>
                  <p className="font-bold text-lg text-slate-100">{message.recipe.name}</p>
                  <p className="text-sm text-slate-400 mt-1">{message.recipe.description}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1 rounded-xl p-4 bg-slate-800/60 border border-slate-700/50">
              <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-800/50 p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-end space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask for a recipe, modify ingredients, or get cooking tips..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-800/60 border-2 border-slate-700/50 text-slate-100 placeholder-slate-500 focus:border-primary-500/50 focus:outline-none resize-none min-h-[60px] max-h-[120px] backdrop-blur-sm"
            rows={2}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-primary-500 text-white p-3 rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 shadow-lg hover:shadow-primary-500/25"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

