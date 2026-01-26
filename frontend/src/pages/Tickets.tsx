import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../hooks/useTickets';
import { TicketList } from '../components/tickets/TicketList';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import type { TicketStatus } from '../types';

export const Tickets: React.FC = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data: ticketsData, isLoading } = useTickets({
    status: statusFilter || undefined,
    page,
    per_page: 12,
  });

  const isSecretary = user?.role === 'secretary';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">קריאות</h1>
        {isSecretary && (
          <Link to="/tickets/new">
            <Button>
              <PlusIcon className="h-5 w-5 ml-2" />
              קריאה חדשה
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <Select
            options={[
              { value: '', label: 'כל הסטטוסים' },
              { value: 'open', label: 'פתוח' },
              { value: 'in_progress', label: 'בטיפול' },
              { value: 'closed', label: 'סגור' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as TicketStatus | '');
              setPage(1);
            }}
            className="w-48"
          />
          <span className="text-sm text-gray-500">
            {ticketsData?.pagination.total_items || 0} קריאות
          </span>
        </div>
      </div>

      <TicketList
        tickets={ticketsData?.tickets || []}
        isLoading={isLoading}
        emptyMessage="לא נמצאו קריאות"
      />

      {ticketsData && ticketsData.pagination.total_pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            הקודם
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            עמוד {page} מתוך {ticketsData.pagination.total_pages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page === ticketsData.pagination.total_pages}
            onClick={() => setPage((p) => p + 1)}
          >
            הבא
          </Button>
        </div>
      )}
    </div>
  );
};
