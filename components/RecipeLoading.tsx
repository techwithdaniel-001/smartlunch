'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Sparkles, UtensilsCrossed, Zap } from 'lucide-react'

export default function RecipeLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-effect rounded-3xl border border-primary-500/30 p-8 sm:p-12 max-w-md w-full mx-4 shadow-2xl"
      >
        {/* Animated Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 mb-6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 via-primary-600/30 to-primary-500/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative w-full h-full">
              <Image
                src="/assets/smartlunchlogo.png"
                alt="Smart Lunch Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold text-white mb-2"
          >
            Creating Your Recipe
          </motion.h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Our AI chef is working their magic...
          </p>
        </div>

        {/* Animated Steps */}
        <div className="space-y-4 mb-8">
          {[
            { icon: Sparkles, text: "Analyzing ingredients", delay: 0 },
            { icon: UtensilsCrossed, text: "Crafting instructions", delay: 0.2 },
            { icon: Zap, text: "Generating image", delay: 0.4 },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.delay, duration: 0.5 }}
              className="flex items-center justify-center space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
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
                <step.icon className="w-5 h-5 text-primary-400" />
              </motion.div>
              <span className="text-slate-300 text-sm sm:text-base text-center">{step.text}</span>
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
          <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
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
          className="text-center text-xs sm:text-sm text-slate-500"
        >
          This usually takes 10-15 seconds...
        </motion.p>
      </motion.div>
    </div>
  )
}

