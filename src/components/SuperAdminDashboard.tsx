import { Building2, Store, Truck, Users, FileText, BarChart3, Database, DollarSign } from 'lucide-react';

interface SuperAdminDashboardProps {
  onNavigate: (view: string) => void;
}

export default function SuperAdminDashboard({ onNavigate }: SuperAdminDashboardProps) {
  const menuItems = [
    {
      id: 'client-organizations-menu',
      title: 'Client Organizations',
      description: 'Manage client organizations, users, and finances',
      icon: Building2,
      color: 'blue',
    },
    {
      id: 'garages',
      title: 'Garages',
      description: 'Manage garage network',
      icon: Store,
      color: 'green',
    },
    {
      id: 'vehicles',
      title: 'Vehicles',
      description: 'View all client vehicles',
      icon: Truck,
      color: 'orange',
    },
    {
      id: 'drivers',
      title: 'Drivers',
      description: 'View all client drivers',
      icon: Users,
      color: 'cyan',
    },
    {
      id: 'invoices',
      title: 'Invoices',
      description: 'Generate and manage client invoices',
      icon: DollarSign,
      color: 'teal',
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Consolidated system reports',
      icon: FileText,
      color: 'amber',
    },
    {
      id: 'custom-reports',
      title: 'Custom Report Builder',
      description: 'Build custom reports from any table',
      icon: FileText,
      color: 'violet',
    },
    {
      id: 'backoffice',
      title: 'Back Office',
      description: 'System settings and EFT processing',
      icon: BarChart3,
      color: 'gray',
    },
    {
      id: 'backup',
      title: 'Database Backup',
      description: 'Create and manage database backups',
      icon: Database,
      color: 'emerald',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; hover: string; icon: string }> = {
      blue: {
        bg: 'bg-blue-50',
        hover: 'hover:bg-blue-100 hover:border-blue-300',
        icon: 'text-blue-600',
      },
      green: {
        bg: 'bg-green-50',
        hover: 'hover:bg-green-100 hover:border-green-300',
        icon: 'text-green-600',
      },
      orange: {
        bg: 'bg-orange-50',
        hover: 'hover:bg-orange-100 hover:border-orange-300',
        icon: 'text-orange-600',
      },
      cyan: {
        bg: 'bg-cyan-50',
        hover: 'hover:bg-cyan-100 hover:border-cyan-300',
        icon: 'text-cyan-600',
      },
      teal: {
        bg: 'bg-teal-50',
        hover: 'hover:bg-teal-100 hover:border-teal-300',
        icon: 'text-teal-600',
      },
      amber: {
        bg: 'bg-amber-50',
        hover: 'hover:bg-amber-100 hover:border-amber-300',
        icon: 'text-amber-600',
      },
      gray: {
        bg: 'bg-gray-50',
        hover: 'hover:bg-gray-100 hover:border-gray-300',
        icon: 'text-gray-600',
      },
      violet: {
        bg: 'bg-violet-50',
        hover: 'hover:bg-violet-100 hover:border-violet-300',
        icon: 'text-violet-600',
      },
      indigo: {
        bg: 'bg-indigo-50',
        hover: 'hover:bg-indigo-100 hover:border-indigo-300',
        icon: 'text-indigo-600',
      },
      emerald: {
        bg: 'bg-emerald-50',
        hover: 'hover:bg-emerald-100 hover:border-emerald-300',
        icon: 'text-emerald-600',
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Administration</h2>
        <p className="text-gray-600 mt-1">Select an option below to manage the system</p>
      </div>

      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const colors = getColorClasses(item.color);

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-3 text-left transition-colors flex items-center gap-3"
            >
              <div className={`${colors.icon} flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 flex-1">
                <span className="font-semibold text-gray-900">{item.title}</span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600">{item.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
