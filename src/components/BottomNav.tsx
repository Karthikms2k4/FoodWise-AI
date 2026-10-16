import React from 'react';
import { Home, Package2, Plus, Sparkles, User } from 'lucide-react';

export type NavTab = 'home' | 'pantry' | 'recipes' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickAdd,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-t border-[#e2e8f0] dark:border-slate-800 pb-safe transition-colors">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Tab 1: Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            currentTab === 'home'
              ? 'text-[#006b2c] dark:text-[#22c55e] font-bold'
              : 'text-[#6e7b6c] dark:text-slate-400 hover:text-[#131b2e] dark:hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] mt-1 tracking-tight">Home</span>
        </button>

        {/* Tab 2: Pantry */}
        <button
          onClick={() => onSelectTab('pantry')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            currentTab === 'pantry'
              ? 'text-[#006b2c] dark:text-[#22c55e] font-bold'
              : 'text-[#6e7b6c] dark:text-slate-400 hover:text-[#131b2e] dark:hover:text-white'
          }`}
        >
          <Package2 className={`w-5 h-5 ${currentTab === 'pantry' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] mt-1 tracking-tight">Pantry</span>
        </button>

        {/* Center Floating Plus Action Button */}
        <div className="flex-1 flex justify-center items-center h-full relative">
          <button
            onClick={onOpenQuickAdd}
            aria-label="Add new food item or scan"
            className="w-14 h-14 rounded-full bg-[#006b2c] text-white flex items-center justify-center shadow-lg shadow-emerald-900/20 ring-4 ring-[#faf8ff] dark:ring-[#0b0f19] active:scale-95 hover:bg-[#005320] transition-all -translate-y-3 z-10"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Recipes */}
        <button
          onClick={() => onSelectTab('recipes')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            currentTab === 'recipes'
              ? 'text-[#006b2c] dark:text-[#22c55e] font-bold'
              : 'text-[#6e7b6c] dark:text-slate-400 hover:text-[#131b2e] dark:hover:text-white'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${currentTab === 'recipes' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] mt-1 tracking-tight">Recipes</span>
        </button>

        {/* Tab 4: Profile */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            currentTab === 'profile'
              ? 'text-[#006b2c] dark:text-[#22c55e] font-bold'
              : 'text-[#6e7b6c] dark:text-slate-400 hover:text-[#131b2e] dark:hover:text-white'
          }`}
        >
          <User className={`w-5 h-5 ${currentTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] mt-1 tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};
