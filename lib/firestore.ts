import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'
import { Recipe } from '@/data/recipes'

const SAVED_RECIPES_COLLECTION = 'savedRecipes'

export async function saveRecipeToFirestore(userId: string, recipe: Recipe) {
  try {
    const recipeRef = doc(db, SAVED_RECIPES_COLLECTION, `${userId}_${recipe.id}`)
    
    // Check if document exists to determine if it's create or update
    const docSnap = await getDoc(recipeRef)
    const existingData = docSnap.exists() ? docSnap.data() : null
    
    const recipeData = {
      userId,
      recipeId: recipe.id,
      recipe: recipe,
      savedAt: existingData?.savedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    // Use setDoc which works for both create and update
    await setDoc(recipeRef, recipeData, { merge: true })
    return true
  } catch (error: any) {
    console.error('Error saving recipe to Firestore:', error)
    console.error('Error code:', error?.code)
    console.error('Error message:', error?.message)
    
    // Provide more specific error messages
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check Firestore security rules are deployed.')
    }
    if (error?.code === 'unavailable' || error?.code === 'deadline-exceeded' || error?.code === 'failed-precondition') {
      throw new Error('Firestore is temporarily unavailable. Please check your internet connection and try again.')
    }
    // Re-throw with original error message for better debugging
    throw new Error(error?.message || 'Failed to save recipe. Please check the console for details.')
  }
}

export async function removeRecipeFromFirestore(userId: string, recipeId: string) {
  try {
    const recipeRef = doc(db, SAVED_RECIPES_COLLECTION, `${userId}_${recipeId}`)
    await deleteDoc(recipeRef)
    return true
  } catch (error: any) {
    console.error('Error removing recipe from Firestore:', error)
    console.error('Error code:', error?.code)
    console.error('Error message:', error?.message)
    
    // Provide more specific error messages
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check Firestore security rules are deployed.')
    }
    if (error?.code === 'unavailable' || error?.code === 'deadline-exceeded' || error?.code === 'failed-precondition') {
      throw new Error('Firestore is temporarily unavailable. Please check your internet connection and try again.')
    }
    // Re-throw with original error message for better debugging
    throw new Error(error?.message || 'Failed to remove recipe. Please check the console for details.')
  }
}

export async function getUserSavedRecipes(userId: string): Promise<Recipe[]> {
  try {
    const q = query(
      collection(db, SAVED_RECIPES_COLLECTION),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    
    // Create array with recipe and savedAt together for efficient sorting
    const recipesWithMetadata: Array<{ recipe: Recipe; savedAt: string }> = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.recipe) {
        recipesWithMetadata.push({
          recipe: data.recipe as Recipe,
          savedAt: data.savedAt || ''
        })
      }
    })
    
    // Sort by savedAt (most recent first) - O(n log n) instead of O(n²)
    recipesWithMetadata.sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    
    // Extract just the recipes
    return recipesWithMetadata.map(item => item.recipe)
  } catch (error: any) {
    console.error('Error fetching saved recipes from Firestore:', error)
    console.error('Error code:', error?.code)
    console.error('Error message:', error?.message)
    
    // Provide more specific error messages
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check Firestore security rules are deployed.')
    }
    if (error?.code === 'unavailable' || error?.code === 'deadline-exceeded' || error?.code === 'failed-precondition') {
      throw new Error('Firestore is temporarily unavailable. Please check your internet connection and try again.')
    }
    throw error
  }
}

export async function isRecipeSaved(userId: string, recipeId: string): Promise<boolean> {
  try {
    const recipeRef = doc(db, SAVED_RECIPES_COLLECTION, `${userId}_${recipeId}`)
    const docSnap = await getDoc(recipeRef)
    return docSnap.exists()
  } catch (error) {
    console.error('Error checking if recipe is saved:', error)
    return false
  }
}

export async function updateSavedRecipe(userId: string, recipe: Recipe) {
  try {
    const recipeRef = doc(db, SAVED_RECIPES_COLLECTION, `${userId}_${recipe.id}`)
    const docSnap = await getDoc(recipeRef)
    
    if (docSnap.exists()) {
      await setDoc(recipeRef, {
        userId,
        recipeId: recipe.id,
        recipe: recipe,
        savedAt: docSnap.data().savedAt, // Keep original savedAt
        updatedAt: new Date().toISOString(),
      }, { merge: true })
      return true
    }
    return false
  } catch (error) {
    console.error('Error updating saved recipe in Firestore:', error)
    throw error
  }
}

// User Preferences
export interface UserPreferences {
  dietaryRestrictions: string[]
  numberOfPeople: number
  hasKids: boolean
  hasPartner: boolean
  kidsAges?: string[]
  preferences?: string[]
  kitchenEquipment?: string[]
}

const USER_PREFERENCES_COLLECTION = 'userPreferences'

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const prefsRef = doc(db, USER_PREFERENCES_COLLECTION, userId)
    const docSnap = await getDoc(prefsRef)
    
    if (docSnap.exists()) {
      return docSnap.data() as UserPreferences
    }
    return null
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    throw error
  }
}

export async function saveUserPreferences(userId: string, preferences: UserPreferences) {
  try {
    const prefsRef = doc(db, USER_PREFERENCES_COLLECTION, userId)
    await setDoc(prefsRef, {
      ...preferences,
      updatedAt: new Date().toISOString(),
    }, { merge: true })
    return true
  } catch (error) {
    console.error('Error saving user preferences:', error)
    throw error
  }
}

