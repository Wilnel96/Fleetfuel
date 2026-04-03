import { useState, useEffect } from 'react';
import { Truck, Users, FileText, Store, Settings, BarChart3, LogOut, ArrowLeft, DollarSign } from 'lucide-react';

interface ClientDashboardProps {
  onNavigate: (view: string) => void;
  onSignOut: () => void;
  initialView?: 'main' | 'reports' | 'invoices';
  resetSubmenu?: boolean;
  paymentOption?: string | null;
}

export default function ClientDashboard({ onNavigate, onSignOut, initialView = 'main', resetSubmenu, paymentOption }: ClientDashboardProps) {
  const [showReportsMenu, setShowReportsMenu] = useState(initialView === 'reports');
  const [showInvoicesMenu, setShowInvoicesMenu] = useState(initialView === 'invoices');

  // Reset submenu when parent requests it
  useEffect(() => {
    if (resetSubmenu) {
      setShowReportsMenu(false);
      setShowInvoicesMenu(false);
    }
  }, [resetSubmenu]);

  // Update showReportsMenu when initialView changes
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
        color: 'blue',
      },
      {
        id: 'fuel-invoices',
        title: 'Fuel Invoices',
        description: 'Individual fuel transaction invoices',
        icon: FileText,
        color: 'green',
      },
    ];

    const getColorClasses = (color: string) => {
      const colors: Record<string, { bg: string; hover: string; icon: string }> = {
        blue: { bg: 'bg-blue-100', hover: 'group-hover:bg-blue-600', icon: 'text-blue-600' },
        green: { bg: 'bg-green-100', hover: 'group-hover:bg-green-600', icon: 'text-green-600' },
      };
      return colors[color] || colors.blue;
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-gray-700" />
            <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
          </div>
          <button
            onClick={() => setShowInvoicesMenu(false)}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 px-3 py-1.5 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Main Menu
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
        {invoicesMenuItems.map((item) => {
          const Icon = item.icon;
          const colors = getColorClasses(item.color);

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center ${colors.hover} transition-colors`}>
                  <Icon className={`w-6 h-6 ${colors.icon} group-hover:text-white transition-colors`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
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
        description: 'View standard reports and analytics',
        icon: FileText,
        color: 'blue',
      },
      {
        id: 'custom-reports',
        title: 'Custom Report Builder',
        description: 'Build custom reports from any data',
        icon: BarChart3,
        color: 'green',
      },
    ];

    const getColorClasses = (color: string) => {
      const colors: Record<string, { bg: string; hover: string; icon: string }> = {
        blue: { bg: 'bg-blue-100', hover: 'group-hover:bg-blue-600', icon: 'text-blue-600' },
        green: { bg: 'bg-green-100', hover: 'group-hover:bg-green-600', icon: 'text-green-600' },
      };
      return colors[color] || colors.blue;
    };

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

        <div className="grid gap-4 md:grid-cols-2">
        {reportsMenuItems.map((item) => {
          const Icon = item.icon;
          const colors = getColorClasses(item.color);

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center ${colors.hover} transition-colors`}>
                  <Icon className={`w-6 h-6 ${colors.icon} group-hover:text-white transition-colors`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
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

  const menuItems = [
    {
      id: 'vehicles',
      title: 'Vehicles',
      description: 'Manage your fleet vehicles',
      icon: Truck,
      color: 'blue',
    },
    {
      id: 'drivers',
      title: 'Drivers',
      description: 'Manage your drivers',
      icon: Users,
      color: 'green',
    },
    {
      id: 'garages',
      title: 'Garages',
      description: 'View garage network',
      icon: Store,
      color: 'orange',
    },
    {
      id: 'invoices-menu',
      title: 'Invoices',
      description: 'View and manage invoices',
      icon: DollarSign,
      color: 'cyan',
    },
    {
      id: 'reports-menu',
      title: 'Reports',
      description: 'View reports and analytics',
      icon: FileText,
      color: 'amber',
    },
    {
      id: 'backoffice',
      title: 'Back Office',
      description: 'Organization settings and management',
      icon: Settings,
      color: 'gray',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; hover: string; icon: string }> = {
      blue: { bg: 'bg-blue-100', hover: 'group-hover:bg-blue-600', icon: 'text-blue-600' },
      green: { bg: 'bg-green-100', hover: 'group-hover:bg-green-600', icon: 'text-green-600' },
      orange: { bg: 'bg-orange-100', hover: 'group-hover:bg-orange-600', icon: 'text-orange-600' },
      cyan: { bg: 'bg-cyan-100', hover: 'group-hover:bg-cyan-600', icon: 'text-cyan-600' },
      amber: { bg: 'bg-amber-100', hover: 'group-hover:bg-amber-600', icon: 'text-amber-600' },
      gray: { bg: 'bg-gray-100', hover: 'group-hover:bg-gray-600', icon: 'text-gray-600' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const colors = getColorClasses(item.color);

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
            className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center ${colors.hover} transition-colors`}>
                <Icon className={`w-6 h-6 ${colors.icon} group-hover:text-white transition-colors`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          </button>
        );
      })}

      <button
        onClick={onSignOut}
        className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 hover:border-red-500 hover:shadow-md transition-all text-left group md:col-span-2"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-600 transition-colors">
            <LogOut className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Sign Out</h3>
            <p className="text-sm text-gray-600">End your session and return to login</p>
          </div>
        </div>
      </button>
    </div>
  );
}
