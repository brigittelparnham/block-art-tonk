/**
 * Voronoi Diagram Generative Art Algorithm
 *
 * Creates Voronoi diagrams and Delaunay triangulations for
 * various artistic effects with dynamic coloring and animation.
 */

import { Algorithm, AlgorithmParameter } from "../../stores/artworkStore";

// Algorithm parameters
const parameters: AlgorithmParameter[] = [
  {
    id: "pointCount",
    name: "Point Count",
    type: "number",
    default: 20,
    min: 3,
    max: 200,
    step: 5,
    description: "Number of points in the Voronoi diagram",
  },
  {
    id: "displayMode",
    name: "Display Mode",
    type: "select",
    default: "voronoi",
    options: [
      { value: "voronoi", label: "Voronoi Cells" },
      { value: "delaunay", label: "Delaunay Triangulation" },
      { value: "points", label: "Points Only" },
      { value: "combined", label: "Combined" },
    ],
    description: "How to visualize the diagram",
  },
  {
    id: "colorMode",
    name: "Color Mode",
    type: "select",
    default: "random",
    options: [
      { value: "random", label: "Random Colors" },
      { value: "distance", label: "Distance Based" },
      { value: "gradient", label: "Gradient" },
      { value: "monochrome", label: "Monochrome" },
    ],
    description: "How cells are colored",
  },
  {
    id: "edgeColor",
    name: "Edge Color",
    type: "color",
    default: "#FFFFFF",
    description: "Color for cell edges",
  },
  {
    id: "edgeWidth",
    name: "Edge Width",
    type: "range",
    default: 1,
    min: 0,
    max: 5,
    step: 0.5,
    description: "Width of cell edges (0 for no edges)",
  },
  {
    id: "backgroundColor",
    name: "Background Color",
    type: "color",
    default: "#000000",
    description: "Canvas background color",
  },
  {
    id: "baseColor",
    name: "Base Color",
    type: "color",
    default: "#3366FF",
    description: "Base color for gradient/monochrome modes",
  },
  {
    id: "pointSize",
    name: "Point Size",
    type: "range",
    default: 4,
    min: 0,
    max: 10,
    step: 1,
    description: "Size of points (0 to hide)",
  },
  {
    id: "pointDistribution",
    name: "Point Distribution",
    type: "select",
    default: "random",
    options: [
      { value: "random", label: "Random" },
      { value: "grid", label: "Grid with Jitter" },
      { value: "circular", label: "Circular" },
      { value: "clustered", label: "Clustered" },
    ],
    description: "How points are distributed",
  },
  {
    id: "relaxation",
    name: "Relaxation Iterations",
    type: "number",
    default: 0,
    min: 0,
    max: 10,
    step: 1,
    description: "Lloyd's relaxation iterations (0 = no relaxation)",
  },
];

// Voronoi algorithm implementation
export const voronoiAlgorithm: Algorithm = {
  id: "voronoi",
  name: "Voronoi Diagram",
  description: "Space-partitioning diagrams based on distance to points",
  category: "geometric",
  parameters,
  draw: (canvas: HTMLCanvasElement, params: Record<string, any>) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    // Set background
    ctx.fillStyle = params.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate points based on distribution
    const points: Array<{ x: number; y: number }> = [];
    const width = canvas.width;
    const height = canvas.height;
    const padding = 20; // Keep points away from the edges

    // Point generation based on distribution setting
    switch (params.pointDistribution) {
      case "grid":
        // Grid with jitter
        const cols = Math.ceil(Math.sqrt(params.pointCount));
        const rows = Math.ceil(params.pointCount / cols);
        const cellWidth = (width - padding * 2) / cols;
        const cellHeight = (height - padding * 2) / rows;

        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            if (points.length >= params.pointCount) break;

            // Add jitter to grid position
            const jitterX = (Math.random() - 0.5) * cellWidth * 0.7;
            const jitterY = (Math.random() - 0.5) * cellHeight * 0.7;

            points.push({
              x: padding + j * cellWidth + cellWidth / 2 + jitterX,
              y: padding + i * cellHeight + cellHeight / 2 + jitterY,
            });
          }
        }
        break;

      case "circular":
        // Points arranged in concentric circles
        const rings = Math.min(5, Math.ceil(params.pointCount / 10));
        const center = { x: width / 2, y: height / 2 };
        const maxRadius = Math.min(width, height) / 2 - padding;

        // Add center point
        points.push({ x: center.x, y: center.y });

        for (let ring = 1; ring <= rings; ring++) {
          const ringRadius = (ring / rings) * maxRadius;
          const circumference = 2 * Math.PI * ringRadius;
          const pointsInRing = Math.floor(
            ((params.pointCount - 1) * (ring / rings)) / rings
          );

          for (let i = 0; i < pointsInRing; i++) {
            const angle = (i / pointsInRing) * 2 * Math.PI;
            const jitter = (Math.random() - 0.5) * (maxRadius / rings) * 0.5;

            points.push({
              x: center.x + (ringRadius + jitter) * Math.cos(angle),
              y: center.y + (ringRadius + jitter) * Math.sin(angle),
            });
          }
        }
        break;

      case "clustered":
        // Generate clusters of points
        const numClusters = Math.min(5, Math.ceil(params.pointCount / 10));
        const clusterCenters = [];

        // Generate cluster centers
        for (let i = 0; i < numClusters; i++) {
          clusterCenters.push({
            x: padding + Math.random() * (width - padding * 2),
            y: padding + Math.random() * (height - padding * 2),
          });
        }

        // Generate points around cluster centers
        for (let i = 0; i < params.pointCount; i++) {
          const cluster =
            clusterCenters[Math.floor(Math.random() * numClusters)];
          const distance = Math.random() * (width / 5); // Cluster spread
          const angle = Math.random() * 2 * Math.PI;

          points.push({
            x: Math.max(
              padding,
              Math.min(width - padding, cluster.x + distance * Math.cos(angle))
            ),
            y: Math.max(
              padding,
              Math.min(height - padding, cluster.y + distance * Math.sin(angle))
            ),
          });
        }
        break;

      case "random":
      default:
        // Completely random distribution
        for (let i = 0; i < params.pointCount; i++) {
          points.push({
            x: padding + Math.random() * (width - padding * 2),
            y: padding + Math.random() * (height - padding * 2),
          });
        }
        break;
    }

    // Apply Lloyd's relaxation if specified
    if (params.relaxation > 0) {
      // Simple implementation of Lloyd's algorithm for point relaxation
      for (let iteration = 0; iteration < params.relaxation; iteration++) {
        // This is a simplified version - a real implementation would use
        // proper Voronoi calculations for each iteration
        const newPoints = [];

        for (let i = 0; i < points.length; i++) {
          const point = points[i];
          let sumX = 0;
          let sumY = 0;
          let count = 0;

          // Find nearest neighbors (approximation)
          for (let j = 0; j < points.length; j++) {
            if (i === j) continue;

            const otherPoint = points[j];
            const dx = otherPoint.x - point.x;
            const dy = otherPoint.y - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < width / 8) {
              // Arbitrary neighbor distance
              sumX += otherPoint.x;
              sumY += otherPoint.y;
              count++;
            }
          }

          // Move point toward centroid of neighbors
          if (count > 0) {
            newPoints.push({
              x: point.x + (sumX / count - point.x) * 0.5,
              y: point.y + (sumY / count - point.y) * 0.5,
            });
          } else {
            newPoints.push({ x: point.x, y: point.y });
          }
        }

        // Update points
        points.length = 0;
        points.push(...newPoints);
      }
    }

    // Simple distance calculation for Voronoi
    function getClosestPointIndex(x: number, y: number): number {
      let minDist = Number.MAX_VALUE;
      let minIndex = 0;

      for (let i = 0; i < points.length; i++) {
        const dx = points[i].x - x;
        const dy = points[i].y - y;
        const dist = dx * dx + dy * dy; // No need for square root for comparison

        if (dist < minDist) {
          minDist = dist;
          minIndex = i;
        }
      }

      return minIndex;
    }

    // Generate random colors for cells
    const colors: string[] = [];
    for (let i = 0; i < points.length; i++) {
      if (params.colorMode === "random") {
        // Random vibrant colors
        const hue = Math.floor(Math.random() * 360);
        const saturation = 70 + Math.floor(Math.random() * 30);
        const lightness = 40 + Math.floor(Math.random() * 40);
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
      } else if (params.colorMode === "monochrome") {
        // Monochrome based on base color
        // Extract HSL components from base color by drawing it
        ctx.fillStyle = params.baseColor;
        ctx.fillRect(0, 0, 1, 1);
        const pixel = ctx.getImageData(0, 0, 1, 1).data;
        const r = pixel[0] / 255;
        const g = pixel[1] / 255;
        const b = pixel[2] / 255;

        // Approximate HSL
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

          if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
          else if (max === g) h = (b - r) / d + 2;
          else h = (r - g) / d + 4;

          h *= 60;
        }

        // Create variation of base color
        const variationL = 30 + (i / points.length) * 40;
        colors.push(`hsl(${h}, ${s * 100}%, ${variationL}%)`);
      } else {
        // Gradient or distance mode will be calculated during rendering
        colors.push("");
      }
    }

    // Draw Voronoi diagram
    if (params.displayMode === "voronoi" || params.displayMode === "combined") {
      // Naive approach - loop through pixels and color based on closest point
      // In a production app, use a proper Voronoi library like d3-voronoi
      const cellSize = 10; // Sample every N pixels for performance

      for (let y = 0; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
          const closestIndex = getClosestPointIndex(x, y);

          let fillColor;
          if (params.colorMode === "distance") {
            // Color based on distance from center
            const distToCenter = Math.hypot(x - width / 2, y - height / 2);
            const normalizedDist = Math.min(
              1,
              distToCenter / (Math.min(width, height) / 2)
            );
            fillColor = `hsl(${normalizedDist * 360}, 70%, 50%)`;
          } else if (params.colorMode === "gradient") {
            // Gradient based on position
            const hue = (x / width) * 180 + (y / height) * 180;
            fillColor = `hsl(${hue}, 70%, 50%)`;
          } else {
            // Use pre-generated color
            fillColor = colors[closestIndex];
          }

          ctx.fillStyle = fillColor;
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }

    // Draw Delaunay triangulation (simplified)
    if (
      params.displayMode === "delaunay" ||
      params.displayMode === "combined"
    ) {
      ctx.strokeStyle = params.edgeColor;
      ctx.lineWidth = params.edgeWidth;

      // Simplified Delaunay - just connect nearby points
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Connect if close enough (not true Delaunay, just for visual effect)
          if (dist < width / 8) {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }
    }

    // Draw points
    if (
      params.pointSize > 0 &&
      (params.displayMode === "points" || params.displayMode === "combined")
    ) {
      for (let i = 0; i < points.length; i++) {
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, params.pointSize, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  },
};

export default voronoiAlgorithm;
