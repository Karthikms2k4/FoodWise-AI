import React from 'react';
import { AlertTriangle, ChevronRight, Clock } from 'lucide-react';
import { FoodItem } from '../types/food';

interface ExpiringListProps {
  items: FoodItem[];
  onViewAll: () => void;
  onItemClick: (item: FoodItem) => void;
  onConsumeItem: (itemId: string) => void;
}

export const ExpiringList: React.FC<ExpiringListProps> = ({
  items,
  onViewAll,
  onItemClick,
}) => {
  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#131b2e] dark:text-white flex items-center gap-1.5">
          <AlertTriangle className="w-5 h-5 text-[#855300] dark:text-amber-400 fill-[#ffddb8] dark:fill-amber-950" />
          <span>Expiring Soon</span>
        </h2>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-[#006b2c] dark:text-emerald-400 hover:underline flex items-center gap-0.5 transition-colors"
        >
          <span>View All ({items.length})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Item Rows */}
      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onItemClick(item)}
            className="group bg-white dark:bg-[#131b2e] rounded-2xl p-3 border border-[#e2e8f0] dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between cursor-pointer active:scale-[0.99]"
          >
            {/* Left: Thumbnail & Details */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 shrink-0">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-[#131b2e] dark:text-white truncate">
                  {item.name}
                </h3>
                <p className="text-xs text-[#6e7b6c] dark:text-slate-400 mt-0.5 truncate">
                  {item.quantity} • {item.location}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    Est. ${item.estCost.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    • {item.co2ImpactKg} kg CO2
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Badge & Expiry Subtext */}
            <div className="text-right shrink-0 pl-2">
              <span className="inline-flex items-center gap-1 bg-[#ffddb8] dark:bg-amber-950/80 text-[#855300] dark:text-amber-300 border border-transparent dark:border-amber-800/60 text-xs font-bold px-2.5 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                {item.expiryDateText}
              </span>
              <div className="text-[11px] font-semibold text-[#855300] dark:text-amber-400 mt-1 text-right">
                {item.id === 'food-1'
                  ? '1 day left'
                  : item.id === 'food-2'
                  ? 'Dairy'
                  : 'Produce'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
