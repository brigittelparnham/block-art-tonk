/**
 * ParameterControl component
 *
 * Renders controls for algorithm parameters including:
 * - Sliders for numeric values
 * - Color pickers
 * - Checkboxes for booleans
 * - Select dropdowns
 *
 * @example
 * <ParameterControl
 *   parameters={algorithm.parameters}
 *   values={currentValues}
 *   onChange={handleChange}
 * />
 */

import React from "react";
import { AlgorithmParameter } from "../../stores/artworkStore";
import { Info, RefreshCw } from "lucide-react";
import { Button } from "../Button";

export interface ParameterControlProps {
  /** Parameter definitions from the algorithm */
  parameters: AlgorithmParameter[];
  /** Current parameter values */
  values: Record<string, any>;
  /** Called when a parameter value changes */
  onChange: (paramId: string, value: any) => void;
  /** Whether controls are disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ParameterControl renders UI controls for generative art parameters
 *
 * Features:
 * - Support for multiple input types
 * - Parameter grouping
 * - Reset to defaults
 * - Tooltips with descriptions
 */
export const ParameterControl: React.FC<ParameterControlProps> = ({
  parameters,
  values,
  onChange,
  disabled = false,
  className = "",
}) => {
  // Group parameters by category (optional feature)
  const groupedParameters = parameters.reduce((groups, param) => {
    const category = (param as any).category || "General";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(param);
    return groups;
  }, {} as Record<string, AlgorithmParameter[]>);

  // Reset parameter to default
  const resetParameter = (param: AlgorithmParameter) => {
    onChange(param.id, param.default);
  };

  // Reset all parameters to defaults
  const resetAllParameters = () => {
    parameters.forEach((param) => {
      onChange(param.id, param.default);
    });
  };

  // Render individual parameter control
  const renderControl = (param: AlgorithmParameter) => {
    const value = values[param.id] ?? param.default;

    switch (param.type) {
      case "number":
      case "range":
        return (
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={param.min}
              max={param.max}
              step={param.step || 1}
              value={value}
              onChange={(e) => onChange(param.id, Number(e.target.value))}
              disabled={disabled}
              className="flex-1"
            />
            <input
              type="number"
              min={param.min}
              max={param.max}
              step={param.step || 1}
              value={value}
              onChange={(e) => onChange(param.id, Number(e.target.value))}
              disabled={disabled}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
        );

      case "color":
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(param.id, e.target.value)}
              disabled={disabled}
              className="w-16 h-8 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(param.id, e.target.value)}
              disabled={disabled}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="#000000"
            />
          </div>
        );

      case "boolean":
        return (
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(param.id, e.target.checked)}
              disabled={disabled}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              {value ? "Enabled" : "Disabled"}
            </span>
          </label>
        );

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => onChange(param.id, e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {param.options?.map((option) => (
              <option
                key={option.value || option}
                value={option.value || option}
              >
                {option.label || option}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(param.id, e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
    }
  };

  return (
    <div
      className={`space-y-6 ${className}`}
      data-tutorial="parameter-controls"
    >
      {/* Reset All Button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetAllParameters}
          disabled={disabled}
          className="text-gray-600 hover:text-gray-900"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset All
        </Button>
      </div>

      {/* Parameter Groups */}
      {Object.entries(groupedParameters).map(([category, categoryParams]) => (
        <div key={category} className="space-y-4">
          {Object.keys(groupedParameters).length > 1 && (
            <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
              {category}
            </h3>
          )}

          {/* Parameter List */}
          <div className="space-y-3">
            {categoryParams.map((param) => (
              <div key={param.id} className="space-y-2">
                {/* Parameter Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      {param.name}
                    </label>
                    {param.description && (
                      <button
                        className="group relative"
                        aria-label={`Info for ${param.name}`}
                      >
                        <Info className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        <div className="invisible group-hover:visible absolute -top-2 left-full ml-2 px-3 py-2 text-xs text-white bg-gray-900 rounded-md whitespace-nowrap z-10">
                          {param.description}
                          <div className="absolute top-1/2 right-full -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-gray-900" />
                        </div>
                      </button>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => resetParameter(param)}
                    disabled={disabled}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label={`Reset ${param.name} to default`}
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>

                {/* Parameter Control */}
                <div className="mt-1">{renderControl(param)}</div>

                {/* Current Value Display */}
                {(param.type === "range" || param.type === "number") && (
                  <div className="text-xs text-gray-500">
                    Current: {values[param.id] ?? param.default}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Quick Presets (if available) */}
      {(parameters as any).presets && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Quick Presets
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {(parameters as any).presets.map((preset: any) => (
              <Button
                key={preset.id}
                variant="secondary"
                size="sm"
                onClick={() => {
                  preset.parameters.forEach((param: any) => {
                    onChange(param.id, param.value);
                  });
                }}
                disabled={disabled}
                className="justify-center"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
