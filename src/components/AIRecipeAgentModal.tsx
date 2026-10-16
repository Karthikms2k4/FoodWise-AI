import React, { useState } from 'react';
import { X, Sparkles, Wand2, ChefHat, Dumbbell, Clock, Check, ArrowRight, RefreshCw, Flame } from 'lucide-react';
import { FoodItem, Recipe } from '../types/food';

interface AIRecipeAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  pantryItems: FoodItem[];
  onSelectRecipeToCook: (recipe: Recipe) => void;
  onSaveNewRecipe: (recipe: Recipe) => void;
}

export const AIRecipeAgentModal: React.FC<AIRecipeAgentModalProps> = ({
  isOpen,
  onClose,
  pantryItems,
  onSelectRecipeToCook,
  onSaveNewRecipe,
}) => {
  // Pre-select expiring items by default
  const expiringItems = pantryItems.filter((i) => i.status === 'expiring_soon');
  const otherItems = pantryItems.filter((i) => i.status !== 'expiring_soon').slice(0, 10);

  const [selectedItems, setSelectedItems] = useState<string[]>(
    expiringItems.length > 0 ? expiringItems.map((i) => i.name) : ['Organic Baby Spinach', 'Vine Ripe Tomatoes']
  );
  const [recipeCount, setRecipeCount] = useState<number>(2);
  const [minProtein, setMinProtein] = useState<number>(25);
  const [dietaryGoal, setDietaryGoal] = useState<string>('High Protein');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[] | null>(null);

  if (!isOpen) return null;

  const toggleItem = (name: string) => {
    setSelectedItems((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const handleGenerate = async () => {
    if (selectedItems.length === 0) return;

    setIsGenerating(true);
    setGeneratedRecipes(null);
    setGenerationStep('Auditing selected pantry ingredients...');

    try {
      setTimeout(() => {
        setGenerationStep('Optimizing macronutrient ratio and protein synthesis...');
      }, 700);

      setTimeout(() => {
        setGenerationStep('Synthesizing zero-waste culinary recipes with Gemini...');
      }, 1400);

      const response = await fetch('/api/ai/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: selectedItems,
          expiringItems: expiringItems.map((i) => i.name),
          minProteinGrams: minProtein,
          recipeCount,
          dietaryGoal,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (data.recipes && data.recipes.length > 0) {
        setGeneratedRecipes(data.recipes);
      }
    } catch (error) {
      console.error('Failed to generate recipes via API:', error);
      // Client-side fallback if offline
      setGeneratedRecipes([
        {
          id: `fallback-${Date.now()}-1`,
          title: 'High-Protein Green Shakshuka Skillet',
          subtitle: `Rescues ${selectedItems.slice(0, 2).join(' & ')} with farm eggs and rich spices.`,
          prepTime: '5 mins',
          cookTime: '12 mins',
          servings: 2,
          difficulty: 'Easy',
          imageUrl: '/src/assets/images/shakshuka_skillet_1791826063552.jpg',
          badgeText: `HIGH PROTEIN • ${minProtein}g`,
          savingsText: 'Save $4.80',
          matchedIngredients: selectedItems,
          missingIngredients: ['Olive oil', 'Black pepper'],
          description: 'A comforting Mediterranean skillet meal with golden yolks simmered into wilted seasonal greens and tomatoes.',
          instructions: [
            'Warm 1 tbsp oil in a heavy skillet over medium-high heat.',
            `Sauté ${selectedItems.slice(0, 2).join(' and ')} until tender.`,
            'Crack 3 large eggs directly into wells in the warm greens.',
            'Simmer covered for 4 minutes until whites are set and yolks are soft.',
            'Serve warm directly from skillet.'
          ],
          calories: 360,
          protein: `${minProtein}g`,
          proteinGrams: minProtein,
          isAiGenerated: true,
        },
      ]);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#131b2e] text-[#131b2e] dark:text-[#f1f5f9] w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#006b2c] to-[#00873a] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#131b2e] dark:text-white leading-tight flex items-center gap-1.5">
                <span>AI Recipe Agent</span>
                <span className="text-[10px] font-bold bg-[#dcfce7] dark:bg-emerald-950 text-[#006b2c] dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  GEMINI 3.8
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Zero-waste chef with automated protein optimization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {!generatedRecipes ? (
            <>
              {/* Step 1: Select Ingredients */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    1. Select Ingredients To Cook ({selectedItems.length})
                  </label>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Expiring items prioritized
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    Expiring Soon:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {expiringItems.map((item) => {
                      const isSelected = selectedItems.includes(item.name);
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleItem(item.name)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isSelected
                              ? 'bg-[#006b2c] text-white shadow-xs ring-2 ring-emerald-500/30'
                              : 'bg-[#ffddb8]/80 dark:bg-amber-950/70 text-[#855300] dark:text-amber-300 border border-amber-300/60 dark:border-amber-800'
                          }`}
                        >
                          <Check className={`w-3 h-3 ${isSelected ? 'opacity-100' : 'opacity-30'}`} />
                          <span>{item.name}</span>
                          <span className="text-[10px] opacity-80">({item.expiryDateText})</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 pt-1">
                    Other Available Pantry Items:
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {otherItems.map((item) => {
                      const isSelected = selectedItems.includes(item.name);
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleItem(item.name)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-[#006b2c] text-white shadow-xs font-bold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {item.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step 2: Recipe Count & Protein Target */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Number of recipes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Recipes to Generate
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        onClick={() => setRecipeCount(num)}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                          recipeCount === num
                            ? 'bg-white dark:bg-slate-700 text-[#006b2c] dark:text-emerald-300 shadow-xs'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {num} {num === 1 ? 'Recipe' : 'Recipes'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Protein Target */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Dumbbell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Target Protein</span>
                  </label>
                  <select
                    value={minProtein}
                    onChange={(e) => setMinProtein(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={15}>15g+ Protein (Light)</option>
                    <option value={25}>25g+ Protein (Recommended)</option>
                    <option value={35}>35g+ Protein (High Performance)</option>
                    <option value={45}>45g+ Protein (Muscle Recovery)</option>
                  </select>
                </div>
              </div>

              {/* Step 3: Culinary Style */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Dietary / Preparation Goal
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['High Protein', 'Under 15 Mins', 'Vegetarian', 'One-Skillet', 'Low Carb'].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setDietaryGoal(goal)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        dietaryGoal === goal
                          ? 'bg-[#006b2c] text-white font-bold shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loading State or Submit Button */}
              {isGenerating ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2.5 animate-pulse">
                  <RefreshCw className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto" />
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    {generationStep || 'Consulting AI Recipe Agent...'}
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Evaluating shelf-life urgency and balancing protein macros
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={selectedItems.length === 0}
                  className="w-full py-3.5 bg-[#006b2c] hover:bg-[#005320] active:scale-[0.98] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-950/10 transition-all disabled:opacity-50"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Generate {recipeCount} High-Protein Recipe{recipeCount > 1 ? 's' : ''}</span>
                </button>
              )}
            </>
          ) : (
            /* Results View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-[#131b2e] dark:text-white">
                    Generated {generatedRecipes.length} Recipe{generatedRecipes.length > 1 ? 's' : ''}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Optimized for: {dietaryGoal} • Min. {minProtein}g Protein
                  </p>
                </div>
                <button
                  onClick={() => setGeneratedRecipes(null)}
                  className="text-xs font-bold text-[#006b2c] dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate</span>
                </button>
              </div>

              <div className="space-y-3">
                {generatedRecipes.map((recipe, index) => (
                  <div
                    key={recipe.id || index}
                    className="p-4 rounded-2xl bg-white dark:bg-[#161f30] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3 hover:shadow-md transition-all"
                  >
                    {/* Header tags with PROMINENT PROTEIN BADGE */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="bg-[#00873a] text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                        <Dumbbell className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{recipe.protein || `${recipe.proteinGrams || minProtein}g Protein`}</span>
                      </span>

                      <span className="bg-[#dcfce7] dark:bg-emerald-950 text-[#006b2c] dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {recipe.savingsText || 'Zero Waste'}
                      </span>
                    </div>

                    {/* Dish Preview */}
                    <div className="flex items-center gap-3">
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold text-[#131b2e] dark:text-white leading-tight truncate">
                          {recipe.title}
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {recipe.subtitle || recipe.description}
                        </p>
                        <div className="flex items-center gap-2.5 text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                          <span>⏱ {recipe.cookTime}</span>
                          <span>•</span>
                          <span>🔥 {recipe.calories} kcal</span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            💪 {recipe.protein}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Matched Ingredients Chips */}
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 mr-1 self-center">
                        Rescues:
                      </span>
                      {recipe.matchedIngredients.map((ing, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1"
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                          <span>{ing}</span>
                        </span>
                      ))}
                    </div>

                    {/* Action button */}
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        onClick={() => {
                          onSaveNewRecipe(recipe);
                          onSelectRecipeToCook(recipe);
                          onClose();
                        }}
                        className="flex-1 py-2.5 bg-[#006b2c] hover:bg-[#005320] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
                      >
                        <span>Cook With My Food</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
