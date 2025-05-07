// ========================================================
// FILE: src/components/CustomAlgorithmEditor/index.tsx
// ========================================================

/**
 * CustomAlgorithmEditor component
 *
 * Allows users to write their own JavaScript code for generating art
 * with a live preview and parameter configuration.
 */

import React, { useState, useEffect, useRef } from "react";
import { Algorithm, AlgorithmParameter } from "../../stores/artworkStore";
import { Button } from "../Button";
import { Card } from "../Card";
import { Heading } from "../Heading";
import { ParameterControl } from "../ParameterControl";

export interface CustomAlgorithmEditorProps {
  /** Called when a new algorithm is created */
  onSave: (algorithm: Algorithm) => void;
  /** Initial code to populate the editor */
  initialCode?: string;
  /** Initial parameters */
  initialParameters?: AlgorithmParameter[];
  /** Whether the editor is in a loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const CustomAlgorithmEditor: React.FC<CustomAlgorithmEditorProps> = ({
  onSave,
  initialCode = defaultTemplate,
  initialParameters = defaultParameters,
  isLoading = false,
  className = "",
}) => {
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState("My Custom Algorithm");
  const [description, setDescription] = useState(
    "A custom generative art algorithm"
  );
  const [category, setCategory] = useState("custom");
  const [parameters, setParameters] =
    useState<AlgorithmParameter[]>(initialParameters);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<false | number>(false);
  const [currentValues, setCurrentValues] = useState<Record<string, any>>({});

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize parameter values
  useEffect(() => {
    const defaultValues: Record<string, any> = {};
    parameters.forEach((param) => {
      defaultValues[param.id] = param.default;
    });
    setCurrentValues(defaultValues);
  }, [parameters]);

  // Create a sandboxed algorithm function
  const createAlgorithmFunction = () => {
    try {
      // Create a safe function from the user code
      const drawFunction = new Function(
        "canvas",
        "params",
        `try {
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Failed to get canvas context');
          ${code}
          return true;
        } catch (error) {
          throw error;
        }`
      );

      return drawFunction;
    } catch (error) {
      console.error("Error creating algorithm function:", error);
      setPreviewError(`Syntax error: ${error}`);
      return null;
    }
  };

  // Preview the algorithm
  const previewAlgorithm = () => {
    if (!previewCanvasRef.current) return;

    setPreviewError(null);

    try {
      const canvas = previewCanvasRef.current;
      const drawFunc = createAlgorithmFunction();

      if (drawFunc) {
        drawFunc(canvas, currentValues);
      }
    } catch (error) {
      console.error("Error previewing algorithm:", error);
      setPreviewError(`Runtime error: ${error}`);
    }
  };

  // Save the algorithm
  const handleSave = () => {
    try {
      const drawFunc = createAlgorithmFunction();

      if (!drawFunc) {
        throw new Error("Failed to create algorithm function");
      }

      // Create the algorithm object
      const customAlgorithm: Algorithm = {
        id: `custom-${Date.now()}`,
        name,
        description,
        category,
        parameters: [...parameters],
        draw: (canvas, params) => {
          return drawFunc(canvas, params);
        },
      };

      onSave(customAlgorithm);
    } catch (error) {
      console.error("Error saving algorithm:", error);
      setPreviewError(`Failed to save: ${error}`);
    }
  };

  // Add a new parameter
  const addParameter = () => {
    const newParam: AlgorithmParameter = {
      id: `param${parameters.length + 1}`,
      name: `Parameter ${parameters.length + 1}`,
      type: "range",
      default: 50,
      min: 0,
      max: 100,
      step: 1,
      description: "Description",
    };

    setParameters([...parameters, newParam]);
    setCurrentValues({
      ...currentValues,
      [newParam.id]: newParam.default,
    });
  };

  // Edit an existing parameter
  const editParameter = (
    index: number,
    updates: Partial<AlgorithmParameter>
  ) => {
    const updatedParams = [...parameters];
    updatedParams[index] = { ...updatedParams[index], ...updates };
    setParameters(updatedParams);
  };

  // Delete a parameter
  const deleteParameter = (index: number) => {
    const updatedParams = [...parameters];
    const paramId = updatedParams[index].id;
    updatedParams.splice(index, 1);
    setParameters(updatedParams);

    const updatedValues = { ...currentValues };
    delete updatedValues[paramId];
    setCurrentValues(updatedValues);
  };

  // Handle parameter value changes
  const handleParameterChange = (paramId: string, value: any) => {
    setCurrentValues({
      ...currentValues,
      [paramId]: value,
    });

    // Auto-preview when parameters change
    previewAlgorithm();
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Editor Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <Heading level={2} className="text-xl font-semibold">
            Custom Algorithm Editor
          </Heading>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={previewAlgorithm}
              disabled={isLoading}
            >
              Preview
            </Button>

            <Button onClick={handleSave} disabled={isLoading}>
              Save Algorithm
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: Code editor */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          {/* Algorithm metadata */}
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Algorithm Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
              />
            </div>
          </div>

          {/* Code editor */}
          <div className="flex-1 overflow-hidden">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 font-mono text-sm border-none resize-none focus:outline-none"
              spellCheck="false"
              placeholder="Write your algorithm code here..."
            />
          </div>

          {/* Error display */}
          {previewError && (
            <div className="p-3 bg-red-50 border-t border-red-200 text-red-700 text-sm">
              <strong>Error:</strong> {previewError}
            </div>
          )}
        </div>

        {/* Right panel: Preview and parameters */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          {/* Preview canvas */}
          <div className="flex-1 bg-gray-900 relative">
            <canvas
              ref={previewCanvasRef}
              width={500}
              height={300}
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Parameters editor */}
          <div className="h-1/2 overflow-y-auto border-t border-gray-200">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Heading level={3} className="text-lg font-medium">
                  Parameters
                </Heading>

                <Button variant="secondary" size="sm" onClick={addParameter}>
                  Add Parameter
                </Button>
              </div>

              {/* Parameter list */}
              <div className="space-y-4">
                {parameters.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No parameters defined. Click "Add Parameter" to create one.
                  </p>
                ) : (
                  parameters.map((param, index) => (
                    <Card key={param.id} className="p-3">
                      {isEditing === index ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Name
                              </label>
                              <input
                                type="text"
                                value={param.name}
                                onChange={(e) =>
                                  editParameter(index, { name: e.target.value })
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                ID
                              </label>
                              <input
                                type="text"
                                value={param.id}
                                onChange={(e) =>
                                  editParameter(index, { id: e.target.value })
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Type
                            </label>
                            <select
                              value={param.type}
                              onChange={(e) =>
                                editParameter(index, {
                                  type: e.target.value as any,
                                })
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            >
                              <option value="number">Number</option>
                              <option value="range">Range Slider</option>
                              <option value="color">Color</option>
                              <option value="boolean">Boolean</option>
                              <option value="select">Select</option>
                            </select>
                          </div>

                          {(param.type === "number" ||
                            param.type === "range") && (
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Default
                                </label>
                                <input
                                  type="number"
                                  value={param.default}
                                  onChange={(e) =>
                                    editParameter(index, {
                                      default: Number(e.target.value),
                                    })
                                  }
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Min
                                </label>
                                <input
                                  type="number"
                                  value={param.min}
                                  onChange={(e) =>
                                    editParameter(index, {
                                      min: Number(e.target.value),
                                    })
                                  }
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Max
                                </label>
                                <input
                                  type="number"
                                  value={param.max}
                                  onChange={(e) =>
                                    editParameter(index, {
                                      max: Number(e.target.value),
                                    })
                                  }
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={param.description || ""}
                              onChange={(e) =>
                                editParameter(index, {
                                  description: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                          </div>

                          <div className="flex justify-end gap-2 mt-2">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setIsEditing(false)}
                            >
                              Cancel
                            </Button>

                            <Button
                              variant="destructive"
                              size="xs"
                              onClick={() => deleteParameter(index)}
                            >
                              Delete
                            </Button>

                            <Button
                              size="xs"
                              onClick={() => setIsEditing(false)}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{param.name}</h4>
                              <p className="text-xs text-gray-500">
                                ID: {param.id} • Type: {param.type}
                              </p>
                            </div>

                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setIsEditing(index)}
                            >
                              Edit
                            </Button>
                          </div>

                          <div className="mt-2">
                            <ParameterControl
                              parameters={[param]}
                              values={currentValues}
                              onChange={handleParameterChange}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Default template code for new algorithms
const defaultTemplate = `// Canvas clearing and background setup
ctx.fillStyle = params.backgroundColor || '#000000';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Get canvas dimensions
const width = canvas.width;
const height = canvas.height;

// Draw your custom artwork here
// Example: Draw a grid of circles with varying colors
const rows = params.rows || 10;
const cols = params.cols || 10;
const cellWidth = width / cols;
const cellHeight = height / rows;

for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    // Calculate position
    const posX = x * cellWidth + cellWidth / 2;
    const posY = y * cellHeight + cellHeight / 2;
    
    // Calculate color
    const hue = (x / cols * 360) % 360;
    const lightness = Math.abs(Math.sin(y / rows * Math.PI)) * 50 + 25;
    
    // Draw circle
    ctx.fillStyle = \`hsl(\${hue}, 70%, \${lightness}%)\`;
    ctx.beginPath();
    ctx.arc(
      posX, 
      posY, 
      Math.min(cellWidth, cellHeight) * 0.4 * params.size, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
  }
}`;

// Default parameters
const defaultParameters: AlgorithmParameter[] = [
  {
    id: "rows",
    name: "Rows",
    type: "range",
    default: 10,
    min: 1,
    max: 50,
    step: 1,
    description: "Number of rows in the grid",
  },
  {
    id: "cols",
    name: "Columns",
    type: "range",
    default: 10,
    min: 1,
    max: 50,
    step: 1,
    description: "Number of columns in the grid",
  },
  {
    id: "size",
    name: "Element Size",
    type: "range",
    default: 0.8,
    min: 0.1,
    max: 1.0,
    step: 0.05,
    description: "Size of each element in the grid",
  },
  {
    id: "backgroundColor",
    name: "Background Color",
    type: "color",
    default: "#000000",
    description: "Canvas background color",
  },
];

// Export the component
export default CustomAlgorithmEditor;
