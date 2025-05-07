/**
 * GenerativeArt view component (UPDATED)
 *
 * Main view for the generative art application that orchestrates
 * all components and manages the state of art generation.
 *
 * Updates:
 * - Fixed tutorial initialization
 * - Added custom algorithm creation integration
 * - Improved gallery view to prevent duplications
 *
 * @example
 * <GenerativeArt />
 */

import React, { useState, useEffect, useRef } from "react";
import { useArtworkStore } from "../../stores/artworkStore";
import { useTutorialStore } from "../../stores/tutorialStore";
import { ArtCanvas } from "../../components/ArtCanvas";
import { AlgorithmSelector } from "../../components/AlgorithmSelector";
import { ParameterControl } from "../../components/ParameterControl";
import { SaveSharePanel } from "../../components/SaveSharePanel";
import { TutorialOverlay } from "../../components/TutorialOverlay";
import { ArtworkGallery } from "../../components/ArtworkGallery";
import { Button } from "../../components/Button";
import { Heading } from "../../components/Heading";
import { Modal } from "../../components/Modal";
import { Card } from "../../components/Card";
import CustomAlgorithmEditor from "../../components/CustomAlgorithmEditor";
import { PlusCircle, Book, Code } from "lucide-react";

export interface GenerativeArtProps {
  /** Whether to show the tutorial on first visit */
  showTutorial?: boolean;
}

/**
 * GenerativeArt component that manages the main generative art interface
 */
export const GenerativeArt: React.FC<GenerativeArtProps> = ({
  showTutorial = true,
}) => {
  // Store state
  const {
    currentArtwork,
    savedArtworks,
    selectedAlgorithm,
    parameters,
    updateParameters,
    saveArtwork,
    saveCustomAlgorithm,
  } = useArtworkStore();

  const {
    isInTutorial,
    currentTutorial,
    currentStep,
    startTutorial,
    completeTutorial,
    nextStep,
    availableTutorials,
    completedTutorials,
  } = useTutorialStore();

  // Local UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showTutorialSelector, setShowTutorialSelector] = useState(false);
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const didInitTutorial = useRef(false);

  // Handle tutorial on first visit - fixed implementation
  useEffect(() => {
    // Only run once
    if (didInitTutorial.current) return;

    if (
      showTutorial &&
      !isInTutorial &&
      savedArtworks.length === 0 &&
      availableTutorials.length > 0
    ) {
      // Start the first tutorial for new users
      const firstTutorial = availableTutorials.find(
        (t) => t.id === "first-artwork"
      );
      if (firstTutorial && !completedTutorials.includes(firstTutorial.id)) {
        startTutorial(firstTutorial.id);
        didInitTutorial.current = true;
      }
    } else {
      didInitTutorial.current = true;
    }
  }, [
    showTutorial,
    isInTutorial,
    savedArtworks.length,
    availableTutorials,
    completedTutorials,
    startTutorial,
  ]);

  // Handle parameter changes
  const handleParameterChange = (paramId: string, value: any) => {
    updateParameters({ [paramId]: value });
    // Trigger regeneration if auto-generate is enabled
    if (parameters.autoGenerate) {
      handleGenerate();
    }
  };

  // Generate artwork
  const handleGenerate = async () => {
    if (!selectedAlgorithm || !canvasRef) return;

    setIsGenerating(true);
    try {
      // Call the algorithm's draw function
      selectedAlgorithm.draw(canvasRef, parameters);
      setIsGenerating(false);
    } catch (error) {
      console.error("Error generating artwork:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save current artwork
  const handleSave = async () => {
    if (!canvasRef) return;

    try {
      // Convert canvas to data URL for saving
      const title = parameters.title || "Untitled Artwork";
      const dataURL = canvasRef.toDataURL();
      await saveArtwork(dataURL, title);
    } catch (error) {
      console.error("Error saving artwork:", error);
    }
  };

  // Handle custom algorithm save
  const handleSaveCustomAlgorithm = (algorithm) => {
    saveCustomAlgorithm(algorithm);
    setShowCustomEditor(false);
  };

  return (
    <main className="w-full h-screen flex flex-col bg-gray-100">
      {/* Header Section */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Heading level={1} className="text-2xl font-bold">
            Generative Art Studio
          </Heading>

          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => setShowCustomEditor(true)}
              className="flex items-center gap-2"
              data-tutorial="custom-algorithm-button"
            >
              <Code className="w-4 h-4" />
              Create Algorithm
            </Button>

            <Button
              variant="secondary"
              onClick={() => setShowTutorialSelector(true)}
              className="flex items-center gap-2"
            >
              <Book className="w-4 h-4" />
              Tutorials
            </Button>

            <Button
              variant="secondary"
              onClick={() => setShowGallery(!showGallery)}
              aria-label="Toggle gallery view"
            >
              {showGallery ? "Create" : "Gallery"}
            </Button>

            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={isGenerating || !selectedAlgorithm}
              aria-label="Generate new artwork"
              data-tutorial="generate-button"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {showGallery ? (
          /* Gallery View */
          <section className="h-full">
            <ArtworkGallery
              artworks={savedArtworks}
              onSelectArtwork={(artwork) => {
                // Load artwork parameters
                updateParameters(artwork.parameters);
                setShowGallery(false);
              }}
              onDeleteArtwork={(artworkId) => {
                // No need to update UI state, store handles it
                console.log("Deleted artwork:", artworkId);
              }}
            />
          </section>
        ) : (
          /* Creation Studio */
          <div className="flex h-full">
            {/* Left Panel - Controls */}
            <aside className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
              <div className="p-4 space-y-6">
                {/* Algorithm Selection */}
                <section aria-labelledby="algorithm-selector-heading">
                  <Heading
                    id="algorithm-selector-heading"
                    level={2}
                    className="text-lg font-semibold mb-4"
                  >
                    Algorithm
                  </Heading>
                  <AlgorithmSelector />
                </section>

                {/* Parameter Controls */}
                {selectedAlgorithm && (
                  <section aria-labelledby="parameter-controls-heading">
                    <Heading
                      id="parameter-controls-heading"
                      level={2}
                      className="text-lg font-semibold mb-4"
                    >
                      Parameters
                    </Heading>
                    <ParameterControl
                      parameters={selectedAlgorithm.parameters}
                      values={parameters}
                      onChange={handleParameterChange}
                    />
                  </section>
                )}

                {/* Save & Share Panel */}
                <section aria-labelledby="save-share-heading">
                  <Heading
                    id="save-share-heading"
                    level={2}
                    className="text-lg font-semibold mb-4"
                  >
                    Save & Share
                  </Heading>
                  <SaveSharePanel canvasRef={canvasRef} onSave={handleSave} />
                </section>
              </div>
            </aside>

            {/* Canvas Container */}
            <main className="flex-1 bg-gray-50 overflow-hidden relative">
              <ArtCanvas
                width={window.innerWidth - 384} // Full width minus left panel
                height={window.innerHeight - 72} // Full height minus header
                algorithm={selectedAlgorithm}
                parameters={parameters}
                onCanvasRef={(ref) => setCanvasRef(ref)}
                className="w-full h-full"
              />
            </main>
          </div>
        )}
      </div>

      {/* Custom Algorithm Editor Modal */}
      {showCustomEditor && (
        <Modal
          isOpen={showCustomEditor}
          onClose={() => setShowCustomEditor(false)}
          title="Create Custom Algorithm"
          maxWidth="full"
        >
          <div className="h-[80vh]">
            <CustomAlgorithmEditor onSave={handleSaveCustomAlgorithm} />
          </div>
        </Modal>
      )}

      {/* Tutorial Selector Modal */}
      {showTutorialSelector && (
        <Modal
          isOpen={showTutorialSelector}
          onClose={() => setShowTutorialSelector(false)}
          title="Available Tutorials"
          maxWidth="md"
        >
          <div className="space-y-4 py-2">
            {availableTutorials.map((tutorial) => (
              <Card key={tutorial.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{tutorial.name}</h3>
                    <p className="text-gray-600 mt-1">{tutorial.description}</p>

                    {completedTutorials.includes(tutorial.id) && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        Completed
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      startTutorial(tutorial.id);
                      setShowTutorialSelector(false);
                    }}
                  >
                    {completedTutorials.includes(tutorial.id)
                      ? "Repeat Tutorial"
                      : "Start Tutorial"}
                  </Button>
                </div>
              </Card>
            ))}

            {availableTutorials.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No tutorials available.</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Tutorial Overlay */}
      {isInTutorial && currentTutorial && (
        <TutorialOverlay
          currentStep={currentStep}
          onNext={nextStep}
          onComplete={completeTutorial}
        />
      )}
    </main>
  );
};
