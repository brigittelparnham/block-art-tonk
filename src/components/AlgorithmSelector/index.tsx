/**
 * AlgorithmSelector component (UPDATED)
 *
 * Updated to include custom algorithms and custom algorithm creation.
 */

import React, { useState } from "react";
import { useArtworkStore } from "../../stores/artworkStore";
import { Card } from "../Card";
import { Button } from "../Button";
import { Heading } from "../Heading";
import { Search, PlusCircle } from "lucide-react";
import { Modal } from "../Modal";
import CustomAlgorithmEditor from "../CustomAlgorithmEditor";

// Import algorithm modules directly from the index.ts file
import {
  flowFieldAlgorithm,
  particleSystemAlgorithm,
  mandalaAlgorithm,
  cellularAutomataAlgorithm,
  lSystemAlgorithm,
  voronoiAlgorithm,
} from "../../modules/artGeneration";

// Available built-in algorithms
const builtInAlgorithms = [
  flowFieldAlgorithm,
  particleSystemAlgorithm,
  mandalaAlgorithm,
  cellularAutomataAlgorithm,
  lSystemAlgorithm,
  voronoiAlgorithm,
];

export interface AlgorithmSelectorProps {
  /** Called when an algorithm is selected */
  onSelect?: (algorithmId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * AlgorithmSelector component for choosing generative art algorithms
 *
 * Features:
 * - Search functionality
 * - Category filtering
 * - Algorithm previews
 * - Detailed information display
 * - Custom algorithm creation and management
 */
export const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  onSelect,
  className = "",
}) => {
  const {
    selectedAlgorithm,
    setSelectedAlgorithm,
    customAlgorithms,
    saveCustomAlgorithm,
    deleteCustomAlgorithm,
  } = useArtworkStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  // Get all available algorithms (built-in + custom)
  const availableAlgorithms = [...builtInAlgorithms, ...customAlgorithms];

  // Get unique categories
  const categories = [
    "all",
    ...new Set(availableAlgorithms.map((algo) => algo.category)),
  ];

  // Filter algorithms
  const filteredAlgorithms = availableAlgorithms.filter((algorithm) => {
    const matchesSearch =
      algorithm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algorithm.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || algorithm.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Handle algorithm selection
  const handleSelect = (algorithm) => {
    setSelectedAlgorithm(algorithm);
    onSelect?.(algorithm.id);
  };

  // Handle new custom algorithm save
  const handleSaveCustomAlgorithm = (algorithm) => {
    saveCustomAlgorithm(algorithm);
    setShowCustomEditor(false);
  };

  // Handle custom algorithm deletion
  const handleDeleteAlgorithm = (algorithmId) => {
    deleteCustomAlgorithm(algorithmId);
    setShowDeleteConfirm(null);
  };

  return (
    <div
      className={`space-y-6 ${className}`}
      data-tutorial="algorithm-selector"
    >
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search algorithms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Custom Algorithm Button */}
        <Button
          onClick={() => setShowCustomEditor(true)}
          className="w-full flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Create Custom Algorithm
        </Button>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                selectedCategory === category
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex justify-end">
          <div className="inline-flex rounded-lg border border-gray-300">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 text-sm rounded-l-lg ${
                viewMode === "grid"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 text-sm rounded-r-lg border-l border-gray-300 ${
                viewMode === "list"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Algorithm List/Grid */}
      <div
        className={`grid gap-4 ${
          viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {filteredAlgorithms.map((algorithm) => (
          <Card
            key={algorithm.id}
            className={`p-4 cursor-pointer transition-all ${
              selectedAlgorithm?.id === algorithm.id
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:shadow-md"
            }`}
            onClick={() => handleSelect(algorithm)}
            data-algorithm={algorithm.id}
          >
            {viewMode === "grid" ? (
              <div className="space-y-3">
                {/* Algorithm Preview */}
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                  {algorithm.thumbnail ? (
                    <img
                      src={algorithm.thumbnail}
                      alt={algorithm.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-sm">Preview</span>
                    </div>
                  )}

                  {/* Custom badge */}
                  {algorithm.isCustom && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Custom
                    </div>
                  )}

                  {/* Delete button for custom algorithms */}
                  {algorithm.isCustom && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(algorithm.id);
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>

                {/* Algorithm Info */}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {algorithm.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {algorithm.description}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    {algorithm.category}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                  {algorithm.thumbnail ? (
                    <img
                      src={algorithm.thumbnail}
                      alt={algorithm.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-xs">Preview</span>
                    </div>
                  )}

                  {/* Custom badge */}
                  {algorithm.isCustom && (
                    <div
                      className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded text-center"
                      style={{ fontSize: "0.65rem" }}
                    >
                      Custom
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {algorithm.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {algorithm.description}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded mr-2">
                        {algorithm.category}
                      </span>

                      {/* Delete button for custom algorithms */}
                      {algorithm.isCustom && (
                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(algorithm.id);
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>

                  {selectedAlgorithm?.id === algorithm.id && (
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(algorithm);
                      }}
                    >
                      Selected
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredAlgorithms.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p>No algorithms found matching your criteria.</p>
          <p className="text-sm mt-2">Try adjusting your search or filters.</p>
        </div>
      )}

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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          title="Delete Custom Algorithm?"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this custom algorithm? This action
              cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteAlgorithm(showDeleteConfirm)}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
