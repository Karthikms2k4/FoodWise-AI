import React from 'react';
import { Sparkles, Clock, ChevronRight, Wand2, Check, Dumbbell } from 'lucide-react';
import { Recipe, FoodItem } from '../types/food';

interface RecipesViewProps {
  recipes: Recipe[];
  pantryItems: FoodItem[];
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenAIRecipeAgent: () => void;
}

export const RecipesView: React.FC<RecipesViewProps> = ({
  recipes,
  pantryItems,
  onSelectRecipe,
  onOpenAIRecipeAgent,
}) => {
  const expiringItems = pantryItems.filter((i) => i.status === 'expiring_soon');

  return (
    <div className="space-y-4 pb-24">
      {/* AI Recipe Generator Banner */}
      <div className="bg-gradient-to-br from-[#006b2c] to-[#005320] rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 backdrop-blur-xs">
              <Sparkles className="w-3 h-3" />
              AI CHEF & PROTEIN OPTIMIZER
            </span>
            <h3 className="text-lg font-extrabold leading-tight">
              AI Recipe Agent
            </h3>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Synthesize zero-waste meals rescuing your {expiringItems.length} expiring items with customized high-protein macros.
            </p>
          </div>
          <button
            onClick={onOpenAIRecipeAgent}
            className="px-3.5 py-2.5 rounded-2xl bg-white text-[#006b2c] font-bold text-xs flex items-center gap-1.5 shadow-md shrink-0 active:scale-95 transition-all self-center hover:bg-emerald-50"
          >
            <Wand2 className="w-4 h-4" />
            <span>Launch Agent</span>
          </button>
        </div>
      </div>

      {/* Recipes List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-[#131b2e] dark:text-white">
            Available Zero-Waste Recipes ({recipes.length})
          </h3>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            High Protein Verified
          </span>
        </div>

        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => onSelectRecipe(recipe)}
            className="bg-white dark:bg-[#131b2e] rounded-3xl p-4 border border-[#e2e8f0] dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 group"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="bg-[#00873a] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {recipe.badgeText}
                </span>
                <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Dumbbell className="w-3 h-3" />
                  <span>{recipe.protein || `${recipe.proteinGrams || 20}g protein`}</span>
                </span>
              </div>

              <span className="bg-[#dcfce7] dark:bg-emerald-950 text-[#006b2c] dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {recipe.savingsText}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-800">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-[#131b2e] dark:text-white leading-snug truncate">
                  {recipe.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {recipe.subtitle}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1.5">
                  <span className="flex items-center gap-1 text-[#006b2c] dark:text-emerald-400 font-semibold">
                    <Clock className="w-3 h-3" />
                    {recipe.cookTime}
                  </span>
                  <span>•</span>
                  <span>{recipe.calories} kcal</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    💪 {recipe.protein}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0" />
            </div>

            {/* Matched Pantry Items */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 mr-1">Uses:</span>
              {recipe.matchedIngredients.slice(0, 3).map((ing, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1"
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  {ing}
                </span>
              ))}
              {recipe.matchedIngredients.length > 3 && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  +{recipe.matchedIngredients.length - 3} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
