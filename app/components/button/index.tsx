import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  className?: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
  showCorners?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  isLoading = false,
  disabled,
  icon,
  showCorners = true,
  ...props
}) => {
  const sizes = {
    sm: "text-xs px-4 py-2",
    md: "text-sm px-6 py-3",
    lg: "text-sm px-8 py-4",
  };

  const baseClasses = `
    relative inline-flex items-center justify-center gap-3
    font-body font-medium tracking-[0.1em] uppercase
    transition-all duration-400 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2
    overflow-hidden group
  `;

  const variantClasses = {
    primary: `
      bg-[var(--color-primary)] text-white border border-[var(--color-primary)]
      hover:bg-[var(--color-primary-dark)] hover:border-[var(--color-primary-dark)]
      hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--color-primary)]/20
      active:translate-y-0
    `,
    outline: `
      bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)]
      hover:bg-[var(--color-primary)] hover:text-white
      hover:-translate-y-0.5
      active:translate-y-0
    `,
    ghost: `
      bg-transparent text-[var(--color-charcoal)] border border-transparent
      hover:bg-[var(--color-stone)]
      active:bg-[var(--color-parchment)]
    `,
    accent: `
      bg-[var(--color-accent)] text-white border border-[var(--color-accent)]
      hover:bg-[var(--color-accent-dark)] hover:border-[var(--color-accent-dark)]
      hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--color-accent)]/20
      active:translate-y-0
    `,
  };

  // Corner styles for different variants
  const cornerColors = {
    primary: "border-white/50",
    outline: "border-[var(--color-accent)]",
    ghost: "border-[var(--color-accent)]",
    accent: "border-white/50",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {/* Corner accents on hover */}
      {showCorners && (
        <>
          <span className={`absolute top-0 left-0 w-0 h-0 border-l border-t ${cornerColors[variant]} opacity-0 group-hover:opacity-100 group-hover:w-3 group-hover:h-3 transition-all duration-300`} />
          <span className={`absolute bottom-0 right-0 w-0 h-0 border-r border-b ${cornerColors[variant]} opacity-0 group-hover:opacity-100 group-hover:w-3 group-hover:h-3 transition-all duration-300`} />
        </>
      )}
      
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{isLoading ? "Loading..." : children}</span>
    </button>
  );
};

export default Button;
