import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc, 
  query, 
  where, 
  getDocs,
  writeBatch,
  orderBy
} from 'firebase/firestore'
import { db, auth } from './firebase'
import { Recipe } from '@/data/recipes'
import { MealPlan } from '@/data/mealPlans'

const SAVED_RECIPES_COLLECTION = 'savedRecipes'

export async function saveRecipeToFirestore(userId: string, recipe: Recipe) {
  try {
    // Verify user is authenticated and userId matches
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('User is not authenticated')
    }
    
    if (currentUser.uid !== userId) {
      throw new Error('User ID does not match authenticated user')
    }
    
    const recipeRef = doc(db, SAVED_RECIPES_COLLECTION, `${userId}_${recipe.id}`)
    
    // Check if document exists to preserve savedAt timestamp
    const docSnap = await getDoc(recipeRef)
    const exists = docSnap.exists()
    const existingData = exists ? docSnap.data() : null
    
    // Ensure userId is explicitly set to current user's uid
    const recipeData = {
      userId: currentUser.uid, // Explicitly set to ensure it matches
      recipeId: recipe.id,
      recipe: recipe,
      savedAt: existingData?.savedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    // Explicitly set userId again to ensure it's correct
    recipeData.userId = currentUser.uid
    
    // Debug: Log what we're trying to save
    console.log('Attempting to save recipe:', {
      documentId: `${userId}_${recipe.id}`,
      userId: currentUser.uid,
      recipeDataUserId: recipeData.userId,
      userIdsMatch: currentUser.uid === recipeData.userId,
      hasRecipe: !!recipeData.recipe,
      hasRecipeId: !!recipeData.recipeId,
      exists: exists,
      existingUserId: existingData?.userId
    })
    
    // Use setDoc without merge to ensure clean write
    // This ensures userId is always set correctly
    await setDoc(recipeRef, recipeData)
    
    console.log('Recipe saved successfully!')
    
    return true
  } catch (error: any) {
    console.error('Error saving recipe to Firestore:', error)
    console.error('Error code:', error?.code)
    console.error('Error message:', error?.message)
    
    if (error?.code === 'permission-denied') {
      console.error('Permission denied - check rules are deployed and userId matches')
      throw new Error('Permission denied. Please check Firestore security rules are deployed.')
    }
    if (error?.code === 'unavailable' || error?.code === 'deadline-exceeded' || error?.code === 'failed-precondition') {
      throw new Error('Firestore is temporarily unavailable. Please check your internet connection and try again.')
    }
    throw new Error(error?.message || 'Failed to save recipe.')
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
  allergies?: string[]
  numberOfPeople: number
  hasKids: boolean
  hasPartner: boolean
  kidsAges?: string[]
  preferences?: string[]
  kitchenEquipment?: string[]
  healthGoals?: string[]
  onboardingCompleted?: boolean
  theme?: 'light' | 'dark'
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

// Meal Plans
const MEAL_PLANS_COLLECTION = 'mealPlans'

export async function saveMealPlanToFirestore(userId: string, mealPlan: MealPlan) {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('User is not authenticated')
    }
    
    if (currentUser.uid !== userId) {
      throw new Error('User ID does not match authenticated user')
    }
    
    const mealPlanRef = doc(db, MEAL_PLANS_COLLECTION, mealPlan.id)
    
    // Check if document exists
    const docSnap = await getDoc(mealPlanRef)
    const exists = docSnap.exists()
    
    // Ensure userId is explicitly set to current user's uid
    const mealPlanData = {
      ...mealPlan,
      userId: currentUser.uid,
      updatedAt: new Date().toISOString(),
    }
    
    // Explicitly set userId to ensure it matches
    mealPlanData.userId = currentUser.uid
    
    if (exists) {
      // Update existing document
      await updateDoc(mealPlanRef, mealPlanData)
    } else {
      // Create new document
      await setDoc(mealPlanRef, {
        ...mealPlanData,
        createdAt: mealPlan.createdAt || new Date().toISOString(),
      })
    }
    
    return true
  } catch (error: any) {
    console.error('Error saving meal plan to Firestore:', error)
    console.error('Meal plan data:', { id: mealPlan.id, userId, currentUserId: auth.currentUser?.uid })
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check Firestore security rules are deployed.')
    }
    throw new Error(error?.message || 'Failed to save meal plan.')
  }
}

export async function getUserMealPlans(userId: string): Promise<MealPlan[]> {
  try {
    const q = query(
      collection(db, MEAL_PLANS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => doc.data() as MealPlan)
  } catch (error) {
    console.error('Error fetching meal plans:', error)
    throw error
  }
}

export async function removeMealPlanFromFirestore(userId: string, mealPlanId: string) {
  try {
    const mealPlanRef = doc(db, MEAL_PLANS_COLLECTION, mealPlanId)
    await deleteDoc(mealPlanRef)
    return true
  } catch (error: any) {
    console.error('Error removing meal plan from Firestore:', error)
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check Firestore security rules are deployed.')
    }
    throw new Error(error?.message || 'Failed to remove meal plan.')
  }
}

export async function updateMealPlan(userId: string, mealPlanId: string, updates: Partial<MealPlan>) {
  try {
    const currentUser = auth.currentUser
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error('User is not authenticated')
    }
    
    const mealPlanRef = doc(db, MEAL_PLANS_COLLECTION, mealPlanId)
    await updateDoc(mealPlanRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    return true
  } catch (error: any) {
    console.error('Error updating meal plan:', error)
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check Firestore security rules are deployed.')
    }
    throw new Error(error?.message || 'Failed to update meal plan.')
  }
}

