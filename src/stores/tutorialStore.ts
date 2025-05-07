/**
 * Tutorial store for managing tutorial state
 *
 * This store manages:
 * - Tutorial progress and steps
 * - Current step highlighting
 * - Tutorial completion status
 * - Tutorial user preferences
 */

import { create } from "zustand";
import { sync, DocumentId } from "@tonk/keepsync";

// Type definitions
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // CSS selector for element to highlight
  position?: "top" | "bottom" | "left" | "right" | "center";
  action?: "click" | "drag" | "input" | "navigate" | "wait";
  completionCondition?: () => boolean;
  nextButtonText?: string;
  skippable?: boolean;
}

export interface Tutorial {
  id: string;
  name: string;
  description: string;
  category: "basics" | "algorithms" | "parameters" | "advanced";
  steps: TutorialStep[];
  requiredAlgorithm?: string;
  order: number;
}

// Store state interface
interface TutorialState {
  // Current tutorial state
  isInTutorial: boolean;
  currentTutorial: Tutorial | null;
  currentStep: number;

  // Available tutorials
  availableTutorials: Tutorial[];

  // User progress
  completedTutorials: string[];
  tutorialPreferences: {
    showTutorialsOnLoad: boolean;
    autoAdvance: boolean;
  };

  // UI state
  highlightedElement: string | null;
  showSkipDialog: boolean;
}

// Actions interface
interface TutorialActions {
  // Tutorial control
  startTutorial: (tutorialId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipStep: () => void;
  completeTutorial: () => void;
  exitTutorial: () => void;

  // Tutorial management
  markTutorialAsCompleted: (tutorialId: string) => void;
  resetTutorialProgress: () => void;

  // Preferences
  updateTutorialPreferences: (
    preferences: Partial<TutorialState["tutorialPreferences"]>
  ) => void;

  // UI control
  setHighlightedElement: (elementSelector: string | null) => void;
  setShowSkipDialog: (show: boolean) => void;
}

// Combined store type
type TutorialStore = TutorialState & TutorialActions;

// Define available tutorials
const defaultTutorials: Tutorial[] = [
  {
    id: "first-artwork",
    name: "Create Your First Artwork",
    description: "Learn how to create your first generative artwork",
    category: "basics",
    order: 1,
    steps: [
      {
        id: "welcome",
        title: "Welcome to Generative Art!",
        description:
          "In this tutorial, you'll learn how to create beautiful art with code.",
        position: "center",
        nextButtonText: "Let's Start!",
      },
      {
        id: "select-algorithm",
        title: "Choose an Algorithm",
        description: "First, select a generative algorithm from the sidebar.",
        targetElement: '[data-tutorial="algorithm-selector"]',
        position: "right",
        action: "click",
        nextButtonText: "Next",
      },
      {
        id: "adjust-parameters",
        title: "Adjust Parameters",
        description:
          "Try adjusting different parameters to see how they affect the artwork.",
        targetElement: '[data-tutorial="parameter-controls"]',
        position: "right",
        action: "input",
        nextButtonText: "Next",
      },
      {
        id: "generate",
        title: "Generate Your Art",
        description: "Click the Generate button to create your artwork.",
        targetElement: '[data-tutorial="generate-button"]',
        position: "top",
        action: "click",
        nextButtonText: "Generate!",
      },
      {
        id: "save-artwork",
        title: "Save Your Creation",
        description: "Love your artwork? Save it to your gallery!",
        targetElement: '[data-tutorial="save-panel"]',
        position: "left",
        action: "click",
        nextButtonText: "Save",
      },
      {
        id: "complete",
        title: "Congratulations!",
        description:
          "You've created your first generative artwork. Explore different algorithms and parameters to create more!",
        position: "center",
        nextButtonText: "Finish Tutorial",
      },
    ],
  },
  {
    id: "algorithm-deep-dive",
    name: "Understanding Algorithms",
    description: "Learn about different generative art algorithms",
    category: "algorithms",
    order: 2,
    steps: [
      {
        id: "flow-field",
        title: "Flow Field Algorithm",
        description:
          "Flow fields use vectors to guide particles, creating organic patterns.",
        targetElement: '[data-algorithm="flow-field"]',
        position: "right",
        nextButtonText: "Next Algorithm",
      },
      {
        id: "cellular-automata",
        title: "Cellular Automata",
        description:
          "These algorithms evolve based on simple rules, like Conway's Game of Life.",
        targetElement: '[data-algorithm="cellular-automata"]',
        position: "right",
        nextButtonText: "Next Algorithm",
      },
      {
        id: "l-systems",
        title: "L-Systems",
        description:
          "L-Systems generate tree-like structures using recursive grammar rules.",
        targetElement: '[data-algorithm="l-systems"]',
        position: "right",
        nextButtonText: "Try It Out",
      },
    ],
  },
  {
    id: "advanced-features",
    name: "Advanced Features",
    description: "Master the advanced features of the art generator",
    category: "advanced",
    order: 3,
    steps: [
      {
        id: "algorithm-combination",
        title: "Combining Algorithms",
        description: "You can layer multiple algorithms for complex effects.",
        targetElement: '[data-tutorial="algorithm-combiner"]',
        position: "right",
        nextButtonText: "Learn More",
      },
      {
        id: "sharing",
        title: "Sharing Your Work",
        description: "Share your creations with the community or export them.",
        targetElement: '[data-tutorial="share-options"]',
        position: "left",
        nextButtonText: "Share Away!",
      },
    ],
  },
];

// Store implementation
export const useTutorialStore = create<TutorialStore>(
  sync(
    (set, get) => ({
      isInTutorial: false,
      currentTutorial: null,
      currentStep: 0,
      availableTutorials: defaultTutorials,
      completedTutorials: [],
      tutorialPreferences: {
        showTutorialsOnLoad: true,
        autoAdvance: false,
      },
      highlightedElement: null,
      showSkipDialog: false,

      startTutorial: (tutorialId) => {
        const tutorial = get().availableTutorials.find(
          (t) => t.id === tutorialId
        );
        if (!tutorial) return;
        set({
          isInTutorial: true,
          currentTutorial: tutorial,
          currentStep: 0,
          highlightedElement: tutorial.steps[0].targetElement || null,
        });
      },

      nextStep: () => {
        const { currentTutorial, currentStep } = get();
        if (!currentTutorial) return;
        const nextStep = currentStep + 1;
        if (nextStep >= currentTutorial.steps.length) {
          get().completeTutorial();
        } else {
          set({
            currentStep: nextStep,
            highlightedElement:
              currentTutorial.steps[nextStep].targetElement || null,
          });
        }
      },

      previousStep: () => {
        const { currentTutorial, currentStep } = get();
        if (!currentTutorial || currentStep === 0) return;
        const prevStep = currentStep - 1;
        set({
          currentStep: prevStep,
          highlightedElement:
            currentTutorial.steps[prevStep].targetElement || null,
        });
      },

      skipStep: () => {
        get().nextStep();
      },

      completeTutorial: () => {
        const { currentTutorial } = get();
        if (!currentTutorial) return;
        get().markTutorialAsCompleted(currentTutorial.id);
        set({
          isInTutorial: false,
          currentTutorial: null,
          currentStep: 0,
          highlightedElement: null,
        });
      },

      exitTutorial: () => {
        set({
          isInTutorial: false,
          currentTutorial: null,
          currentStep: 0,
          highlightedElement: null,
          showSkipDialog: false,
        });
      },

      markTutorialAsCompleted: (tutorialId) => {
        const { completedTutorials } = get();
        if (!completedTutorials.includes(tutorialId)) {
          set({
            completedTutorials: [...completedTutorials, tutorialId],
          });
        }
      },

      resetTutorialProgress: () => {
        set({
          completedTutorials: [],
          isInTutorial: false,
          currentTutorial: null,
          currentStep: 0,
        });
      },

      updateTutorialPreferences: (preferences) => {
        const { tutorialPreferences } = get();
        set({
          tutorialPreferences: { ...tutorialPreferences, ...preferences },
        });
      },

      setHighlightedElement: (elementSelector) => {
        set({ highlightedElement: elementSelector });
      },

      setShowSkipDialog: (show) => {
        set({ showSkipDialog: show });
      },
    }),
    { docId: "tutorial-store" as DocumentId }
  )
);
