/**
 * Play a sound effect
 * @param soundPath - Path to the sound file (relative to public folder)
 * @param volume - Volume level (0.0 to 1.0, default: 0.5)
 */
export function playSound(soundPath: string, volume: number = 0.5): void {
  if (typeof window === 'undefined') return // Server-side check
  
  try {
    const audio = new Audio(soundPath)
    audio.volume = Math.max(0, Math.min(1, volume)) // Clamp between 0 and 1
    audio.play().catch((error) => {
      // Silently fail if audio can't play (e.g., user hasn't interacted with page)
      console.log('Could not play sound:', error)
    })
  } catch (error) {
    console.log('Error playing sound:', error)
  }
}

/**
 * Play the chime alert sound when AI recipe generation completes
 */
export function playRecipeCompleteSound(): void {
  playSound('/assets/chimealert.mp3', 0.6)
}

