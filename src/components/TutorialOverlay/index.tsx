/**
 * TutorialOverlay component
 *
 * Provides an interactive tutorial system that overlays the main interface
 * to guide users through various features and workflows.
 *
 * @example
 * <TutorialOverlay
 *   currentStep={currentStep}
 *   onNext={handleNext}
 *   onComplete={handleComplete}
 * />
 */

import React, { useEffect, useRef } from "react";
import { useTutorialStore, TutorialStep } from "../../stores/tutorialStore";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { X, ChevronRight, ChevronLeft, SkipForward } from "lucide-react";

export interface TutorialOverlayProps {
  /** Current tutorial step index */
  currentStep: number;
  /** Called when next button is clicked */
  onNext: () => void;
  /** Called when tutorial is completed */
  onComplete: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TutorialOverlay provides an interactive tutorial experience
 *
 * Features:
 * - Step-by-step guidance
 * - Element highlighting
 * - Skip/back navigation
 * - Progress tracking
 */
export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  currentStep,
  onNext,
  onComplete,
  className = "",
}) => {
  const {
    currentTutorial,
    exitTutorial,
    previousStep,
    setShowSkipDialog,
    showSkipDialog,
  } = useTutorialStore();

  const overlayRef = useRef<HTMLDivElement>(null);

  if (!currentTutorial) return null;

  const step = currentTutorial.steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === currentTutorial.steps.length - 1;

  // Highlight target element
  useEffect(() => {
    if (!step.targetElement) return;

    // Find and highlight the target element
    const targetEl = document.querySelector(step.targetElement);
    if (targetEl) {
      // Add highlight
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      targetEl.classList.add("tutorial-highlight");

      // Remove highlight on cleanup
      return () => {
        targetEl.classList.remove("tutorial-highlight");
      };
    }
  }, [step.targetElement]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          setShowSkipDialog(true);
          break;
        case "ArrowRight":
        case "Enter":
          if (!isLastStep) {
            onNext();
          } else {
            onComplete();
          }
          break;
        case "ArrowLeft":
          if (!isFirstStep) {
            previousStep();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isFirstStep,
    isLastStep,
    onNext,
    onComplete,
    previousStep,
    setShowSkipDialog,
  ]);

  // Calculate position for tutorial bubble
  const getBubblePosition = () => {
    if (!step.targetElement || step.position === "center") {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const targetEl = document.querySelector(step.targetElement);
    if (!targetEl) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const rect = targetEl.getBoundingClientRect();

    switch (step.position) {
      case "top":
        return {
          top: `${rect.top - 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: "translate(-50%, -100%)",
        };
      case "bottom":
        return {
          top: `${rect.bottom + 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: "translate(-50%, 0)",
        };
      case "left":
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - 20}px`,
          transform: "translate(-100%, -50%)",
        };
      case "right":
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + 20}px`,
          transform: "translate(0, -50%)",
        };
      default:
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
    }
  };

  const bubbleStyle = getBubblePosition();

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 bg-black bg-opacity-75 z-40 ${className}`}
        style={{
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
        }}
      />

      {/* Tutorial Bubble */}
      <Card className="fixed z-50 max-w-md p-6 shadow-2xl" style={bubbleStyle}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {step.title}
            </h2>
            <div className="text-sm text-gray-500 mt-1">
              Step {currentStep + 1} of {currentTutorial.steps.length}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSkipDialog(true)}
            className="p-1"
            aria-label="Close tutorial"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <p className="text-gray-700 mb-6">{step.description}</p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {!isFirstStep && (
              <Button
                variant="ghost"
                onClick={previousStep}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}

            {step.skippable && !isLastStep && (
              <Button
                variant="ghost"
                onClick={onNext}
                className="flex items-center gap-1"
              >
                <SkipForward className="w-4 h-4" />
                Skip
              </Button>
            )}
          </div>

          <Button
            onClick={isLastStep ? onComplete : onNext}
            className="flex items-center gap-1"
          >
            {step.nextButtonText || (isLastStep ? "Finish" : "Next")}
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{currentTutorial.name}</span>
            <span>
              {currentStep + 1}/{currentTutorial.steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((currentStep + 1) / currentTutorial.steps.length) * 100
                }%`,
              }}
            />
          </div>
        </div>
      </Card>

      {/* Skip/Exit Dialog */}
      {showSkipDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Exit Tutorial?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to exit the tutorial? You can restart it
              later from the help menu.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowSkipDialog(false)}>
                Continue Tutorial
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  exitTutorial();
                  setShowSkipDialog(false);
                }}
              >
                Exit Tutorial
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Tutorial Highlight Styles */}
      <style jsx>{`
        .tutorial-highlight {
          position: relative;
          z-index: 41;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};
