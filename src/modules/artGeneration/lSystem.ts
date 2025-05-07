/**
 * L-System Generative Art Algorithm
 *
 * Implements Lindenmayer systems (L-systems) for generating fractal-like
 * structures such as plants, trees, and other organic forms.
 */

import { Algorithm, AlgorithmParameter } from "../../stores/artworkStore";

// Algorithm parameters
const parameters: AlgorithmParameter[] = [
  {
    id: "preset",
    name: "Preset",
    type: "select",
    default: "plant",
    options: [
      { value: "plant", label: "Fractal Plant" },
      { value: "tree", label: "Branching Tree" },
      { value: "dragon", label: "Dragon Curve" },
      { value: "sierpinski", label: "Sierpinski Triangle" },
      { value: "koch", label: "Koch Snowflake" },
      { value: "custom", label: "Custom" },
    ],
    description: "Predefined L-system patterns",
  },
  {
    id: "axiom",
    name: "Axiom",
    type: "select",
    default: "F",
    options: [
      { value: "F", label: "F" },
      { value: "X", label: "X" },
      { value: "FX", label: "FX" },
      { value: "A", label: "A" },
    ],
    description: "Starting string for the L-system",
  },
  {
    id: "iterations",
    name: "Iterations",
    type: "number",
    default: 4,
    min: 1,
    max: 6,
    step: 1,
    description: "Number of recursive iterations (higher values may be slower)",
  },
  {
    id: "angle",
    name: "Rotation Angle",
    type: "range",
    default: 25,
    min: 5,
    max: 90,
    step: 1,
    description: "Angle of rotation in degrees",
  },
  {
    id: "lineLength",
    name: "Line Length",
    type: "range",
    default: 5,
    min: 1,
    max: 20,
    step: 1,
    description: "Length of each line segment",
  },
  {
    id: "lineWidth",
    name: "Line Width",
    type: "range",
    default: 1,
    min: 0.5,
    max: 3,
    step: 0.5,
    description: "Width of drawn lines",
  },
  {
    id: "thinning",
    name: "Branch Thinning",
    type: "range",
    default: 0.75,
    min: 0.5,
    max: 1,
    step: 0.05,
    description: "How much branches thin out (1 = no thinning)",
  },
  {
    id: "color",
    name: "Line Color",
    type: "color",
    default: "#00AA00",
    description: "Main color for the L-system",
  },
  {
    id: "backgroundColor",
    name: "Background Color",
    type: "color",
    default: "#000000",
    description: "Canvas background color",
  },
  {
    id: "useGradient",
    name: "Use Gradient",
    type: "boolean",
    default: true,
    description: "Apply color gradient based on depth",
  },
];

// L-system algorithm implementation
export const lSystemAlgorithm: Algorithm = {
  id: "l-system",
  name: "L-System",
  description:
    "Recursive rule-based systems for generating fractal-like patterns and plant structures",
  category: "fractal",
  parameters,
  draw: (canvas: HTMLCanvasElement, params: Record<string, any>) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    // Clear canvas with background color
    ctx.fillStyle = params.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Define L-system presets (rules)
    const presets: Record<
      string,
      { axiom: string; rules: Record<string, string> }
    > = {
      plant: {
        axiom: "X",
        rules: {
          X: "F+[[X]-X]-F[-FX]+X",
          F: "FF",
        },
      },
      tree: {
        axiom: "F",
        rules: {
          F: "FF+[+F-F-F]-[-F+F+F]",
        },
      },
      dragon: {
        axiom: "FX",
        rules: {
          X: "X+YF+",
          Y: "-FX-Y",
        },
      },
      sierpinski: {
        axiom: "F-G-G",
        rules: {
          F: "F-G+F+G-F",
          G: "GG",
        },
      },
      koch: {
        axiom: "F",
        rules: {
          F: "F+F-F-F+F",
        },
      },
      custom: {
        axiom: "F",
        rules: {
          F: "F+F-F",
        },
      },
    };

    // Get preset or use custom
    const preset = presets[params.preset];
    const axiom = preset.axiom;
    const rules = preset.rules;

    // Generate L-system string
    function generateLSystem(
      axiom: string,
      rules: Record<string, string>,
      iterations: number
    ): string {
      let result = axiom;

      for (let i = 0; i < iterations; i++) {
        let newResult = "";

        for (let j = 0; j < result.length; j++) {
          const char = result[j];
          newResult += rules[char] || char;
        }

        result = newResult;
      }

      return result;
    }

    // Draw the L-system
    function drawLSystem(lSystem: string): void {
      // Center positioning
      const centerX = canvas.width / 2;
      const centerY = canvas.height * 0.8; // Start near bottom for plant-like systems

      // Adjust for specific presets
      let startX = centerX;
      let startY = centerY;
      let startAngle = -90; // Start upward (in degrees)

      if (params.preset === "koch") {
        startY = canvas.height * 0.6;
        startAngle = 0;
      } else if (params.preset === "sierpinski") {
        startY = canvas.height * 0.3;
        startAngle = 0;
      } else if (params.preset === "dragon") {
        startX = canvas.width * 0.3;
        startY = canvas.height * 0.5;
        startAngle = 0;
      }

      // Convert angle to radians
      const angle = params.angle * (Math.PI / 180);

      // Stack for saving positions/angles
      const stack: Array<{
        x: number;
        y: number;
        angle: number;
        width: number;
      }> = [];

      let x = startX;
      let y = startY;
      let currentAngle = startAngle * (Math.PI / 180);
      let currentWidth = params.lineWidth;
      let maxDepth = 0;
      let currentDepth = 0;

      // First pass to determine maximum depth (for gradient coloring)
      for (let i = 0; i < lSystem.length; i++) {
        if (lSystem[i] === "[") maxDepth = Math.max(maxDepth, ++currentDepth);
        else if (lSystem[i] === "]") currentDepth--;
      }

      currentDepth = 0;

      // Draw the L-system
      ctx.strokeStyle = params.color;
      ctx.lineWidth = params.lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 0; i < lSystem.length; i++) {
        const char = lSystem[i];

        switch (char) {
          case "F":
          case "G": // Also treat G as forward
            // Calculate new position
            const newX = x + params.lineLength * Math.cos(currentAngle);
            const newY = y + params.lineLength * Math.sin(currentAngle);

            // Set color based on depth if gradient is enabled
            if (params.useGradient) {
              const hue =
                params.preset === "plant" || params.preset === "tree"
                  ? 100 - (currentDepth / maxDepth) * 60 // Green to brown
                  : (currentDepth / maxDepth) * 360; // Rainbow

              const lightness = 50 - (currentDepth / maxDepth) * 20; // Darker with depth
              ctx.strokeStyle = `hsl(${hue}, 70%, ${lightness}%)`;
            } else {
              ctx.strokeStyle = params.color;
            }

            // Set line width
            ctx.lineWidth = currentWidth;

            // Draw line
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(newX, newY);
            ctx.stroke();

            // Update position
            x = newX;
            y = newY;
            break;

          case "+": // Turn left (counter-clockwise)
            currentAngle += angle;
            break;

          case "-": // Turn right (clockwise)
            currentAngle -= angle;
            break;

          case "[": // Push state
            stack.push({ x, y, angle: currentAngle, width: currentWidth });
            currentWidth *= params.thinning; // Thin out branches
            currentDepth++;
            break;

          case "]": // Pop state
            const state = stack.pop();
            if (state) {
              x = state.x;
              y = state.y;
              currentAngle = state.angle;
              currentWidth = state.width;
              currentDepth--;
            }
            break;
        }
      }
    }

    // Generate and draw the L-system
    const lSystem = generateLSystem(axiom, rules, params.iterations);
    drawLSystem(lSystem);
  },
};

export default lSystemAlgorithm;
