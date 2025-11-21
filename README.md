# Smart Lunch 🍱

An intelligent, beautiful web application that helps busy moms and families discover fun, easy, and healthy lunch recipes personalized to their available ingredients.

## Features

- 🔐 **User Authentication**: Secure login with Firebase (Email/Password and Google Sign-In)
- 🎯 **Smart Ingredient Matching**: Enter what you have, and get recipe suggestions that adapt to your pantry
- 👨‍🍳 **Step-by-Step Instructions**: Clear, personalized cooking instructions with helpful tips
- 🎨 **Beautiful Presentation Ideas**: Learn how to make food look amazing with creative plating and shaping tips
- 🌈 **Kid-Friendly Recipes**: All recipes are designed to be fun, healthy, and appealing to children
- 💾 **Save Recipes**: Save your favorite recipes for easy access
- 📄 **PDF Export**: Download recipes as PDFs for printing
- 📱 **Responsive Design**: Works beautifully on desktop, tablet, and mobile devices
- ⚡ **Fast & Scalable**: Built with Next.js 14 for optimal performance

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- OpenAI API key (optional, for AI features)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase Authentication (required):
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Enable Authentication:
     * Go to Authentication > Sign-in method
     * Enable "Email/Password" provider
     * Enable "Google" provider (optional, for Google sign-in)
   - Set up Firestore Database:
     * Go to Firestore Database > Create database
     * Start in test mode (we'll set up security rules)
     * Choose a location for your database
     * Go to Rules tab and paste the rules from `firestore.rules` file
     * This ensures users can only access their own saved recipes
   - Get your Firebase config:
     * Go to Project Settings > General > Your apps
     * Click "Add app" > Web (</>) icon
     * Copy the config values
   - Create a `.env.local` file in the project root with:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

3. Set up OpenAI API key (optional, for AI features):
   - Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Add to `.env.local`: `OPENAI_API_KEY=your_key_here`
   - The app will work without it, but AI features won't be available

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 14** - React framework for production
- **TypeScript** - Type-safe development
- **Firebase** - Authentication and database
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **jsPDF** - PDF generation

## Project Structure

```
smartlunch/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── IngredientInput.tsx
│   ├── RecipeCard.tsx
│   └── RecipeDetail.tsx
├── data/              # Recipe database
│   └── recipes.ts
└── public/            # Static assets
```

## Key Features Explained

### 🤖 AI-Powered Recipe Generation
- **Search with AI**: Describe what you want, and AI generates a custom recipe
- **Real-time Chat**: Talk to the AI assistant to modify recipes on the fly
- **Smart Adaptations**: AI considers your available ingredients when generating recipes
- **Recipe Planning**: Let AI plan recipes first, then adapt based on what you have

### 🎯 Smart Recipe Matching (Optional)
The app intelligently matches recipes based on available ingredients. It calculates a match percentage and prioritizes recipes where you have most of the required ingredients. **Ingredients are completely optional** - you can use AI to generate recipes without specifying ingredients first.

### 👨‍🍳 Personalized Instructions
Each recipe includes:
- Clear step-by-step instructions
- Helpful tips for each step
- Visual indicators for ingredients you have
- Interactive step completion tracking
- Real-time AI modifications

### 🎨 Presentation Tips
Every recipe includes creative ideas for making food look appealing:
- Fun shapes using cookie cutters
- Colorful arrangements
- Creative plating techniques
- Kid-friendly presentation ideas

## Customization

### Adding New Recipes

Edit `data/recipes.ts` to add new recipes. Each recipe includes:
- Basic info (name, description, time, servings)
- Ingredients list
- Step-by-step instructions with tips
- Presentation ideas
- Nutritional information

### Styling

The app uses Tailwind CSS with custom colors defined in `tailwind.config.ts`. Modify the color scheme to match your brand.

## Future Enhancements

- User accounts and saved recipes
- Shopping list generation
- Meal planning calendar
- Recipe sharing
- AI-powered recipe suggestions
- Nutritional tracking
- Allergy filtering

## License

MIT License - feel free to use this project for your own purposes!

## Support

For issues or questions, please open an issue on the repository.

---

Made with ❤️ for busy families

