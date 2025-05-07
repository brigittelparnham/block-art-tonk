/**
 * GenerativeArt view component
 *
 * Main view for the generative art application that orchestrates
 * all components and manages the state of art generation.
 *
 * @example
 * <GenerativeArt />
 */

import React, { useState, useEffect } from "react";
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

export interface GenerativeArtProps {
  /** Whether to show the tutorial on first visit */
  showTutorial?: boolean;
}

/**
 * GenerativeArt component that manages the main generative art interface
 *
 * Architecture:
 * - Uses artworkStore for synchronized artwork data
 * - Uses tutorialStore for tutorial progress
 * - Manages real-time canvas rendering
 * - Coordinates between all sub-components
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
  } = useArtworkStore();

  const { isInTutorial, currentStep, completeTutorial, nextStep } =
    useTutorialStore();

  // Local UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  // Handle tutorial on first visit
  useEffect(() => {
    if (showTutorial && !isInTutorial && savedArtworks.length === 0) {
      // Start tutorial automatically for new users
      completeTutorial(); // This will trigger the tutorial overlay
    }
  }, [showTutorial, isInTutorial, savedArtworks.length]);

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
      const dataURL = canvasRef.toDataURL();
      await saveArtwork(dataURL);
    } catch (error) {
      console.error("Error saving artwork:", error);
    }
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

      {/* Tutorial Overlay */}
      {isInTutorial && (
        <TutorialOverlay
          currentStep={currentStep}
          onNext={nextStep}
          onComplete={completeTutorial}
        />
      )}
    </main>
  );
};
