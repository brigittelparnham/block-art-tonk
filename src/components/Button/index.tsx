/**
 * Button component
 *
 * A flexible button component that supports different variants, sizes,
 * and states with consistent styling.
 *
 * @example
 * <Button onClick={handleClick} variant="primary">
 *   Click Me
 * </Button>
 */

import React from "react";

export interface ButtonProps {
  /** Button variant */
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  /** Button size */
  size?: "xs" | "sm" | "md" | "lg";
  /** Click handler */
  onClick?: () => void;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Button content */
  children: React.ReactNode;
  /** Accessible label */
  "aria-label"?: string;
  /** Button type */
  type?: "button" | "submit" | "reset";
  /** Whether button is in a loading state */
  isLoading?: boolean;
}

/**
 * Button component with consistent styling
 */
export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  className = "",
  children,
  "aria-label": ariaLabel,
  type = "button",
  isLoading = false,
}) => {
  const baseStyles =
    "rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center";

  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizeStyles = {
    xs: "text-xs px-2 py-1",
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-5 py-2.5",
  };

  const disabledStyles =
    disabled || isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
      aria-label={ariaLabel}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
