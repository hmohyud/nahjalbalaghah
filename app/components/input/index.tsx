import React from "react";

type InputProps = {
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  icon,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-warm-gray)]">
            {icon}
          </div>
        )}
        <input
          type="text"
          placeholder={placeholder}
          className={`
            w-full py-3 px-4 ${icon ? 'pl-11' : 'pl-4'}
            bg-[var(--color-parchment)] 
            border border-[var(--color-stone)]
            text-[var(--color-charcoal)]
            placeholder:text-[var(--color-warm-gray)]
            text-sm font-body
            focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20
            transition-all duration-300
            ${className}
          `}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;
