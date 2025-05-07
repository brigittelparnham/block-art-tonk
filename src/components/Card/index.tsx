/**
 * Card component
 *
 * A simple card container with consistent styling for content organization.
 *
 * @example
 * <Card className="p-4">
 *   <h2>Card Title</h2>
 *   <p>Card content goes here</p>
 * </Card>
 */

import React from "react";

export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Card component with consistent styling
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  onClick,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow ${className} ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
