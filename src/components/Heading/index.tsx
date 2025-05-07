/**
 * Heading component
 *
 * A semantic heading component that provides consistent styling
 * for different heading levels (h1-h6).
 *
 * @example
 * <Heading level={2} className="mb-4">Section Title</Heading>
 */

import React from "react";

export interface HeadingProps {
  /** Heading level (h1-h6) */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /** Heading content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Optional ID for linking */
  id?: string;
}

/**
 * Semantic heading component with consistent styling
 */
export const Heading: React.FC<HeadingProps> = ({
  level,
  children,
  className = "",
  id,
}) => {
  // Create the appropriate heading element based on level
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  // Default styles based on heading level
  const defaultStyles = {
    1: "text-2xl font-bold",
    2: "text-xl font-semibold",
    3: "text-lg font-medium",
    4: "text-base font-medium",
    5: "text-sm font-medium",
    6: "text-xs font-medium",
  }[level];

  return (
    <Tag id={id} className={`${defaultStyles} ${className}`}>
      {children}
    </Tag>
  );
};

export default Heading;
