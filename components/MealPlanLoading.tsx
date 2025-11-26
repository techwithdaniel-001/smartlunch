'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Calendar, Sparkles, UtensilsCrossed, Zap } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export default function MealPlanLoading() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-colors duration-300 ${isDark ? 'bg-slate-950/80' : 'bg-white/80'}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`rounded-3xl border border-primary-500/30 p-8 sm:p-12 max-w-md w-full mx-4 transition-colors duration-300 ${isDark ? 'glass-effect' : 'bg-white'}`}
      >
        {/* Animated Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{
              rotate: [0, 5, -5, 5, 0],
              scale: [1, 1.05, 1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 mb-6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 via-primary-600/30 to-primary-500/30 rounded-full blur-2xl animate-pulse"></div>
            <div className={`relative z-10 p-4 rounded-2xl border-2 transition-colors duration-300 ${isDark ? 'bg-slate-800/50 border-primary-500/30' : 'bg-white border-primary-200'}`}>
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-primary-500" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            Creating Your Meal Plan
          </motion.h2>
          <p className={`text-sm sm:text-base transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Planning your meals and generating recipes...
          </p>
        </div>

        {/* Animated Steps */}
        <div className="space-y-4 mb-8">
          {[
            { icon: Sparkles, text: "Analyzing your preferences", delay: 0 },
            { icon: UtensilsCrossed, text: "Planning meals for each day", delay: 0.2 },
            { icon: Zap, text: "Generating recipes", delay: 0.4 },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.delay, duration: 0.5 }}
              className={`flex items-center justify-center space-x-3 p-3 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: step.delay,
                  ease: "easeInOut"
                }}
                className="flex-shrink-0"
              >
                <step.icon className="w-5 h-5 text-primary-500" />
              </motion.div>
              <span className={`text-sm sm:text-base text-center transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{step.text}</span>
              <motion.div
                className="flex space-x-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: step.delay + 0.3 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-primary-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: step.delay + i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className={`h-2 rounded-full overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-800/50' : 'bg-slate-200'}`}>
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
        </div>

        {/* Fun Message */}
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`text-center text-xs sm:text-sm transition-colors duration-300 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
        >
          This usually takes 15-20 seconds...
        </motion.p>
      </motion.div>
    </div>
  )
}

