'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ArrowRight, Sparkles, Clock, Users, Heart, ChefHat, CheckCircle2, Star, X, Search, MessageSquare, BookOpen, ChefHat as ChefHatIcon, CheckCircle, Loader2, Lock } from 'lucide-react'
import Auth from './Auth'
import { Recipe } from '@/data/recipes'

export default function LandingPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
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
                className="hidden sm:block px-4 py-2 text-slate-300 hover:text-white transition-colors"
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
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white mb-6 leading-tight">
                Lunches Made
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600">
                  with Love
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-slate-300 mb-8 leading-relaxed">
                Personalized, healthy lunch recipes for busy families. 
                <span className="block mt-2 text-lg text-slate-400">
                  Founded by Fathima Zahra, who started cooking lunches at 9—now using AI to help families everywhere.
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
                  className="px-8 py-4 border-2 border-slate-700 text-slate-300 rounded-xl font-medium hover:border-primary-500/50 hover:bg-primary-500/10 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Our Story</span>
                </button>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-medium text-primary-400 mb-1">15min</div>
                  <div className="text-sm text-slate-400">Avg Prep Time</div>
                </div>
                <div>
                  <div className="text-3xl font-medium text-primary-400 mb-1">100%</div>
                  <div className="text-sm text-slate-400">Kid-Friendly</div>
                </div>
                <div>
                  <div className="text-3xl font-medium text-primary-400 mb-1">AI</div>
                  <div className="text-sm text-slate-400">Personalized</div>
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
              <div className="glass-effect rounded-3xl overflow-hidden border-primary-500/20 relative">
                <div className="relative w-full aspect-[4/3] sm:aspect-square">
                  <Image
                    src="/assets/love.jpg"
                    alt="Smart Lunch - Lunches made with love"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-primary-600/10"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Try Smart Lunch AI Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white mb-4">
              Try Smart Lunch AI
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
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
            <div className="glass-effect rounded-3xl p-8 sm:p-10 lg:p-12 border-primary-500/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-primary-600/10"></div>
              <div className="relative z-10">
                <p className="text-slate-300 mb-6 text-center text-base sm:text-lg">
                  💡 Examples: "quick 15-minute pasta", "fun animal sandwiches", "healthy wraps for kids"
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="e.g., 'quick pasta for kids' or 'healthy wraps with chicken'..."
                      className="w-full pl-12 sm:pl-14 pr-4 sm:pr-5 py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-slate-800/70 border-2 border-slate-700/50 text-slate-100 placeholder-slate-500 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all backdrop-blur-sm text-base sm:text-lg"
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
        <section id="recipe-preview" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-3xl p-8 border-primary-500/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-primary-600/10"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-medium text-white mb-2">{previewRecipe.name}</h2>
                    <p className="text-slate-300">{previewRecipe.description}</p>
                  </div>
                  <button
                    onClick={() => setPreviewRecipe(null)}
                    className="w-8 h-8 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Clock className="w-4 h-4 text-primary-400" />
                      <span>{previewRecipe.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Users className="w-4 h-4 text-primary-400" />
                      <span>{previewRecipe.servings}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Star className="w-4 h-4 fill-primary-400 text-primary-400" />
                      <span>{previewRecipe.rating}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Ingredients Needed</h3>
                    <div className="space-y-2">
                      {previewRecipe.ingredients.slice(0, 5).map((ing, i) => (
                        <div key={i} className="flex items-center space-x-2 text-slate-300 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary-400" />
                          <span>{ing.amount} {ing.name}</span>
                        </div>
                      ))}
                      {previewRecipe.ingredients.length > 5 && (
                        <p className="text-slate-400 text-sm">+ {previewRecipe.ingredients.length - 5} more ingredients</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-700/50">
                  <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-6 text-center">
                    <Lock className="w-8 h-8 text-primary-400 mx-auto mb-3" />
                    <h3 className="text-xl font-medium text-white mb-2">Sign up to view full recipe</h3>
                    <p className="text-slate-300 mb-4">
                      Get access to step-by-step cooking instructions, timers, AI assistance, and more!
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
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
                <h3 className="text-2xl font-medium text-white mb-2">Step 1: Search</h3>
                <p className="text-slate-400 leading-relaxed">
                  Type what you want to make—<br className="hidden md:block" />
                  like "quick pasta" or "healthy wraps"—<br className="hidden md:block" />
                  and our AI generates a custom recipe<br className="hidden md:block" />
                  tailored to your family.
                </p>
              </div>
              <div>
                <div className="glass-effect rounded-3xl p-6 sm:p-8 border-primary-500/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium">
                      1
                    </div>
                    <h3 className="text-2xl font-medium text-white">Tell Us What You Want</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                      <div className="flex items-center space-x-2 mb-3">
                        <Sparkles className="w-4 h-4 text-primary-400" />
                        <span className="text-sm font-medium text-slate-100">AI Recipe Search</span>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value="quick pasta for kids"
                          readOnly
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/50 border-2 border-slate-700/50 text-slate-300 text-sm"
                        />
                      </div>
                      <button className="mt-3 w-full btn-primary text-sm py-2.5 flex items-center justify-center space-x-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Generate</span>
                      </button>
                    </div>
                    <p className="text-slate-300 text-sm">
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
                <div className="glass-effect rounded-3xl p-6 sm:p-8 border-primary-500/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium">
                      2
                    </div>
                    <h3 className="text-2xl font-medium text-white">Your Personalized Recipe</h3>
                  </div>
                  <div className="space-y-3">
                    {/* Recipe Preview */}
                    <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-3xl">🍝</span>
                        <div>
                          <div className="text-base font-medium text-slate-100">Quick Pasta for Kids</div>
                          <div className="text-xs text-slate-400">15 min • 4 servings</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                      <div className="text-sm font-medium text-slate-100 mb-3">Ingredients Needed</div>
                      <div className="space-y-2">
                        {['2 cups Pasta', '1 cup Tomato Sauce', '1/2 cup Grated Cheese', '1 tbsp Olive Oil', 'Salt & Pepper'].map((ing, i) => (
                          <div key={i} className="flex items-center space-x-2 text-slate-300 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary-400 flex-shrink-0" />
                            <span>{ing}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                      <div className="text-sm font-medium text-slate-100 mb-2">Quick Prep Guide</div>
                      <div className="flex items-center space-x-4 text-xs text-slate-300">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-primary-400" />
                          <span>15 min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3 text-primary-400" />
                          <span>4 servings</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-primary-400" />
                          <span>Kid-friendly</span>
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
                <h3 className="text-2xl font-medium text-white mb-2">Step 2: Get Your Recipe</h3>
                <p className="text-slate-400 leading-relaxed">
                  Receive a complete recipe with ingredients,<br className="hidden md:block" />
                  step-by-step instructions, and cooking tips—<br className="hidden md:block" />
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
                <h3 className="text-2xl font-medium text-white mb-2">Step 3: Start Cooking</h3>
                <p className="text-slate-400 mb-4 leading-relaxed">
                  Enter cooking mode for step-by-step guidance.<br className="hidden md:block" />
                  Each step is detailed and easy to follow,<br className="hidden md:block" />
                  with timers and AI help available<br className="hidden md:block" />
                  whenever you need it.
                </p>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary-400" />
                    <span>Detailed instructions for beginners</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary-400" />
                    <span>Built-in timers for each step</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary-400" />
                    <span>AI help available anytime</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="glass-effect rounded-3xl p-6 sm:p-8 border-primary-500/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium">
                      3
                    </div>
                    <h3 className="text-2xl font-medium text-white">Cook with Guidance</h3>
                  </div>
                  
                  {/* Recipe Header */}
                  <div className="mb-6 pb-6 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-4xl">🍝</span>
                      <div>
                        <h4 className="text-lg font-medium text-white">Quick Pasta for Kids</h4>
                        <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
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
                    <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                          1
                        </div>
                        <span className="text-base font-medium text-slate-100">Step 1: Cook the Pasta</span>
                      </div>
                      
                      <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-slate-700/30">
                        <p className="text-slate-200 text-sm leading-relaxed mb-3">
                          First, fill a large pot with 6 cups of water. Place it on the stove over high heat. Wait until the water starts bubbling and boiling (you'll see big bubbles rising to the surface). Then add 1 tablespoon of salt to the water.
                        </p>
                        <p className="text-slate-200 text-sm leading-relaxed">
                          Next, add 2 cups of pasta to the boiling water. Stir it once with a spoon so the pasta doesn't stick together. Let it cook for 8 minutes, stirring occasionally.
                        </p>
                      </div>
                      
                      <div className="bg-primary-500/10 rounded-lg p-4 border border-primary-500/30">
                        <div className="text-xs text-slate-300 mb-3 font-medium">⏱️ Ready to Start?</div>
                        <button className="w-full px-4 py-3 bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 border border-primary-500/30">
                          <Clock className="w-4 h-4" />
                          <span>Start Timer (8 min)</span>
                        </button>
                        <p className="text-xs text-slate-400 mt-2 text-center">The timer will alert you when the pasta is ready!</p>
                      </div>
                    </div>

                    {/* Next Step Preview */}
                    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 opacity-60">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-sm font-medium">
                          2
                        </div>
                        <span className="text-sm text-slate-400">Step 2: Prepare the Sauce (Coming next...)</span>
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
                <div className="glass-effect rounded-3xl p-6 sm:p-8 border-primary-500/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium">
                      4
                    </div>
                    <h3 className="text-2xl font-medium text-white">AI Assistant</h3>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                      <div className="text-xs text-slate-400 mb-1.5">You</div>
                      <div className="text-sm text-slate-200 bg-primary-500/10 rounded-lg p-2.5">
                        Can you make this vegan?
                      </div>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                      <div className="flex items-center space-x-2 mb-1.5">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-primary-500/20 border border-primary-500/30">
                          <Image
                            src="/assets/smartlunchlogo.png"
                            alt="AI"
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <span className="text-xs text-slate-400">AI Assistant</span>
                      </div>
                      <div className="text-sm text-slate-300 bg-slate-900/50 rounded-lg p-2.5">
                        I'll replace the cheese with vegan alternatives and update the recipe...
                      </div>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Ask a question..."
                          readOnly
                          className="flex-1 bg-slate-900/50 border border-slate-700/30 rounded-lg px-3 py-2 text-slate-300 text-sm"
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
                <h3 className="text-2xl font-medium text-white mb-2">Step 4: Customize Anytime</h3>
                <p className="text-slate-400 leading-relaxed">
                  Need to modify the recipe?<br className="hidden md:block" />
                  Chat with our AI to adjust ingredients,<br className="hidden md:block" />
                  change cooking steps, or make it fit<br className="hidden md:block" />
                  your preferences—even while cooking!
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowStory(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect rounded-3xl p-8 sm:p-12 border-primary-500/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setShowStory(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:border-primary-500/50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white mb-4">
                  Our Story
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-primary-600 mx-auto rounded-full"></div>
              </div>

              <div className="flex items-start space-x-6 mb-8">
                <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-3xl">
                  👩‍🍳
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-medium text-white mb-2">Fathima Zahra</h3>
                  <p className="text-primary-400 mb-4">Founder & CEO</p>
                </div>
              </div>

              <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
                <p>
                  I started cooking lunches for my family when I was just <strong className="text-white">9 years old</strong>. 
                  It became my responsibility, and I quickly learned how challenging it can be to create healthy, 
                  delicious meals day after day—especially when you're busy.
                </p>
                
                <p>
                  As I grew older, I saw the same struggle in families everywhere. Parents want to feed their 
                  kids well, but between work, school, and life's demands, finding time to plan and prepare 
                  nutritious lunches feels impossible.
                </p>
                
                <p className="text-xl text-white font-medium">
                  That's why I created Smart Lunch.
                </p>
                
                <p>
                  Now, I'm using AI-powered recipes to help families everywhere enjoy lunches made with love. 
                  Every recipe is designed to be quick, healthy, and kid-approved—because I understand what 
                  it's like to be in your kitchen, trying to make something special for the people you care about.
                </p>
                
                <div className="pt-6 border-t border-slate-700/50">
                  <p className="text-primary-400 font-medium">
                    Join thousands of families who are already making lunchtime easier, healthier, and more fun.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white mb-4">
              Why Smart Lunch?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything you need to make lunchtime stress-free and delicious
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'AI-Powered Recipes',
                description: 'Get personalized recipes tailored to your family\'s preferences, dietary needs, and available ingredients.'
              },
              {
                icon: Clock,
                title: '15-Minute Meals',
                description: 'Quick, easy recipes designed for busy parents. No complicated techniques, just simple, delicious food.'
              },
              {
                icon: Users,
                title: 'Family-Focused',
                description: 'Every recipe is kid-tested and parent-approved. We know what families actually want to eat.'
              },
              {
                icon: Heart,
                title: 'Health Goals',
                description: 'Set your health goals—more protein, more vegetables, balanced meals—and we\'ll tailor recipes to match.'
              },
              {
                icon: ChefHat,
                title: 'Step-by-Step Guidance',
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
                className="glass-effect rounded-2xl p-6 border-slate-800/80 hover:border-primary-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500/10 via-primary-600/10 to-primary-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white mb-6">
              Ready to Transform Lunchtime?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join Smart Lunch today and start making lunches your family will love—in 15 minutes or less.
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
      <footer className="bg-slate-950/80 border-t border-slate-800/50 py-12 px-4 sm:px-6 lg:px-8">
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
              <p className="text-slate-400 text-sm max-w-md">
                Lunches made with love. Personalized, healthy recipes for busy families, powered by AI.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setShowStory(true)}
                    className="text-slate-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    Our Story
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowAuth(true)}
                    className="text-slate-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    Get Started
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-medium mb-4">Connect</h4>
              <ul className="space-y-2">
                <li className="text-slate-400 text-sm">
                  Made with ❤️ by Fathima Zahra
                </li>
                <li className="text-slate-400 text-sm">
                  For busy families everywhere
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/50 text-center">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Smart Lunch. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

