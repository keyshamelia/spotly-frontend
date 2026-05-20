// ============================================================
// SPOTLY — Badge.tsx  (src/components/ui/Badge.tsx)
// ============================================================

import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger:  'bg-red-50 text-red-700 border border-red-200',
  info:    'bg-blue-50 text-blue-700 border border-blue-200',
  neutral: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const dotColors: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
  info:    'bg-blue-500',
  neutral: 'bg-gray-400',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs rounded-md gap-1',
  md: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = true,
  children,
  className = '',
}) => {
  return (
    <span
      className={[
        'inline-flex items-center font-semibold tracking-wide',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .join(' ')
        .trim()}
    >
      {dot && (
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`}
        />
      )}
      {children}
    </span>
  );
};

/** Map Room status → Badge variant */
export function statusVariant(status: string): BadgeVariant {
  if (status === 'Confirmed') return 'success';
  if (status === 'Maintenance') return 'warning';
  if (status === 'Inactive') return 'danger';
  return 'neutral';
}

export default Badge;
