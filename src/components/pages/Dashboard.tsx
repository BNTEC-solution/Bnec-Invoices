import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  DollarSign,
  FileText,
  Package,
  Users,
  Truck,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { parseISO, format, subMonths } from 'date-fns';
import { cn } from '../../lib/utils';
import type { Database } from '../../types/database.types';

type Invoice = Database['public']['Tables']['invoices']['Row'] & { clients: { name: string } | null };
type Product = Database['public']['Tables']['products']['Row'];

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ElementType;
  description?: string;
}

function KPICard({ title, value, change, trend, icon: Icon, description }: KPICardProps) {
  return (
    <Card className="p-6 transition-all hover:border-foreground/20 group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
            {change && (
              <span className={cn(
                "text-xs font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5",
                trend === 'up' ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
              )}>
                {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                {change}
              </span>
            )}
          </div>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-muted transition-colors">
          <Icon className="w-5 h-5 text-foreground/70" />
        </div>
      </div>
    </Card>
  );
}

// Mock Data for Demo Mode
const MOCK_CHART_DATA = [
  { name: 'Jan 2024', amount: 4500 },
  { name: 'Feb 2024', amount: 5200 },
  { name: 'Mar 2024', amount: 4800 },
  { name: 'Apr 2024', amount: 6100 },
  { name: 'May 2024', amount: 5900 },
  { name: 'Jun 2024', amount: 7200 },
];

export function Dashboard() {
  const { organization } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingInvoices: 0,
    paidInvoices: 0,
    stockValue: 0,
    totalClients: 0,
    totalSuppliers: 0,
    lowStockItems: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [chartData, setChartData] = useState<{ name: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!organization?.id) return;

    try {
      const [invoicesRes, productsRes, clientsRes, suppliersRes, recentInvoicesRes] = await Promise.all([
        supabase.from('invoices').select('status, total, issue_date').eq('organization_id', organization.id),
        supabase.from('products').select('*').eq('organization_id', organization.id),
        supabase.from('clients').select('id', { count: 'exact', head: true }).eq('organization_id', organization.id),
        supabase.from('suppliers').select('id', { count: 'exact', head: true }).eq('organization_id', organization.id),
        supabase.from('invoices').select('*, clients(name)').eq('organization_id', organization.id).order('created_at', { ascending: false }).limit(5),
      ]);

      let hasRealData = false;

      if (invoicesRes.data && invoicesRes.data.length > 0) {
        hasRealData = true;
        const paid = invoicesRes.data.filter(i => i.status === 'paid');
        const pending = invoicesRes.data.filter(i => i.status === 'pending' || i.status === 'overdue');

        setStats(prev => ({
          ...prev,
          totalRevenue: paid.reduce((sum, inv) => sum + (inv.total || 0), 0),
          paidInvoices: paid.length,
          pendingInvoices: pending.length,
        }));

        const last6Months = Array.from({ length: 6 }).map((_, i) => {
          const d = subMonths(new Date(), i);
          return format(d, 'MMM yyyy');
        }).reverse();

        const dataMap = new Map<string, number>(last6Months.map(month => [month, 0]));
        paid.forEach(inv => {
          if (inv.issue_date) {
            const dateStr = format(parseISO(inv.issue_date), 'MMM yyyy');
            if (dataMap.has(dateStr)) {
              dataMap.set(dateStr, dataMap.get(dateStr)! + (inv.total || 0));
            }
          }
        });

        setChartData(last6Months.map(month => ({
          name: month,
          amount: dataMap.get(month) || 0
        })));
      }

      if (productsRes.data && productsRes.data.length > 0) {
        hasRealData = true;
        const stockValue = productsRes.data.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const lowStock = productsRes.data.filter(p => p.quantity <= (p.low_stock_threshold ?? 10));

        setStats(prev => ({
          ...prev,
          stockValue,
          lowStockItems: lowStock.length,
        }));
        setLowStockProducts(lowStock.slice(0, 5));
      }

      setStats(prev => ({
        ...prev,
        totalClients: clientsRes.count || 0,
        totalSuppliers: suppliersRes.count || 0,
      }));

      if (recentInvoicesRes.data) {
        setRecentInvoices(recentInvoicesRes.data as Invoice[]);
      }

      // If no data found, enable Demo Mode
      if (!hasRealData) {
        setIsDemo(true);
        setStats({
          totalRevenue: 34500,
          pendingInvoices: 12,
          paidInvoices: 145,
          stockValue: 89000,
          totalClients: 48,
          totalSuppliers: 14,
          lowStockItems: 3,
        });
        setChartData(MOCK_CHART_DATA);
      } else {
        setIsDemo(false);
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [organization?.id]);

  useEffect(() => {
    if (organization?.id) {
      loadDashboardData();
    }
  }, [organization?.id, loadDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1.5 flex items-center gap-2">
            Welcome to {organization?.name || 'your workspace'}.
            {isDemo && <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Demo Mode</Badge>}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/app/invoices'}
            className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Create Invoice <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change="+12.5%"
          trend="up"
          icon={DollarSign}
          description="Total settled payments"
        />
        <KPICard
          title="Pending"
          value={stats.pendingInvoices}
          change="+2"
          trend="up"
          icon={Clock}
          description="Awaiting payment"
        />
        <KPICard
          title="Stock Value"
          value={`$${stats.stockValue.toLocaleString()}`}
          icon={Package}
          description="Total inventory worth"
        />
        <KPICard
          title="Clients"
          value={stats.totalClients}
          icon={Users}
          description="Active customer base"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <Card className="lg:col-span-2 p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold">Revenue Trend</h3>
              <p className="text-sm text-muted-foreground">Monthly performance analysis</p>
            </div>
            <Badge variant="outline" className="font-mono">Last 6 Months</Badge>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: number | string | readonly (number | string)[] | undefined) => {
                    if (typeof value === 'number') return [`$${value.toLocaleString()}`, 'Revenue'];
                    return [value?.toString() ?? '', 'Revenue'];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Activity/Alerts Sidebar */}
        <div className="space-y-8">
          {/* Alerts Card */}
          {stats.lowStockItems > 0 && (
            <Card className="p-5 border-amber-500/20 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/10 rounded-full">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900 leading-none">Inventory Warnings</h4>
                  <p className="text-sm text-amber-800/80 mt-1.5 font-medium">
                    {stats.lowStockItems} items are below critical threshold.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {lowStockProducts.map(p => (
                      <Badge key={p.id} variant="outline" className="bg-white/50 border-amber-200">
                        {p.name} ({p.quantity})
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Recent Activity List */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Recent Invoices</h3>
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-6">
              {recentInvoices.length === 0 && !isDemo ? (
                <p className="text-sm text-muted-foreground text-center py-8 italic">No recent activity detected.</p>
              ) : (
                (isDemo ? [
                  { id: '1', invoice_number: 'INV-001', clients: { name: 'Acme Corp' }, total: 1200, status: 'paid' },
                  { id: '2', invoice_number: 'INV-002', clients: { name: 'Global Tech' }, total: 450, status: 'pending' },
                  { id: '3', invoice_number: 'INV-003', clients: { name: 'Nexus Ltd' }, total: 890, status: 'paid' },
                  { id: '4', invoice_number: 'INV-004', clients: { name: 'Stark Ind' }, total: 2100, status: 'overdue' },
                ] : recentInvoices).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        invoice.status === 'paid' ? "bg-emerald-500" :
                          invoice.status === 'pending' ? "bg-amber-500" : "bg-red-500"
                      )} />
                      <div>
                        <p className="text-sm font-semibold group-hover:underline underline-offset-4">{invoice.invoice_number}</p>
                        <p className="text-xs text-muted-foreground font-medium">{invoice.clients?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold tracking-tight">${invoice.total.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">{invoice.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-muted/20 border-border/40 text-center">
              <Truck className="w-4 h-4 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{stats.totalSuppliers}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Suppliers</p>
            </Card>
            <Card className="p-4 bg-muted/20 border-border/40 text-center">
              <FileText className="w-4 h-4 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{stats.paidInvoices + stats.pendingInvoices}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Invoices</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
