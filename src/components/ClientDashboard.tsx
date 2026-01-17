import { useState, useEffect } from 'react';
import { Truck, Users, FileText, Store, Settings, BarChart3, LogOut, ArrowLeft, DollarSign, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ClientDashboardProps {
  onNavigate: (view: string) => void;
  onSignOut: () => void;
  initialView?: 'main' | 'reports' | 'invoices';
  resetSubmenu?: boolean;
}

export default function ClientDashboard({ onNavigate, onSignOut, initialView = 'main', resetSubmenu }: ClientDashboardProps) {
  const [showReportsMenu, setShowReportsMenu] = useState(initialView === 'reports');
  const [showInvoicesMenu, setShowInvoicesMenu] = useState(initialView === 'invoices');
  const [paymentOption, setPaymentOption] = useState<string | null>(null);

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

  // Load payment option
  useEffect(() => {
    loadPaymentOption();
  }, []);

  const loadPaymentOption = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('payment_option')
          .eq('id', profile.organization_id)
          .maybeSingle();

        if (org) {
          setPaymentOption(org.payment_option);
        }
      }
    } catch (err) {
      console.error('Error loading payment option:', err);
    }
  };

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
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 px-3 py-1.5 text-sm"
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
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Icon className="w-6 h-6 text-blue-600" />
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
    // Only show NFC Payment Card if payment option is Card Payment
    ...(paymentOption === 'Card Payment' ? [{
      id: 'payment-card',
      title: 'NFC Payment Card',
      icon: CreditCard,
    }] : []),
    {
      id: 'invoices-menu',
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
                onNavigate(item.id);
              } else if (item.id === 'invoices-menu') {
                setShowInvoicesMenu(true);
                onNavigate(item.id);
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
