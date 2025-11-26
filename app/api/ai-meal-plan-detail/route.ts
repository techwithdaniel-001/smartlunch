import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Recipe } from '@/data/recipes'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function generateRecipeId(): string {
  return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipe, userPreferences } = body

    if (!recipe || !recipe.name) {
      return NextResponse.json(
        { error: 'Recipe name is required' },
        { status: 400 }
      )
    }

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

    const systemPrompt = `You are an expert recipe AI. Generate a complete, detailed recipe based on the recipe name provided.

${dietaryInfo}${allergyInfo}${peopleInfo}${kidsInfo}${healthGoals}

Requirements:
- Provide detailed, beginner-friendly step-by-step instructions
- Include specific ingredient amounts
- Make it quick and practical (15-30 minutes)
- Ensure it's kid-friendly if cooking for families
- Consider dietary restrictions and allergies strictly
- Do NOT hallucinate ingredients - use real alternatives

For the recipe, provide:
- name: ${recipe.name}
- description: Brief description (1-2 sentences)
- emoji: Relevant food emoji
- time: Cooking time (e.g., "15 min", "20 min")
- servings: Number of servings
- difficulty: "Easy", "Medium", or "Hard"
- rating: Number between 4.0 and 5.0
- tags: Array of 3-5 relevant tags
- ingredients: Array with name and amount for each ingredient (REAL ingredients only, no hallucinations)
- instructions: Array of detailed step-by-step instructions (each step should be specific and beginner-friendly, including exact ingredients and actions)
- presentationTips: Array of 2-3 presentation tips
- nutrition: Object with calories, protein, carbs, fat

Return ONLY a valid JSON object with the complete recipe.`

    const userPrompt = `Generate a complete recipe for: "${recipe.name}"

${recipe.description ? `Description: ${recipe.description}` : ''}
${recipe.time ? `Time: ${recipe.time}` : ''}
${recipe.servings ? `Servings: ${recipe.servings}` : ''}
${recipe.difficulty ? `Difficulty: ${recipe.difficulty}` : ''}
${recipe.tags?.length ? `Tags: ${recipe.tags.join(', ')}` : ''}

Create a complete recipe with all ingredients, detailed instructions, and presentation tips.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      throw new Error('No response from AI')
    }

    // Parse JSON
    let recipeData: any
    try {
      recipeData = JSON.parse(responseContent)
    } catch (e) {
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        recipeData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Could not parse recipe JSON')
      }
    }

    // Helper function to sanitize strings
    const sanitizeString = (str: any): string => {
      if (typeof str !== 'string') return String(str || '')
      return str
        .replace(/\n/g, ' ')
        .replace(/\r/g, '')
        .replace(/\t/g, ' ')
        .trim()
    }

    // Build complete recipe (remove _isLightweight flag if present)
    const completeRecipe: Recipe = {
      id: recipe.id || generateRecipeId(),
      name: sanitizeString(recipeData.name || recipe.name),
      description: sanitizeString(recipeData.description || recipe.description || ''),
      emoji: recipeData.emoji || recipe.emoji || '🍱',
      time: sanitizeString(recipeData.time || recipe.time || '20 min'),
      servings: sanitizeString(recipeData.servings || recipe.servings || '2-3'),
      difficulty: recipeData.difficulty || recipe.difficulty || 'Easy',
      rating: typeof recipeData.rating === 'number' ? recipeData.rating : (recipe.rating || 4.5),
      tags: Array.isArray(recipeData.tags) ? recipeData.tags.map(sanitizeString) : (recipe.tags || []),
      ingredients: Array.isArray(recipeData.ingredients) 
        ? recipeData.ingredients.map((ing: any) => ({
            name: sanitizeString(ing.name || ''),
            amount: sanitizeString(ing.amount || ''),
          }))
        : [],
      instructions: Array.isArray(recipeData.instructions)
        ? recipeData.instructions.map((inst: any) => ({
            step: sanitizeString(inst.step || inst || ''),
            tip: inst.tip ? sanitizeString(inst.tip) : undefined,
          }))
        : [],
      presentationTips: Array.isArray(recipeData.presentationTips)
        ? recipeData.presentationTips.map(sanitizeString)
        : [],
      nutrition: recipeData.nutrition || recipe.nutrition || {
        calories: '250',
        protein: '10g',
        carbs: '30g',
        fat: '8g',
      },
      imageUrl: recipe.imageUrl || undefined,
    }
    
    // Remove _isLightweight flag if it exists (it's not part of Recipe type)
    if ('_isLightweight' in completeRecipe) {
      delete (completeRecipe as any)._isLightweight
    }

    // Generate image for the recipe
    try {
      const mainIngredients = completeRecipe.ingredients.slice(0, 5).map(i => i.name).join(', ')
      const presentation = completeRecipe.presentationTips && completeRecipe.presentationTips.length > 0 
        ? completeRecipe.presentationTips[0] 
        : 'beautifully arranged on a plate'
      const imagePrompt = `Professional food photography of ${completeRecipe.name}, a delicious cooked and prepared dish. The final prepared meal showing ${mainIngredients} as they appear when cooked and ready to eat. ${presentation}. Realistic food photography, natural lighting, appetizing colors, kid-friendly lunch presentation, on a clean white plate or colorful bento box, overhead or 45-degree angle view, sharp focus, professional restaurant quality, mouth-watering, photorealistic, no illustrations or drawings, actual food photography.`
      
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: imagePrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        }),
      })

      if (imageResponse.ok) {
        const imageData = await imageResponse.json()
        if (imageData.data && imageData.data[0]?.url) {
          completeRecipe.imageUrl = imageData.data[0].url
        }
      }
    } catch (imageError) {
      console.error('Error generating image:', imageError)
      // Continue without image
    }

    return NextResponse.json({ recipe: completeRecipe })
  } catch (error: any) {
    console.error('Error generating recipe detail:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate recipe detail' },
      { status: 500 }
    )
  }
}

