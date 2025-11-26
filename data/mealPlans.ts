import { Recipe } from './recipes'

export type MealPlanDuration = 'day' | 'week' | 'month'

export interface MealPlanItem {
  date: string // ISO date string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  recipe: Recipe
}

export interface MealPlan {
  id: string
  userId: string
  name: string
  duration: MealPlanDuration
  startDate: string // ISO date string
  endDate: string // ISO date string
  items: MealPlanItem[]
  createdAt: string
  updatedAt: string
}

