import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
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
export const db: Firestore = getFirestore(app)

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

