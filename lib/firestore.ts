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
    await setDoc(recipeRef, {
      userId,
      recipeId: recipe.id,
      recipe: recipe,
      savedAt: new Date().toISOString(),
    })
    return true
  } catch (error) {
    console.error('Error saving recipe to Firestore:', error)
    throw error
  }
}

export async function removeRecipeFromFirestore(userId: string, recipeId: string) {
  try {
    const recipeRef = doc(db, SAVED_RECIPES_COLLECTION, `${userId}_${recipeId}`)
    await deleteDoc(recipeRef)
    return true
  } catch (error) {
    console.error('Error removing recipe from Firestore:', error)
    throw error
  }
}

export async function getUserSavedRecipes(userId: string): Promise<Recipe[]> {
  try {
    const q = query(
      collection(db, SAVED_RECIPES_COLLECTION),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    const recipes: Recipe[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.recipe) {
        recipes.push(data.recipe as Recipe)
      }
    })
    
    // Sort by savedAt (most recent first)
    recipes.sort((a, b) => {
      const aData = querySnapshot.docs.find(d => d.data().recipe?.id === a.id)
      const bData = querySnapshot.docs.find(d => d.data().recipe?.id === b.id)
      const aTime = aData?.data().savedAt || ''
      const bTime = bData?.data().savedAt || ''
      return bTime.localeCompare(aTime)
    })
    
    return recipes
  } catch (error) {
    console.error('Error fetching saved recipes from Firestore:', error)
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

