import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini on the server side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Barcode Lookup Endpoint with Open Food Facts & Presets
app.get('/api/barcode/:code', async (req, res) => {
  const code = req.params.code?.trim();
  if (!code) {
    return res.status(400).json({ error: 'Barcode is required' });
  }

  // 1. Check known local presets
  const LOCAL_PRESETS: Record<string, any> = {
    '070380001234': {
      code: '070380001234',
      name: 'Horizon Organic Whole Milk',
      category: 'Dairy',
      quantity: '1 Gallon',
      location: 'Fridge Top Shelf',
      daysRemaining: 7,
      cost: 5.29,
      co2: 1.4,
      image: '/src/assets/images/organic_whole_milk_1791826094095.jpg',
    },
    '033383002451': {
      code: '033383002451',
      name: 'Earthbound Organic Baby Spinach',
      category: 'Produce',
      quantity: '300g clam',
      location: 'Fridge Crisper',
      daysRemaining: 5,
      cost: 3.99,
      co2: 0.8,
      image: '/src/assets/images/baby_spinach_bowl_1791826076360.jpg',
    },
    '041220789012': {
      code: '041220789012',
      name: 'Campari Vine-Ripened Tomatoes',
      category: 'Produce',
      quantity: '450g pack',
      location: 'Counter Basket',
      daysRemaining: 6,
      cost: 3.49,
      co2: 0.6,
      image: '/src/assets/images/vine_ripe_tomatoes_1791826107875.jpg',
    },
  };

  if (LOCAL_PRESETS[code]) {
    return res.json({ item: LOCAL_PRESETS[code], source: 'preset' });
  }

  // 2. Query Open Food Facts free public database
  try {
    const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(code)}.json`, {
      headers: { 'User-Agent': 'FoodWiseAI - Web/1.0' },
    });
    if (offRes.ok) {
      const data = await offRes.json();
      if (data.status === 1 && data.product) {
        const prod = data.product;
        const name = prod.product_name || prod.product_name_en || prod.generic_name || `Scanned Product #${code.slice(-6)}`;
        const categoriesTag = (prod.categories_tags || []).join(' ').toLowerCase();

        let category: 'Produce' | 'Dairy' | 'Bakery' | 'Meat & Seafood' | 'Pantry' | 'Beverages' = 'Pantry';
        let location: 'Fridge Crisper' | 'Fridge Top Shelf' | 'Fridge Door' | 'Freezer' | 'Counter Basket' | 'Pantry Shelf' = 'Pantry Shelf';
        let days = 14;

        if (categoriesTag.includes('dairy') || categoriesTag.includes('milk') || categoriesTag.includes('cheese') || categoriesTag.includes('yogurt')) {
          category = 'Dairy';
          location = 'Fridge Top Shelf';
          days = 7;
        } else if (categoriesTag.includes('vegetable') || categoriesTag.includes('fruit') || categoriesTag.includes('produce') || categoriesTag.includes('salad')) {
          category = 'Produce';
          location = 'Fridge Crisper';
          days = 5;
        } else if (categoriesTag.includes('bread') || categoriesTag.includes('bakery') || categoriesTag.includes('pastry')) {
          category = 'Bakery';
          location = 'Counter Basket';
          days = 4;
        } else if (categoriesTag.includes('meat') || categoriesTag.includes('poultry') || categoriesTag.includes('fish') || categoriesTag.includes('seafood')) {
          category = 'Meat & Seafood';
          location = 'Fridge Top Shelf';
          days = 3;
        } else if (categoriesTag.includes('beverage') || categoriesTag.includes('drink') || categoriesTag.includes('juice')) {
          category = 'Beverages';
          location = 'Fridge Door';
          days = 10;
        }

        const item = {
          code,
          name,
          category,
          quantity: prod.quantity || '1 unit',
          location,
          daysRemaining: days,
          cost: 3.99,
          co2: 0.8,
          image: prod.image_front_url || prod.image_url || '/src/assets/images/organic_whole_milk_1791826094095.jpg',
        };
        return res.json({ item, source: 'openfoodfacts' });
      }
    }
  } catch (err) {
    console.warn('Open Food Facts lookup failed:', err);
  }

  // 3. Graceful fallback for any valid barcode
  return res.json({
    item: {
      code,
      name: `Grocery Item (${code.slice(-6)})`,
      category: 'Pantry',
      quantity: '1 item',
      location: 'Pantry Shelf',
      daysRemaining: 10,
      cost: 3.49,
      co2: 0.5,
      image: '/src/assets/images/baby_spinach_bowl_1791826076360.jpg',
    },
    source: 'generated',
  });
});

// AI Food Vision Scanner Endpoint
app.post('/api/ai/scan-food', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Clean base64 string
    let mimeType = 'image/jpeg';
    let base64Data = image;
    if (image.startsWith('data:')) {
      const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    if (!ai) {
      // Smart offline fallback if Gemini key is not configured
      return res.json({
        entities: [
          {
            name: 'Fresh Crisp Produce',
            category: 'Produce',
            confidence: 96,
            quantity: '3 pcs',
            location: 'Fridge Crisper',
            daysRemaining: 5,
            freshnessGrade: 'Optimal',
            estCost: 3.49,
            co2ImpactKg: 0.5,
          },
          {
            name: 'Artisan Sourdough',
            category: 'Bakery',
            confidence: 92,
            quantity: '1 loaf',
            location: 'Counter Basket',
            daysRemaining: 3,
            freshnessGrade: 'Ripe',
            estCost: 4.5,
            co2ImpactKg: 0.4,
          },
        ],
        source: 'fallback',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: `You are an expert grocery inventory and produce freshness AI.
Analyze the user's camera photo of food/groceries.
Identify all distinct food items, raw produce, fresh herbs, packaged groceries, or meal items present.
For each item found:
- name: realistic concise food name (e.g. 'Ripe Haas Avocados', 'Campari Tomatoes', 'Fresh Baby Spinach', 'Greek Yogurt')
- category: one of 'Produce', 'Dairy', 'Bakery', 'Meat & Seafood', 'Pantry', 'Beverages'
- confidence: integer between 75 and 99
- quantity: estimated quantity (e.g. '3 pcs', '1 bunch', '500g', '1 carton')
- location: recommended storage location ('Fridge Crisper', 'Fridge Top Shelf', 'Fridge Door', 'Freezer', 'Counter Basket', 'Pantry Shelf')
- daysRemaining: realistic shelf life in days before spoilage
- freshnessGrade: one of 'Optimal', 'Ripe', 'Needs Attention'
- estCost: estimated price in USD (e.g. 3.25)
- co2ImpactKg: estimated carbon footprint in kg (e.g. 0.5)

Return only a JSON array matching the schema.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: 'You are an advanced food computer vision expert. Accurately identify produce and pantry items from images with realistic shelf-life estimates.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['Produce', 'Dairy', 'Bakery', 'Meat & Seafood', 'Pantry', 'Beverages'] },
              confidence: { type: Type.INTEGER },
              quantity: { type: Type.STRING },
              location: { type: Type.STRING, enum: ['Fridge Crisper', 'Fridge Top Shelf', 'Fridge Door', 'Freezer', 'Counter Basket', 'Pantry Shelf'] },
              daysRemaining: { type: Type.INTEGER },
              freshnessGrade: { type: Type.STRING, enum: ['Optimal', 'Ripe', 'Needs Attention'] },
              estCost: { type: Type.NUMBER },
              co2ImpactKg: { type: Type.NUMBER },
            },
            required: ['name', 'category', 'quantity', 'location', 'daysRemaining', 'freshnessGrade'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '[]');
    return res.json({ entities: parsed, source: 'gemini' });
  } catch (error) {
    console.error('Gemini Food Vision Scanner error:', error);
    return res.json({
      entities: [
        {
          name: 'Fresh Market Produce',
          category: 'Produce',
          confidence: 90,
          quantity: '2 items',
          location: 'Fridge Crisper',
          daysRemaining: 4,
          freshnessGrade: 'Optimal',
          estCost: 3.5,
          co2ImpactKg: 0.5,
        },
      ],
      source: 'fallback_error',
    });
  }
});

// AI Recipe Agent Endpoint
app.post('/api/ai/recipes', async (req, res) => {
  try {
    const {
      ingredients = [],
      expiringItems = [],
      minProteinGrams = 0,
      recipeCount = 2,
      dietaryGoal = 'High Protein',
    } = req.body;

    const ingredientListStr = (ingredients.length > 0 ? ingredients : ['Spinach', 'Eggs', 'Tomatoes', 'Milk', 'Cheese']).join(', ');
    const expiringListStr = (expiringItems.length > 0 ? expiringItems : ingredients.slice(0, 2)).join(', ');

    if (!ai) {
      // Fallback recipe generator if API key is not yet set
      const fallbackRecipes = generateFallbackRecipes(ingredients, expiringItems, minProteinGrams, recipeCount);
      return res.json({ recipes: fallbackRecipes, source: 'fallback' });
    }

    const prompt = `You are an expert Culinary Nutritionist and Zero-Waste Chef AI Agent.
The user has the following pantry ingredients available: ${ingredientListStr}.
The following items are EXPIRING SOON and MUST be prioritized: ${expiringListStr}.
Goal: Create ${recipeCount} distinct delicious, practical zero-waste recipe(s).
Dietary focus: ${dietaryGoal}.
Target Protein: Each recipe MUST highlight high protein content (aim for at least ${minProteinGrams > 0 ? minProteinGrams : 20}g of protein per serving).

Return a JSON array of recipe objects with exact protein quantities and culinary instructions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a professional Michelin-star zero-waste chef and sports nutrition expert. Prioritize using expiring produce and pantry staples. Always calculate accurate protein amounts in grams.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              prepTime: { type: Type.STRING },
              cookTime: { type: Type.STRING },
              servings: { type: Type.INTEGER },
              difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Intermediate'] },
              badgeText: { type: Type.STRING },
              savingsText: { type: Type.STRING },
              matchedIngredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              missingIngredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              description: { type: Type.STRING },
              instructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              calories: { type: Type.INTEGER },
              protein: { type: Type.STRING },
              proteinGrams: { type: Type.INTEGER },
            },
            required: ['title', 'subtitle', 'cookTime', 'matchedIngredients', 'instructions', 'protein', 'proteinGrams'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '[]');
    // Attach reliable culinary fallback images if missing
    const enriched = parsed.map((recipe: any, idx: number) => ({
      ...recipe,
      id: recipe.id || `ai-recipe-${Date.now()}-${idx}`,
      imageUrl: recipe.imageUrl || (idx % 2 === 0
        ? '/src/assets/images/shakshuka_skillet_1791826063552.jpg'
        : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'),
      badgeText: recipe.badgeText || `HIGH PROTEIN (${recipe.proteinGrams || 25}g)`,
      savingsText: recipe.savingsText || `Save $${(Math.random() * 3 + 2.5).toFixed(2)}`,
    }));

    return res.json({ recipes: enriched, source: 'gemini' });
  } catch (error) {
    console.error('Gemini Recipe Agent error:', error);
    // Graceful fallback so app always functions reliably
    const fallbackRecipes = generateFallbackRecipes(req.body.ingredients || [], req.body.expiringItems || [], req.body.minProteinGrams || 20, req.body.recipeCount || 2);
    return res.json({ recipes: fallbackRecipes, source: 'fallback_error' });
  }
});

// Fallback algorithm for zero downtime
function generateFallbackRecipes(ingredients: string[], expiring: string[], minProtein: number, count: number) {
  const defaults = [
    {
      id: `ai-recipe-1-${Date.now()}`,
      title: 'Power Protein Shakshuka Skillet',
      subtitle: `Rescues expiring ${expiring[0] || 'greens'} with high-protein eggs and simmered tomatoes.`,
      prepTime: '5 mins',
      cookTime: '12 mins',
      servings: 2,
      difficulty: 'Easy',
      imageUrl: '/src/assets/images/shakshuka_skillet_1791826063552.jpg',
      badgeText: 'HIGH PROTEIN • 26g',
      savingsText: 'Save $4.50',
      matchedIngredients: [expiring[0] || 'Baby Spinach', expiring[1] || 'Tomatoes', 'Eggs', 'Olive Oil'],
      missingIngredients: ['Feta cheese'],
      description: 'A protein-dense, one-skillet Mediterranean meal that poaches farm fresh eggs in fragrant wilted greens and ripe tomatoes.',
      instructions: [
        'Sauté garlic and diced tomatoes in olive oil for 4 minutes until bubbling.',
        `Fold in ${expiring[0] || 'fresh spinach'} until wilted and vibrant green.`,
        'Create 2-3 pockets and crack pasture-raised eggs directly into the simmer.',
        'Cover and cook for 4 minutes until egg whites set and yolks remain silky.',
        'Season with cracked black pepper and enjoy warm.'
      ],
      calories: 340,
      protein: '26g',
      proteinGrams: 26,
    },
    {
      id: `ai-recipe-2-${Date.now()}`,
      title: 'Seared Salmon & Crispy Veggie Scramble',
      subtitle: `Ultra-high protein recovery bowl using ${expiring[0] || 'produce'} and wholesome pantry staples.`,
      prepTime: '7 mins',
      cookTime: '10 mins',
      servings: 2,
      difficulty: 'Easy',
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80',
      badgeText: 'PROTEIN BEAST • 38g',
      savingsText: 'Save $6.20',
      matchedIngredients: ['Salmon', expiring[0] || 'Spinach', 'Eggs', 'Butter'],
      missingIngredients: ['Lemon wedge'],
      description: 'Pan-seared omega-3 rich salmon flaked over soft scrambled eggs and tender wilted greens for maximal protein synthesis.',
      instructions: [
        'Sear seasoned salmon fillet in butter for 3-4 minutes per side until flaky.',
        'In the same skillet, toss in chopped greens until soft.',
        'Whisk 2 eggs and pour over greens, gently folding until soft curds form.',
        'Top with flaked salmon and finish with sea salt.'
      ],
      calories: 420,
      protein: '38g',
      proteinGrams: 38,
    },
    {
      id: `ai-recipe-3-${Date.now()}`,
      title: 'Creamy Greek Yogurt & Greens Protein Bowl',
      subtitle: 'Instant 3-minute zero-cook protein powerhouse using expiring yogurt & dairy.',
      prepTime: '3 mins',
      cookTime: '0 mins',
      servings: 1,
      difficulty: 'Easy',
      imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80',
      badgeText: 'NO-COOK PROTEIN • 28g',
      savingsText: 'Save $3.80',
      matchedIngredients: ['Greek Yogurt', 'Whole Milk', 'Honey', 'Walnuts'],
      missingIngredients: ['Chia seeds'],
      description: 'Thick strained yogurt whipped with a splash of milk, raw honey, and crunchy walnuts delivering 28g of clean protein.',
      instructions: [
        'Scoop Greek yogurt into a chilled bowl.',
        'Drizzle with raw clover honey and a splash of milk to reach desired consistency.',
        'Top with toasted walnuts and fresh fruit if available.'
      ],
      calories: 310,
      protein: '28g',
      proteinGrams: 28,
    }
  ];

  return defaults.slice(0, Math.max(1, Math.min(count, 3)));
}

// In development, hook Vite middleware; in production, serve built dist/
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FoodWise AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
