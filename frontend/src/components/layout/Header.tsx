import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface HeaderProps {
  onMenuClick: () => void;
}

const roleDisplayNames: Record<string, string> = {
  secretary: 'מזכירה',
  housekeeper: 'אב בית',
  technician: 'טכנאי',
  admin: 'מנהל מערכת',
};

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={onMenuClick}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 mr-4">
              מערכת ניהול תחזוקה
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role ? roleDisplayNames[user.role] : ''}
              </p>
            </div>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              התנתק
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
