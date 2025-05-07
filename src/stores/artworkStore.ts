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
import { Doc } from "@automerge/automerge";

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
}

// Store state interface and actions (same as before)
interface ArtworkState {
  selectedAlgorithm: Algorithm | null;
  parameters: Record<string, any>;
  currentArtwork: string | null;
  savedArtworks: Artwork[];
  publicArtworks: Artwork[];
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
}

type ArtworkStore = ArtworkState & ArtworkActions;

export const useArtworkStore = create<ArtworkStore>()(
  sync(
    (set, get) => ({
      selectedAlgorithm: null,
      parameters: {},
      currentArtwork: null,
      savedArtworks: [],
      publicArtworks: [],
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

      saveArtwork: async (imageData, title = "Untitled Artwork") => {
        const { selectedAlgorithm, parameters, savedArtworks } = get();
        if (!selectedAlgorithm) return;

        const artwork: Artwork = {
          id: `artwork-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
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
        set({
          selectedAlgorithm: null, // Placeholder - set actual algorithm elsewhere
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
    }),
    { docId: "artwork-store" as DocumentId } // This identifies the sync document
  )
);
