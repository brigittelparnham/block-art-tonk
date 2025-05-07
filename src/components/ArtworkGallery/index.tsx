/**
 * ArtworkGallery component
 *
 * Displays a grid of saved artworks with options to:
 * - View full size
 * - Remix existing artworks
 * - Delete artworks
 * - Like/share artworks
 *
 * @example
 * <ArtworkGallery
 *   artworks={savedArtworks}
 *   onSelectArtwork={handleSelect}
 * />
 */

import React, { useState } from "react";
import { Artwork } from "../../stores/artworkStore";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import {
  Eye,
  Heart,
  Trash2,
  Share2,
  ShuffleIcon as Remix,
  Grid,
  List,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react";

export interface ArtworkGalleryProps {
  /** Array of artworks to display */
  artworks: Artwork[];
  /** Called when an artwork is selected */
  onSelectArtwork?: (artwork: Artwork) => void;
  /** Called when an artwork is deleted */
  onDeleteArtwork?: (artworkId: string) => void;
  /** Called when an artwork is liked */
  onLikeArtwork?: (artworkId: string) => void;
  /** Whether to show public artworks */
  showPublic?: boolean;
  /** Whether to allow editing actions */
  allowEdit?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ArtworkGallery displays a collection of artworks
 *
 * Features:
 * - Grid and list view modes
 * - Search and filtering
 * - Artwork preview modal
 * - Social interactions
 */
export const ArtworkGallery: React.FC<ArtworkGalleryProps> = ({
  artworks,
  onSelectArtwork,
  onDeleteArtwork,
  onLikeArtwork,
  showPublic = false,
  allowEdit = true,
  className = "",
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "likes">("newest");

  // Get unique categories/algorithms
  const categories = ["all", ...new Set(artworks.map((art) => art.algorithm))];

  // Filter and sort artworks
  const filteredArtworks = artworks
    .filter((artwork) => {
      const matchesSearch = artwork.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || artwork.algorithm === selectedCategory;
      const matchesVisibility = showPublic ? artwork.isPublic : true;

      return matchesSearch && matchesCategory && matchesVisibility;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "likes":
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

  // Handle remix artwork
  const handleRemix = (artwork: Artwork) => {
    onSelectArtwork?.(artwork);
  };

  // Handle delete artwork
  const handleDelete = (artworkId: string) => {
    onDeleteArtwork?.(artworkId);
    setShowDeleteDialog(null);
  };

  // Handle like artwork
  const handleLike = (artworkId: string) => {
    onLikeArtwork?.(artworkId);
  };

  // Render artwork actions menu
  const renderActionsMenu = (artwork: Artwork) => (
    <div className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-lg transition-opacity">
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedArtwork(artwork);
          }}
          aria-label="View full size"
        >
          <Eye className="w-4 h-4" />
        </Button>

        {allowEdit && (
          <>
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                handleRemix(artwork);
              }}
              aria-label="Remix artwork"
            >
              <Remix className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(artwork.id);
              }}
              className="text-red-600 hover:text-red-800"
              aria-label="Delete artwork"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header Controls */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex flex-col gap-4">
          {/* Search and View Toggle */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search artworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-gray-100" : ""}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-gray-100" : ""}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
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

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "newest" | "oldest" | "likes")
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredArtworks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Grid className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No artworks found</h3>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                : "space-y-4"
            }
          >
            {filteredArtworks.map((artwork) => (
              <Card
                key={artwork.id}
                className={`overflow-hidden transition-all hover:shadow-lg cursor-pointer group relative ${
                  viewMode === "list" ? "flex gap-4 p-4" : ""
                }`}
                onClick={() => setSelectedArtwork(artwork)}
              >
                {viewMode === "grid" ? (
                  <>
                    {/* Artwork Thumbnail */}
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      <img
                        src={artwork.thumbnail}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Artwork Info */}
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 truncate">
                        {artwork.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(artwork.createdAt).toLocaleDateString()}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Heart className="w-3 h-3" />
                        <span>{artwork.likes}</span>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    {renderActionsMenu(artwork)}
                  </>
                ) : (
                  <>
                    {/* Thumbnail */}
                    <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={artwork.thumbnail}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {artwork.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Created on{" "}
                            {new Date(artwork.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Algorithm: {artwork.algorithm}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Heart className="w-4 h-4" />
                          <span>{artwork.likes}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    {renderActionsMenu(artwork)}
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Artwork Detail Modal */}
      {selectedArtwork && (
        <Modal
          isOpen={!!selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          title={selectedArtwork.title}
          maxWidth="4xl"
        >
          <div className="flex flex-col gap-4">
            {/* Full Size Image */}
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={selectedArtwork.fullImage}
                alt={selectedArtwork.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Artwork Details */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedArtwork.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Created on{" "}
                  {new Date(selectedArtwork.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Algorithm: {selectedArtwork.algorithm}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(selectedArtwork.id)}
                  className="flex items-center gap-1"
                >
                  <Heart className="w-4 h-4" />
                  {selectedArtwork.likes}
                </Button>

                {allowEdit && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRemix(selectedArtwork)}
                      className="flex items-center gap-1"
                    >
                      <Remix className="w-4 h-4" />
                      Remix
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteDialog(selectedArtwork.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <Modal
          isOpen={!!showDeleteDialog}
          onClose={() => setShowDeleteDialog(null)}
          title="Delete Artwork?"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this artwork? This action cannot
              be undone.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowDeleteDialog(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(showDeleteDialog)}
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
