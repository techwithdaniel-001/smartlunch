import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Recipe } from '@/data/recipes'
import { MealPlan, MealPlanItem, MealPlanDuration } from '@/data/mealPlans'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function generateId(): string {
  return `mealplan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateRecipeId(): string {
  return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getDatesForDuration(duration: MealPlanDuration, startDate?: string): { start: string; end: string; dates: string[] } {
  const start = startDate ? new Date(startDate) : new Date()
  start.setHours(0, 0, 0, 0)
  
  const dates: string[] = []
  let end = new Date(start)
  
  switch (duration) {
    case 'day':
      dates.push(start.toISOString().split('T')[0])
      break
    case 'week':
      end.setDate(start.getDate() + 6)
      for (let i = 0; i < 7; i++) {
        const date = new Date(start)
        date.setDate(start.getDate() + i)
        dates.push(date.toISOString().split('T')[0])
      }
      break
    case 'month':
      end.setMonth(start.getMonth() + 1)
      end.setDate(0) // Last day of the month
      const daysInMonth = end.getDate() - start.getDate() + 1
      for (let i = 0; i < daysInMonth; i++) {
        const date = new Date(start)
        date.setDate(start.getDate() + i)
        dates.push(date.toISOString().split('T')[0])
      }
      break
  }
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    dates
  }
}

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      { 
        error: 'Meal plans are coming soon! We\'re working hard to bring you this feature. If you\'d like to see it sooner, let us know - we release features based on user requests. For now, you can use our recipe search to find individual recipes!' 
      },
      { status: 503 }
    )
    
    // Temporarily disabled - meal plans coming soon
    /*
    const body = await request.json()
    const { duration, userPreferences, startDate } = body

    if (!duration || !['day', 'week', 'month'].includes(duration)) {
      return NextResponse.json(
        { error: 'Invalid duration. Must be "day", "week", or "month"' },
        { status: 400 }
      )
    }

    const { start, end, dates } = getDatesForDuration(duration as MealPlanDuration, startDate)
    const mealTypes = ['breakfast', 'lunch', 'dinner']
    const totalMeals = dates.length * mealTypes.length

    // Build user context
    const dietaryInfo = userPreferences?.dietaryRestrictions?.length 
      ? `Dietary restrictions: ${userPreferences.dietaryRestrictions.join(', ')}. `
      : ''
    const allergyInfo = userPreferences?.allergies?.length
      ? `Allergies: ${userPreferences.allergies.join(', ')}. `
      : ''
    const peopleInfo = userPreferences?.numberOfPeople
      ? `Cooking for ${userPreferences.numberOfPeople} ${userPreferences.numberOfPeople === 1 ? 'person' : 'people'}. `
      : ''
    const kidsInfo = userPreferences?.hasKids
      ? `Includes kids. `
      : ''
    const healthGoals = userPreferences?.healthGoals?.length
      ? `Health goals: ${userPreferences.healthGoals.join(', ')}. `
      : ''
    const mealPlanQuery = userPreferences?.mealPlanQuery
      ? `User's specific request: "${userPreferences.mealPlanQuery}". Please incorporate this into the meal plan. `
      : ''

    const systemPrompt = `You are an expert meal planning AI that creates personalized meal plans. Generate a ${duration} meal plan with ${totalMeals} recipes total.

${mealPlanQuery}

${dietaryInfo}${allergyInfo}${peopleInfo}${kidsInfo}${healthGoals}

Requirements:
- Create unique, varied recipes for each meal
- Ensure recipes are appropriate for the meal type (breakfast, lunch, dinner)
- Make recipes kid-friendly if cooking for families
- Consider dietary restrictions and allergies strictly
- Make recipes quick and practical (15-30 minutes)
- Ensure variety across the meal plan

For each recipe, provide ONLY these lightweight fields (full details will be generated on-demand when user clicks):
- name: Creative, appealing name
- description: Brief description (1-2 sentences)
- emoji: Relevant food emoji
- time: Cooking time (e.g., "15 min", "20 min")
- servings: Number of servings
- difficulty: "Easy", "Medium", or "Hard"
- rating: Number between 4.0 and 5.0
- tags: Array of 3-5 relevant tags

DO NOT include ingredients, instructions, or nutrition - these will be generated later when the user clicks on the recipe.

Return ONLY a valid JSON object with items array. Keep it lightweight and fast.`

    const userPrompt = `Create a ${duration} meal plan starting ${start}. Generate ${totalMeals} recipes:
- ${dates.length} days
- ${mealTypes.length} meals per day (${mealTypes.join(', ')})

Return a JSON object with this exact structure:
{
  "items": [
    {
      "date": "YYYY-MM-DD",
      "mealType": "breakfast" | "lunch" | "dinner",
      "recipe": { ... complete recipe object ... }
    }
  ]
}

IMPORTANT: 
- Escape all special characters in strings (newlines, quotes, etc.)
- Do not include any text outside the JSON object
- Ensure all strings are properly closed
- Use double quotes for all JSON keys and string values`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 3000, // Reduced since we're only generating lightweight recipes
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      throw new Error('No response from AI')
    }

    // Helper function to repair malformed JSON
    const repairJSON = (jsonString: string): string => {
      let repaired = jsonString
      
      // Extract JSON from markdown code blocks if present
      const jsonMatch = repaired.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                       repaired.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        repaired = jsonMatch[1] || jsonMatch[0]
      }
      
      // Remove trailing commas before closing braces/brackets
      repaired = repaired.replace(/,(\s*[}\]])/g, '$1')
      
      // Fix common issues: unescaped newlines and quotes in string values
      let result = ''
      let inString = false
      let escapeNext = false
      
      for (let i = 0; i < repaired.length; i++) {
        const char = repaired[i]
        const prevChar = i > 0 ? repaired[i - 1] : ''
        
        if (escapeNext) {
          result += char
          escapeNext = false
          continue
        }
        
        if (char === '\\') {
          result += char
          escapeNext = true
          continue
        }
        
        if (char === '"') {
          inString = !inString
          result += char
          continue
        }
        
        if (inString) {
          // Inside a string, escape problematic characters
          if (char === '\n') {
            result += '\\n'
          } else if (char === '\r') {
            result += '\\r'
          } else if (char === '\t') {
            result += '\\t'
          } else {
            result += char
          }
        } else {
          result += char
        }
      }
      
      return result
    }

    // Try to parse JSON with better error handling
    let parsed: any
    try {
      // First, try direct parsing
      parsed = JSON.parse(responseContent)
    } catch (e) {
      // If that fails, try to repair and parse
      try {
        const repaired = repairJSON(responseContent)
        parsed = JSON.parse(repaired)
      } catch (parseError) {
        console.error('JSON parsing error:', parseError)
        console.error('Response content length:', responseContent.length)
        console.error('Response content (first 1000 chars):', responseContent.substring(0, 1000))
        console.error('Response content (last 500 chars):', responseContent.substring(Math.max(0, responseContent.length - 500)))
        
        // Try one more time with a more aggressive fix
        try {
          // Last resort: try to extract just the items array if possible
          const itemsMatch = responseContent.match(/"items"\s*:\s*\[([\s\S]*)\]/)
          if (itemsMatch) {
            // This is a fallback - we'll construct a minimal valid structure
            throw new Error('JSON structure too malformed to repair automatically')
          }
          throw parseError
        } catch (finalError) {
          throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. The AI may have generated invalid JSON.`)
        }
      }
    }
    let items: MealPlanItem[] = []
    
    // Handle different response formats
    if (Array.isArray(parsed)) {
      items = parsed
    } else if (parsed.items && Array.isArray(parsed.items)) {
      items = parsed.items
    } else if (parsed.recipes && Array.isArray(parsed.recipes)) {
      items = parsed.recipes
    } else if (parsed.mealPlan && parsed.mealPlan.items) {
      items = parsed.mealPlan.items
    }

    // Helper function to sanitize strings
    const sanitizeString = (str: any): string => {
      if (typeof str !== 'string') return String(str || '')
      // Remove or escape problematic characters
      return str
        .replace(/\n/g, ' ') // Replace newlines with spaces
        .replace(/\r/g, '') // Remove carriage returns
        .replace(/\t/g, ' ') // Replace tabs with spaces
        .trim()
    }

    // Ensure all recipes have IDs and proper structure (lightweight only)
    const processedItems: MealPlanItem[] = items.map((item: any) => {
      const recipe = item.recipe || {}
      return {
        date: item.date || dates[Math.floor(Math.random() * dates.length)],
        mealType: item.mealType || mealTypes[Math.floor(Math.random() * mealTypes.length)],
        recipe: {
          id: recipe.id || generateRecipeId(),
          name: sanitizeString(recipe.name || 'Untitled Recipe'),
          description: sanitizeString(recipe.description || ''),
          emoji: recipe.emoji || '🍱',
          time: sanitizeString(recipe.time || '20 min'),
          servings: sanitizeString(recipe.servings || '2-3'),
          difficulty: recipe.difficulty || 'Easy',
          rating: typeof recipe.rating === 'number' ? recipe.rating : 4.5,
          tags: Array.isArray(recipe.tags) ? recipe.tags.map(sanitizeString) : [],
          // Lightweight - these will be generated on-demand
          ingredients: [],
          instructions: [],
          presentationTips: [],
          nutrition: {
            calories: '250',
            protein: '10g',
            carbs: '30g',
            fat: '8g',
          },
          imageUrl: undefined, // Will be generated on-demand
          _isLightweight: true, // Flag to indicate this needs full generation
        } as Recipe & { _isLightweight?: boolean }
      }
    })

    // Fill in any missing dates/meals systematically
    const mealPlanItems: MealPlanItem[] = []
    let itemIndex = 0
    dates.forEach(date => {
      mealTypes.forEach(mealType => {
        const existing = processedItems.find(
          item => item.date === date && item.mealType === mealType
        )
        if (existing) {
          mealPlanItems.push(existing)
        } else if (processedItems.length > 0) {
          // Use next available item or cycle through
          const item = processedItems[itemIndex % processedItems.length]
          mealPlanItems.push({
            date,
            mealType: mealType as 'breakfast' | 'lunch' | 'dinner',
            recipe: item.recipe
          })
          itemIndex++
        }
      })
    })

    const mealPlan: MealPlan = {
      id: generateId(),
      userId: '', // Will be set by the client
      name: `${duration.charAt(0).toUpperCase() + duration.slice(1)} Meal Plan - ${start}`,
      duration: duration as MealPlanDuration,
      startDate: start,
      endDate: end,
      items: mealPlanItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ mealPlan })
    */
  } catch (error: any) {
    console.error('Error generating meal plan:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate meal plan' },
      { status: 500 }
    )
  }
}

