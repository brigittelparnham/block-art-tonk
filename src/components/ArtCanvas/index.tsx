/**
 * ArtCanvas component with fixed animation
 *
 * A wrapper for the HTML5 Canvas element that handles rendering
 * generative art using different algorithms and parameters.
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Algorithm } from "../../stores/artworkStore";

export interface ArtCanvasProps {
  /** Canvas width in pixels */
  width?: number;
  /** Canvas height in pixels */
  height?: number;
  /** The algorithm to use for generation */
  algorithm: Algorithm | null;
  /** Parameters to pass to the algorithm */
  parameters: Record<string, any>;
  /** Whether to auto-regenerate when parameters change */
  autoRegenerate?: boolean;
  /** Called with canvas reference when mounted */
  onCanvasRef?: (canvas: HTMLCanvasElement) => void;
  /** Called when generation completes */
  onGenerationComplete?: () => void;
  /** Called when generation errors occur */
  onGenerationError?: (error: Error) => void;
  /** Additional CSS classes */
  className?: string;
  /** Background color for the canvas */
  backgroundColor?: string;
  /** Whether to animate the generation process */
  animate?: boolean;
  /** Animation frame rate (fps) */
  frameRate?: number;
}

/**
 * ArtCanvas component that renders generative art
 *
 * Features:
 * - Responsive canvas sizing
 * - Automatic regeneration on parameter changes
 * - Animation support
 * - Proper cleanup and error handling
 */
export const ArtCanvas: React.FC<ArtCanvasProps> = ({
  width = 800,
  height = 600,
  algorithm,
  parameters,
  autoRegenerate = true,
  onCanvasRef,
  onGenerationComplete,
  onGenerationError,
  className = "",
  backgroundColor = "#ffffff",
  animate = true, // Default to true for algorithms that support animation
  frameRate = 60,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastParameters, setLastParameters] = useState(parameters);

  // Flag to track if animation is currently running
  const isAnimatingRef = useRef<boolean>(false);

  // Pass canvas ref to parent
  useEffect(() => {
    if (canvasRef.current && onCanvasRef) {
      onCanvasRef(canvasRef.current);
    }
  }, [onCanvasRef]);

  // Setup canvas context
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Set initial styles
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    return ctx;
  }, [width, height, backgroundColor]);

  // Generate artwork (initial generation)
  const generateArt = useCallback(async () => {
    if (!algorithm || !canvasRef.current) return;

    setIsGenerating(true);

    try {
      // Setup canvas
      const ctx = setupCanvas();
      if (!ctx) throw new Error("Failed to get canvas context");

      // Call algorithm's draw function
      if (typeof algorithm.draw === "function") {
        await algorithm.draw(canvasRef.current, parameters);
      } else {
        throw new Error("Algorithm draw function is not available");
      }

      // Notify completion
      onGenerationComplete?.();
    } catch (error) {
      console.error("Error generating artwork:", error);
      onGenerationError?.(error as Error);
    } finally {
      setIsGenerating(false);
    }
  }, [
    algorithm,
    parameters,
    setupCanvas,
    onGenerationComplete,
    onGenerationError,
  ]);

  // Animation frame handler - properly fixed
  const animateFrame = useCallback(() => {
    if (!algorithm || !canvasRef.current || !animate) return;

    // Track that we're in an animation
    isAnimatingRef.current = true;

    try {
      // Call algorithm's draw function for animation
      if (typeof algorithm.draw === "function") {
        algorithm.draw(canvasRef.current, parameters);
      }

      // Schedule next frame using requestAnimationFrame for better performance
      animationRef.current = window.requestAnimationFrame(animateFrame);
    } catch (error) {
      console.error("Animation error:", error);
      // Stop animation on error
      isAnimatingRef.current = false;
    }
  }, [algorithm, parameters, animate]);

  // Handle parameter changes
  useEffect(() => {
    if (!autoRegenerate) return;

    // Check if parameters have actually changed
    const haveParametersChanged =
      JSON.stringify(parameters) !== JSON.stringify(lastParameters);

    if (haveParametersChanged) {
      setLastParameters(parameters);

      // If we're animating, we don't need to call generateArt
      // The animation frame will pick up the new parameters
      if (!isAnimatingRef.current) {
        generateArt();
      }
    }
  }, [parameters, lastParameters, autoRegenerate, generateArt]);

  // Start/stop animation
  useEffect(() => {
    // Initial render
    generateArt();

    // Only set up animation if animate is true
    if (animate) {
      // Start animation
      isAnimatingRef.current = true;
      animationRef.current = window.requestAnimationFrame(animateFrame);

      console.log("Animation started");
    } else {
      // Stop animation
      isAnimatingRef.current = false;
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      console.log("Animation stopped");
    }

    // Cleanup on unmount
    return () => {
      isAnimatingRef.current = false;
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [animate, animateFrame, generateArt]);

  // Handle canvas resize
  useEffect(() => {
    setupCanvas();
  }, [width, height, setupCanvas]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor,
        }}
        aria-label="Generative Art Canvas"
      />

      {/* Loading overlay */}
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg px-6 py-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-700">Generating artwork...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
