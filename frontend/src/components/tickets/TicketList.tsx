import React from 'react';
import { TicketCard } from './TicketCard';
import { Spinner } from '../common/Spinner';
import type { Ticket } from '../../types';

interface TicketListProps {
  tickets: Ticket[];
  isLoading: boolean;
  emptyMessage?: string;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  isLoading,
  emptyMessage = 'אין קריאות להצגה',
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};
