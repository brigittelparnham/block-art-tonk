/**
 * Art Generation Module Index
 *
 * Exports all available generative art algorithms for use in the application.
 */

// Import all algorithms
import flowFieldAlgorithm from "./flowField";
import particleSystemAlgorithm from "./particleSystem";
import mandalaAlgorithm from "./mandala";
import cellularAutomataAlgorithm from "./cellularAutomata";
import lSystemAlgorithm from "./lSystem";
import voronoiAlgorithm from "./voronoi";
import { Algorithm } from "../../stores/artworkStore";

// Export individual algorithms
export { flowFieldAlgorithm } from "./flowField";
export { particleSystemAlgorithm } from "./particleSystem";
export { mandalaAlgorithm } from "./mandala";
export { cellularAutomataAlgorithm } from "./cellularAutomata";
export { lSystemAlgorithm } from "./lSystem";
export { voronoiAlgorithm } from "./voronoi";

// Array of all available algorithms
export const allAlgorithms: Algorithm[] = [
  flowFieldAlgorithm,
  particleSystemAlgorithm,
  mandalaAlgorithm,
  cellularAutomataAlgorithm,
  lSystemAlgorithm,
  voronoiAlgorithm,
];

// Utility functions for working with algorithms
export const getAlgorithmById = (algorithmId: string): Algorithm | null => {
  return allAlgorithms.find((algo) => algo.id === algorithmId) || null;
};

export const getAlgorithmsByCategory = (category: string): Algorithm[] => {
  return allAlgorithms.filter((algo) => algo.category === category);
};

export const getAllCategories = (): string[] => {
  const categories = new Set(allAlgorithms.map((algo) => algo.category));
  return Array.from(categories);
};

// Export a helper for accessing algorithm parameters
export const getDefaultParameters = (
  algorithm: Algorithm
): Record<string, any> => {
  const params: Record<string, any> = {};
  algorithm.parameters.forEach((param) => {
    params[param.id] = param.default;
  });
  return params;
};

// Export the module as the default
export default {
  algorithms: allAlgorithms,
  getAlgorithmById,
  getAlgorithmsByCategory,
  getAllCategories,
  getDefaultParameters,
};
