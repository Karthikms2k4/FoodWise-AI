import React from 'react';
import { Sparkles, ChevronRight, UtensilsCrossed, Dumbbell } from 'lucide-react';
import { Recipe } from '../types/food';

interface RecipeSpotlightProps {
  recipe: Recipe;
  onCook: () => void;
  onViewRecipe: () => void;
  onOpenAIAgent?: () => void;
}

export const RecipeSpotlight: React.FC<RecipeSpotlightProps> = ({
  recipe,
  onCook,
  onViewRecipe,
  onOpenAIAgent,
}) => {
  return (
    <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-4 border border-[#e2e8f0] dark:border-slate-800 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
      {/* Header Badges */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <span className="bg-[#00873a] text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
          {recipe.badgeText}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Dumbbell className="w-3 h-3" />
            <span>{recipe.protein || '18g Protein'}</span>
          </span>
          <span className="bg-[#dcfce7] dark:bg-emerald-950/80 text-[#006b2c] dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {recipe.savingsText}
          </span>
        </div>
      </div>

      {/* Dish Imagery & Summary */}
      <div className="flex items-center gap-3.5 mb-4">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 shadow-inner bg-slate-100 dark:bg-slate-800">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-[#131b2e] dark:text-white leading-snug truncate">
            {recipe.title}
          </h2>
          <p className="text-xs text-[#6e7b6c] dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {recipe.subtitle}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-[#006b2c] dark:text-emerald-400 font-semibold mt-1.5">
            <span>⏱ {recipe.cookTime}</span>
            <span>•</span>
            <span>🔥 {recipe.calories} kcal</span>
            <span>•</span>
            <span className="font-bold">💪 {recipe.protein || '18g protein'}</span>
          </div>
        </div>
      </div>

      {/* Two Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onCook}
          className="flex-1 bg-[#006b2c] hover:bg-[#005320] active:scale-[0.98] text-white py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Cook With My Food</span>
        </button>

        <button
          onClick={onViewRecipe}
          className="bg-[#eaedff] dark:bg-slate-800 hover:bg-[#dae2fd] dark:hover:bg-slate-700 active:scale-[0.98] text-[#131b2e] dark:text-white py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-all shrink-0"
        >
          <span>Recipe</span>
          <ChevronRight className="w-4 h-4 text-[#131b2e] dark:text-white" />
        </button>
      </div>
    </div>
  );
};
