/**
 * Artwork store for managing generative art state
 *
 * This store manages:
 * - Current artwork creation parameters
 * - Saved artworks collection
 * - Algorithm selection and parameters
 * - Synchronized state using keepsync
 */

import { create } from "zustand";
import { sync, DocumentId } from "@tonk/keepsync";

// Type definitions
export interface Artwork {
  id: string;
  title: string;
  algorithm: string;
  parameters: Record<string, any>;
  thumbnail: string;
  fullImage: string;
  createdAt: Date;
  userId: string;
  isPublic: boolean;
  likes: number;
  remixes: number;
}

export interface AlgorithmParameter {
  id: string;
  name: string;
  type: "number" | "color" | "select" | "boolean" | "range";
  default: any;
  min?: number;
  max?: number;
  step?: number;
  options?: any[];
  description?: string;
}

export interface Algorithm {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: AlgorithmParameter[];
  draw: (canvas: HTMLCanvasElement, params: Record<string, any>) => void;
  thumbnail?: string;
  isCustom?: boolean;
}

// Store state interface and actions
interface ArtworkState {
  selectedAlgorithm: Algorithm | null;
  parameters: Record<string, any>;
  currentArtwork: string | null;
  savedArtworks: Artwork[];
  publicArtworks: Artwork[];
  customAlgorithms: Algorithm[];
  isGenerating: boolean;
  generationError: string | null;
}

interface ArtworkActions {
  setSelectedAlgorithm: (algorithm: Algorithm | null) => void;
  updateParameters: (params: Record<string, any>) => void;
  resetParameters: () => void;
  saveArtwork: (imageData: string, title?: string) => Promise<void>;
  deleteArtwork: (artworkId: string) => Promise<void>;
  updateArtwork: (
    artworkId: string,
    updates: Partial<Artwork>
  ) => Promise<void>;
  setGenerating: (status: boolean) => void;
  setGenerationError: (error: string | null) => void;
  likeArtwork: (artworkId: string) => Promise<void>;
  remixArtwork: (artwork: Artwork) => void;
  togglePublicity: (artworkId: string) => Promise<void>;
  saveCustomAlgorithm: (algorithm: Algorithm) => void;
  deleteCustomAlgorithm: (algorithmId: string) => void;
}

type ArtworkStore = ArtworkState & ArtworkActions;

// Helper function to generate unique IDs
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

export const useArtworkStore = create<ArtworkStore>()(
  sync(
    (set, get) => ({
      selectedAlgorithm: null,
      parameters: {},
      currentArtwork: null,
      savedArtworks: [],
      publicArtworks: [],
      customAlgorithms: [],
      isGenerating: false,
      generationError: null,

      setSelectedAlgorithm: (algorithm) => {
        set({ selectedAlgorithm: algorithm });

        if (algorithm) {
          const defaultParams = algorithm.parameters.reduce((acc, param) => {
            acc[param.id] = param.default;
            return acc;
          }, {} as Record<string, any>);
          set({ parameters: defaultParams });
        } else {
          set({ parameters: {} });
        }
      },

      updateParameters: (newParams) => {
        set((state) => ({
          parameters: { ...state.parameters, ...newParams },
        }));
      },

      resetParameters: () => {
        const { selectedAlgorithm } = get();
        if (selectedAlgorithm) {
          const defaultParams = selectedAlgorithm.parameters.reduce(
            (acc, param) => {
              acc[param.id] = param.default;
              return acc;
            },
            {} as Record<string, any>
          );
          set({ parameters: defaultParams });
        }
      },

      // Fixed save function to prevent duplicates
      saveArtwork: async (imageData, title = "Untitled Artwork") => {
        const { selectedAlgorithm, parameters, savedArtworks } = get();
        if (!selectedAlgorithm) return;

        // Generate unique ID to avoid conflicts
        const uniqueId = generateUniqueId();

        const artwork: Artwork = {
          id: uniqueId,
          title,
          algorithm: selectedAlgorithm.id,
          parameters: { ...parameters },
          thumbnail: imageData,
          fullImage: imageData,
          createdAt: new Date(),
          userId: "current-user",
          isPublic: false,
          likes: 0,
          remixes: 0,
        };

        set({
          savedArtworks: [...savedArtworks, artwork],
          currentArtwork: imageData,
        });
      },

      // Fixed delete function to handle artworks correctly
      deleteArtwork: async (artworkId) => {
        const { savedArtworks } = get();
        set({
          savedArtworks: savedArtworks.filter((a) => a.id !== artworkId),
        });
      },

      updateArtwork: async (artworkId, updates) => {
        const { savedArtworks } = get();
        set({
          savedArtworks: savedArtworks.map((a) =>
            a.id === artworkId ? { ...a, ...updates } : a
          ),
        });
      },

      setGenerating: (status) => {
        set({ isGenerating: status });
      },

      setGenerationError: (error) => {
        set({ generationError: error });
      },

      likeArtwork: async (artworkId) => {
        const { savedArtworks, publicArtworks } = get();
        const updateLikes = (artworks: Artwork[]) =>
          artworks.map((artwork) =>
            artwork.id === artworkId
              ? { ...artwork, likes: artwork.likes + 1 }
              : artwork
          );

        set({
          savedArtworks: updateLikes(savedArtworks),
          publicArtworks: updateLikes(publicArtworks),
        });
      },

      remixArtwork: (artwork) => {
        const { customAlgorithms } = get();
        const algorithm = customAlgorithms.find(
          (a) => a.id === artwork.algorithm
        );

        set({
          selectedAlgorithm: algorithm || null,
          parameters: { ...artwork.parameters },
        });
      },

      togglePublicity: async (artworkId) => {
        const { savedArtworks } = get();
        const artwork = savedArtworks.find((a) => a.id === artworkId);
        if (artwork) {
          await get().updateArtwork(artworkId, {
            isPublic: !artwork.isPublic,
          });
        }
      },

      // New function to save custom algorithms
      saveCustomAlgorithm: (algorithm) => {
        const { customAlgorithms } = get();
        set({
          customAlgorithms: [
            ...customAlgorithms,
            { ...algorithm, isCustom: true },
          ],
          selectedAlgorithm: algorithm,
        });
      },

      // New function to delete custom algorithms
      deleteCustomAlgorithm: (algorithmId) => {
        const { customAlgorithms, selectedAlgorithm } = get();
        const updatedAlgorithms = customAlgorithms.filter(
          (a) => a.id !== algorithmId
        );

        set({
          customAlgorithms: updatedAlgorithms,
          // Deselect the algorithm if it was selected
          selectedAlgorithm:
            selectedAlgorithm?.id === algorithmId ? null : selectedAlgorithm,
        });
      },
    }),
    { docId: "artwork-store" as DocumentId } // This identifies the sync document
  )
);
