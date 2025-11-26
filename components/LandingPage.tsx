'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ArrowRight, Sparkles, Clock, Users, Heart, ChefHat, CheckCircle2, Star, X, Search, MessageSquare, BookOpen, ChefHat as ChefHatIcon, CheckCircle, Loader2, Lock } from 'lucide-react'
import Auth from './Auth'
import { Recipe } from '@/data/recipes'
import { useTheme } from '@/contexts/ThemeContext'

export default function LandingPage() {
  const { theme } = useTheme()
  const [showAuth, setShowAuth] = useState(false)
  const [showStory, setShowStory] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [previewRecipe, setPreviewRecipe] = useState<Recipe | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim() || isSearching) return

    setIsSearching(true)
    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          availableIngredients: [],
          userPreferences: null,
        }),
      })

      const data = await response.json()

      if (data.error) {
        alert(data.error)
        return
      }

      if (data.recipe) {
        setPreviewRecipe(data.recipe)
        // Scroll to preview
        setTimeout(() => {
          document.getElementById('recipe-preview')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    } catch (error) {
      console.error('Search error:', error)
      alert('Failed to generate recipe. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  if (showAuth) {
    return <Auth />
  }

  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-white'}`}>
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-xl border-b transition-colors duration-300 ${isDark ? 'bg-slate-950/80 border-slate-800/50' : 'bg-white/80 border-slate-200/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                <Image
                  src="/assets/smartlunchlogo.png"
                  alt="Smart Lunch Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl sm:text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600">
                Smart Lunch
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowStory(true)}
                className={`hidden sm:block px-4 py-2 transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
              >
                Our Story
              </button>
              <button
                onClick={() => setShowAuth(true)}
                className="btn-primary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 sm:pt-40 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              
              <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium mb-6 leading-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Lunches Made
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600">
                  with Love
                </span>
              </h1>
              
              <p className={`text-xl sm:text-2xl mb-8 leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Personalized, healthy lunch recipes for busy families. 
                <span className={`block mt-2 text-lg transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Founded by Fathima Zahra, who started cooking lunches at 9 now using AI to help families everywhere.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => setShowAuth(true)}
                  className="btn-primary flex items-center justify-center space-x-2 text-lg px-8 py-4 group"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setShowStory(true)}
                  className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:border-primary-500/50 hover:bg-primary-500/10 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Our Story</span>
                </button>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-medium text-primary-500 mb-1">15min</div>
                  <div className={`text-sm transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Avg Prep Time</div>
                </div>
                <div>
                  <div className="text-3xl font-medium text-primary-500 mb-1">100%</div>
                  <div className={`text-sm transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Kid Friendly</div>
                </div>
                <div>
                  <div className="text-3xl font-medium text-primary-500 mb-1">AI</div>
                  <div className={`text-sm transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Personalized</div>
                </div>
              </div>
            </motion.div>

            {/* Right: Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="relative w-full aspect-[4/3] sm:aspect-square">
                  <Image
                    src="/assets/love.jpg"
                    alt="Smart Lunch - Lunches made with love"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-primary-600/5"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Try Smart Lunch AI Section */}
      <section className={`py-16 sm:py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-medium mb-4 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Try Smart Lunch AI
            </h2>
            <p className={`text-xl max-w-2xl mx-auto transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Describe what you'd like to make, and we'll generate a custom recipe for you!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className={`rounded-3xl p-8 sm:p-10 lg:p-12 border-2 shadow-xl relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-primary-100'}`}>
              <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-300 ${isDark ? 'from-primary-500/10 via-transparent to-primary-600/10' : 'from-primary-50/50 via-transparent to-primary-100/30'}`}></div>
              <div className="relative z-10">
                <p className={`mb-6 text-center text-base sm:text-lg transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  💡 Examples: "quick 15 minute pasta", "fun animal sandwiches", "healthy wraps for kids"
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1 relative">
                    <Search className={`absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="e.g., 'quick pasta for kids' or 'healthy wraps with chicken'..."
                      className={`w-full pl-12 sm:pl-14 pr-4 sm:pr-5 py-4 sm:py-5 rounded-xl sm:rounded-2xl border-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all text-base sm:text-lg ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-primary-100 text-slate-900 placeholder-slate-400'}`}
                      disabled={isSearching}
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || isSearching}
                    className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>Generate Recipe</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recipe Preview Section */}
      {previewRecipe && (
        <section id="recipe-preview" className={`py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl p-8 border-2 shadow-xl relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-primary-100'}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-300 ${isDark ? 'from-primary-500/10 via-transparent to-primary-600/10' : 'from-primary-50/50 via-transparent to-primary-100/30'}`}></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className={`text-3xl font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>{previewRecipe.name}</h2>
                    <p className={`transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{previewRecipe.description}</p>
                  </div>
                  <button
                    onClick={() => setPreviewRecipe(null)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <div className={`flex items-center space-x-2 transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <Clock className="w-4 h-4 text-primary-500" />
                      <span>{previewRecipe.time}</span>
                    </div>
                    <div className={`flex items-center space-x-2 transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <Users className="w-4 h-4 text-primary-500" />
                      <span>{previewRecipe.servings}</span>
                    </div>
                    <div className={`flex items-center space-x-2 transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <Star className="w-4 h-4 fill-primary-500 text-primary-500" />
                      <span>{previewRecipe.rating}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium mb-3 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Ingredients Needed</h3>
                    <div className="space-y-2">
                      {previewRecipe.ingredients.slice(0, 5).map((ing, i) => (
                        <div key={i} className={`flex items-center space-x-2 text-sm transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          <CheckCircle className="w-4 h-4 text-primary-500" />
                          <span>{ing.amount} {ing.name}</span>
                        </div>
                      ))}
                      {previewRecipe.ingredients.length > 5 && (
                        <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>+ {previewRecipe.ingredients.length - 5} more ingredients</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`pt-6 border-t transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div className={`border rounded-xl p-6 text-center transition-colors duration-300 ${isDark ? 'bg-primary-500/10 border-primary-500/20' : 'bg-primary-50 border-primary-200'}`}>
                    <Lock className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                    <h3 className={`text-xl font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Sign up to view full recipe</h3>
                    <p className={`mb-4 transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Get access to step by step cooking instructions, timers, AI assistance, and more!
                    </p>
                    <button
                      onClick={() => setShowAuth(true)}
                      className="btn-primary flex items-center justify-center space-x-2 mx-auto"
                    >
                      <span>Sign Up Free</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* How It Works / Product Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Simple steps to transform your lunchtime routine
            </p>
          </motion.div>

          <div className="space-y-12">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              <div className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/20 mb-4">
                  <Search className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className={`text-2xl font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Step 1: Search</h3>
                <p className={`leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Type what you want to make<br className="hidden md:block" />
                  like "quick pasta" or "healthy wraps"<br className="hidden md:block" />
                  and our AI generates a custom recipe<br className="hidden md:block" />
                  tailored to your family.
                </p>
              </div>
              <div>
                <div className={`rounded-3xl p-6 sm:p-8 border-2 shadow-lg transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-primary-100'}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium">
                      1
                    </div>
                    <h3 className={`text-2xl font-medium transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Tell Us What You Want</h3>
                  </div>
                  <div className="space-y-4">
                    <div className={`rounded-xl p-4 border transition-colors duration-300 ${isDark ? 'bg-primary-500/10 border-primary-500/20' : 'bg-primary-50 border-primary-100'}`}>
                      <div className="flex items-center space-x-2 mb-3">
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        <span className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Recipe Search</span>
                      </div>
                      <div className="relative">
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input
                          type="text"
                          value="quick pasta for kids"
                          readOnly
                          className={`w-full pl-10 pr-3 py-2.5 rounded-xl border-2 text-sm transition-colors duration-300 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                        />
                      </div>
                      <button className="mt-3 w-full btn-primary text-sm py-2.5 flex items-center justify-center space-x-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Generate</span>
                      </button>
                    </div>
                    <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Simply describe what you'd like to make. Our AI understands your preferences and creates a personalized recipe just for you.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              <div>
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-primary-100 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium">
                      2
                    </div>
                    <h3 className="text-2xl font-medium text-slate-900">Your Personalized Recipe</h3>
                  </div>
                  <div className="space-y-3">
                    {/* Recipe Preview */}
                    <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-3xl">🍝</span>
                        <div>
                          <div className="text-base font-medium text-slate-900">Quick Pasta for Kids</div>
                          <div className="text-xs text-slate-600">15 min • 4 servings</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                      <div className="text-sm font-medium text-slate-900 mb-3">Ingredients Needed</div>
                      <div className="space-y-2">
                        {['2 cups Pasta', '1 cup Tomato Sauce', '1/2 cup Grated Cheese', '1 tbsp Olive Oil', 'Salt & Pepper'].map((ing, i) => (
                          <div key={i} className="flex items-center space-x-2 text-slate-700 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                            <span>{ing}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                      <div className="text-sm font-medium text-slate-900 mb-2">Quick Prep Guide</div>
                      <div className="flex items-center space-x-4 text-xs text-slate-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-primary-500" />
                          <span>15 min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3 text-primary-500" />
                          <span>4 servings</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-primary-500" />
                          <span>Kid friendly</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/20 mb-4">
                  <BookOpen className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className={`text-2xl font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Step 2: Get Your Recipe</h3>
                <p className={`leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Receive a complete recipe with ingredients,<br className="hidden md:block" />
                  step by step instructions, and cooking tips<br className="hidden md:block" />
                  all personalized to your preferences<br className="hidden md:block" />
                  and dietary needs.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              <div className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/20 mb-4">
                  <ChefHatIcon className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className={`text-2xl font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Step 3: Start Cooking</h3>
                <p className={`mb-4 leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Enter cooking mode for step by step guidance.<br className="hidden md:block" />
                  Each step is detailed and easy to follow,<br className="hidden md:block" />
                  with timers and AI help available<br className="hidden md:block" />
                  whenever you need it.
                </p>
                <div className={`space-y-2 text-sm transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary-500" />
                    <span>Detailed instructions for beginners</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary-500" />
                    <span>Built in timers for each step</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary-500" />
                    <span>AI help available anytime</span>
                  </div>
                </div>
              </div>
              <div>
                <div className={`rounded-3xl p-6 sm:p-8 border-2 shadow-lg transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-primary-100'}`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium">
                      3
                    </div>
                    <h3 className={`text-2xl font-medium transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Cook with Guidance</h3>
                  </div>
                  
                  {/* Recipe Header */}
                  <div className={`mb-6 pb-6 border-b transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-4xl">🍝</span>
                      <div>
                        <h4 className={`text-lg font-medium transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Quick Pasta for Kids</h4>
                        <div className={`flex items-center space-x-3 text-xs mt-1 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>15 min</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>4 servings</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cooking Step */}
                  <div className="space-y-4">
                    <div className={`rounded-xl p-5 border transition-colors duration-300 ${isDark ? 'bg-primary-500/10 border-primary-500/20' : 'bg-primary-50 border-primary-100'}`}>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                          1
                        </div>
                        <span className={`text-base font-medium transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Step 1: Cook the Pasta</span>
                      </div>
                      
                      <div className={`rounded-lg p-4 mb-4 border transition-colors duration-300 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                        <p className={`text-sm leading-relaxed mb-3 transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          First, fill a large pot with 6 cups of water. Place it on the stove over high heat. Wait until the water starts bubbling and boiling (you'll see big bubbles rising to the surface). Then add 1 tablespoon of salt to the water.
                        </p>
                        <p className={`text-sm leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Next, add 2 cups of pasta to the boiling water. Stir it once with a spoon so the pasta doesn't stick together. Let it cook for 8 minutes, stirring occasionally.
                        </p>
                      </div>
                      
                      <div className={`rounded-lg p-4 border transition-colors duration-300 ${isDark ? 'bg-primary-500/20 border-primary-500/30' : 'bg-primary-100 border-primary-200'}`}>
                        <div className={`text-xs mb-3 font-medium transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>⏱️ Ready to Start?</div>
                        <button className="w-full px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 border border-primary-400">
                          <Clock className="w-4 h-4" />
                          <span>Start Timer (8 min)</span>
                        </button>
                        <p className={`text-xs mt-2 text-center transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>The timer will alert you when the pasta is ready!</p>
                      </div>
                    </div>

                    {/* Next Step Preview */}
                    <div className={`rounded-xl p-4 border opacity-60 transition-colors duration-300 ${isDark ? 'bg-primary-500/10 border-primary-500/20' : 'bg-primary-50 border-primary-100'}`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ${isDark ? 'bg-primary-500/30 text-primary-400' : 'bg-primary-200 text-primary-600'}`}>
                          2
                        </div>
                        <span className={`text-sm transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Step 2: Prepare the Sauce (Coming next...)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              <div>
                <div className={`rounded-3xl p-6 sm:p-8 border-2 shadow-lg transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-primary-100'}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium">
                      4
                    </div>
                    <h3 className={`text-2xl font-medium transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Assistant</h3>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    <div className={`rounded-xl p-3 border transition-colors duration-300 ${isDark ? 'bg-primary-500/10 border-primary-500/20' : 'bg-primary-50 border-primary-100'}`}>
                      <div className={`text-xs mb-1.5 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>You</div>
                      <div className={`text-sm rounded-lg p-2.5 transition-colors duration-300 ${isDark ? 'text-white bg-primary-500/20' : 'text-slate-900 bg-primary-100'}`}>
                        Can you make this vegan?
                      </div>
                    </div>
                    <div className={`rounded-xl p-3 border transition-colors duration-300 ${isDark ? 'bg-primary-500/10 border-primary-500/20' : 'bg-primary-50 border-primary-100'}`}>
                      <div className="flex items-center space-x-2 mb-1.5">
                        <div className={`relative w-6 h-6 rounded-full overflow-hidden border transition-colors duration-300 ${isDark ? 'bg-primary-500/20 border-primary-500/30' : 'bg-primary-100 border-primary-200'}`}>
                          <Image
                            src="/assets/smartlunchlogo.png"
                            alt="AI"
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <span className={`text-xs transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>AI Assistant</span>
                      </div>
                      <div className={`text-sm rounded-lg p-2.5 border transition-colors duration-300 ${isDark ? 'text-slate-300 bg-slate-800 border-slate-700' : 'text-slate-700 bg-white border-primary-100'}`}>
                        I'll replace the cheese with vegan alternatives and update the recipe...
                      </div>
                    </div>
                    <div className={`rounded-xl p-3 border transition-colors duration-300 ${isDark ? 'bg-primary-500/10 border-primary-500/20' : 'bg-primary-50 border-primary-100'}`}>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Ask a question..."
                          readOnly
                          className={`flex-1 border rounded-lg px-3 py-2 text-sm transition-colors duration-300 ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-primary-100 text-slate-900'}`}
                        />
                        <button className="btn-primary p-2">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/20 mb-4">
                  <MessageSquare className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className={`text-2xl font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Step 4: Customize Anytime</h3>
                <p className={`leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Need to modify the recipe?<br className="hidden md:block" />
                  Chat with our AI to adjust ingredients,<br className="hidden md:block" />
                  change cooking steps, or make it fit<br className="hidden md:block" />
                  your preferences even while cooking!
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story Modal */}
      <AnimatePresence>
        {showStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-black/80' : 'bg-black/60'}`}
            onClick={() => setShowStory(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-3xl p-8 sm:p-12 border-2 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative transition-colors duration-300 ${isDark ? 'bg-slate-900 border-primary-500/20' : 'bg-white border-primary-200'}`}
            >
              <button
                onClick={() => setShowStory(false)}
                className={`absolute top-6 right-6 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white hover:border-primary-500/50' : 'bg-slate-100/80 border-slate-200/50 text-slate-600 hover:text-slate-900 hover:border-primary-500/50'}`}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <h2 className={`text-3xl sm:text-4xl md:text-5xl font-medium mb-6 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Our Story
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-primary-600 mx-auto rounded-full mb-8"></div>
                
                {/* Profile Image - Larger and Centered */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 shadow-xl transition-all duration-300 border-primary-500/50 hover:border-primary-500 hover:scale-105">
                    <Image
                      src="/assets/zahra.jpg"
                      alt="Fathima Zahra"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
                
                {/* Name and Title - Centered */}
                <div className="mb-8">
                  <h3 className={`text-2xl sm:text-3xl font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Fathima Zahra</h3>
                  <p className="text-primary-500 text-lg">Founder & CEO</p>
                </div>
              </div>

              <div className={`space-y-6 text-lg leading-relaxed text-center transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <p>
                  I started cooking lunches for my family when I was just <strong className={`transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>9 years old</strong>. 
                  It became my responsibility, and I quickly learned how challenging it can be to create healthy, 
                  delicious meals day after day especially when you're busy.
                </p>
                
                <p>
                  As I grew older, I saw the same struggle in families everywhere. Parents want to feed their 
                  kids well, but between work, school, and life's demands, finding time to plan and prepare 
                  nutritious lunches feels impossible.
                </p>
                
                <p className={`text-xl font-medium transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  That's why I created Smart Lunch.
                </p>
                
                <p>
                  Now, I'm using AI powered recipes to help families everywhere enjoy lunches made with love. 
                  Every recipe is designed to be quick, healthy, and kid approved because I understand what 
                  it's like to be in your kitchen, trying to make something special for the people you care about.
                </p>
                
                <div className={`pt-6 border-t transition-colors duration-300 ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                  <p className="text-primary-500 font-medium">
                    Join thousands of families who are already making lunchtime easier, healthier, and more fun.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features Section */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-medium mb-4 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Why Smart Lunch?
            </h2>
            <p className={`text-xl max-w-2xl mx-auto transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Everything you need to make lunchtime stress-free and delicious
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'AI Powered Recipes',
                description: 'Get personalized recipes tailored to your family\'s preferences, dietary needs, and available ingredients.'
              },
              {
                icon: Clock,
                title: '15 Minute Meals',
                description: 'Quick, easy recipes designed for busy parents. No complicated techniques, just simple, delicious food.'
              },
              {
                icon: Users,
                title: 'Family Focused',
                description: 'Every recipe is kid tested and parent approved. We know what families actually want to eat.'
              },
              {
                icon: Heart,
                title: 'Health Goals',
                description: 'Set your health goals more protein, more vegetables, balanced meals and we\'ll tailor recipes to match.'
              },
              {
                icon: ChefHat,
                title: 'Step by Step Guidance',
                description: 'Detailed instructions that anyone can follow. We break down every step so you can cook with confidence.'
              },
              {
                icon: Star,
                title: 'Save & Organize',
                description: 'Save your favorite recipes, organize by preferences, and build your family\'s perfect lunch collection.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border-2 border-primary-100 hover:border-primary-300 transition-all shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-xl font-medium text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-r from-primary-50 via-primary-100/50 to-primary-50'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-medium mb-6 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Ready to Transform Lunchtime?
            </h2>
            <p className={`text-xl mb-8 max-w-2xl mx-auto transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Join Smart Lunch today and start making lunches your family will love in 15 minutes or less.
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="btn-primary flex items-center justify-center space-x-2 text-lg px-8 py-4 mx-auto group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative w-10 h-10">
                  <Image
                    src="/assets/smartlunchlogo.png"
                    alt="Smart Lunch Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600">
                  Smart Lunch
                </span>
              </div>
              <p className={`text-sm max-w-md transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Lunches made with love. Personalized, healthy recipes for busy families, powered by AI.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className={`font-medium mb-4 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setShowStory(true)}
                    className={`hover:text-primary-500 transition-colors text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                  >
                    Our Story
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowAuth(true)}
                    className={`hover:text-primary-500 transition-colors text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                  >
                    Get Started
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className={`font-medium mb-4 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Connect</h4>
              <ul className="space-y-2">
                <li className={`text-sm transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Made with ❤️ by Fathima Zahra
                </li>
                <li className={`text-sm transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  For busy families everywhere
                </li>
              </ul>
            </div>
          </div>

          <div className={`pt-8 border-t text-center transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              © {new Date().getFullYear()} Smart Lunch. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

