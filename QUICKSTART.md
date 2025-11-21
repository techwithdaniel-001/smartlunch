# Quick Start Guide

## 🚀 Get Started in 3 Steps

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Set up AI features (Optional but Recommended)**:
   - Get an OpenAI API key from https://platform.openai.com/api-keys
   - Create a `.env.local` file in the project root
   - Add: `OPENAI_API_KEY=your_key_here`
   - Without this, you can still browse recipes, but AI generation won't work

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## ✨ What You'll See

- **Beautiful Homepage**: Clean, modern interface with gradient backgrounds
- **Ingredient Input**: Start typing ingredients or use quick-add buttons
- **Smart Recipe Matching**: Recipes automatically filter based on what you have
- **Recipe Cards**: Beautiful cards showing match percentage, time, and ratings
- **Detailed Recipe View**: 
  - Step-by-step instructions with tips
  - Visual ingredient matching (green checkmarks for what you have)
  - Presentation ideas to make food look amazing
  - Interactive step completion tracking

## 🎨 Key Features to Try

### AI-Powered Features (Requires API Key)
1. **AI Recipe Search**: Type "fun animal sandwiches" or "healthy pasta for kids" and let AI generate a custom recipe
2. **AI Chat Assistant**: Click "AI Assistant" button to chat with AI about recipes
3. **Modify Recipes**: Open any recipe and click "Modify with AI" to make real-time changes
4. **Recipe Planning**: Ask AI to plan recipes first, then tell it what ingredients you have

### Standard Features (Works Without API Key)
1. **Browse Recipes**: View all pre-loaded kid-friendly recipes
2. **Optional Ingredient Filter**: Add ingredients to filter recipes (completely optional!)
3. **Click a Recipe**: See detailed instructions with helpful tips
4. **Complete Steps**: Click on instruction steps to mark them complete
5. **Navigate Steps**: Use Previous/Next buttons to go through instructions
6. **View Presentation Tips**: Scroll to see creative ideas for making food look fun

## 📝 Customization

- **Add Recipes**: Edit `data/recipes.ts` to add your own recipes
- **Change Colors**: Modify `tailwind.config.ts` for different color schemes
- **Adjust Matching**: Edit the matching logic in `app/page.tsx`

Enjoy your Smart Lunch app! 🍱

