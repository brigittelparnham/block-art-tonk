/**
 * Mandala/Spirograph Generative Art Algorithm
 *
 * Creates intricate circular patterns using mathematical formulas
 * for spirographs, mandalas, and rose curves.
 */

import { Algorithm, AlgorithmParameter } from "../../stores/artworkStore";

// Algorithm parameters
const parameters: AlgorithmParameter[] = [
  {
    id: "patternType",
    name: "Pattern Type",
    type: "select",
    default: "spirograph",
    options: [
      { value: "spirograph", label: "Spirograph" },
      { value: "rose", label: "Rose Curve" },
      { value: "mandala", label: "Mandala" },
      { value: "epitrochoid", label: "Epitrochoid" },
    ],
    description: "Type of circular pattern to generate",
  },
  {
    id: "radius1",
    name: "Outer Radius",
    type: "range",
    default: 100,
    min: 20,
    max: 300,
    step: 10,
    description: "Radius of the outer circle",
  },
  {
    id: "radius2",
    name: "Inner Radius",
    type: "range",
    default: 50,
    min: 10,
    max: 200,
    step: 10,
    description: "Radius of the inner circle or curve parameter",
  },
  {
    id: "offset",
    name: "Pen Offset",
    type: "range",
    default: 50,
    min: 0,
    max: 100,
    step: 5,
    description: "Distance of pen from inner circle center",
  },
  {
    id: "rotations",
    name: "Rotations",
    type: "number",
    default: 360,
    min: 1,
    max: 3600,
    step: 1,
    description: "Number of degrees to rotate",
  },
  {
    id: "symmetry",
    name: "Symmetry",
    type: "number",
    default: 6,
    min: 2,
    max: 24,
    step: 1,
    description: "Number of symmetrical repetitions (for mandalas)",
  },
  {
    id: "strokeWidth",
    name: "Stroke Width",
    type: "range",
    default: 1,
    min: 0.5,
    max: 5,
    step: 0.5,
    description: "Width of the drawn lines",
  },
  {
    id: "colorMode",
    name: "Color Mode",
    type: "select",
    default: "gradient",
    options: [
      { value: "gradient", label: "Gradient" },
      { value: "rainbow", label: "Rainbow" },
      { value: "monochrome", label: "Monochrome" },
    ],
    description: "How colors are applied to the pattern",
  },
  {
    id: "baseColor",
    name: "Base Color",
    type: "color",
    default: "#ffffff",
    description: "Base color for the pattern",
  },
  {
    id: "backgroundColor",
    name: "Background Color",
    type: "color",
    default: "#000000",
    description: "Canvas background color",
  },
  {
    id: "steps",
    name: "Detail Level",
    type: "range",
    default: 1000,
    min: 100,
    max: 5000,
    step: 100,
    description: "Number of calculation steps (affects detail and performance)",
  },
];

// Mandala algorithm implementation
export const mandalaAlgorithm: Algorithm = {
  id: "mandala",
  name: "Mandala/Spirograph",
  description:
    "Intricate circular patterns using spirograph and rose curve mathematics",
  category: "geometric",
  parameters,
  draw: (canvas: HTMLCanvasElement, params: Record<string, any>) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    // Setup canvas
    ctx.fillStyle = params.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center the pattern
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Helper function to generate color based on angle
    function getColor(angle: number): string {
      switch (params.colorMode) {
        case "gradient":
          const progress = angle / (Math.PI * 2);
          const hue = progress * 360;
          return `hsl(${hue}, 70%, 50%)`;

        case "rainbow":
          const rainbowHue = (angle / (Math.PI * 2)) * 360;
          return `hsl(${rainbowHue}, 100%, 50%)`;

        case "monochrome":
        default:
          return params.baseColor;
      }
    }

    // Calculate points based on pattern type
    function calculatePoint(t: number, type: string): { x: number; y: number } {
      let x: number, y: number;

      switch (type) {
        case "spirograph":
          // Classic spirograph formula
          const r1 = params.radius1;
          const r2 = params.radius2;
          const d = params.offset;

          x = (r1 - r2) * Math.cos(t) + d * Math.cos(((r1 - r2) / r2) * t);
          y = (r1 - r2) * Math.sin(t) - d * Math.sin(((r1 - r2) / r2) * t);
          break;

        case "rose":
          // Rose curve formula
          const n = params.radius2 / 10; // Petal count
          const roseR = params.radius1 * Math.cos(n * t);
          x = roseR * Math.cos(t);
          y = roseR * Math.sin(t);
          break;

        case "epitrochoid":
          // Epitrochoid formula
          const r1Epit = params.radius1;
          const r2Epit = params.radius2;
          const d2 = params.offset;

          x =
            (r1Epit + r2Epit) * Math.cos(t) -
            d2 * Math.cos(((r1Epit + r2Epit) / r2Epit) * t);
          y =
            (r1Epit + r2Epit) * Math.sin(t) -
            d2 * Math.sin(((r1Epit + r2Epit) / r2Epit) * t);
          break;

        case "mandala":
        default:
          // Simple mandala pattern
          const angle = t * params.symmetry;
          const radius = params.radius1 + params.radius2 * Math.sin(angle);
          x = radius * Math.cos(t);
          y = radius * Math.sin(t);
          break;
      }

      return { x, y };
    }

    // Draw pattern
    ctx.lineWidth = params.strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Convert degrees to radians
    const totalRadians = (params.rotations * Math.PI) / 180;
    const step = totalRadians / params.steps;

    // Draw the main pattern
    let firstPoint = true;
    ctx.beginPath();

    for (let t = 0; t <= totalRadians; t += step) {
      const point = calculatePoint(t, params.patternType);
      const x = centerX + point.x;
      const y = centerY + point.y;

      if (firstPoint) {
        ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }

      // Change color for each segment if using gradient mode
      if (params.colorMode !== "monochrome" && t > 0) {
        ctx.strokeStyle = getColor(t);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }

    // Final stroke for monochrome mode
    if (params.colorMode === "monochrome") {
      ctx.strokeStyle = params.baseColor;
      ctx.stroke();
    }

    // Draw symmetrical copies for mandala patterns
    if (params.patternType === "mandala" && params.symmetry > 1) {
      const angleStep = (Math.PI * 2) / params.symmetry;

      for (let i = 1; i < params.symmetry; i++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angleStep * i);
        ctx.translate(-centerX, -centerY);

        // Redraw the pattern
        ctx.beginPath();
        firstPoint = true;

        for (let t = 0; t <= totalRadians; t += step) {
          const point = calculatePoint(t, params.patternType);
          const x = centerX + point.x;
          const y = centerY + point.y;

          if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = params.baseColor;
        ctx.stroke();
        ctx.restore();
      }
    }

    // Add decorative elements for mandala
    if (params.patternType === "mandala") {
      // Draw center decoration
      ctx.fillStyle = params.baseColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw outer ring decoration
      const ringRadius = params.radius1 * 1.2;
      ctx.strokeStyle = params.baseColor;
      ctx.lineWidth = params.strokeWidth * 0.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  },
};

export default mandalaAlgorithm;
