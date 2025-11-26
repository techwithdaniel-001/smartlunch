'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Recipe } from '@/data/recipes'
import { playRecipeCompleteSound } from '@/lib/sounds'
import { useTheme } from '@/contexts/ThemeContext'

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
  removedIngredients?: string[]
  autoSendMessage?: string | null
}

export default function AIChat({ onRecipeGenerated, currentRecipe, availableIngredients = [], userPreferences, onClose, removedIngredients = [], autoSendMessage }: AIChatProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
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
  const lastAutoMessageRef = useRef<string | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle auto-send message when ingredient is removed
  useEffect(() => {
    if (autoSendMessage && autoSendMessage !== lastAutoMessageRef.current && !isLoading) {
      lastAutoMessageRef.current = autoSendMessage
      setInput(autoSendMessage)
      
      // Trigger send after a brief delay to ensure state is updated
      const timer = setTimeout(() => {
        sendMessageProgrammatically(autoSendMessage)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [autoSendMessage, isLoading])

  const sendMessageProgrammatically = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: messageText.trim(),
    }

    setMessages((prev) => {
      // Check if this exact message was just sent to prevent duplicates
      const lastUserMessage = prev[prev.length - 1]
      if (lastUserMessage?.role === 'user' && lastUserMessage.content === messageText.trim()) {
        // Don't send duplicate message
        return prev
      }

      const updatedMessages = [...prev, userMessage]
      setInput('')
      setIsLoading(true)

      // Send the message asynchronously
      fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          currentRecipe,
          availableIngredients,
          userPreferences: userPreferences,
          removedIngredients: removedIngredients,
        }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            throw new Error(data.error)
          }

          console.log('AI Chat response received:', data)
          console.log('Recipe in response:', data.recipe)
          console.log('Recipe ingredients:', data.recipe?.ingredients)

          // Clean the message to remove any JSON that might have slipped through
          let cleanMessage = data.message || ''
          // Remove JSON code blocks
          cleanMessage = cleanMessage.replace(/```json\s*\{[\s\S]*?\}\s*```/gi, '').trim()
          // Remove plain JSON objects
          cleanMessage = cleanMessage.replace(/\{[\s\S]*\}/, '').trim()
          // Remove any remaining code block markers
          cleanMessage = cleanMessage.replace(/```[\s\S]*?```/g, '').trim()
          // Remove any text that looks like it's introducing JSON
          cleanMessage = cleanMessage.replace(/here'?s?\s+(the\s+)?(updated\s+)?(recipe|json):?/gi, '').trim()
          cleanMessage = cleanMessage.replace(/here'?s?\s+(the\s+)?(recipe|json):?/gi, '').trim()
          
          // If message is empty after cleaning, use a default
          if (!cleanMessage || cleanMessage.length === 0) {
            cleanMessage = currentRecipe 
              ? "Recipe updated to your preference!" 
              : "Here's your recipe!"
          }

          const assistantMessage: Message = {
            role: 'assistant',
            content: cleanMessage,
            recipe: data.recipe,
          }

          setMessages((prevMessages) => {
            // Check if the last message is the same to prevent duplicates
            const lastMessage = prevMessages[prevMessages.length - 1]
            if (lastMessage?.role === 'assistant' && lastMessage.content === assistantMessage.content && !assistantMessage.recipe) {
              // Don't add duplicate assistant message unless it has a recipe
              return prevMessages
            }
            return [...prevMessages, assistantMessage]
          })

          if (data.recipe && onRecipeGenerated) {
            console.log('Calling onRecipeGenerated with recipe:', data.recipe)
            console.log('Recipe ingredients being passed:', data.recipe.ingredients)
            // Play success sound when recipe is generated
            playRecipeCompleteSound()
            // Update the recipe - this will trigger the notification in RecipeDetail
            // Ensure we pass a complete recipe object
            onRecipeGenerated(data.recipe)
          } else {
            console.log('No recipe in response or onRecipeGenerated not available')
            console.log('Has recipe:', !!data.recipe)
            console.log('Has onRecipeGenerated:', !!onRecipeGenerated)
          }
        })
        .catch(error => {
          console.error('Error sending message:', error)
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              role: 'assistant',
              content: 'Sorry, I encountered an error. Please make sure you have set up your OpenAI API key in the environment variables. Check the README for instructions.',
            },
          ])
        })
        .finally(() => {
          setIsLoading(false)
        })

      return updatedMessages
    })
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return
    await sendMessageProgrammatically(input.trim())
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className={`flex flex-col h-full transition-colors duration-300 ${isDark ? 'border-slate-800/80' : 'border-primary-200'}`}>
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

      <div className={`flex-1 overflow-y-auto p-4 space-y-4 transition-colors duration-300 ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${
                message.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-5 h-5" />
              ) : (
                <div className="w-full h-full relative rounded-full overflow-hidden">
                  <Image
                    src="/assets/smartlunchlogo.png"
                    alt="Smart Lunch"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
            <div
              className={`flex-1 rounded-xl p-4 transition-colors duration-300 ${
                message.role === 'user'
                  ? isDark
                    ? 'bg-primary-500/20 border border-primary-500/30 text-slate-100'
                    : 'bg-primary-50 border border-primary-200 text-black'
                  : isDark
                  ? 'bg-slate-800/60 border border-slate-700/50 text-slate-200'
                  : 'bg-white border border-primary-200 text-black'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.recipe && (
                <div className={`mt-3 pt-3 border-t transition-colors duration-300 ${isDark ? 'border-slate-700' : 'border-primary-200'}`}>
                  <p className={`text-sm font-semibold mb-2 transition-colors duration-300 ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>✨ Generated Recipe:</p>
                  <p className={`font-bold text-lg transition-colors duration-300 ${isDark ? 'text-slate-100' : 'text-black'}`}>{message.recipe.name}</p>
                  <p className={`text-sm mt-1 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/70'}`}>{message.recipe.description}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center overflow-hidden">
              <div className="w-full h-full relative rounded-full overflow-hidden">
                <Image
                  src="/assets/smartlunchlogo.png"
                  alt="Smart Lunch"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className={`flex-1 rounded-xl p-4 transition-colors duration-300 ${isDark ? 'bg-slate-800/60 border border-slate-700/50' : 'bg-white border border-primary-200'}`}>
              <Loader2 className={`w-5 h-5 animate-spin transition-colors duration-300 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`border-t p-4 backdrop-blur-sm transition-colors duration-300 ${isDark ? 'border-slate-800/50 bg-slate-900/60' : 'border-primary-200 bg-white'}`}>
        <div className="flex items-end space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask for a recipe, modify ingredients, or get cooking tips..."
            className={`flex-1 px-4 py-3 rounded-xl border-2 focus:border-primary-500/50 focus:outline-none resize-none min-h-[60px] max-h-[120px] backdrop-blur-sm transition-colors duration-300 ${
              isDark
                ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 placeholder-slate-500'
                : 'bg-white border-primary-200 text-black placeholder-black/40'
            }`}
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
        <p className={`text-xs mt-2 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`}>
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

