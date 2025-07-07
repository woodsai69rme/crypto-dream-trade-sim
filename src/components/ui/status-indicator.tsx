import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: 'success' | 'error' | 'loading' | 'idle';
  message?: string;
  className?: string;
}

export const StatusIndicator = ({ status, message, className }: StatusIndicatorProps) => {
  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'loading':
        return <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />;
      default:
        return null;
    }
  };

  const getColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'loading':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  if (status === 'idle') return null;

  return (
    <div className={cn('flex items-center gap-2 text-sm', getColor(), className)}>
      {getIcon()}
      {message && <span>{message}</span>}
    </div>
  );
};