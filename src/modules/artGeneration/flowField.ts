/**
 * Processing-Style Flow Field Generative Art Algorithm
 *
 * Creates dynamic vector fields visualized by particles following flow directions,
 * inspired by Processing examples for more artistic and natural-looking results.
 */

import { Algorithm, AlgorithmParameter } from "../../stores/artworkStore";

// Algorithm parameters designed to match Processing implementations
const parameters: AlgorithmParameter[] = [
  {
    id: "particleCount",
    name: "Particle Count",
    type: "number",
    default: 2000,
    min: 100,
    max: 10000,
    step: 100,
    description: "Number of particles in the flow field",
  },
  {
    id: "particleStyle",
    name: "Particle Style",
    type: "select",
    default: "lines",
    options: [
      { value: "lines", label: "Lines" },
      { value: "circles", label: "Circles" },
      { value: "points", label: "Points" },
      { value: "curves", label: "Curves" },
    ],
    description: "Visual style for the particles",
  },
  {
    id: "flowScale",
    name: "Flow Scale",
    type: "range",
    default: 0.003,
    min: 0.0001,
    max: 0.05,
    step: 0.0001,
    description: "Scale of the noise field (smaller = smoother)",
  },
  {
    id: "animated",
    name: "Animated",
    type: "boolean",
    default: true,
    description: "Whether to animate the flow field",
  },
  {
    id: "animationSpeed",
    name: "Animation Speed",
    type: "range",
    default: 0.002,
    min: 0,
    max: 0.01,
    step: 0.0001,
    description: "Speed of animation (0 = static)",
  },
  {
    id: "particleSpeed",
    name: "Particle Speed",
    type: "range",
    default: 2,
    min: 0.2,
    max: 8,
    step: 0.1,
    description: "Movement speed of particles",
  },
  {
    id: "particleLifetime",
    name: "Particle Lifetime",
    type: "number",
    default: -1,
    min: -1,
    max: 500,
    step: 10,
    description: "How long particles live before respawning (-1 = infinite)",
  },
  {
    id: "lineWidth",
    name: "Line Width",
    type: "range",
    default: 1,
    min: 0.1,
    max: 5,
    step: 0.1,
    description: "Thickness of particle lines",
  },
  {
    id: "loopEdges",
    name: "Loop Edges",
    type: "boolean",
    default: true,
    description: "Whether particles wrap around the edges",
  },
  {
    id: "primaryColor",
    name: "Primary Color",
    type: "color",
    default: "#ffffff",
    description: "Main color for particles",
  },
  {
    id: "backgroundColor",
    name: "Background Color",
    type: "color",
    default: "#000000",
    description: "Canvas background color",
  },
  {
    id: "opacity",
    name: "Opacity",
    type: "range",
    default: 5,
    min: 1,
    max: 100,
    step: 1,
    description: "Opacity of particle trails (lower = more trails)",
  },
  {
    id: "flowForce",
    name: "Flow Force",
    type: "range",
    default: 1,
    min: 0.1,
    max: 10,
    step: 0.1,
    description: "How strongly particles follow the flow field",
  },
  {
    id: "noiseDetail",
    name: "Noise Detail",
    type: "range",
    default: 8,
    min: 1,
    max: 16,
    step: 1,
    description: "Level of detail in the noise field",
  },
  {
    id: "noiseVariation",
    name: "Noise Variation",
    type: "range",
    default: 1,
    min: 0.1,
    max: 10,
    step: 0.1,
    description: "Variation in the noise pattern",
  },
  {
    id: "flowFieldStyle",
    name: "Flow Field Style",
    type: "select",
    default: "perlin",
    options: [
      { value: "perlin", label: "Perlin Noise" },
      { value: "circular", label: "Circular" },
      { value: "radial", label: "Radial" },
      { value: "turbulent", label: "Turbulent" },
    ],
    description: "Pattern style for the flow field",
  },
  {
    id: "colorMode",
    name: "Color Mode",
    type: "select",
    default: "solid",
    options: [
      { value: "solid", label: "Solid Color" },
      { value: "flow", label: "Flow Direction" },
      { value: "speed", label: "Particle Speed" },
      { value: "position", label: "Position" },
    ],
    description: "How colors are calculated",
  },
  {
    id: "clearCanvas",
    name: "Clear Canvas",
    type: "boolean",
    default: true,
    description: "Clear canvas when parameters change",
  },
];

// Flow field algorithm implementation inspired by Processing examples
export const flowFieldAlgorithm: Algorithm = {
  id: "flow-field",
  name: "Flow Field",
  description: "Processing-style flow fields with natural movement patterns",
  category: "particle",
  parameters,
  draw: (canvas: HTMLCanvasElement, params: Record<string, any>) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    // Global storage for tracking state between frames
    const globalStore = ((window as any).flowFieldGlobalStore = (window as any)
      .flowFieldGlobalStore || {
      lastParams: {},
      noiseOffset: {
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        z: Math.random() * 1000,
      },
      frameCount: 0,
    });

    // Check if parameters have changed
    const paramsChanged =
      JSON.stringify(params) !== JSON.stringify(globalStore.lastParams);

    // Full clear if parameters changed and clearCanvas is enabled
    if (paramsChanged && params.clearCanvas) {
      ctx.fillStyle = params.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Reset particles on parameter change
      if ((window as any).flowFieldParticles) {
        (window as any).flowFieldParticles.forEach((p: any) => p.reset(true));
      }

      // Store new parameters
      globalStore.lastParams = JSON.parse(JSON.stringify(params));
    } else {
      // Fade effect for trails - use opacity parameter
      ctx.fillStyle = `rgba(${hexToRgb(params.backgroundColor)}, ${
        params.opacity / 100
      })`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Increment frame counter
    globalStore.frameCount++;

    // Update noise offset for animation if enabled
    if (params.animated && params.animationSpeed > 0) {
      globalStore.noiseOffset.z +=
        params.animationSpeed * params.noiseVariation;
    }

    // Flow field grid scale - determines how many flow vectors we calculate
    const scl = 20; // Size of each flow field cell
    const cols = Math.floor(canvas.width / scl);
    const rows = Math.floor(canvas.height / scl);

    // Generate flow field - pre-calculate all vectors
    const flowField = new Array(cols * rows);

    let yoff = globalStore.noiseOffset.y;
    for (let y = 0; y < rows; y++) {
      let xoff = globalStore.noiseOffset.x;
      for (let x = 0; x < cols; x++) {
        const index = x + y * cols;

        // Different flow field styles
        let angle;

        switch (params.flowFieldStyle) {
          case "circular":
            // Circular field - vectors point around a central point
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const dx = x * scl - centerX;
            const dy = y * scl - centerY;
            angle = Math.atan2(dy, dx) + Math.PI / 2;
            break;

          case "radial":
            // Radial field - vectors point outward from center
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const rdx = x * scl - cx;
            const rdy = y * scl - cy;
            angle = Math.atan2(rdy, rdx);
            break;

          case "turbulent":
            // Turbulent field - uses multiple noise scales
            const n1 = perlinNoise(xoff, yoff, globalStore.noiseOffset.z);
            const n2 =
              perlinNoise(xoff * 2, yoff * 2, globalStore.noiseOffset.z * 2) *
              0.5;
            const n3 =
              perlinNoise(xoff * 4, yoff * 4, globalStore.noiseOffset.z * 4) *
              0.25;
            angle = (n1 + n2 + n3) * Math.PI * 4;
            break;

          case "perlin":
          default:
            // Classic Perlin noise field
            angle =
              perlinNoise(xoff, yoff, globalStore.noiseOffset.z) * Math.PI * 4;
            break;
        }

        // Create a vector from the angle
        const v = {
          x: Math.cos(angle) * params.flowForce,
          y: Math.sin(angle) * params.flowForce,
        };

        flowField[index] = v;
        xoff += params.flowScale;
      }
      yoff += params.flowScale;
    }

    // Very simple Perlin noise approximation - could be improved
    function perlinNoise(x: number, y: number, z: number): number {
      // Use multiple sine waves at different frequencies and amplitudes
      return (
        (Math.sin(x * 1.0 + z) * Math.cos(y * 1.0 + z) * Math.sin(z) * 0.5 +
          0.5 +
          Math.sin(x * 2.3 + z * 1.5) * Math.cos(y * 2.3 + z * 1.5) * 0.25 +
          Math.sin(x * 5.6 + z * 2.2) * Math.cos(y * 5.6 + z * 2.2) * 0.125) /
        1.75
      );
    }

    // Helper function to parse color strings
    function parseColor(color: string): { r: number; g: number; b: number } {
      // Handle hex color strings
      if (color.startsWith("#")) {
        const hex = color.replace("#", "");
        return {
          r: parseInt(hex.substr(0, 2), 16),
          g: parseInt(hex.substr(2, 2), 16),
          b: parseInt(hex.substr(4, 2), 16),
        };
      }

      // Handle rgb/rgba strings
      if (color.startsWith("rgb")) {
        const values = color.match(/\d+/g);
        if (values && values.length >= 3) {
          return {
            r: parseInt(values[0]),
            g: parseInt(values[1]),
            b: parseInt(values[2]),
          };
        }
      }

      // Default to white if parsing fails
      return { r: 255, g: 255, b: 255 };
    }

    // Particle class - follows the flow field
    class Particle {
      x: number;
      y: number;
      px: number;
      py: number;
      vx: number;
      vy: number;
      speed: number;
      age: number;
      lifetime: number;
      color: string;
      size: number;
      id: number;

      constructor(id: number) {
        this.id = id;
        this.reset(true);
        this.size = params.lineWidth * (0.7 + Math.random() * 0.6);
        this.speed = params.particleSpeed * (0.5 + Math.random() * 1.0);
      }

      reset(initial = false) {
        // Starting position - random in canvas
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.px = this.x; // Previous x - for line drawing
        this.py = this.y; // Previous y
        this.vx = 0; // Velocity x
        this.vy = 0; // Velocity y
        this.age = 0;
        this.lifetime = params.particleLifetime;

        // Set color based on selected mode - FIX: Use proper primaryColor for solid mode
        this.updateColor();
      }

      // Update color based on settings
      updateColor() {
        switch (params.colorMode) {
          case "solid":
            // Use primaryColor directly
            this.color = params.primaryColor;
            break;
          case "flow":
            // Random hue for flow mode
            const hue = Math.random() * 360;
            this.color = `hsl(${hue}, 100%, 80%)`;
            break;
          case "speed":
            // Initial color - will be updated during update()
            this.color = params.primaryColor;
            break;
          case "position":
            // Initial color - will be updated during update()
            this.color = params.primaryColor;
            break;
        }
      }

      // Follow flow field like in Processing examples
      follow(flowField: any[]) {
        // Find grid cell position
        const x = Math.floor(this.x / scl);
        const y = Math.floor(this.y / scl);

        // Get index in flow field array
        const index = x + y * cols;

        // Check if within bounds
        if (index >= 0 && index < flowField.length) {
          const force = flowField[index];

          // Apply force with better physics
          const targetVx = force.x * this.speed;
          const targetVy = force.y * this.speed;

          // Smooth interpolation for more natural movement
          this.vx = this.vx * 0.9 + targetVx * 0.1;
          this.vy = this.vy * 0.9 + targetVy * 0.1;
        }
      }

      update() {
        // Save previous position for line drawing
        this.px = this.x;
        this.py = this.y;

        // Update position with velocity
        this.x += this.vx;
        this.y += this.vy;

        // Update age
        this.age++;

        // Check lifetime if not infinite
        if (this.lifetime > 0 && this.age > this.lifetime) {
          this.reset();
        }

        // Edge checking like in Processing examples
        if (params.loopEdges) {
          // Wrap around edges
          if (this.x < 0) this.x = canvas.width;
          if (this.x > canvas.width) this.x = 0;
          if (this.y < 0) this.y = canvas.height;
          if (this.y > canvas.height) this.y = 0;

          // If position warped, update previous position to avoid lines across screen
          if (
            Math.abs(this.x - this.px) > canvas.width / 2 ||
            Math.abs(this.y - this.py) > canvas.height / 2
          ) {
            this.px = this.x;
            this.py = this.y;
          }
        } else {
          // Reset when out of bounds
          if (
            this.x < -10 ||
            this.x > canvas.width + 10 ||
            this.y < -10 ||
            this.y > canvas.height + 10
          ) {
            this.reset();
          }
        }

        // Update color if using dynamic modes
        if (params.colorMode === "speed") {
          // Color based on particle speed
          const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          const normalizedSpeed = Math.min(
            1,
            speed / (params.particleSpeed * 2)
          );
          const hue = normalizedSpeed * 240; // Blue to red
          this.color = `hsl(${hue}, 100%, 50%)`;
        } else if (params.colorMode === "position") {
          // Color based on position
          const nx = this.x / canvas.width;
          const ny = this.y / canvas.height;
          const hue = ((nx + ny) * 180) % 360;
          this.color = `hsl(${hue}, 100%, 50%)`;
        }
      }

      display() {
        // Different rendering styles
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = this.size;

        switch (params.particleStyle) {
          case "circles":
            // Draw as circles
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            break;

          case "points":
            // Small points (more like Processing's point function)
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            break;

          case "curves":
            // Attempt curved lines (simplified)
            // This approximates Processing's curveVertex
            if ((window as any).curvePoints === undefined) {
              (window as any).curvePoints = {};
            }

            if ((window as any).curvePoints[this.id] === undefined) {
              (window as any).curvePoints[this.id] = [];
            }

            const points = (window as any).curvePoints[this.id];
            points.push({ x: this.x, y: this.y });

            // Keep a reasonable number of points
            if (points.length > 4) {
              points.shift();
            }

            // Need at least 3 points for quadratic curve
            if (points.length >= 3) {
              ctx.beginPath();
              ctx.moveTo(points[0].x, points[0].y);

              // Draw curved path through points
              for (let i = 1; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
              }

              ctx.stroke();
            }
            break;

          case "lines":
          default:
            // Draw a line from previous to current position
            // Most like Processing's typical particle line
            ctx.beginPath();
            ctx.moveTo(this.px, this.py);
            ctx.lineTo(this.x, this.y);
            ctx.stroke();
            break;
        }
      }
    }

    // Create or update particles
    let particles: any[] = [];

    // Use global particles array if it exists, otherwise create new
    if (!(window as any).flowFieldParticles) {
      (window as any).flowFieldParticles = Array(params.particleCount)
        .fill(null)
        .map((_, i) => new Particle(i));
    }

    // Get particles from global store
    particles = (window as any).flowFieldParticles;

    // Update particle count if needed
    if (particles.length < params.particleCount) {
      // Add more particles
      const oldLength = particles.length;
      for (let i = oldLength; i < params.particleCount; i++) {
        particles.push(new Particle(i));
      }
    } else if (particles.length > params.particleCount) {
      // Remove excess particles
      particles = particles.slice(0, params.particleCount);
    }

    // If primary color changed, update all particle colors in solid mode
    if (paramsChanged && params.colorMode === "solid") {
      particles.forEach((p) => p.updateColor());
    }

    // Update global store
    (window as any).flowFieldParticles = particles;

    // Update and draw particles
    particles.forEach((particle) => {
      // Skip update if not animated
      if (params.animated) {
        particle.follow(flowField);
        particle.update();
      }

      // Always display, even when not animated
      particle.display();
    });
  },
};

// Helper to convert hex color to rgb
function hexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Parse hex values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `${r}, ${g}, ${b}`;
}

// Export as both default and named export to ensure compatibility
export default flowFieldAlgorithm;
