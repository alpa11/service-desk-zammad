import React from 'react';
import clsx from 'clsx';
import type { TicketStatus } from '../../types';

interface StatusBadgeProps {
  status: TicketStatus;
  display?: string;
}

const statusConfig: Record<TicketStatus, { bg: string; text: string; label: string; dot: string }> = {
  open: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: 'פתוח',
    dot: 'bg-red-500',
  },
  in_progress: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    label: 'בטיפול',
    dot: 'bg-yellow-500',
  },
  closed: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: 'סגור',
    dot: 'bg-green-500',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, display }) => {
  const config = statusConfig[status];

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.bg,
        config.text
      )}
    >
      <span className={clsx('w-2 h-2 rounded-full ml-1.5', config.dot)} />
      {display || config.label}
    </span>
  );
};
