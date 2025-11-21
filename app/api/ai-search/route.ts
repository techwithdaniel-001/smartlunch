import { NextRequest, NextResponse } from 'next/server'
import { Recipe } from '@/data/recipes'

export async function POST(request: NextRequest) {
  try {
    const { query, availableIngredients, userPreferences } = await request.json()

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your .env.local file.',
          recipe: null,
        },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a recipe generator for Smart Lunch app - helping busy parents create fun, healthy, kid-friendly lunch recipes.

Always return ONLY valid JSON in this exact format (no markdown, no code blocks, just pure JSON):
{
  "name": "Recipe Name",
  "description": "Brief description emphasizing ease for busy parents",
  "emoji": "🍱",
  "time": "15 min",
  "servings": "2-3 kids",
  "difficulty": "Easy",
  "rating": 4.8,
  "tags": ["tag1", "tag2", "tag3"],
  "ingredients": [
    {"name": "Ingredient Name", "amount": "1 cup"},
    {"name": "Another Ingredient", "amount": "2 tbsp"}
  ],
  "instructions": [
    {"step": "Clear step with timing if needed (e.g., 'cook for 3-4 minutes')", "tip": "Practical tip for busy parents"},
    {"step": "Next step", "tip": "Another helpful tip"}
  ],
  "presentationTips": [
    "Quick presentation idea 1",
    "Quick presentation idea 2",
    "Quick presentation idea 3"
  ],
  "nutrition": {
    "calories": "250",
    "protein": "10g",
    "carbs": "30g",
    "fat": "8g"
  }
}

Requirements: Under 30 min total, simple ingredients, clear instructions with timing, Easy/Medium difficulty, kid-friendly.
${availableIngredients && availableIngredients.length > 0 ? `- Prioritize using these available ingredients: ${availableIngredients.join(', ')}` : ''}
${userPreferences ? `
USER PREFERENCES (IMPORTANT - USE THESE TO PERSONALIZE THE RECIPE):
- Number of people: ${userPreferences.numberOfPeople}
${userPreferences.hasKids ? `- Has kids (ages: ${userPreferences.kidsAges?.join(', ') || 'not specified'})` : ''}
${userPreferences.hasPartner ? '- Has a partner' : ''}
${userPreferences.dietaryRestrictions && userPreferences.dietaryRestrictions.length > 0 ? `- Dietary restrictions: ${userPreferences.dietaryRestrictions.join(', ')} - MUST respect these restrictions!` : ''}
${userPreferences.kitchenEquipment && userPreferences.kitchenEquipment.length > 0 ? `- Available kitchen equipment: ${userPreferences.kitchenEquipment.map((e: string) => {
  const equipmentMap: { [key: string]: string } = {
    'oven': 'Oven',
    'stovetop': 'Stovetop',
    'microwave': 'Microwave',
    'toaster': 'Toaster',
    'air_fryer': 'Air Fryer',
    'slow_cooker': 'Slow Cooker',
    'instant_pot': 'Instant Pot',
    'blender': 'Blender',
    'food_processor': 'Food Processor',
    'grill': 'Grill',
    'rice_cooker': 'Rice Cooker',
    'steamer': 'Steamer'
  }
  return equipmentMap[e] || e
}).join(', ')} - ONLY suggest recipes that can be made with these tools! If a recipe requires equipment they don't have, suggest an alternative method or skip that recipe.` : '- No specific kitchen equipment specified - assume basic stovetop and microwave available'}
- Adjust serving size to match ${userPreferences.numberOfPeople} people
- Make it appropriate for ${userPreferences.hasKids ? 'kids and adults' : 'adults'}
` : ''}

Generate a recipe based on: "${query}"`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate a recipe for: ${query}` },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API error')
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from AI')
    }

    // Parse the JSON response
    let recipeData
    try {
      recipeData = JSON.parse(content)
    } catch (e) {
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        recipeData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Could not parse recipe JSON')
      }
    }

    // Validate and create recipe
    if (!recipeData.name || !recipeData.ingredients || !recipeData.instructions) {
      throw new Error('Invalid recipe format')
    }

    const recipe: Recipe = {
      id: `ai-${Date.now()}`,
      name: recipeData.name,
      description: recipeData.description || 'A delicious, kid-friendly recipe',
      emoji: recipeData.emoji || '🍱',
      time: recipeData.time || '20 min',
      servings: recipeData.servings || '2-3 kids',
      difficulty: recipeData.difficulty || 'Easy',
      rating: recipeData.rating || 4.5,
      tags: recipeData.tags || [],
      ingredients: recipeData.ingredients.map((ing: any) => ({
        name: ing.name,
        amount: ing.amount,
      })),
      instructions: recipeData.instructions.map((inst: any) => ({
        step: inst.step,
        tip: inst.tip,
      })),
      presentationTips: recipeData.presentationTips || [],
      nutrition: recipeData.nutrition || {
        calories: '250',
        protein: '10g',
        carbs: '30g',
        fat: '8g',
      },
    }

    // Generate image for the recipe (this is important for the final preview)
    // We'll wait for it since it's a key feature, but optimize the prompt for speed
    try {
      const mainIngredients = recipe.ingredients.slice(0, 5).map((i: any) => i.name).join(', ')
      const presentation = recipe.presentationTips && recipe.presentationTips.length > 0 
        ? recipe.presentationTips[0] 
        : 'beautifully arranged on a plate'
      const imagePrompt = `Professional food photography of ${recipe.name}, a delicious cooked and prepared dish. The final prepared meal showing ${mainIngredients} as they appear when cooked and ready to eat. ${presentation}. Realistic food photography, natural lighting, appetizing colors, kid-friendly lunch presentation, on a clean white plate or colorful bento box, overhead or 45-degree angle view, sharp focus, professional restaurant quality, mouth-watering, photorealistic, no illustrations or drawings, actual food photography.`
      
      console.log('Generating image for recipe:', recipe.name)
      console.log('Image prompt:', imagePrompt)
      
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: imagePrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        }),
      })

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text()
        console.error('Image generation failed:', imageResponse.status, errorText)
        throw new Error(`Image generation failed: ${imageResponse.status}`)
      }

      const imageData = await imageResponse.json()
      console.log('Image generation response:', imageData)
      
      if (imageData.data && imageData.data[0]?.url) {
        recipe.imageUrl = imageData.data[0].url
        console.log('Image URL set:', recipe.imageUrl)
      } else {
        console.error('No image URL in response:', imageData)
      }
    } catch (imageError: any) {
      console.error('Image generation error:', imageError)
      console.error('Error details:', {
        message: imageError?.message,
        stack: imageError?.stack,
        name: imageError?.name
      })
      // Continue without image if generation fails, but log it
      recipe.imageUrl = undefined
    }

    // Ensure imageUrl is included in the response
    console.log('Returning recipe with imageUrl:', recipe.imageUrl ? 'YES' : 'NO')
    console.log('Recipe object:', JSON.stringify({ ...recipe, imageUrl: recipe.imageUrl }))
    
    return NextResponse.json({
      recipe: {
        ...recipe,
        imageUrl: recipe.imageUrl, // Explicitly include imageUrl
      },
    })
  } catch (error: any) {
    console.error('AI Search Error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate recipe',
        recipe: null,
      },
      { status: 500 }
    )
  }
}

