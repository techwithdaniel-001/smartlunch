'use client'

import { memo, useMemo } from 'react'
import Image from 'next/image'
import { Clock, Users, Star, CheckCircle2, Bookmark, BookmarkCheck } from 'lucide-react'
import { Recipe } from '@/data/recipes'
import { useTheme } from '@/contexts/ThemeContext'

interface RecipeCardProps {
  recipe: Recipe
  onClick: () => void
  availableIngredients: string[]
  isSaved?: boolean
  onSave?: () => void
  onUnsave?: () => void
}

function RecipeCard({ recipe, onClick, availableIngredients, isSaved, onSave, onUnsave }: RecipeCardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const matchPercentage = useMemo(() => {
    if (availableIngredients.length === 0) return 100
    return Math.round(
      (recipe.ingredients.filter(ri =>
        availableIngredients.some(ai =>
          ri.name.toLowerCase().includes(ai.toLowerCase()) ||
          ai.toLowerCase().includes(ri.name.toLowerCase())
        )
      ).length / recipe.ingredients.length) * 100
    )
  }, [recipe.ingredients, availableIngredients])

  return (
    <div
      onClick={onClick}
      className={`recipe-card cursor-pointer group transition-colors duration-300 border ${
        isDark 
          ? 'glass-effect border-slate-800/80 hover:border-primary-500/30' 
          : 'bg-white border-primary-200/50 hover:border-primary-500/50'
      }`}
    >
      <div className="relative mb-4 overflow-hidden rounded-xl">
        <div className={`aspect-video rounded-xl flex items-center justify-center overflow-hidden border group-hover:border-primary-500/40 transition-all duration-300 relative ${
          isDark 
            ? 'bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80 border-slate-700/30' 
            : 'bg-gradient-to-br from-primary-50/50 via-white to-primary-50/50 border-primary-200'
        }`}>
          {recipe.imageUrl ? (
            <>
              <Image 
                src={recipe.imageUrl} 
                alt={recipe.name}
                fill
                className="object-cover"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-primary-500/5 to-primary-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.2)_100%)]"></div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-primary-500/5 to-primary-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="text-6xl filter drop-shadow-2xl relative z-10 transform group-hover:scale-110 transition-transform duration-300">{recipe.emoji}</div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)] opacity-60"></div>
            </>
          )}
        </div>
        {availableIngredients.length > 0 && (
          <div className={`absolute top-3 right-3 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-1 border border-primary-500/30 transition-colors duration-300 ${
            isDark ? 'bg-slate-900/90' : 'bg-white/95'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-primary-400" />
            <span className={`text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-slate-100' : 'text-black'}`}>{matchPercentage}% match</span>
          </div>
        )}
        {recipe.difficulty === 'Easy' && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
            Easy
          </div>
        )}
        {/* Save Button */}
        {(onSave || onUnsave) && (
          <button
            onClick={async (e) => {
              e.stopPropagation()
              e.preventDefault()
              try {
                if (isSaved && onUnsave) {
                  await onUnsave()
                } else if (!isSaved && onSave) {
                  await onSave()
                }
              } catch (error) {
                console.error('Error in save button:', error)
              }
            }}
            className={`absolute bottom-3 right-3 backdrop-blur-sm p-2 rounded-full border border-primary-500/30 hover:border-primary-500/60 transition-all hover:scale-110 z-10 active:scale-95 ${
              isDark ? 'bg-slate-900/90' : 'bg-white/95'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save recipe'}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-primary-400" />
            ) : (
              <Bookmark className={`w-4 h-4 hover:text-primary-400 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/60'}`} />
            )}
          </button>
        )}
      </div>

      <h3 className={`text-xl font-bold mb-2 group-hover:text-primary-400 transition-colors duration-300 ${isDark ? 'text-slate-100' : 'text-black'}`}>
        {recipe.name}
      </h3>
      
      <p className={`text-sm mb-4 line-clamp-2 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/70'}`}>
        {recipe.description}
      </p>

      <div className={`flex items-center justify-between text-sm transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-black/70'}`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-primary-400" />
            <span>{recipe.time}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4 text-primary-400" />
            <span>{recipe.servings}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 fill-primary-400 text-primary-400" />
          <span className="font-semibold">{recipe.rating}</span>
        </div>
      </div>

      <div className={`mt-4 pt-4 border-t transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-primary-200'}`}>
        <div className="flex flex-wrap gap-1.5">
          {recipe.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={`px-2.5 py-1 text-xs rounded-md border transition-colors duration-300 ${
                isDark 
                  ? 'bg-slate-800/60 text-slate-300 border-slate-700/50' 
                  : 'bg-primary-50 text-black border-primary-200'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(RecipeCard)

