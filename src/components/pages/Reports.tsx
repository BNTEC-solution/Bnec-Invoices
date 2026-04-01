import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Download, TrendingUp, DollarSign, Package, ArrowUpRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, parseISO } from 'date-fns';

export function Reports() {
  const { organization } = useAuth();
  const { showToast } = useToast();
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingAmount: 0,
    productsSold: 0,
    topProducts: [] as { name: string; quantity: number; revenue: number }[],
    revenueByMonth: [] as { date: string; revenue: number; profit: number }[],
  });
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    if (!organization?.id) return;
    setLoading(true);

    try {
      const [invoicesRes, productsRes] = await Promise.all([
        supabase
          .from('invoices')
          .select('*, invoice_items(*)')
          .eq('organization_id', organization.id)
          .gte('issue_date', dateRange.from)
          .lte('issue_date', dateRange.to),
        supabase
          .from('products')
          .select('id, name, cost')
          .eq('organization_id', organization.id)
      ]);

      if (invoicesRes.error) throw invoicesRes.error;
      if (productsRes.error) throw productsRes.error;

      const invoices = invoicesRes.data || [];
      const products = productsRes.data || [];
      
      const productMap = new Map(products.map(p => [p.id, p]));
      
      let totalRevenue = 0;
      let totalCost = 0;
      let productsSold = 0;
      const productSales = new Map<string, { quantity: number; revenue: number }>();
      const revenueMap = new Map<string, { revenue: number; cost: number }>();

      invoices.forEach((inv) => {
        const isPaid = inv.status === 'paid';
        const dateStr = format(parseISO(inv.issue_date), 'MMM dd');
        
        if (!revenueMap.has(dateStr)) {
          revenueMap.set(dateStr, { revenue: 0, cost: 0 });
        }

        if (isPaid) {
          totalRevenue += inv.total;
          revenueMap.get(dateStr)!.revenue += inv.total;
        }

        inv.invoice_items?.forEach((item: { product_id: string | null; quantity: number; total: number }) => {
          const product = item.product_id ? productMap.get(item.product_id) : null;
          const itemCost = (product?.cost || 0) * item.quantity;
          
          if (isPaid) {
            totalCost += itemCost;
            revenueMap.get(dateStr)!.cost += itemCost;
          }

          productsSold += item.quantity;

          if (item.product_id) {
            const current = productSales.get(item.product_id) || { quantity: 0, revenue: 0 };
            productSales.set(item.product_id, {
              quantity: current.quantity + item.quantity,
              revenue: current.revenue + item.total
            });
          }
        });
      });

      const revenueByMonth = Array.from(revenueMap.entries())
        .map(([date, data]) => ({ 
          date, 
          revenue: data.revenue,
          profit: data.revenue - data.cost 
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const topProducts = Array.from(productSales.entries())
        .map(([productId, data]) => ({
          name: productMap.get(productId)?.name || 'Unknown Product',
          quantity: data.quantity,
          revenue: data.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const pendingAmount = invoices
        .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
        .reduce((sum, inv) => sum + inv.total, 0);

      setStats({
        totalRevenue,
        totalCost,
        totalProfit: totalRevenue - totalCost,
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter(i => i.status === 'paid').length,
        pendingAmount,
        productsSold,
        topProducts,
        revenueByMonth,
      });
    } catch (error) {
      console.error('Error loading reports:', error);
      showToast('Failed to load report data', 'error');
    } finally {
      setLoading(false);
    }
  }, [organization?.id, dateRange.from, dateRange.to, showToast]);

  useEffect(() => {
    if (organization?.id) {
      loadReports();
    }
  }, [organization?.id, loadReports]);

  const currency = organization?.currency || 'USD';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Real-time insights into your business performance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => showToast('Feature coming soon!')}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-sm font-medium text-foreground">Start Date</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-sm font-medium text-foreground">End Date</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
            <Button onClick={loadReports} className="w-full md:w-auto">Update Reports</Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-center gap-3 p-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalRevenue.toLocaleString()} {currency}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/5 to-transparent">
              <div className="flex items-center gap-3 p-6">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Net Profit</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.totalProfit.toLocaleString()} {currency}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/5 to-transparent">
              <div className="flex items-center gap-3 p-6">
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <ArrowUpRight className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Outstanding</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pendingAmount.toLocaleString()} {currency}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/5 to-transparent">
              <div className="flex items-center gap-3 p-6">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Package className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Units Sold</p>
                  <p className="text-2xl font-bold text-foreground">{stats.productsSold}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Revenue vs Profit</h3>
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-primary rounded-full" />
                      <span className="text-muted-foreground">Revenue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                      <span className="text-muted-foreground">Profit</span>
                    </div>
                  </div>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.revenueByMonth}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickFormatter={(val) => `${val}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '12px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorRev)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorProfit)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Top Product Performance</h3>
                <div className="space-y-6">
                  {stats.topProducts.map((p, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.quantity} units sold</p>
                        </div>
                        <p className="font-bold text-foreground">{p.revenue.toLocaleString()} {currency}</p>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500" 
                          style={{ width: `${stats.topProducts.length > 0 && Math.max(...stats.topProducts.map(tp => tp.revenue)) > 0 ? (p.revenue / Math.max(...stats.topProducts.map(tp => tp.revenue))) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {stats.topProducts.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No sales data available for top products
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Summary Performance</h3>
                <p className="text-muted-foreground">Detailed breakdown of margins and costs</p>
              </div>
              <div className="flex flex-wrap gap-8">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Gross Margin</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.totalRevenue > 0 ? ((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="w-px h-12 bg-border hidden md:block" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Avg Order Value</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.paidInvoices > 0 ? (stats.totalRevenue / stats.paidInvoices).toFixed(0) : 0} {currency}
                  </p>
                </div>
                <div className="w-px h-12 bg-border hidden md:block" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Paid Invoices</p>
                  <p className="text-3xl font-bold text-foreground">{stats.paidInvoices}</p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
