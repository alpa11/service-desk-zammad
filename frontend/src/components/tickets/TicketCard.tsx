import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../common/StatusBadge';
import type { Ticket } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface TicketCardProps {
  ticket: Ticket;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const { user } = useAuth();
  const canManage = user?.role !== 'secretary';

  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <StatusBadge status={ticket.status} display={ticket.status_display} />
            <span className="text-sm text-gray-500">#{ticket.id}</span>
          </div>
          <span className="text-sm text-gray-500">{formatDate(ticket.created_at)}</span>
        </div>

        <div className="mt-2">
          <p className="text-sm font-medium text-gray-900">
            {ticket.branch.name}
          </p>
          <p className="text-sm text-gray-600">
            {ticket.issue_type.name}
            {ticket.floor && ` • ${ticket.floor}`}
            {ticket.room && ` • ${ticket.room}`}
          </p>
        </div>

        <p className="mt-2 text-sm text-gray-700 line-clamp-2">
          {ticket.description}
        </p>

        {canManage && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              נפתח ע"י: {ticket.created_by.name}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
};
