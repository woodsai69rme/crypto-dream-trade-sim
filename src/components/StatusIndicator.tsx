
import React from 'react';

interface StatusIndicatorProps {
  isActive: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const StatusIndicator = ({ 
  isActive, 
  label, 
  size = 'sm', 
  showLabel = true 
}: StatusIndicatorProps) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          ${isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'} 
          shadow-lg
          ${isActive ? 'shadow-green-400/50' : 'shadow-red-400/50'}
        `}
      />
      {showLabel && label && (
        <span className={`text-xs ${isActive ? 'text-green-400' : 'text-red-400'}`}>
          {label}
        </span>
      )}
    </div>
  );
};
