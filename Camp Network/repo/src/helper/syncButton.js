import React from 'react';
import { Loader2 } from 'lucide-react';

const SyncToggleButton = ({
  isEnabled,
  onClick,
  disabled = false,
  label,
  status,
  customColors = {
    button: 'bg-orange-500',
    toggle: 'bg-cyan-500'
  }
}) => {
  const getButtonText = () => {
    if (status === true) return "Synced";
    if (isEnabled) return "Syncing";
    return "Sync";
  };

  const getBackgroundColor = () => {
    if (disabled) return 'bg-gray-100';
    if (status === true) return 'bg-green-200';
    if (isEnabled) return 'bg-orange-200';
    return 'bg-gray-200';
  };

  return (
    <div className="flex items-center justify-between w-full px-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300
        ${getBackgroundColor()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${status ? 'text-green-700' : isEnabled ? 'text-orange-700' : 'text-gray-700'}`}>
            {getButtonText()}
          </span>
          {isEnabled && !status && (
            <Loader2 className="w-3 h-3 animate-spin text-orange-600" />
          )}
          {status && (
            <span className="text-green-500">✓</span>
          )}
        </div>
        <div
          className={`relative inline-flex h-7 w-14 items-center rounded-full 
          transition-all duration-300 ease-in-out focus:outline-none ring-2 
          ring-cyan-500 ring-offset-2 ${
            isEnabled ? customColors.toggle : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white 
              shadow-lg transition-transform duration-300 ease-in-out ${
              isEnabled ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </div>
      </button>
    </div>
  );
};

export default SyncToggleButton;