/**
 * SaveSharePanel component
 *
 * Provides options for saving and sharing generative artworks:
 * - Save to gallery
 * - Download as PNG/SVG
 * - Copy share link
 * - Social media sharing
 *
 * @example
 * <SaveSharePanel
 *   canvasRef={canvasRef}
 *   onSave={handleSave}
 * />
 */

import React, { useState } from "react";
import {
  Save,
  Download,
  Share2,
  Link2,
  Twitter,
  Instagram,
  CheckCircle,
  Heart,
  Eye,
} from "lucide-react";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { useArtworkStore } from "../../stores/artworkStore";

export interface SaveSharePanelProps {
  /** Reference to the canvas element */
  canvasRef: HTMLCanvasElement | null;
  /** Called when artwork is saved */
  onSave?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SaveSharePanel provides options for saving and sharing artworks
 *
 * Features:
 * - Save to personal gallery
 * - Export in various formats
 * - Generate shareable links
 * - Social media integration
 * - Public/private toggle
 */
export const SaveSharePanel: React.FC<SaveSharePanelProps> = ({
  canvasRef,
  onSave,
  className = "",
}) => {
  const { currentArtwork, saveArtwork, selectedAlgorithm, parameters } =
    useArtworkStore();

  const [artworkTitle, setArtworkTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [exportFormat, setExportFormat] = useState<"png" | "svg" | "jpg">(
    "png"
  );

  // Save artwork to gallery
  const handleSave = async () => {
    if (!canvasRef) return;

    setIsSaving(true);
    try {
      const dataUrl = canvasRef.toDataURL(`image/${exportFormat}`);
      const finalTitle = artworkTitle.trim() || "Untitled Artwork";
      await saveArtwork(dataUrl, finalTitle);

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Reset form
      setArtworkTitle("");

      onSave?.();
    } catch (error) {
      console.error("Error saving artwork:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Download artwork
  const handleDownload = () => {
    if (!canvasRef) return;

    const dataUrl = canvasRef.toDataURL(`image/${exportFormat}`);
    const link = document.createElement("a");
    link.download = `${artworkTitle || "artwork"}.${exportFormat}`;
    link.href = dataUrl;
    link.click();
  };

  // Generate and copy share link
  const handleCopyShareLink = async () => {
    if (!canvasRef || !selectedAlgorithm) return;

    setIsSharing(true);
    try {
      // Create share URL with parameters
      const params = new URLSearchParams({
        algorithm: selectedAlgorithm.id,
        params: JSON.stringify(parameters),
      });

      const url = `${window.location.origin}${
        window.location.pathname
      }?${params.toString()}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(url);

      setShareUrl(url);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error copying share link:", error);
    } finally {
      setIsSharing(false);
    }
  };

  // Share to social media
  const handleSocialShare = (
    platform: "twitter" | "instagram" | "facebook"
  ) => {
    if (!shareUrl && !canvasRef) return;

    const text = `Check out this generative art I created!`;

    switch (platform) {
      case "twitter":
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, "_blank", "width=600,height=400");
        break;

      case "instagram":
        // Instagram doesn't have a direct web share API
        // For now, we'll just download and the user can upload manually
        handleDownload();
        alert("Download complete! You can now upload to Instagram.");
        break;

      case "facebook":
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}`;
        window.open(fbUrl, "_blank", "width=600,height=400");
        break;
    }
  };

  return (
    <div className={`space-y-4 ${className}`} data-tutorial="save-panel">
      {/* Save Section */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Save to Gallery
        </h3>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="artwork-title"
              className="block text-sm text-gray-700 mb-1"
            >
              Artwork Title
            </label>
            <input
              id="artwork-title"
              type="text"
              value={artworkTitle}
              onChange={(e) => setArtworkTitle(e.target.value)}
              placeholder="Enter a title for your artwork"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="export-format"
              className="block text-sm text-gray-700 mb-1"
            >
              Export Format
            </label>
            <select
              id="export-format"
              value={exportFormat}
              onChange={(e) =>
                setExportFormat(e.target.value as "png" | "svg" | "jpg")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="svg">SVG</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || !canvasRef}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? "Saving..." : "Save to Gallery"}
            </Button>

            <Button
              variant="secondary"
              onClick={handleDownload}
              disabled={!canvasRef}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </Card>

      {/* Share Section */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Share Your Art
        </h3>

        <div className="space-y-3">
          <Button
            variant="secondary"
            onClick={handleCopyShareLink}
            disabled={isSharing || !canvasRef}
            className="w-full flex items-center justify-center gap-2"
          >
            {isSharing ? (
              <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            {isSharing ? "Generating..." : "Copy Share Link"}
          </Button>

          <div className="flex justify-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSocialShare("twitter")}
              disabled={!canvasRef}
              className="flex items-center gap-2"
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSocialShare("instagram")}
              disabled={!canvasRef}
              className="flex items-center gap-2"
            >
              <Instagram className="w-4 h-4" />
              Instagram
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSocialShare("facebook")}
              disabled={!canvasRef}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Facebook
            </Button>
          </div>
        </div>
      </Card>

      {/* Artwork Stats */}
      {currentArtwork && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Artwork Stats
          </h3>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-gray-600">
                <Heart className="w-4 h-4" />
                <span className="text-sm">Likes</span>
              </div>
              <div className="text-lg font-medium mt-1">0</div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 text-gray-600">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Views</span>
              </div>
              <div className="text-lg font-medium mt-1">0</div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 text-gray-600">
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Shares</span>
              </div>
              <div className="text-lg font-medium mt-1">0</div>
            </div>
          </div>
        </Card>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle className="w-5 h-5" />
          <span>Success! Artwork saved.</span>
        </div>
      )}
    </div>
  );
};
