'use client';
import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  disabled = false
}) => {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className={`
          w-5 h-5 border transition-all duration-200
          ${checked 
            ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' 
            : 'bg-white border-[var(--color-stone)] group-hover:border-[var(--color-primary)]/50'
          }
        `}>
          {checked && (
            <Check className="w-full h-full text-white p-0.5" strokeWidth={3} />
          )}
        </div>
      </div>
      <span className={`
        text-sm font-body transition-colors duration-200
        ${checked ? 'text-[var(--color-ink)]' : 'text-[var(--color-charcoal)]'}
        group-hover:text-[var(--color-primary)]
      `}>
        {label}
      </span>
    </label>
  );
};

export default Checkbox;
