import { NextRequest, NextResponse } from 'next/server'
import { Recipe } from '@/data/recipes'

export async function POST(request: NextRequest) {
  try {
    const { messages, currentRecipe, availableIngredients, userPreferences, removedIngredients } = await request.json()

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
- When modifying an existing recipe, you MUST return the complete updated recipe in JSON format
- After returning the JSON, you can say "Recipe updated!" or "Changed to your preference" - DO NOT repeat the recipe details in text
- The recipe will automatically update on the right side, so you don't need to show it in chat
- Only provide detailed explanations when the user explicitly asks for help or clarification
- Keep responses short and to the point - busy parents don't have time for long messages
- NEVER repeat the same response twice - if you already answered a question, just acknowledge briefly or provide a different angle
- If the user asks about alternatives for removed ingredients, provide ONE clear, concise response with specific options
- MOST IMPORTANT: When user requests ANY recipe modification (vegan, ingredient change, etc.), you MUST return the complete updated recipe JSON - this is not optional!

Your role:
- Generate creative, kid-friendly lunch recipes that are EASY for busy parents to make
- Modify existing recipes based on user preferences (be brief!)
- Suggest recipes based on available ingredients (if provided)
- Provide practical cooking tips ONLY when asked

When modifying recipes:
- CRITICAL: You MUST ALWAYS return the COMPLETE updated recipe in JSON format - this is REQUIRED, not optional
- The JSON must be valid and complete with ALL fields (name, ingredients, instructions, etc.)
- Make the change requested (e.g., "turkey to chicken" = replace turkey with chicken)
- For step modifications (e.g., "break step 2 into two steps", "make step 3 more detailed"):
  * You can split, combine, or modify individual steps
  * Update the instructions array accordingly
  * Maintain the logical flow of the recipe
  * Keep step numbering sequential
- For dietary changes (vegan, vegetarian, gluten-free, etc.), replace ALL non-compliant ingredients:
  * Vegan: Replace ALL animal products (meat, dairy, eggs, honey) with REAL plant-based alternatives
    * Eggs → flax eggs (1 tbsp ground flaxseed + 3 tbsp water per egg), chia eggs, or applesauce
    * Dairy → plant-based milk (almond, oat, soy), vegan butter, nutritional yeast for cheese flavor
    * Meat → tofu, tempeh, legumes, mushrooms
  * Vegetarian: Replace all meat with REAL plant-based proteins (tofu, tempeh, legumes, etc.)
  * Gluten-free: Replace wheat/gluten ingredients with REAL gluten-free alternatives (rice, quinoa, gluten-free pasta, etc.)
  * Dairy-free: Replace all dairy with REAL non-dairy alternatives (almond milk, coconut milk, vegan cheese, etc.)
- CRITICAL: DO NOT HALLUCINATE INGREDIENTS! Only use real, existing ingredients:
  * DO NOT invent ingredients like "lactose-free fettuccine" (fettuccine is pasta, not dairy)
  * DO NOT create fake product names
  * Use actual alternatives: for dairy-free pasta, use regular pasta (pasta doesn't contain dairy) or specify "dairy-free sauce"
  * Research real alternatives before suggesting them
- Update instructions to reflect ingredient changes - mention the new ingredients in the steps
- Adjust cooking times/methods if needed for substitutions
- Keep all other aspects the same unless specifically asked to change them
- Your chat message should be VERY SHORT - just acknowledge the change (e.g., "Made it vegan!" or "Recipe updated!")
- IMPORTANT: Even if you say "Recipe updated!", you MUST still return the complete JSON recipe

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
    {"step": "VERY DETAILED step-by-step instruction. Break down every action. Instead of 'add vegetables', say 'First, chop 1 onion into small pieces. Then add the chopped onion to the pan.' Be extremely specific about what to do first, second, third. Include exact ingredient names, amounts, and order. Make it so clear a teenager with no cooking experience can follow it.", "tip": "Helpful tip for busy parents"}
  ],
  "presentationTips": ["Quick tip 1", "Quick tip 2"],
  "nutrition": {"calories": "250", "protein": "10g", "carbs": "30g", "fat": "8g"}
}

${currentRecipe ? `
CURRENT RECIPE TO MODIFY (IMPORTANT - USE THIS AS THE BASE):
${JSON.stringify(currentRecipe, null, 2)}

When modifying this recipe:
- Preserve the recipe structure (name, description, emoji, time, servings, difficulty, rating, tags)
- Update ingredients list completely - replace all non-compliant items
- Update instructions to reflect new ingredients and cooking methods
- CRITICAL: Keep ALL instructions EXTREMELY detailed and beginner-friendly:
  * Break down every action into tiny steps
  * Specify EXACTLY which ingredient to add first, second, third
  * Include specific amounts in each step
  * Never use generic terms like "add vegetables" - say "add 1 chopped onion, then add 1 cup of tomatoes"
  * Make it so clear a teenager with no cooking experience can follow it
- For step modifications (e.g., "break step 2 into two steps", "make step 3 more detailed", "split step 1"):
  * You can split a single step into multiple steps
  * You can combine multiple steps into one
  * You can reorder steps if needed
  * Maintain logical flow and cooking sequence
  * Update step numbering to be sequential (0, 1, 2, 3...)
  * Each step should be EXTREMELY detailed and actionable
- Keep presentation tips relevant to the modified recipe
- Adjust nutrition info if significant changes are made
- ALWAYS return the complete recipe with ALL fields filled in
` : ''}
${availableIngredients.length > 0 ? `Available ingredients: ${availableIngredients.join(', ')}` : ''}
${removedIngredients && removedIngredients.length > 0 ? `
REMOVED INGREDIENTS (USER DOESN'T HAVE THESE):
- ${removedIngredients.join(', ')}
- IMPORTANT: When user asks about alternatives or modifications, provide:
  * Specific substitute ingredients they can use
  * Alternative recipes or variations without these ingredients
  * Questions to understand what they have available
  * Multiple options so they can choose what works best
- Be helpful and provide practical, realistic alternatives
` : ''}
${userPreferences ? `
USER PREFERENCES (IMPORTANT - USE THESE TO PERSONALIZE RECIPES):
- Number of people: ${userPreferences.numberOfPeople}
${userPreferences.hasKids ? `- Has kids (ages: ${userPreferences.kidsAges?.join(', ') || 'not specified'})` : ''}
${userPreferences.hasPartner ? '- Has a partner' : ''}
${userPreferences.dietaryRestrictions && userPreferences.dietaryRestrictions.length > 0 ? `- Dietary restrictions: ${userPreferences.dietaryRestrictions.join(', ')} - MUST respect these restrictions!` : ''}
${userPreferences.allergies && userPreferences.allergies.length > 0 ? `- ALLERGIES (CRITICAL - NEVER USE THESE): ${userPreferences.allergies.join(', ')} - ABSOLUTELY DO NOT include any of these ingredients or cross-contaminated items!` : ''}
${userPreferences.healthGoals && userPreferences.healthGoals.length > 0 ? `- HEALTH GOALS (CRITICAL - TAILOR RECIPES TO THESE): ${userPreferences.healthGoals.join(', ')}
  * If "Eat more vegetables": Include plenty of vegetables, make them the star of the dish
  * If "Increase protein intake": Prioritize protein-rich ingredients (chicken, beans, eggs, tofu, etc.)
  * If "More balanced meals": Ensure good balance of protein, carbs, and healthy fats
  * If "Weight management": Focus on nutrient-dense, lower-calorie options
  * If "Build healthy habits": Emphasize whole foods, minimal processed ingredients
  * If "Energy boost": Include energizing ingredients, balanced macros
  * If "Better nutrition for kids": Make it fun, colorful, and packed with nutrients kids need
  * Adjust ingredients and portions to support these goals!` : ''}
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

CRITICAL INSTRUCTION REQUIREMENTS - WRITE STEPS FOR BEGINNERS:
- Break down EVERY step into tiny, specific actions
- NEVER say generic things like "add vegetables" or "add mixed ingredients"
- ALWAYS specify EXACTLY which ingredient first, then which next
- Example BAD: "Add vegetables and spices to the pan"
- Example GOOD: "First, add 1 chopped onion to the pan. Cook for 2 minutes until soft. Then add 1 teaspoon of garlic powder. Stir. Then add 1 cup of chopped tomatoes. Cook for 3 more minutes."
- List ingredients in the EXACT order they should be added
- Include specific amounts for each ingredient in each step
- Tell them what to look for (e.g., "cook until onions are soft and see-through")
- Make it so detailed that someone who has NEVER cooked before can follow it
- Think: "How would I teach a teenager to cook this step-by-step?"

Focus on making recipes that are:
1. Quick to prepare (15-25 minutes max)
2. EXTREMELY detailed step-by-step instructions (beginner-friendly, like teaching a teenager)
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
        max_tokens: 1500,
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
      // Look for JSON in the response - try multiple patterns
      let jsonMatch = assistantMessage.match(/\{[\s\S]*\}/)
      
      // Also try to find JSON in code blocks
      if (!jsonMatch) {
        const codeBlockMatch = assistantMessage.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
        if (codeBlockMatch) {
          jsonMatch = [codeBlockMatch[1], codeBlockMatch[1]]
        }
      }
      
      if (jsonMatch) {
        const jsonString = jsonMatch[0]
        console.log('Found JSON in response, attempting to parse:', jsonString.substring(0, 200))
        const parsed = JSON.parse(jsonString)
        console.log('Parsed recipe:', parsed.name, 'with', parsed.ingredients?.length, 'ingredients')
        
        if (parsed.name && parsed.ingredients && Array.isArray(parsed.ingredients)) {
          recipe = {
            id: currentRecipe?.id || `ai-${Date.now()}`,
            ...parsed,
          } as Recipe
          
          console.log('Recipe created successfully:', recipe.name)
          console.log('Recipe ingredients:', recipe.ingredients.map(i => i.name).join(', '))
          
          // Generate image for the recipe (important for final preview)
          // Do this asynchronously so we don't block the response
          const generateImage = async () => {
            if (!recipe) return null
            try {
              const mainIngredients = recipe.ingredients.slice(0, 5).map(i => i.name).join(', ')
              const presentation = recipe.presentationTips && recipe.presentationTips.length > 0 
                ? recipe.presentationTips[0] 
                : 'beautifully arranged on a plate'
              const imagePrompt = `Professional food photography of ${recipe.name}, a delicious cooked and prepared dish. The final prepared meal showing ${mainIngredients} as they appear when cooked and ready to eat. ${presentation}. Realistic food photography, natural lighting, appetizing colors, kid-friendly lunch presentation, on a clean white plate or colorful bento box, overhead or 45-degree angle view, sharp focus, professional restaurant quality, mouth-watering, photorealistic, no illustrations or drawings, actual food photography.`
              
              console.log('Generating real AI image for recipe:', recipe.name)
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
                return null
              }

              const imageData = await imageResponse.json()
              console.log('Image generation response received')
              
              if (imageData.data && imageData.data[0]?.url) {
                const imageUrl = imageData.data[0].url
                console.log('Image URL generated:', imageUrl)
                return imageUrl
              } else {
                console.error('No image URL in response:', imageData)
                return null
              }
            } catch (imageError: any) {
              console.error('Image generation error:', imageError)
              console.error('Error details:', {
                message: imageError?.message,
                stack: imageError?.stack,
                name: imageError?.name
              })
              return null
            }
          }
          
          // Generate image - wait longer to ensure we get a real image
          // This is important for user experience - they need to see what the food looks like
          const imageUrl = await Promise.race([
            generateImage(),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 30000)) // 30 second timeout - DALL-E can take time
          ])
          
          if (imageUrl) {
            recipe.imageUrl = imageUrl
            console.log('✅ Real AI image generated and set on recipe:', recipe.imageUrl)
          } else {
            console.warn('⚠️ Image generation timed out or failed - will retry or show placeholder')
            // Don't set undefined - let it retry or show loading state
            // The UI will show "AI image generating..." if imageUrl is missing
          }
          
          // If we found a recipe, make the message super brief
          // Remove ALL JSON from the message (including code blocks)
          // Remove JSON code blocks (```json ... ```)
          assistantMessage = assistantMessage.replace(/```json\s*\{[\s\S]*?\}\s*```/gi, '').trim()
          // Remove plain JSON objects
          assistantMessage = assistantMessage.replace(/\{[\s\S]*\}/, '').trim()
          // Remove any remaining code block markers
          assistantMessage = assistantMessage.replace(/```[\s\S]*?```/g, '').trim()
          // Remove any text that looks like it's introducing JSON
          assistantMessage = assistantMessage.replace(/here'?s?\s+(the\s+)?(updated\s+)?(recipe|json):?/gi, '').trim()
          assistantMessage = assistantMessage.replace(/here'?s?\s+(the\s+)?(recipe|json):?/gi, '').trim()
          
          // If message is empty or too long after removing JSON, use a brief default
          if (!assistantMessage || assistantMessage.length > 100) {
            assistantMessage = currentRecipe 
              ? "Recipe updated to your preference!" 
              : "Here's your recipe!"
          }
        } else {
          console.error('Parsed JSON missing required fields:', {
            hasName: !!parsed.name,
            hasIngredients: !!parsed.ingredients,
            isIngredientsArray: Array.isArray(parsed.ingredients)
          })
        }
      } else {
        console.log('No JSON found in AI response. Full response:', assistantMessage.substring(0, 500))
      }
    } catch (e: any) {
      console.error('Error parsing recipe JSON:', e)
      console.error('Error message:', e?.message)
      console.error('Response that failed to parse:', assistantMessage.substring(0, 500))
      // If no recipe found, that's okay - just return the message
    }

    // Ensure imageUrl is included in the response if recipe exists
    const responseRecipe = recipe ? {
      ...recipe,
      imageUrl: recipe.imageUrl, // Explicitly include imageUrl
    } : null
    
    console.log('Returning recipe with imageUrl:', responseRecipe?.imageUrl ? 'YES' : 'NO')
    if (responseRecipe) {
      console.log('Recipe imageUrl:', responseRecipe.imageUrl)
    }
    
    return NextResponse.json({
      message: assistantMessage,
      recipe: responseRecipe,
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

