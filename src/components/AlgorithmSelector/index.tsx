/**
 * AlgorithmSelector component
 *
 * Allows users to browse and select generative art algorithms.
 * Displays available algorithms with previews and descriptions.
 *
 * @example
 * <AlgorithmSelector />
 */

import React, { useState } from "react";
import { useArtworkStore } from "../../stores/artworkStore";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Heading } from "../../components/Heading";
import { Search } from "lucide-react";

// Import algorithm modules directly from the index.ts file
import {
  flowFieldAlgorithm,
  particleSystemAlgorithm,
  mandalaAlgorithm,
  cellularAutomataAlgorithm,
  lSystemAlgorithm,
  voronoiAlgorithm,
} from "../../modules/artGeneration";

// Available algorithms
const availableAlgorithms = [
  flowFieldAlgorithm,
  particleSystemAlgorithm,
  mandalaAlgorithm,
  cellularAutomataAlgorithm,
  lSystemAlgorithm,
  voronoiAlgorithm,
];

// Rest of your component code...

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
 */
export const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  onSelect,
  className = "",
}) => {
  const { selectedAlgorithm, setSelectedAlgorithm } = useArtworkStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
  const handleSelect = (algorithm: typeof flowFieldAlgorithm) => {
    setSelectedAlgorithm(algorithm);
    onSelect?.(algorithm.id);
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
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
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
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      {algorithm.category}
                    </span>
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
    </div>
  );
};
