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
  const sizes: Record<string, string> = {
    sm: "ui-button--sm",
    md: "ui-button--md",
    lg: "ui-button--lg",
  };

  // Map aliases to base variants
  const normalizedVariant =
    variant === "solid" ? "primary" :
    variant === "outlined" ? "outline" :
    variant === "secondary" ? "outline" :
    variant;

  const variantClasses: Record<string, string> = {
    primary: "ui-button--primary",
    outline: "ui-button--outline",
    ghost: "ui-button--ghost",
    accent: "ui-button--accent",
    danger: "ui-button--danger",
  };

  return (
    <button
      className={`ui-button ${variantClasses[normalizedVariant] || variantClasses.primary} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {icon && <span className="ui-button__icon">{icon}</span>}
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
    <div className="ui-input">
      {label && (
        <label className="ui-input__label">
          {label}
        </label>
      )}
      <div className="ui-input__wrapper">
        {icon && (
          <div className="ui-input__icon">
            {icon}
          </div>
        )}
        <input
          type="text"
          placeholder={placeholder}
          className={`ui-input__field ${icon ? 'ui-input__field--with-icon' : ''} ${className}`}
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
    <div ref={selectRef} className={`ui-select ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`ui-select__trigger ${disabled ? 'ui-select__trigger--disabled' : ''} ${isOpen ? 'ui-select__trigger--open' : ''}`}
      >
        <span className={selectedOption ? 'ui-select__value' : 'ui-select__placeholder'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 ui-select__chevron ${isOpen ? 'ui-select__chevron--open' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="ui-select__dropdown">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`ui-select__option ${
                option.value === value
                  ? 'ui-select__option--selected'
                  : 'ui-select__option--unselected'
              }`}
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
      className={`ui-checkbox ${disabled ? 'ui-checkbox--disabled' : ''}`}
    >
      <div className="ui-checkbox__wrapper">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="ui-checkbox__input"
        />
        <div className={`ui-checkbox__box ${checked ? 'ui-checkbox__box--checked' : ''}`}>
          {checked && (
            <Check className="w-full h-full text-white p-0.5" strokeWidth={3} />
          )}
        </div>
      </div>
      <span className={`ui-checkbox__label ${checked ? 'ui-checkbox__label--checked' : ''}`}>
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
        <div className="ui-modal">
          <motion.div
            className="ui-modal__backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          <motion.div
            className="ui-modal__panel"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="ui-modal__header"
              variants={headerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h3
                className="ui-modal__title"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {title}
              </motion.h3>
              <motion.button
                onClick={onClose}
                className="ui-modal__close-btn"
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
              className="ui-modal__body"
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
    <div className="ui-view-toggle">
      <button
        onClick={() => onViewChange('grid')}
        className={`ui-view-toggle__btn ${
          view === 'grid'
            ? 'ui-view-toggle__btn--active'
            : 'ui-view-toggle__btn--inactive'
        }`}
      >
        <Grid3X3 className="w-4 h-4" />
        Card View
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`ui-view-toggle__btn ${
          view === 'list'
            ? 'ui-view-toggle__btn--active'
            : 'ui-view-toggle__btn--inactive'
        }`}
      >
        <List className="w-4 h-4" />
        List View
      </button>
    </div>
  );
}
