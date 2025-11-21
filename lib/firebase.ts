import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAhhLyHLtBB0UgxQlgJnbJ_vJWfVSLebFg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "smart-lunch-4bab3.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "smart-lunch-4bab3",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "smart-lunch-4bab3.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "408696166420",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:408696166420:web:ed3b924a90f9dfd6286f01",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-SXBNJQWB91"
}

// Initialize Firebase
let app: FirebaseApp
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Initialize Firebase services
export const auth: Auth = getAuth(app)

// Initialize Firestore with better error handling
let db: Firestore
try {
  db = getFirestore(app)
  
  // Enable offline persistence (optional, helps with connectivity issues)
  if (typeof window !== 'undefined') {
    import('firebase/firestore').then((firestoreModule) => {
      firestoreModule.enableIndexedDbPersistence(db).catch((err: any) => {
        if (err.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled in one tab at a time
          console.warn('Firestore persistence already enabled in another tab')
        } else if (err.code === 'unimplemented') {
          // Browser doesn't support persistence
          console.warn('Firestore persistence not supported in this browser')
        }
      })
    })
  }
} catch (error) {
  console.error('Error initializing Firestore:', error)
  throw error
}

export { db }

// Set authentication persistence to local (persists across browser sessions)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error setting auth persistence:', error)
  })
}

// Initialize Analytics (only on client side, optional)
let analytics: any = null
if (typeof window !== 'undefined') {
  try {
    import('firebase/analytics').then((analyticsModule) => {
      analyticsModule.isSupported().then((supported) => {
        if (supported) {
          analytics = analyticsModule.getAnalytics(app)
        }
      })
    })
  } catch (error) {
    // Analytics not available, continue without it
    console.log('Analytics not available')
  }
}

export { analytics }

export default app

