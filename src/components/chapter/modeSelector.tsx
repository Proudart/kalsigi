
import React from 'react';

interface ModeSelectorProps {
  currentMode: string;
  onModeChange: (mode: string) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  const buttonClass = (buttonMode: string) =>
    `px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm
    ${currentMode === buttonMode
      ? 'bg-primary-600 text-background-50 shadow-md transform scale-105'
      : 'bg-background-200 text-text-700 hover:bg-background-300 hover:text-text-800    '
    }`;

  return (
    <div className="flex justify-center space-x-4 my-4 round-900 rounded-lg ">
      <button
        className={buttonClass('scroll')}
        onClick={() => onModeChange('scroll')}
      >
        Scroll
      </button>
      <button
        className={buttonClass('single')}
        onClick={() => onModeChange('single')}
      >
        Single Image
      </button>
    </div>
  );
};

export default ModeSelector;