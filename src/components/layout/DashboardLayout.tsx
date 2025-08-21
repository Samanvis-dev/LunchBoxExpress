import React from 'react';
import { Truck, Bell, User, LogOut } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
}

export default function DashboardLayout({ children, user, onLogout }: DashboardLayoutProps) {
  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      parent: 'Parent',
      delivery_staff: 'Delivery Partner',
      school_admin: 'School Admin',
      caterer: 'Caterer',
      admin: 'System Admin'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      parent: 'bg-blue-100 text-blue-800',
      delivery_staff: 'bg-green-100 text-green-800',
      school_admin: 'bg-purple-100 text-purple-800',
      caterer: 'bg-orange-100 text-orange-800',
      admin: 'bg-red-100 text-red-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div className="text-xl font-bold text-gray-900">
                LB • LunchBox Express
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  Welcome, {user?.username}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user?.role)}`}>
                  {getRoleDisplayName(user?.role)}
                </div>
              </div>
              
              <button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>

              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-lg">
                  <User className="w-5 h-5" />
                </button>
                
                {/* Dropdown */}
                <div className="invisible group-hover:visible absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      onClick={onLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {children}
      </main>
    </div>
  );
}