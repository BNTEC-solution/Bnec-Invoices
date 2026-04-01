import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  TrendingUp,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Home
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { NavLink } from 'react-router-dom';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();
  const { isAdmin, isSuperAdmin } = useAuth();

  const menuItems = [
    { path: '/app', label: t('dashboard.title') || 'Dashboard', icon: LayoutDashboard, exact: true },
    ...(isSuperAdmin ? [{ path: '/app/admin', label: 'Global Admin', icon: ShieldCheck }] : []),
    { path: '/app/invoices', label: t('invoices.title') || 'Invoices', icon: FileText },
    { path: '/app/inventory', label: t('inventory.title') || 'Inventory', icon: Package },
    { path: '/app/clients', label: t('clients.title') || 'Clients', icon: Users },
    { path: '/app/suppliers', label: t('suppliers.title') || 'Suppliers', icon: Building2 },
    { path: '/app/reports', label: t('reports.title') || 'Reports', icon: TrendingUp },
    ...(isAdmin ? [{ path: '/app/settings', label: t('settings.name') || 'Settings', icon: Settings }] : []),
  ];

  return (
    <aside
      className={`bg-card border-r border-border flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-6 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">InvoiceFlow</h1>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-muted rounded-lg transition-colors ml-auto text-muted-foreground"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <NavLink
          to="/"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-muted-foreground hover:bg-muted hover:text-foreground ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Return to Home' : ''}
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Return to Home</span>}
        </NavLink>
      </div>
    </aside>
  );
}
