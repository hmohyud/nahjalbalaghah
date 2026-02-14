'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, ChevronDown, Check, Grid3X3, List } from 'lucide-react';

// ============================================================================
// Button
// ============================================================================

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "solid" | "outline" | "outlined" | "ghost" | "accent" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  isLoading = false,
  disabled,
  icon,
  ...props
}) => {
  const sizes = {
    sm: "text-xs px-4 py-2",
    md: "text-sm px-6 py-3",
    lg: "text-sm px-8 py-4",
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-3
    font-body font-medium tracking-[0.1em] uppercase
    transition-all duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2
  `;

  // Map aliases to base variants
  const normalizedVariant =
    variant === "solid" ? "primary" :
    variant === "outlined" ? "outline" :
    variant === "secondary" ? "outline" :
    variant;

  const variantClasses: Record<string, string> = {
    primary: `
      bg-[var(--color-primary)] text-white
      hover:bg-[var(--color-primary-dark)]
      hover:shadow-lg hover:shadow-[var(--color-primary)]/15
    `,
    outline: `
      bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)]
      hover:bg-[var(--color-primary)] hover:text-white
    `,
    ghost: `
      bg-transparent text-[var(--color-charcoal)]
      hover:bg-[var(--color-stone)]/50
    `,
    accent: `
      bg-[var(--color-accent)] text-white
      hover:bg-[var(--color-accent-dark)]
      hover:shadow-lg hover:shadow-[var(--color-accent)]/15
    `,
    danger: `
      bg-red-600 text-white
      hover:bg-red-700
      hover:shadow-lg hover:shadow-red-600/15
    `,
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[normalizedVariant] || variantClasses.primary} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{isLoading ? "Loading..." : children}</span>
    </button>
  );
};

// ============================================================================
// Input
// ============================================================================

type InputProps = {
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = ({
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

// ============================================================================
// Select
// ============================================================================

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2 px-4 py-3
          bg-[var(--color-parchment)] border border-[var(--color-stone)]
          text-sm font-body text-left
          transition-all duration-200
          ${disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-[var(--color-primary)]/50 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20'
          }
          ${isOpen ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/20' : ''}
        `}
      >
        <span className={selectedOption ? 'text-[var(--color-charcoal)]' : 'text-[var(--color-warm-gray)]'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[var(--color-warm-gray)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[var(--color-stone)] shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full px-4 py-3 text-left text-sm font-body
                transition-colors duration-150
                ${option.value === value
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-[var(--color-charcoal)] hover:bg-[var(--color-parchment)]'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Checkbox
// ============================================================================

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
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

// ============================================================================
// Modal
// ============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const modalVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.75,
      y: 100
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }
    },
    exit: {
      opacity: 0,
      scale: 0.75,
      y: 100,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1,
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.15,
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const closeButtonVariants: Variants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.2,
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl max-w-6xl max-h-[90vh] w-full mx-4 overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="flex items-center justify-between p-6 border-b border-gray-200"
              variants={headerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h3
                className="text-xl font-bold text-gray-900"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {title}
              </motion.h3>
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                variants={closeButtonVariants}
                initial="hidden"
                animate="visible"
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "rgb(243 244 246)",
                  transition: { duration: 0.15 }
                }}
                whileTap={{
                  scale: 0.95,
                  transition: { duration: 0.1 }
                }}
              >
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-5 h-5" />
                </motion.div>
              </motion.button>
            </motion.div>
            <motion.div
              className="overflow-auto max-h-[calc(90vh-80px)]"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              {children}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// ViewToggle
// ============================================================================

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onViewChange('grid')}
        className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          view === 'grid'
            ? 'bg-white text-[#43896B] shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Grid3X3 className="w-4 h-4" />
        Card View
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          view === 'list'
            ? 'bg-white text-[#43896B] shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <List className="w-4 h-4" />
        List View
      </button>
    </div>
  );
}
