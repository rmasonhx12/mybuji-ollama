import React from 'react';

const models = ['llama2', 'codellama', 'mistral'];

interface ModelSelectorProps {
  currentModel: string;
  onModelChange: (model: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ currentModel, onModelChange }) => {
  return (
    <select
      value={currentModel}
      onChange={(e) => onModelChange(e.target.value)}
      className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
    >
      {models.map((model) => (
        <option key={model} value={model}>
          {model}
        </option>
      ))}
    </select>
  );
};