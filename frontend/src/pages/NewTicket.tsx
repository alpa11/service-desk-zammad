import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TicketForm } from '../components/tickets/TicketForm';
import { useCreateTicket } from '../hooks/useTickets';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export const NewTicket: React.FC = () => {
  const navigate = useNavigate();
  const createTicket = useCreateTicket();

  const handleSubmit = async (data: Parameters<typeof createTicket.mutateAsync>[0]) => {
    await createTicket.mutateAsync(data);
    navigate('/tickets');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          to="/tickets"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowRightIcon className="h-4 w-4 ml-1" />
          חזרה לקריאות
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">פתיחת קריאה חדשה</h1>
        <TicketForm onSubmit={handleSubmit} isLoading={createTicket.isPending} />
      </div>
    </div>
  );
};
