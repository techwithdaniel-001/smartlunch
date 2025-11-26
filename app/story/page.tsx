'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export default function StoryPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-white'}`}>
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-xl border-b transition-colors duration-300 ${isDark ? 'bg-slate-950/80 border-slate-800/50' : 'bg-white/80 border-slate-200/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <button
              onClick={() => router.back()}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors duration-300 ${isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/50' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Story Content */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h1 className={`text-4xl sm:text-5xl md:text-6xl font-medium mb-6 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Our Story
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-primary-600 mx-auto rounded-full mb-12"></div>
              
              {/* Profile Image - Larger and Centered */}
              <div className="flex justify-center mb-8">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 shadow-xl transition-all duration-300 border-primary-500/50 hover:border-primary-500 hover:scale-105">
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
              <div className="mb-12">
                <h2 className={`text-3xl sm:text-4xl font-medium mb-3 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Fathima Zahra</h2>
                <p className="text-primary-500 text-xl">Founder & CEO</p>
              </div>
            </div>

            <div className={`space-y-8 text-lg sm:text-xl leading-relaxed text-center transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                I started cooking lunches for my family when I was just <strong className={`transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>9 years old</strong>. 
                It became my responsibility, and I quickly learned how challenging it can be to create healthy, 
                delicious meals day after day especially when you're busy.
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                As I grew older, I saw the same struggle in families everywhere. Parents want to feed their 
                kids well, but between work, school, and life's demands, finding time to plan and prepare 
                nutritious lunches feels impossible.
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className={`text-2xl sm:text-3xl font-medium transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}
              >
                That's why I created Smart Lunch.
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Now, I'm using AI powered recipes to help families everywhere enjoy lunches made with love. 
                Every recipe is designed to be quick, healthy, and kid approved because I understand what 
                it's like to be in your kitchen, trying to make something special for the people you care about.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className={`pt-8 border-t transition-colors duration-300 ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}
              >
                <p className="text-primary-500 font-medium text-xl">
                  Join thousands of families who are already making lunchtime easier, healthier, and more fun.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

