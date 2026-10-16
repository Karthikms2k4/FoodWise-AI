import React from 'react';
import { PartyPopper } from 'lucide-react';

interface MilestoneCardProps {
  percentage: number;
  co2Kg: number;
  onClick?: () => void;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  percentage,
  co2Kg,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-[#eaedff] dark:bg-[#161f30] rounded-3xl p-4 border border-[#dae2fd] dark:border-slate-800 shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
    >
      <div className="flex items-start gap-3.5">
        {/* Megaphone / Milestone Badge Icon */}
        <div className="w-11 h-11 rounded-full bg-[#00873a] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <PartyPopper className="w-5 h-5" />
        </div>

        {/* Text and Percentage */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#131b2e] dark:text-white leading-snug">
              Monthly Milestone
            </h3>
            <span className="text-xs font-bold text-[#006b2c] dark:text-emerald-300 bg-white/70 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full">
              {percentage}% Saved
            </span>
          </div>

          <p className="text-xs text-[#3e4a3d] dark:text-slate-300 mt-1 leading-relaxed">
            🎉 You&apos;ve prevented <strong className="font-bold text-[#131b2e] dark:text-emerald-400">{co2Kg} kg of CO2</strong> from food waste this month!
          </p>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-[#dae2fd] dark:bg-slate-800 rounded-full overflow-hidden mt-3 relative">
            <div
              className="h-full bg-[#00873a] dark:bg-emerald-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
