import React, { useState } from 'react';
import { X, Dumbbell, Check, Sparkles, UtensilsCrossed } from 'lucide-react';
import { Recipe } from '../types/food';

interface RecipeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  onCompleteCooking: (recipe: Recipe) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  isOpen,
  onClose,
  recipe,
  onCompleteCooking,
}) => {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [cooked, setCooked] = useState(false);

  if (!isOpen) return null;

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleFinishCooking = () => {
    setCooked(true);
    setTimeout(() => {
      onCompleteCooking(recipe);
      onClose();
      setCooked(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#131b2e] text-[#131b2e] dark:text-[#f1f5f9] w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
        {/* Hero image header */}
        <div className="relative h-56 w-full bg-slate-900 shrink-0">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Floating Badges */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <span className="bg-[#00873a] text-white text-[11px] font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 shadow-sm mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {recipe.badgeText}
              </span>
              <h2 className="text-xl font-extrabold text-white leading-tight">
                {recipe.title}
              </h2>
            </div>
            <span className="bg-[#dcfce7] text-[#006b2c] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {recipe.savingsText}
            </span>
          </div>
        </div>

        {/* Recipe Meta Info strip with PROTEIN */}
        <div className="grid grid-cols-4 border-b border-slate-100 dark:border-slate-800 bg-[#faf8ff] dark:bg-[#0b0f19] px-4 py-3 text-center text-xs font-semibold text-[#131b2e] dark:text-white transition-colors">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Prep</span>
            <span className="mt-0.5">{recipe.prepTime}</span>
          </div>
          <div className="flex flex-col items-center border-l border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Cook</span>
            <span className="mt-0.5">{recipe.cookTime}</span>
          </div>
          <div className="flex flex-col items-center border-l border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Protein</span>
            <span className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <Dumbbell className="w-3 h-3" />
              {recipe.protein}
            </span>
          </div>
          <div className="flex flex-col items-center border-l border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Calories</span>
            <span className="mt-0.5">{recipe.calories} kcal</span>
          </div>
        </div>

        {/* Tab switch: Ingredients vs Steps */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 pt-2 bg-white dark:bg-[#131b2e] transition-colors">
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all relative ${
              activeTab === 'ingredients'
                ? 'text-[#006b2c] dark:text-emerald-400 border-b-2 border-[#006b2c] dark:border-emerald-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Pantry Ingredients ({recipe.matchedIngredients.length})
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all relative ${
              activeTab === 'steps'
                ? 'text-[#006b2c] dark:text-emerald-400 border-b-2 border-[#006b2c] dark:border-emerald-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Cooking Instructions ({recipe.instructions.length})
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'ingredients' ? (
            <div className="space-y-3">
              <div className="p-3 bg-[#dcfce7]/40 dark:bg-emerald-950/40 border border-[#dcfce7] dark:border-emerald-900 rounded-2xl text-xs text-[#006b2c] dark:text-emerald-300 leading-relaxed">
                ✨ <strong>Zero-Waste & High Protein:</strong> Formulated to rescue expiring items from your pantry while delivering {recipe.protein} of bioavailable protein.
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Matched From Your Pantry
                </span>
                {recipe.matchedIngredients.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#006b2c] text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item}</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">In Pantry</span>
                  </div>
                ))}
              </div>

              {recipe.missingIngredients.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Optional / Missing
                  </span>
                  {recipe.missingIngredients.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-700 dark:text-slate-300">{item}</span>
                      <span className="text-[11px] text-amber-700 dark:text-amber-400">Optional garnish</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Check off each step as you cook in your kitchen:
              </p>
              {recipe.instructions.map((step, idx) => {
                const isDone = completedSteps.includes(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isDone
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-slate-400 dark:text-slate-500 line-through'
                        : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 flex-1">
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-white dark:bg-[#131b2e] border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 transition-colors">
          <button
            onClick={handleFinishCooking}
            disabled={cooked}
            className="flex-1 py-3.5 bg-[#006b2c] hover:bg-[#005320] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
          >
            {cooked ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Ingredients Deducted & Saved!</span>
              </>
            ) : (
              <>
                <UtensilsCrossed className="w-4 h-4" />
                <span>Finished Cooking (Deduct from Pantry)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
