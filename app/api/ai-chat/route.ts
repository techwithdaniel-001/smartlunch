import { NextRequest, NextResponse } from 'next/server'
import { Recipe } from '@/data/recipes'

export async function POST(request: NextRequest) {
  try {
    const { messages, currentRecipe, availableIngredients, userPreferences } = await request.json()

    // Check if OpenAI API key is set
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      // Return a helpful response when API key is not set
      const lastMessage = messages[messages.length - 1]?.content || ''
      
      // Try to generate a basic recipe response without API
      if (lastMessage.toLowerCase().includes('recipe') || lastMessage.toLowerCase().includes('make') || lastMessage.toLowerCase().includes('lunch')) {
        return NextResponse.json({
          message: `I'd love to help you create a recipe! To enable AI-powered recipe generation, please set up your OpenAI API key.\n\nFor now, here's what I can tell you:\n\n1. Browse our existing recipes - they're all kid-friendly and healthy!\n2. Use the ingredient filter to find recipes based on what you have\n3. Each recipe has step-by-step instructions and presentation tips\n\nTo enable AI features:\n1. Get an API key from https://platform.openai.com/api-keys\n2. Create a .env.local file in your project root\n3. Add: OPENAI_API_KEY=your_key_here\n4. Restart the dev server`,
          recipe: null,
        })
      }

      return NextResponse.json({
        message: 'To use AI features, please set up your OpenAI API key. Create a `.env.local` file and add `OPENAI_API_KEY=your_key_here`. Get your key from https://platform.openai.com/api-keys',
        recipe: null,
      })
    }

    // Prepare the system prompt
    const systemPrompt = `You are a helpful AI assistant for Smart Lunch, an app that helps busy parents create fun, healthy, kid-friendly lunch recipes.

CRITICAL: BE CONCISE AND BRIEF!
- When modifying an existing recipe, just say "Recipe updated!" or "Changed to your preference" - DO NOT repeat the recipe details
- The recipe will automatically update on the right side, so you don't need to show it in chat
- Only provide detailed explanations when the user explicitly asks for help or clarification
- Keep responses short and to the point - busy parents don't have time for long messages

Your role:
- Generate creative, kid-friendly lunch recipes that are EASY for busy parents to make
- Modify existing recipes based on user preferences (be brief!)
- Suggest recipes based on available ingredients (if provided)
- Provide practical cooking tips ONLY when asked

When modifying recipes:
- Make the change requested (e.g., "turkey to chicken" = replace turkey with chicken)
- Keep all other aspects the same unless specifically asked to change them
- Return the updated recipe in JSON format (see below)
- Your chat message should be VERY SHORT - just acknowledge the change

When generating recipes, always return them in this JSON format:
{
  "name": "Recipe Name",
  "description": "Brief description emphasizing ease for parents",
  "emoji": "🍱",
  "time": "15 min",
  "servings": "2-3 kids",
  "difficulty": "Easy",
  "rating": 4.8,
  "tags": ["tag1", "tag2"],
  "ingredients": [{"name": "Ingredient", "amount": "1 cup"}],
  "instructions": [
    {"step": "Clear instruction with timing if needed (e.g., 'cook for 3-4 minutes')", "tip": "Helpful tip for busy parents"}
  ],
  "presentationTips": ["Quick tip 1", "Quick tip 2"],
  "nutrition": {"calories": "250", "protein": "10g", "carbs": "30g", "fat": "8g"}
}

${currentRecipe ? `Current recipe being modified: ${JSON.stringify(currentRecipe)}` : ''}
${availableIngredients.length > 0 ? `Available ingredients: ${availableIngredients.join(', ')}` : ''}
${userPreferences ? `
USER PREFERENCES (IMPORTANT - USE THESE TO PERSONALIZE RECIPES):
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
}).join(', ')} - ONLY suggest recipes that can be made with these tools! If modifying a recipe that requires equipment they don't have, suggest an alternative cooking method or substitute.` : '- No specific kitchen equipment specified - assume basic stovetop and microwave available'}
- Always adjust serving sizes to match ${userPreferences.numberOfPeople} people
- Make recipes appropriate for ${userPreferences.hasKids ? 'kids and adults' : 'adults'}
` : ''}

Focus on making recipes that are:
1. Quick to prepare (15-25 minutes max)
2. Easy to follow (clear steps, no complex techniques)
3. Kid-approved (fun shapes, colors, flavors)
4. Parent-friendly (minimal cleanup, can multitask)
5. Realistic for busy families (common ingredients, simple tools)`

    // Call OpenAI API
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
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API error')
    }

    const data = await response.json()
    let assistantMessage = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    // Try to extract recipe from the response
    let recipe: Recipe | null = null
    try {
      // Look for JSON in the response
      const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.name && parsed.ingredients) {
          recipe = {
            id: currentRecipe?.id || `ai-${Date.now()}`,
            ...parsed,
          } as Recipe
          
          // Generate image for the recipe
          try {
            const mainIngredients = recipe.ingredients.slice(0, 5).map(i => i.name).join(', ')
            const presentation = recipe.presentationTips && recipe.presentationTips.length > 0 
              ? recipe.presentationTips[0] 
              : 'beautifully arranged'
            const imagePrompt = `Professional high-quality food photography of ${recipe.name}, a real cooked and prepared dish. ${recipe.description}. The actual final prepared meal showing ${mainIngredients} as they appear when cooked and ready to eat. ${presentation}. Realistic food photography, natural lighting, appetizing colors, kid-friendly lunch presentation, on a clean white plate or colorful bento box, overhead or 45-degree angle view, sharp focus, professional restaurant quality, mouth-watering, photorealistic, no illustrations or drawings, actual food photography.`
            
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

            if (imageResponse.ok) {
              const imageData = await imageResponse.json()
              if (imageData.data && imageData.data[0]?.url) {
                recipe.imageUrl = imageData.data[0].url
              }
            }
          } catch (imageError) {
            console.error('Image generation error:', imageError)
            // Continue without image if generation fails
          }
          
          // If we found a recipe, make the message super brief
          // Remove the JSON from the message and keep only a short acknowledgment
          assistantMessage = assistantMessage.replace(/\{[\s\S]*\}/, '').trim()
          
          // If message is empty or too long after removing JSON, use a brief default
          if (!assistantMessage || assistantMessage.length > 100) {
            assistantMessage = currentRecipe 
              ? "Recipe updated to your preference!" 
              : "Here's your recipe!"
          }
        }
      }
    } catch (e) {
      // If no recipe found, that's okay - just return the message
    }

    return NextResponse.json({
      message: assistantMessage,
      recipe,
    })
  } catch (error: any) {
    console.error('AI Chat Error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to process AI request',
        message: 'Sorry, I encountered an error. Please try again.',
        recipe: null,
      },
      { status: 500 }
    )
  }
}

