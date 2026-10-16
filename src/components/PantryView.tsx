import React, { useState, useMemo } from 'react';
import { Search, Plus, CheckCircle2, Snowflake, Trash2, ArrowUpDown } from 'lucide-react';
import { FoodItem } from '../types/food';

interface PantryViewProps {
  items: FoodItem[];
  onConsumeItem: (id: string) => void;
  onFreezeItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onOpenAddModal: () => void;
  initialFilter?: 'all' | 'expiring_soon' | 'expired' | 'optimal';
}

export const PantryView: React.FC<PantryViewProps> = ({
  items,
  onConsumeItem,
  onFreezeItem,
  onDeleteItem,
  onOpenAddModal,
  initialFilter = 'all',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationTab, setLocationTab] = useState<'All' | 'Fridge' | 'Freezer' | 'Pantry'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'expiring_soon' | 'expired' | 'optimal'>(initialFilter);
  const [sortBy, setSortBy] = useState<'expiry' | 'name'>('expiry');

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Search query
        if (searchQuery.trim() && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }

        // Location tab
        if (locationTab === 'Fridge' && !item.location.includes('Fridge')) return false;
        if (locationTab === 'Freezer' && item.location !== 'Freezer') return false;
        if (locationTab === 'Pantry' && !(item.location.includes('Pantry') || item.location.includes('Counter'))) return false;

        // Status filter
        if (statusFilter !== 'all' && item.status !== statusFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'expiry') {
          return a.daysRemaining - b.daysRemaining;
        }
        return a.name.localeCompare(b.name);
      });
  }, [items, searchQuery, locationTab, statusFilter, sortBy]);

  return (
    <div className="space-y-4 pb-24">
      {/* Search & Add Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pantry items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#131b2e] border border-[#e2e8f0] dark:border-slate-800 text-sm text-[#131b2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006b2c] shadow-xs"
          />
        </div>
        <button
          onClick={onOpenAddModal}
          className="p-2.5 bg-[#006b2c] hover:bg-[#005320] text-white rounded-2xl shadow-sm transition-all active:scale-95"
          title="Add New Food Item"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Location Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {(['All', 'Fridge', 'Freezer', 'Pantry'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setLocationTab(tab)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              locationTab === tab
                ? 'bg-[#006b2c] text-white shadow-xs'
                : 'bg-white dark:bg-[#131b2e] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab === 'All' ? `All (${items.length})` : tab}
          </button>
        ))}
      </div>

      {/* Status Segmented Pills */}
      <div className="flex items-center justify-between text-xs gap-1 bg-[#eaedff]/60 dark:bg-slate-800/60 p-1 rounded-xl">
        <button
          onClick={() => setStatusFilter('all')}
          className={`flex-1 py-1.5 text-center font-bold rounded-lg transition-all ${
            statusFilter === 'all' ? 'bg-white dark:bg-slate-700 text-[#131b2e] dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('expiring_soon')}
          className={`flex-1 py-1.5 text-center font-bold rounded-lg transition-all ${
            statusFilter === 'expiring_soon' ? 'bg-[#ffddb8] dark:bg-amber-950 text-[#855300] dark:text-amber-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Soon ({items.filter((i) => i.status === 'expiring_soon').length})
        </button>
        <button
          onClick={() => setStatusFilter('expired')}
          className={`flex-1 py-1.5 text-center font-bold rounded-lg transition-all ${
            statusFilter === 'expired' ? 'bg-[#ffdad6] dark:bg-red-950 text-[#ba1a1a] dark:text-red-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Expired ({items.filter((i) => i.status === 'expired').length})
        </button>
        <button
          onClick={() => setStatusFilter('optimal')}
          className={`flex-1 py-1.5 text-center font-bold rounded-lg transition-all ${
            statusFilter === 'optimal' ? 'bg-[#7ffc97] dark:bg-emerald-950 text-[#005320] dark:text-emerald-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Fresh ({items.filter((i) => i.status === 'optimal').length})
        </button>
      </div>

      {/* Item count & Sort */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>Showing {filteredItems.length} items</span>
        <button
          onClick={() => setSortBy(sortBy === 'expiry' ? 'name' : 'expiry')}
          className="flex items-center gap-1 font-semibold text-[#006b2c] dark:text-emerald-400 hover:underline"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Sort: {sortBy === 'expiry' ? 'By Expiry' : 'By Name'}</span>
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-[#131b2e] rounded-2xl p-3 border border-[#e2e8f0] dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            {/* Image & Basic Details */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 shrink-0">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-[#131b2e] dark:text-white truncate">
                  {item.name}
                </h4>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {item.quantity} • {item.location}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'expired'
                        ? 'bg-[#ffdad6] dark:bg-red-950/80 text-[#ba1a1a] dark:text-red-300'
                        : item.status === 'expiring_soon'
                        ? 'bg-[#ffddb8] dark:bg-amber-950/80 text-[#855300] dark:text-amber-300'
                        : 'bg-[#7ffc97]/60 dark:bg-emerald-950/80 text-[#005320] dark:text-emerald-300'
                    }`}
                  >
                    {item.expiryDateText}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    ${item.estCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Eat, Freeze, Delete) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onConsumeItem(item.id)}
                title="Mark as Eaten / Consumed"
                className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-[#006b2c] dark:text-emerald-400 flex items-center justify-center transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>

              {item.location !== 'Freezer' && (
                <button
                  onClick={() => onFreezeItem(item.id)}
                  title="Move to Freezer (Extend shelf life)"
                  className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 flex items-center justify-center transition-colors"
                >
                  <Snowflake className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => onDeleteItem(item.id)}
                title="Discard / Remove"
                className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950 text-slate-400 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
