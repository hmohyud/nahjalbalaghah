import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  className?: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<ButtonProps> = ({
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

  const variantClasses = {
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
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{isLoading ? "Loading..." : children}</span>
    </button>
  );
};

export default Button;
