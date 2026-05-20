// ============================================================
// SPOTLY — Input.tsx  (src/components/ui/Input.tsx)
// ============================================================

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** If true, wraps in a full-width block with label + error */
  block?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  block = true,
  className = '',
  id,
  ...rest
}) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  const inputEl = (
    <div className="relative flex items-center">
      {leftIcon && (
        <span className="absolute left-3 text-gray-400 pointer-events-none flex items-center">
          {leftIcon}
        </span>
      )}
      <input
        id={inputId}
        className={[
          'w-full rounded-xl border bg-white text-[#0D1B2A] text-sm',
          'py-3 transition-all duration-150 outline-none',
          'placeholder:text-gray-400',
          'focus:ring-2 focus:ring-[#0D1B2A]/25 focus:border-[#0D1B2A]',
          error
            ? 'border-red-400 focus:ring-red-300/40 focus:border-red-500'
            : 'border-gray-200 hover:border-gray-300',
          leftIcon ? 'pl-10' : 'pl-4',
          rightIcon ? 'pr-10' : 'pr-4',
          className,
        ]
          .join(' ')
          .trim()}
        {...rest}
      />
      {rightIcon && (
        <span className="absolute right-3 text-gray-400 pointer-events-none flex items-center">
          {rightIcon}
        </span>
      )}
    </div>
  );

  if (!block) return inputEl;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-[#0D1B2A] tracking-wide"
        >
          {label}
        </label>
      )}
      {inputEl}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
};

export default Input;
