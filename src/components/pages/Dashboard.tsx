import { useState, useEffect } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { DollarSign, FileText, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

function KPICard({ title, value, change, trend, icon, color }: KPICardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {change}
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingInvoices: 0,
    paidInvoices: 0,
    stockValue: 0,
    lowStockItems: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.company_id) {
      loadDashboardData();
    }
  }, [profile]);

  const loadDashboardData = async () => {
    if (!profile?.company_id) return;

    try {
      const [invoicesRes, productsRes, recentInvoicesRes] = await Promise.all([
        supabase
          .from('invoices')
          .select('status, total')
          .eq('company_id', profile.company_id),
        supabase
          .from('products')
          .select('*')
          .eq('company_id', profile.company_id),
        supabase
          .from('invoices')
          .select('*, clients(name)')
          .eq('company_id', profile.company_id)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (invoicesRes.data) {
        const paid = invoicesRes.data.filter(i => i.status === 'paid');
        const pending = invoicesRes.data.filter(i => i.status === 'pending' || i.status === 'overdue');

        setStats(prev => ({
          ...prev,
          totalRevenue: paid.reduce((sum, inv) => sum + (inv.total || 0), 0),
          paidInvoices: paid.length,
          pendingInvoices: pending.length,
        }));
      }

      if (productsRes.data) {
        const stockValue = productsRes.data.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const lowStock = productsRes.data.filter(p => p.quantity <= p.low_stock_threshold);

        setStats(prev => ({
          ...prev,
          stockValue,
          lowStockItems: lowStock.length,
        }));

        setLowStockProducts(lowStock.slice(0, 5));
      }

      if (recentInvoicesRes.data) {
        setRecentInvoices(recentInvoicesRes.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      paid: 'success',
      pending: 'warning',
      overdue: 'danger',
      draft: 'info',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {profile?.full_name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change="+12.5%"
          trend="up"
          icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
          color="bg-emerald-50"
        />
        <KPICard
          title="Pending Invoices"
          value={stats.pendingInvoices.toString()}
          icon={<FileText className="w-6 h-6 text-amber-600" />}
          color="bg-amber-50"
        />
        <KPICard
          title="Paid Invoices"
          value={stats.paidInvoices.toString()}
          icon={<FileText className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50"
        />
        <KPICard
          title="Stock Value"
          value={`$${stats.stockValue.toLocaleString()}`}
          icon={<Package className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50"
        />
      </div>

      {stats.lowStockItems > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <p className="text-sm font-medium text-amber-900">
              You have {stats.lowStockItems} product{stats.lowStockItems !== 1 ? 's' : ''} with low stock
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Recent Invoices" />
          <div className="space-y-3">
            {recentInvoices.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No invoices yet</p>
            ) : (
              recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                    <p className="text-sm text-gray-600">{invoice.clients?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${invoice.total.toLocaleString()}</p>
                    {getStatusBadge(invoice.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Low Stock Alerts" />
          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">All products are well stocked</p>
            ) : (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      {product.quantity} / {product.low_stock_threshold} units
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
