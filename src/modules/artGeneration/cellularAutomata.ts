/**
 * Cellular Automata Generative Art Algorithm
 *
 * Implements rule-based cellular automata like Conway's Game of Life
 * and other similar systems for generating patterns.
 */

import { Algorithm, AlgorithmParameter } from "../../stores/artworkStore";

// Algorithm parameters
const parameters: AlgorithmParameter[] = [
  {
    id: "rule",
    name: "CA Rule",
    type: "select",
    default: "gameOfLife",
    options: [
      { value: "gameOfLife", label: "Conway's Game of Life" },
      { value: "briansBrain", label: "Brian's Brain" },
      { value: "wireWorld", label: "Wire World" },
      { value: "elementary", label: "Elementary CA" },
    ],
    description: "Type of cellular automaton to simulate",
  },
  {
    id: "cellSize",
    name: "Cell Size",
    type: "range",
    default: 5,
    min: 1,
    max: 20,
    step: 1,
    description: "Size of each cell in pixels",
  },
  {
    id: "initialDensity",
    name: "Initial Density",
    type: "range",
    default: 0.3,
    min: 0.1,
    max: 0.9,
    step: 0.05,
    description: "Initial density of live cells",
  },
  {
    id: "stepsPerFrame",
    name: "Steps Per Frame",
    type: "number",
    default: 1,
    min: 1,
    max: 10,
    step: 1,
    description: "Number of simulation steps per frame",
  },
  {
    id: "primaryColor",
    name: "Primary Color",
    type: "color",
    default: "#00FF00",
    description: "Color for live cells",
  },
  {
    id: "secondaryColor",
    name: "Secondary Color",
    type: "color",
    default: "#0000FF",
    description: "Color for secondary state (e.g., dying cells)",
  },
  {
    id: "backgroundColor",
    name: "Background Color",
    type: "color",
    default: "#000000",
    description: "Color for dead/empty cells",
  },
  {
    id: "elementaryRule",
    name: "Elementary Rule",
    type: "number",
    default: 30,
    min: 0,
    max: 255,
    step: 1,
    description: "Rule number for elementary CA (0-255)",
  },
  {
    id: "wrap",
    name: "Wrap Edges",
    type: "boolean",
    default: true,
    description: "Whether the grid wraps around at the edges",
  },
  {
    id: "symmetry",
    name: "Symmetrical Start",
    type: "boolean",
    default: false,
    description: "Start with symmetrical initial conditions",
  },
];

// Cellular automata algorithm implementation
export const cellularAutomataAlgorithm: Algorithm = {
  id: "cellular-automata",
  name: "Cellular Automata",
  description:
    "Rule-based grid simulations creating complex patterns from simple rules",
  category: "simulation",
  parameters,
  draw: (canvas: HTMLCanvasElement, params: Record<string, any>) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    // Set background
    ctx.fillStyle = params.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate grid dimensions
    const cellSize = params.cellSize;
    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.floor(canvas.height / cellSize);

    // Initialize grid with random values based on density
    let grid: number[][] = [];
    for (let y = 0; y < rows; y++) {
      grid[y] = [];
      for (let x = 0; x < cols; x++) {
        if (params.symmetry && x > cols / 2) {
          // Mirror for symmetry
          grid[y][x] = grid[y][cols - x - 1];
        } else {
          grid[y][x] = Math.random() < params.initialDensity ? 1 : 0;
        }
      }
    }

    // Special initialization for elementary CA
    if (params.rule === "elementary") {
      // Clear grid
      grid = Array(rows)
        .fill(0)
        .map(() => Array(cols).fill(0));

      // Start with a single cell in the middle of the top row
      grid[0][Math.floor(cols / 2)] = 1;
    }

    // Implement rule-specific update functions
    const updateFunctions = {
      // Conway's Game of Life rules
      gameOfLife: (grid: number[][]): number[][] => {
        const nextGrid = Array(rows)
          .fill(0)
          .map(() => Array(cols).fill(0));

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            // Count live neighbors
            let neighbors = 0;
            for (let i = -1; i <= 1; i++) {
              for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue; // Skip self

                let nx = x + i;
                let ny = y + j;

                // Handle edge wrapping
                if (params.wrap) {
                  nx = (nx + cols) % cols;
                  ny = (ny + rows) % rows;
                }

                // Count only if within bounds
                if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                  neighbors += grid[ny][nx] === 1 ? 1 : 0;
                }
              }
            }

            // Apply Game of Life rules
            if (grid[y][x] === 1) {
              // Live cell
              nextGrid[y][x] = neighbors === 2 || neighbors === 3 ? 1 : 0;
            } else {
              // Dead cell
              nextGrid[y][x] = neighbors === 3 ? 1 : 0;
            }
          }
        }

        return nextGrid;
      },

      // Brian's Brain (3-state CA: 0=dead, 1=alive, 2=dying)
      briansBrain: (grid: number[][]): number[][] => {
        const nextGrid = Array(rows)
          .fill(0)
          .map(() => Array(cols).fill(0));

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            if (grid[y][x] === 1) {
              // Alive cells become dying
              nextGrid[y][x] = 2;
            } else if (grid[y][x] === 2) {
              // Dying cells become dead
              nextGrid[y][x] = 0;
            } else {
              // Count live neighbors for dead cells
              let neighbors = 0;
              for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                  if (i === 0 && j === 0) continue; // Skip self

                  let nx = x + i;
                  let ny = y + j;

                  // Handle edge wrapping
                  if (params.wrap) {
                    nx = (nx + cols) % cols;
                    ny = (ny + rows) % rows;
                  }

                  // Count only if within bounds
                  if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                    neighbors += grid[ny][nx] === 1 ? 1 : 0;
                  }
                }
              }

              // Dead cell with exactly 2 neighbors becomes alive
              nextGrid[y][x] = neighbors === 2 ? 1 : 0;
            }
          }
        }

        return nextGrid;
      },

      // WireWorld (4-state CA: 0=empty, 1=electron head, 2=electron tail, 3=conductor)
      wireWorld: (grid: number[][]): number[][] => {
        const nextGrid = Array(rows)
          .fill(0)
          .map(() => Array(cols).fill(0));

        // Convert the initial random grid to WireWorld states
        if (grid[0][0] === 0 || grid[0][0] === 1) {
          // First time running, convert binary grid to WireWorld
          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              // Convert 1s to conductors (3) and add some electron heads (1)
              if (grid[y][x] === 1) {
                grid[y][x] = Math.random() < 0.1 ? 1 : 3;
              }
            }
          }
        }

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            switch (grid[y][x]) {
              case 0: // Empty stays empty
                nextGrid[y][x] = 0;
                break;
              case 1: // Electron head becomes electron tail
                nextGrid[y][x] = 2;
                break;
              case 2: // Electron tail becomes conductor
                nextGrid[y][x] = 3;
                break;
              case 3: // Conductor with 1-2 electron head neighbors becomes electron head
                let headCount = 0;
                for (let i = -1; i <= 1; i++) {
                  for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue; // Skip self

                    let nx = x + i;
                    let ny = y + j;

                    // Handle edge wrapping
                    if (params.wrap) {
                      nx = (nx + cols) % cols;
                      ny = (ny + rows) % rows;
                    }

                    // Count only if within bounds
                    if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                      headCount += grid[ny][nx] === 1 ? 1 : 0;
                    }
                  }
                }

                nextGrid[y][x] = headCount === 1 || headCount === 2 ? 1 : 3;
                break;
            }
          }
        }

        return nextGrid;
      },

      // Elementary Cellular Automaton (1D CA with binary states)
      elementary: (grid: number[][]): number[][] => {
        const nextGrid = Array(rows)
          .fill(0)
          .map(() => Array(cols).fill(0));

        // Copy the existing grid
        for (let y = 0; y < rows - 1; y++) {
          nextGrid[y] = [...grid[y + 1]];
        }

        // Generate the next row based on elementary CA rules
        const ruleTable = params.elementaryRule
          .toString(2)
          .padStart(8, "0")
          .split("")
          .map((bit) => parseInt(bit));

        for (let x = 0; x < cols; x++) {
          const left =
            x === 0
              ? params.wrap
                ? grid[rows - 1][cols - 1]
                : 0
              : grid[rows - 1][x - 1];
          const center = grid[rows - 1][x];
          const right =
            x === cols - 1
              ? params.wrap
                ? grid[rows - 1][0]
                : 0
              : grid[rows - 1][x + 1];

          // Convert neighborhood to rule table index
          const idx = (left << 2) | (center << 1) | right;

          // Apply the rule
          nextGrid[rows - 1][x] = ruleTable[7 - idx];
        }

        return nextGrid;
      },
    };

    // Run the simulation for multiple steps
    for (let i = 0; i < params.stepsPerFrame; i++) {
      // Update grid based on selected rule
      grid = updateFunctions[params.rule](grid);
    }

    // Draw the grid
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cellValue = grid[y][x];

        // Set color based on cell state and rule
        let cellColor;
        if (params.rule === "briansBrain") {
          if (cellValue === 1) cellColor = params.primaryColor;
          else if (cellValue === 2) cellColor = params.secondaryColor;
          else cellColor = params.backgroundColor;
        } else if (params.rule === "wireWorld") {
          if (cellValue === 1) cellColor = "#ff0000"; // Electron head (red)
          else if (cellValue === 2)
            cellColor = "#0000ff"; // Electron tail (blue)
          else if (cellValue === 3) cellColor = "#ffcc00"; // Conductor (yellow)
          else cellColor = params.backgroundColor;
        } else {
          cellColor = cellValue ? params.primaryColor : params.backgroundColor;
        }

        // Draw the cell
        ctx.fillStyle = cellColor;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  },
};

export default cellularAutomataAlgorithm;
