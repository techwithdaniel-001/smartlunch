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
            <h1 className={`text-xl sm:text-2xl font-medium transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Our Story
            </h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </nav>

      {/* Story Content */}
      <div className="pt-20 min-h-screen">
        <div className="flex flex-col md:flex-row h-[calc(100vh-5rem)]">
          {/* Left Side - Fixed Card with Image and Profile Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`md:sticky md:top-20 md:h-[calc(100vh-5rem)] md:overflow-y-auto w-full md:w-1/3 lg:w-2/5 p-6 lg:p-8 border-r transition-colors duration-300 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-200'}`}
          >
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              {/* Profile Image */}
              <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden border-4 shadow-2xl transition-all duration-300 border-primary-500/50 hover:border-primary-500 hover:shadow-primary-500/20">
                <Image
                  src="/assets/zahra.jpg"
                  alt="Fathima Zahra"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              
              {/* Name and Title */}
              <div className="text-center">
                <h2 className={`text-3xl sm:text-4xl font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Fathima Zahra</h2>
                <p className="text-primary-500 text-xl">Founder & CEO</p>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Scrollable Story Text */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1 overflow-y-auto"
          >
            <div className={`p-6 lg:p-12 space-y-8 text-lg sm:text-xl leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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
              
              <p className={`text-2xl sm:text-3xl font-medium transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                That's why I created Smart Lunch.
              </p>
              
              <p>
                Now, I'm using AI powered recipes to help families everywhere enjoy lunches made with love. 
                Every recipe is designed to be quick, healthy, and kid approved because I understand what 
                it's like to be in your kitchen, trying to make something special for the people you care about.
              </p>
              
              <div className={`pt-6 border-t transition-colors duration-300 ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                <p className="text-primary-500 font-medium text-xl">
                  Join thousands of families who are already making lunchtime easier, healthier, and more fun.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

