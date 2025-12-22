import { useState } from 'react';
import { Truck, Users, FileText, Store, Settings, BarChart3, LogOut, ArrowLeft, DollarSign } from 'lucide-react';

interface ClientDashboardProps {
  onNavigate: (view: string) => void;
  onSignOut: () => void;
  initialView?: 'main' | 'reports';
}

export default function ClientDashboard({ onNavigate, onSignOut, initialView = 'main' }: ClientDashboardProps) {
  const [showReportsMenu, setShowReportsMenu] = useState(initialView === 'reports');

  if (showReportsMenu) {
    const reportsMenuItems = [
      {
        id: 'reports',
        title: 'Reports',
        icon: FileText,
      },
      {
        id: 'custom-reports',
        title: 'Custom Report Builder',
        icon: BarChart3,
      },
    ];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-gray-700" />
            <h1 className="text-xl font-bold text-gray-900">Reports</h1>
          </div>
          <button
            onClick={() => setShowReportsMenu(false)}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 px-3 py-1.5 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Main Menu
          </button>
        </div>

        <div className="space-y-2">
        {reportsMenuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors flex items-center gap-3"
            >
              <Icon className="w-5 h-5 flex-shrink-0 text-blue-600" />
              <span className="font-medium text-gray-900">{item.title}</span>
            </button>
          );
        })}
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      id: 'vehicles',
      title: 'Vehicles',
      icon: Truck,
    },
    {
      id: 'drivers',
      title: 'Drivers',
      icon: Users,
    },
    {
      id: 'garages',
      title: 'Garages',
      icon: Store,
    },
    {
      id: 'invoices',
      title: 'Invoices',
      icon: DollarSign,
    },
    {
      id: 'reports-menu',
      title: 'Reports',
      icon: FileText,
    },
    {
      id: 'backoffice',
      title: 'Back Office',
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'reports-menu') {
                setShowReportsMenu(true);
              } else {
                onNavigate(item.id);
              }
            }}
            className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors flex items-center gap-3"
          >
            <Icon className="w-5 h-5 flex-shrink-0 text-blue-600" />
            <span className="font-medium text-gray-900">{item.title}</span>
          </button>
        );
      })}

      <button
        onClick={onSignOut}
        className="w-full bg-white hover:bg-red-50 border border-gray-200 rounded-lg p-4 text-left transition-colors flex items-center gap-3"
      >
        <LogOut className="w-5 h-5 flex-shrink-0 text-red-600" />
        <span className="font-medium text-gray-900">Sign Out</span>
      </button>
    </div>
  );
}
