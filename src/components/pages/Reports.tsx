import { useState, useEffect } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Download, TrendingUp, DollarSign, Package, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function Reports() {
  const { profile } = useAuth();
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingAmount: 0,
    productsSold: 0,
    topProducts: [] as any[],
    revenueByMonth: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.company_id) {
      loadReports();
    }
  }, [profile, dateRange]);

  const loadReports = async () => {
    if (!profile?.company_id) return;

    try {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .eq('company_id', profile.company_id)
        .gte('issue_date', dateRange.from)
        .lte('issue_date', dateRange.to);

      if (invoices) {
        const paid = invoices.filter(i => i.status === 'paid');
        const pending = invoices.filter(i => i.status === 'pending' || i.status === 'overdue');

        setStats({
          totalRevenue: paid.reduce((sum, inv) => sum + inv.total, 0),
          totalInvoices: invoices.length,
          paidInvoices: paid.length,
          pendingAmount: pending.reduce((sum, inv) => sum + inv.total, 0),
          productsSold: invoices.reduce((sum, inv) =>
            sum + (inv.invoice_items?.reduce((s: number, item: any) => s + item.quantity, 0) || 0), 0
          ),
          topProducts: [],
          revenueByMonth: [],
        });
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">View insights and export data</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">From</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">To</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={loadReports}>Apply</Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900">${stats.pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Products Sold</p>
              <p className="text-2xl font-bold text-gray-900">{stats.productsSold}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Revenue Overview" />
          <div className="h-64 flex items-center justify-center text-gray-500">
            Revenue chart visualization
          </div>
        </Card>

        <Card>
          <CardHeader title="Invoice Status Breakdown" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-gray-700">Paid</span>
              </div>
              <span className="font-medium text-gray-900">{stats.paidInvoices}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-gray-700">Pending</span>
              </div>
              <span className="font-medium text-gray-900">{stats.totalInvoices - stats.paidInvoices}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Profit & Loss Statement" />
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="font-medium text-gray-900">Total Revenue</span>
            <span className="font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="font-medium text-gray-900">Outstanding</span>
            <span className="font-bold text-amber-600">${stats.pendingAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="font-medium text-gray-900">Net Profit</span>
            <span className="font-bold text-emerald-600">${stats.totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
