import React from 'react';

interface MetricCardProps {
  icon: React.ReactNode;
  badgeText: string;
  badgeStyle: string;
  count: number;
  countColor?: string;
  label: string;
  iconBg: string;
  onClick?: () => void;
  isActive?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  badgeText,
  badgeStyle,
  count,
  countColor = 'text-[#131b2e] dark:text-white',
  label,
  iconBg,
  onClick,
  isActive = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-2xl bg-white dark:bg-[#131b2e] border transition-all duration-200 relative overflow-hidden flex flex-col justify-between shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md active:scale-[0.98] ${
        isActive
          ? 'border-[#006b2c] ring-2 ring-[#006b2c]/20'
          : 'border-[#e2e8f0] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top row: icon and status badge */}
      <div className="flex items-center justify-between mb-3 w-full">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${badgeStyle}`}>
          {badgeText}
        </span>
      </div>

      {/* Main metric count and title */}
      <div>
        <div className={`text-[32px] font-extrabold tracking-tight tabular-nums leading-none ${countColor}`}>
          {count}
        </div>
        <div className="text-xs font-semibold text-[#6e7b6c] dark:text-slate-400 mt-1.5">
          {label}
        </div>
      </div>
    </button>
  );
};
