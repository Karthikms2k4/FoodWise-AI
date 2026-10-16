import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { FoodCategory, StorageLocation, FoodItem } from '../types/food';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<FoodItem, 'id'>) => void;
}

const CATEGORIES: FoodCategory[] = ['Produce', 'Dairy', 'Bakery', 'Meat & Seafood', 'Pantry', 'Beverages'];
const LOCATIONS: StorageLocation[] = ['Fridge Crisper', 'Fridge Top Shelf', 'Fridge Door', 'Freezer', 'Counter Basket', 'Pantry Shelf'];

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Produce');
  const [location, setLocation] = useState<StorageLocation>('Fridge Crisper');
  const [quantity, setQuantity] = useState('1 unit');
  const [daysRemaining, setDaysRemaining] = useState(5);
  const [estCost, setEstCost] = useState('3.50');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const days = Number(daysRemaining);
    let status: 'optimal' | 'expiring_soon' | 'expired' = 'optimal';
    let expiryDateText = `${days} Days Left`;

    if (days <= 0) {
      status = 'expired';
      expiryDateText = 'Expired Today';
    } else if (days <= 3) {
      status = 'expiring_soon';
      expiryDateText = days === 1 ? 'Tomorrow' : `${days} Days Left`;
    }

    onAdd({
      name: name.trim(),
      category,
      location,
      quantity,
      daysRemaining: days,
      expiryDateText,
      status,
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&q=80',
      co2ImpactKg: 0.5,
      estCost: parseFloat(estCost) || 2.5,
      addedDate: new Date().toISOString().split('T')[0],
    });

    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#131b2e] text-[#131b2e] dark:text-[#f1f5f9] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#006b2c]/10 dark:bg-emerald-950 text-[#006b2c] dark:text-emerald-400 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#131b2e] dark:text-white">Add Food Item</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold text-[#131b2e] dark:text-slate-300 mb-1">
              Food Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Organic Honeycrisp Apples"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] text-sm text-[#131b2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006b2c]"
            />
          </div>

          {/* Category & Location Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#131b2e] dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] text-sm text-[#131b2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006b2c]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#131b2e] dark:text-slate-300 mb-1">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as StorageLocation)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] text-sm text-[#131b2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006b2c]"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity & Estimated Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#131b2e] dark:text-slate-300 mb-1">
                Quantity
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 500g, 4 pcs"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] text-sm text-[#131b2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006b2c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#131b2e] dark:text-slate-300 mb-1">
                Est. Value ($)
              </label>
              <input
                type="number"
                step="0.1"
                value={estCost}
                onChange={(e) => setEstCost(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] text-sm text-[#131b2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006b2c]"
              />
            </div>
          </div>

          {/* Shelf Life Selector with Quick Chips */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#131b2e] dark:text-slate-300">
                Shelf Life (Days remaining)
              </label>
              <span className="text-xs font-bold text-[#006b2c] dark:text-emerald-400">
                {daysRemaining} days
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={daysRemaining}
              onChange={(e) => setDaysRemaining(Number(e.target.value))}
              className="w-full accent-[#006b2c]"
            />
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-slate-400">Quick set:</span>
              <button
                type="button"
                onClick={() => setDaysRemaining(2)}
                className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ffddb8] dark:bg-amber-950 text-[#855300] dark:text-amber-300"
              >
                2 days (Fresh)
              </button>
              <button
                type="button"
                onClick={() => setDaysRemaining(5)}
                className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                5 days (Produce)
              </button>
              <button
                type="button"
                onClick={() => setDaysRemaining(14)}
                className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#dcfce7] dark:bg-emerald-950 text-[#006b2c] dark:text-emerald-300"
              >
                14 days (Dairy/Eggs)
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-[#006b2c] hover:bg-[#005320] text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              Add to Food Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
