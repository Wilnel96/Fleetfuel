import { useState, useEffect } from 'react';
import { Truck, Users, FileText, Store, Settings, BarChart3, LogOut, ArrowLeft, DollarSign, Building2 } from 'lucide-react';

interface ClientAccountDashboardProps {
  onNavigate: (view: string) => void;
  onSignOut: () => void;
  initialView?: 'main' | 'reports' | 'invoices';
  resetSubmenu?: boolean;
}

export default function ClientAccountDashboard({ onNavigate, onSignOut, initialView = 'main', resetSubmenu }: ClientAccountDashboardProps) {
  const [showReportsMenu, setShowReportsMenu] = useState(initialView === 'reports');
  const [showInvoicesMenu, setShowInvoicesMenu] = useState(initialView === 'invoices');

  useEffect(() => {
    if (resetSubmenu) {
      setShowReportsMenu(false);
      setShowInvoicesMenu(false);
    }
  }, [resetSubmenu]);

  useEffect(() => {
    setShowReportsMenu(initialView === 'reports');
    setShowInvoicesMenu(initialView === 'invoices');
  }, [initialView]);

  if (showInvoicesMenu) {
    const invoicesMenuItems = [
      {
        id: 'fee-invoices',
        title: 'Fee Invoices',
        description: 'Monthly subscription and service fees',
        icon: DollarSign,
      },
      {
        id: 'fuel-invoices',
        title: 'Fuel Invoices',
        description: 'Individual fuel transaction invoices',
        icon: FileText,
      },
    ];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-gray-700" />
            <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
          </div>
          <button
            onClick={() => setShowInvoicesMenu(false)}
            className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2 px-3 py-1.5 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Main Menu
          </button>
        </div>

        <div className="space-y-2">
        {invoicesMenuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Icon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            </button>
          );
        })}
        </div>
      </div>
    );
  }

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
            className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2 px-3 py-1.5 text-sm"
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
              <Icon className="w-5 h-5 flex-shrink-0 text-amber-600" />
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
      description: 'Manage your fleet vehicles',
      icon: Truck,
    },
    {
      id: 'drivers',
      title: 'Drivers',
      description: 'Manage drivers and assignments',
      icon: Users,
    },
    {
      id: 'garages',
      title: 'Garage Accounts',
      description: 'Manage local garage accounts and spending limits',
      icon: Store,
    },
    {
      id: 'invoices-menu',
      title: 'Invoices',
      description: 'View payment and fuel invoices',
      icon: DollarSign,
    },
    {
      id: 'reports-menu',
      title: 'Reports',
      description: 'Fuel usage and transaction reports',
      icon: FileText,
    },
    {
      id: 'backoffice',
      title: 'Back Office',
      description: 'Organization settings and configurations',
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8" />
          <h1 className="text-2xl font-bold">MyFuel Accounts</h1>
        </div>
        <p className="text-amber-100">Local garage account management</p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'reports-menu') {
                  setShowReportsMenu(true);
                  onNavigate(item.id);
                } else if (item.id === 'invoices-menu') {
                  setShowInvoicesMenu(true);
                  onNavigate(item.id);
                } else {
                  onNavigate(item.id);
                }
              }}
              className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Icon className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
              </div>
              <p className="text-sm text-gray-600">{item.description}</p>
            </button>
          );
        })}
      </div>

      <button
        onClick={onSignOut}
        className="w-full bg-white hover:bg-red-50 border border-red-200 rounded-lg p-4 text-left transition-colors flex items-center gap-3 mt-6"
      >
        <LogOut className="w-5 h-5 flex-shrink-0 text-red-600" />
        <span className="font-medium text-gray-900">Sign Out</span>
      </button>
    </div>
  );
}
