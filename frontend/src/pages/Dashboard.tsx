import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../hooks/useTickets';
import { useMyDashboard } from '../hooks/useStatistics';
import { TicketList } from '../components/tickets/TicketList';
import { Button } from '../components/common/Button';
import { PlusIcon } from '@heroicons/react/24/outline';

const StatCard: React.FC<{
  label: string;
  value: number;
  color: 'red' | 'yellow' | 'green' | 'blue';
}> = ({ label, value, color }) => {
  const colorClasses = {
    red: 'bg-red-50 text-red-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
  };

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm">{label}</p>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: ticketsData, isLoading: ticketsLoading } = useTickets({
    status: user?.role === 'secretary' ? undefined : 'open',
    per_page: 6,
  });
  const { data: dashboardData } = useMyDashboard();

  const isSecretary = user?.role === 'secretary';
  const isHousekeeper = user?.role === 'housekeeper' || user?.role === 'technician';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          שלום, {user?.first_name}
        </h1>
        {isSecretary && (
          <Link to="/tickets/new">
            <Button>
              <PlusIcon className="h-5 w-5 ml-2" />
              פתיחת קריאה חדשה
            </Button>
          </Link>
        )}
      </div>

      {isHousekeeper && dashboardData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="קריאות פתוחות" value={dashboardData.open_tickets} color="red" />
          <StatCard label="בטיפול" value={dashboardData.in_progress_tickets} color="yellow" />
          <StatCard label="נסגרו היום" value={dashboardData.closed_today} color="green" />
          <StatCard label="נסגרו השבוע" value={dashboardData.closed_this_week} color="blue" />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isSecretary ? 'הקריאות שלי' : 'קריאות לטיפול'}
          </h2>
          <Link to="/tickets" className="text-sm text-primary-600 hover:text-primary-700">
            צפה בכל הקריאות
          </Link>
        </div>

        <TicketList
          tickets={ticketsData?.tickets || []}
          isLoading={ticketsLoading}
          emptyMessage={
            isSecretary
              ? 'עדיין לא פתחת קריאות'
              : 'אין קריאות פתוחות כרגע'
          }
        />
      </div>
    </div>
  );
};
