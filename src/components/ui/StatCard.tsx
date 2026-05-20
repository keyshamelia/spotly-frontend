// ============================================================
// SPOTLY — StatCard.tsx  (src/components/ui/StatCard.tsx)
// ============================================================

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  /** e.g. "+12%" */
  trend: string;
  /** e.g. "from last month" */
  trendLabel: string;
  isPositive: boolean;
  icon: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  trendLabel,
  isPositive,
  icon,
  className = '',
}) => {
  return (
    <div
      className={[
        'bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3',
        'shadow-sm hover:shadow-md transition-shadow duration-200',
        className,
      ]
        .join(' ')
        .trim()}
    >
      {/* Top row: title + icon */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          {title}
        </p>
        <span className="text-gray-400">{icon}</span>
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-[#0D1B2A] leading-none tracking-tight">
        {value}
      </p>

      {/* Trend */}
      <div className="flex items-center gap-1.5">
        {isPositive ? (
          <TrendingUp size={14} className="text-emerald-500 flex-shrink-0" />
        ) : (
          <TrendingDown size={14} className="text-red-500 flex-shrink-0" />
        )}
        <span
          className={`text-xs font-bold ${
            isPositive ? 'text-emerald-600' : 'text-red-500'
          }`}
        >
          {trend}
        </span>
        <span className="text-xs text-gray-400">{trendLabel}</span>
      </div>
    </div>
  );
};

export default StatCard;
