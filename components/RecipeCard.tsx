'use client'

import { Clock, Users, Star, CheckCircle2, Bookmark, BookmarkCheck } from 'lucide-react'
import { Recipe } from '@/data/recipes'

interface RecipeCardProps {
  recipe: Recipe
  onClick: () => void
  availableIngredients: string[]
  isSaved?: boolean
  onSave?: () => void
  onUnsave?: () => void
}

export default function RecipeCard({ recipe, onClick, availableIngredients, isSaved, onSave, onUnsave }: RecipeCardProps) {
  const matchPercentage = availableIngredients.length > 0
    ? Math.round(
        (recipe.ingredients.filter(ri =>
          availableIngredients.some(ai =>
            ri.name.toLowerCase().includes(ai.toLowerCase()) ||
            ai.toLowerCase().includes(ri.name.toLowerCase())
          )
        ).length / recipe.ingredients.length) * 100
      )
    : 100

  return (
    <div
      onClick={onClick}
      className="recipe-card cursor-pointer group"
    >
      <div className="relative mb-4 overflow-hidden rounded-xl">
        <div className="aspect-video bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80 rounded-xl flex items-center justify-center overflow-hidden border border-slate-700/30 group-hover:border-primary-500/40 transition-all duration-300 relative">
          {recipe.imageUrl ? (
            <>
              <img 
                src={recipe.imageUrl} 
                alt={recipe.name}
                className="w-full h-full object-cover"
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
          <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-1 border border-primary-500/30">
            <CheckCircle2 className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-semibold text-slate-100">{matchPercentage}% match</span>
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
            onClick={(e) => {
              e.stopPropagation()
              if (isSaved && onUnsave) {
                onUnsave()
              } else if (!isSaved && onSave) {
                onSave()
              }
            }}
            className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-sm p-2 rounded-full border border-primary-500/30 hover:border-primary-500/60 transition-all hover:scale-110 z-10"
            title={isSaved ? 'Remove from saved' : 'Save recipe'}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-primary-400" />
            ) : (
              <Bookmark className="w-4 h-4 text-slate-400" />
            )}
          </button>
        )}
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-primary-400 transition-colors">
        {recipe.name}
      </h3>
      
      <p className="text-slate-400 text-sm mb-4 line-clamp-2">
        {recipe.description}
      </p>

      <div className="flex items-center justify-between text-sm text-slate-400">
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

      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex flex-wrap gap-1.5">
          {recipe.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-slate-800/60 text-slate-300 text-xs rounded-md border border-slate-700/50"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

