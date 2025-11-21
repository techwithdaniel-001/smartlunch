export interface Ingredient {
  name: string
  amount?: string
}

export interface Instruction {
  step: string
  tip?: string
}

export interface Recipe {
  id: string
  name: string
  description: string
  emoji: string
  imageUrl?: string // AI-generated image URL
  time: string
  servings: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  rating: number
  tags: string[]
  ingredients: Ingredient[]
  instructions: Instruction[]
  presentationTips?: string[]
  nutrition?: {
    calories: string
    protein: string
    carbs: string
    fat: string
  }
}

export const recipes: Recipe[] = [
  {
    id: '1',
    name: 'Rainbow Veggie Wraps',
    description: 'Colorful, crunchy wraps that make eating vegetables fun! Perfect for picky eaters.',
    emoji: '🌈',
    time: '15 min',
    servings: '2-3 kids',
    difficulty: 'Easy',
    rating: 4.8,
    tags: ['Vegetarian', 'Healthy', 'Colorful', 'Quick'],
    ingredients: [
      { name: 'Tortilla wraps', amount: '4 large' },
      { name: 'Cream cheese', amount: '1/2 cup' },
      { name: 'Carrots', amount: '2 medium' },
      { name: 'Cucumber', amount: '1 medium' },
      { name: 'Bell pepper', amount: '1' },
      { name: 'Spinach', amount: '1 cup' },
      { name: 'Avocado', amount: '1' },
    ],
    instructions: [
      {
        step: 'Wash and prepare all vegetables. Cut carrots, cucumber, and bell pepper into thin matchstick strips.',
        tip: 'Use a vegetable peeler to make thin carrot ribbons for extra fun!'
      },
      {
        step: 'Lay out tortilla wraps on a clean surface. Spread a thin layer of cream cheese on each wrap.',
        tip: 'Let kids help spread - it makes them more excited to eat!'
      },
      {
        step: 'Arrange vegetables in colorful rows across the wrap, creating a rainbow pattern.',
        tip: 'Red bell pepper, orange carrots, yellow bell pepper, green cucumber, and purple cabbage make a perfect rainbow!'
      },
      {
        step: 'Add spinach leaves and sliced avocado on top of the vegetables.',
      },
      {
        step: 'Roll the wrap tightly, starting from one end. Cut into pinwheel slices.',
        tip: 'Use toothpicks to hold the wraps together if needed, but remove before serving to kids.'
      },
    ],
    presentationTips: [
      'Cut wraps into pinwheels and arrange them in a rainbow pattern on the plate',
      'Use cookie cutters to create fun shapes from the vegetables before wrapping',
      'Serve with a side of colorful fruit to complete the rainbow theme',
      'Add a small container of hummus or ranch for dipping',
    ],
    nutrition: {
      calories: '280',
      protein: '8g',
      carbs: '32g',
      fat: '12g',
    },
  },
  {
    id: '2',
    name: 'Animal Face Sandwiches',
    description: 'Transform ordinary sandwiches into adorable animal faces that kids will love!',
    emoji: '🐻',
    time: '20 min',
    servings: '2-3 kids',
    difficulty: 'Easy',
    rating: 4.9,
    tags: ['Fun', 'Creative', 'Kid-Friendly', 'Customizable'],
    ingredients: [
      { name: 'Bread', amount: '6 slices' },
      { name: 'Turkey or ham', amount: '6 slices' },
      { name: 'Cheese', amount: '4 slices' },
      { name: 'Cucumber', amount: '1/2' },
      { name: 'Carrots', amount: '1' },
      { name: 'Black olives', amount: '6-8' },
      { name: 'Cherry tomatoes', amount: '2-3' },
    ],
    instructions: [
      {
        step: 'Make your base sandwich with turkey/ham and cheese between two slices of bread.',
      },
      {
        step: 'Use a round cookie cutter or glass to cut the sandwich into a circle.',
        tip: 'Save the bread scraps for breadcrumbs or croutons!'
      },
      {
        step: 'Create eyes using cucumber slices with black olive pupils, or use cherry tomatoes cut in half.',
        tip: 'Use a small round cookie cutter for perfect circles!'
      },
      {
        step: 'Make a nose using a small piece of carrot or a round slice of cucumber.',
      },
      {
        step: 'Add a smile using a thin slice of bell pepper or a curved piece of cucumber.',
        tip: 'Get creative - you can make bears, cats, bunnies, or any animal your child loves!'
      },
    ],
    presentationTips: [
      'Use different colored vegetables to create various animal faces',
      'Arrange on a plate with a "habitat" background using lettuce or spinach',
      'Create a whole animal family - mom, dad, and baby animals',
      'Use nori (seaweed) sheets cut into shapes for more detailed features',
    ],
    nutrition: {
      calories: '320',
      protein: '18g',
      carbs: '28g',
      fat: '14g',
    },
  },
  {
    id: '3',
    name: 'Bento Box Power Bowl',
    description: 'A balanced, colorful lunch in a fun bento box format that encourages healthy eating.',
    emoji: '🍱',
    time: '25 min',
    servings: '2 kids',
    difficulty: 'Medium',
    rating: 4.7,
    tags: ['Balanced', 'Colorful', 'Healthy', 'Portable'],
    ingredients: [
      { name: 'Rice', amount: '1 cup cooked' },
      { name: 'Chicken', amount: '1 breast' },
      { name: 'Broccoli', amount: '1 cup' },
      { name: 'Carrots', amount: '1/2 cup' },
      { name: 'Edamame', amount: '1/2 cup' },
      { name: 'Eggs', amount: '2' },
      { name: 'Soy sauce', amount: '2 tbsp' },
    ],
    instructions: [
      {
        step: 'Cook rice according to package directions and let cool slightly.',
      },
      {
        step: 'Cut chicken into bite-sized pieces and cook in a pan until golden and cooked through. Season with a little soy sauce.',
        tip: 'Kids love bite-sized pieces - they\'re easier to eat and more fun!'
      },
      {
        step: 'Steam broccoli and carrots until tender but still colorful (about 3-4 minutes).',
        tip: 'Don\'t overcook - bright colors are more appealing to kids!'
      },
      {
        step: 'Hard boil eggs, then slice in half or cut into fun shapes using cookie cutters.',
      },
      {
        step: 'Arrange everything in bento box compartments: rice in one section, chicken in another, vegetables in separate sections.',
        tip: 'The key to bento boxes is keeping foods separate and colorful!'
      },
    ],
    presentationTips: [
      'Use silicone cupcake liners to create colorful compartments in any container',
      'Make rice into fun shapes using cookie cutters or molds',
      'Create faces or patterns with the food arrangement',
      'Add colorful picks or small flags to make it more festive',
    ],
    nutrition: {
      calories: '420',
      protein: '28g',
      carbs: '45g',
      fat: '12g',
    },
  },
  {
    id: '4',
    name: 'Pizza Pinwheels',
    description: 'Fun, rollable pizza that kids can help make and customize with their favorite toppings.',
    emoji: '🍕',
    time: '30 min',
    servings: '4-6 kids',
    difficulty: 'Easy',
    rating: 4.9,
    tags: ['Fun', 'Interactive', 'Customizable', 'Crowd-Pleaser'],
    ingredients: [
      { name: 'Pizza dough', amount: '1 lb' },
      { name: 'Pizza sauce', amount: '1/2 cup' },
      { name: 'Mozzarella cheese', amount: '1 cup shredded' },
      { name: 'Pepperoni', amount: '20 slices' },
      { name: 'Bell peppers', amount: '1/2 cup diced' },
      { name: 'Olives', amount: '1/4 cup sliced' },
    ],
    instructions: [
      {
        step: 'Preheat oven to 400°F. Roll out pizza dough into a rectangle on a floured surface.',
        tip: 'Let kids help roll - they love being involved in cooking!'
      },
      {
        step: 'Spread pizza sauce evenly over the dough, leaving a small border around the edges.',
      },
      {
        step: 'Sprinkle cheese, then add pepperoni and vegetables evenly across the sauce.',
        tip: 'Let kids choose their own toppings for their section!'
      },
      {
        step: 'Starting from one long edge, tightly roll the dough into a log.',
        tip: 'Roll as tightly as possible to prevent gaps when slicing.'
      },
      {
        step: 'Cut the log into 1-inch slices and place on a baking sheet. Bake for 15-18 minutes until golden.',
        tip: 'Use a serrated knife and gentle sawing motion for clean cuts.'
      },
    ],
    presentationTips: [
      'Arrange pinwheels in a spiral pattern on the plate',
      'Serve with a side of marinara sauce for dipping',
      'Create a "pizza garden" by arranging pinwheels like flowers with vegetable "leaves"',
      'Use different colored bell peppers to create rainbow pinwheels',
    ],
    nutrition: {
      calories: '180',
      protein: '8g',
      carbs: '22g',
      fat: '7g',
    },
  },
  {
    id: '5',
    name: 'Fruit & Cheese Kabobs',
    description: 'Colorful skewers that make fruits and cheese exciting and easy to eat on the go.',
    emoji: '🍓',
    time: '10 min',
    servings: '2-3 kids',
    difficulty: 'Easy',
    rating: 4.6,
    tags: ['Quick', 'Healthy', 'Colorful', 'Portable'],
    ingredients: [
      { name: 'Strawberries', amount: '6-8' },
      { name: 'Grapes', amount: '1 cup' },
      { name: 'Cheese cubes', amount: '1 cup' },
      { name: 'Cucumber', amount: '1/2' },
      { name: 'Cherry tomatoes', amount: '6-8' },
    ],
    instructions: [
      {
        step: 'Wash all fruits and vegetables thoroughly.',
      },
      {
        step: 'Cut strawberries in half, cucumber into rounds, and prepare cheese into cubes if needed.',
        tip: 'Use cookie cutters to make cheese into fun shapes!'
      },
      {
        step: 'Thread ingredients onto skewers in a colorful pattern, alternating between fruits, vegetables, and cheese.',
        tip: 'Create patterns: red, white, green, red, white, green for a festive look!'
      },
      {
        step: 'Arrange kabobs on a plate or pack in a container for lunch.',
        tip: 'For younger kids, use shorter skewers or remove sharp ends.'
      },
    ],
    presentationTips: [
      'Create rainbow patterns with different colored fruits',
      'Arrange kabobs in a fan shape on the plate',
      'Use themed picks - stars, hearts, or animal shapes',
      'Serve with a yogurt dip for extra fun and nutrition',
    ],
    nutrition: {
      calories: '150',
      protein: '6g',
      carbs: '18g',
      fat: '6g',
    },
  },
  {
    id: '6',
    name: 'Mini Quesadilla Triangles',
    description: 'Bite-sized quesadillas that are perfect for little hands and packed with protein.',
    emoji: '🌮',
    time: '15 min',
    servings: '2-3 kids',
    difficulty: 'Easy',
    rating: 4.7,
    tags: ['Quick', 'Protein-Rich', 'Customizable', 'Finger Food'],
    ingredients: [
      { name: 'Tortillas', amount: '4 small' },
      { name: 'Cheese', amount: '1 cup shredded' },
      { name: 'Black beans', amount: '1/2 cup' },
      { name: 'Corn', amount: '1/4 cup' },
      { name: 'Chicken', amount: '1/2 cup cooked' },
    ],
    instructions: [
      {
        step: 'Heat a large pan over medium heat.',
      },
      {
        step: 'Place one tortilla in the pan, sprinkle with cheese, beans, corn, and chicken (if using).',
        tip: 'Don\'t overfill - too much filling makes it hard to flip!'
      },
      {
        step: 'Top with another tortilla and cook for 2-3 minutes until golden brown.',
      },
      {
        step: 'Carefully flip and cook the other side for 2-3 minutes until cheese is melted.',
      },
      {
        step: 'Remove from pan, let cool slightly, then cut into triangles using a pizza cutter.',
        tip: 'Cut into 4-6 triangles for perfect bite-sized pieces!'
      },
    ],
    presentationTips: [
      'Arrange triangles in a sunburst pattern on the plate',
      'Serve with colorful salsa and guacamole for dipping',
      'Create a "quesadilla flower" by arranging triangles like petals',
      'Add a dollop of sour cream in the center as the "flower center"',
    ],
    nutrition: {
      calories: '220',
      protein: '12g',
      carbs: '24g',
      fat: '8g',
    },
  },
  {
    id: '7',
    name: 'Pasta Salad Stars',
    description: 'Fun-shaped pasta in a colorful salad that makes lunchtime exciting and nutritious.',
    emoji: '⭐',
    time: '20 min',
    servings: '3-4 kids',
    difficulty: 'Easy',
    rating: 4.5,
    tags: ['Colorful', 'Make-Ahead', 'Vegetarian Option', 'Fun Shapes'],
    ingredients: [
      { name: 'Pasta', amount: '2 cups (star or fun shapes)' },
      { name: 'Cherry tomatoes', amount: '1 cup' },
      { name: 'Cucumber', amount: '1/2' },
      { name: 'Bell pepper', amount: '1' },
      { name: 'Cheese cubes', amount: '1/2 cup' },
      { name: 'Italian dressing', amount: '1/4 cup' },
    ],
    instructions: [
      {
        step: 'Cook pasta according to package directions until al dente. Drain and rinse with cold water.',
        tip: 'Rinsing stops the cooking and prevents pasta from sticking together!'
      },
      {
        step: 'While pasta cooks, cut cherry tomatoes in half, dice cucumber and bell pepper.',
      },
      {
        step: 'In a large bowl, combine cooled pasta with all vegetables and cheese cubes.',
      },
      {
        step: 'Drizzle with Italian dressing and toss gently to combine.',
        tip: 'Start with less dressing - you can always add more!'
      },
      {
        step: 'Chill in refrigerator for at least 30 minutes before serving for best flavor.',
        tip: 'This is perfect for meal prep - make it the night before!'
      },
    ],
    presentationTips: [
      'Use different colored bell peppers to create a rainbow effect',
      'Arrange in a star shape on the plate using a cookie cutter as a guide',
      'Serve in a clear container so kids can see all the colorful ingredients',
      'Add fun-shaped pasta - stars, dinosaurs, or alphabet letters',
    ],
    nutrition: {
      calories: '280',
      protein: '10g',
      carbs: '42g',
      fat: '8g',
    },
  },
  {
    id: '8',
    name: 'Turkey & Apple Roll-Ups',
    description: 'Sweet and savory roll-ups that combine protein and fruit in a fun, portable format.',
    emoji: '🍎',
    time: '10 min',
    servings: '2-3 kids',
    difficulty: 'Easy',
    rating: 4.8,
    tags: ['Quick', 'Sweet & Savory', 'Portable', 'Protein-Rich'],
    ingredients: [
      { name: 'Turkey slices', amount: '6-8 slices' },
      { name: 'Apple', amount: '1' },
      { name: 'Cream cheese', amount: '2 tbsp' },
      { name: 'Lettuce', amount: '2-3 leaves' },
    ],
    instructions: [
      {
        step: 'Wash and thinly slice the apple into matchsticks.',
        tip: 'Squeeze a little lemon juice on apple slices to prevent browning!'
      },
      {
        step: 'Lay out turkey slices on a clean surface.',
      },
      {
        step: 'Spread a thin layer of cream cheese on each turkey slice.',
      },
      {
        step: 'Place a few apple matchsticks and a small piece of lettuce on one end of each slice.',
      },
      {
        step: 'Roll up tightly and secure with a toothpick if needed. Cut in half for easier eating.',
        tip: 'Remove toothpicks before serving to younger children!'
      },
    ],
    presentationTips: [
      'Arrange roll-ups standing up in a container like a bouquet',
      'Create a "caterpillar" by arranging multiple roll-ups in a line',
      'Serve with apple slices on the side for extra crunch',
      'Use different colored apples (red, green, yellow) for variety',
    ],
    nutrition: {
      calories: '120',
      protein: '12g',
      carbs: '8g',
      fat: '4g',
    },
  },
]

