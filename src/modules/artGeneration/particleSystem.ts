/**
 * Particle System Generative Art Algorithm
 *
 * Creates dynamic particle interactions with various forces,
 * including gravity, attraction/repulsion, and wind.
 */

import { Algorithm, AlgorithmParameter } from "../../stores/artworkStore";

// Algorithm parameters
const parameters: AlgorithmParameter[] = [
  {
    id: "particleCount",
    name: "Particle Count",
    type: "number",
    default: 500,
    min: 50,
    max: 2000,
    step: 50,
    description: "Number of particles in the system",
  },
  {
    id: "particleSize",
    name: "Particle Size",
    type: "range",
    default: 2,
    min: 1,
    max: 10,
    step: 0.5,
    description: "Size of each particle",
  },
  {
    id: "gravity",
    name: "Gravity",
    type: "range",
    default: 0.1,
    min: -1,
    max: 1,
    step: 0.1,
    description: "Gravitational force (negative for upward)",
  },
  {
    id: "windForce",
    name: "Wind Force",
    type: "range",
    default: 0,
    min: -1,
    max: 1,
    step: 0.1,
    description: "Horizontal wind force",
  },
  {
    id: "attraction",
    name: "Attraction Force",
    type: "range",
    default: 0,
    min: -0.5,
    max: 0.5,
    step: 0.05,
    description: "Attraction/repulsion between particles",
  },
  {
    id: "velocityDamping",
    name: "Velocity Damping",
    type: "range",
    default: 0.99,
    min: 0.9,
    max: 1,
    step: 0.01,
    description: "Velocity decay factor",
  },
  {
    id: "showTrails",
    name: "Show Trails",
    type: "boolean",
    default: true,
    description: "Show particle movement trails",
  },
  {
    id: "trailFade",
    name: "Trail Fade",
    type: "range",
    default: 0.05,
    min: 0.01,
    max: 0.2,
    step: 0.01,
    description: "How quickly trails fade",
  },
  {
    id: "colorMode",
    name: "Color Mode",
    type: "select",
    default: "velocity",
    options: [
      { value: "velocity", label: "Velocity Based" },
      { value: "position", label: "Position Based" },
      { value: "static", label: "Static Color" },
    ],
    description: "How particles are colored",
  },
  {
    id: "staticColor",
    name: "Static Color",
    type: "color",
    default: "#ffffff",
    description: "Color when using static color mode",
  },
];

// Particle system algorithm implementation
export const particleSystemAlgorithm: Algorithm = {
  id: "particle-system",
  name: "Particle System",
  description: "Dynamic particle interactions with gravity, wind, and forces",
  category: "physics",
  parameters,
  draw: (canvas: HTMLCanvasElement, params: Record<string, any>) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    // Clear canvas with trail effect
    if (params.showTrails) {
      ctx.fillStyle = `rgba(0, 0, 0, ${params.trailFade})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Particle class
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.size = params.particleSize + Math.random() * params.particleSize;
      }

      update(particles: Particle[]) {
        // Apply gravity
        this.vy += params.gravity;

        // Apply wind
        this.vx += params.windForce;

        // Apply inter-particle forces
        if (params.attraction !== 0) {
          particles.forEach((other) => {
            if (other === this) return;

            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0 && distance < 100) {
              const force = params.attraction / distance;
              this.vx += (dx / distance) * force;
              this.vy += (dy / distance) * force;
            }
          });
        }

        // Apply damping
        this.vx *= params.velocityDamping;
        this.vy *= params.velocityDamping;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < this.size) {
          this.x = this.size;
          this.vx *= -0.8;
        }
        if (this.x > canvas.width - this.size) {
          this.x = canvas.width - this.size;
          this.vx *= -0.8;
        }
        if (this.y < this.size) {
          this.y = this.size;
          this.vy *= -0.8;
        }
        if (this.y > canvas.height - this.size) {
          this.y = canvas.height - this.size;
          this.vy *= -0.8;
        }
      }

      draw() {
        // Calculate color based on mode
        let color: string;

        switch (params.colorMode) {
          case "velocity":
            const velocity = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const hue = (velocity * 20) % 360;
            color = `hsl(${hue}, 100%, 50%)`;
            break;

          case "position":
            const hueX = (this.x / canvas.width) * 360;
            const hueY = (this.y / canvas.height) * 50 + 25;
            color = `hsl(${hueX}, 100%, ${hueY}%)`;
            break;

          case "static":
          default:
            color = params.staticColor;
            break;
        }

        // Draw particle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw velocity indicator
        if (params.attraction !== 0) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + this.vx * 10, this.y + this.vy * 10);
          ctx.stroke();
        }
      }
    }

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < params.particleCount; i++) {
      particles.push(new Particle());
    }

    // Update and draw particles
    particles.forEach((particle) => {
      particle.update(particles);
      particle.draw();
    });
  },
};

export default particleSystemAlgorithm;
