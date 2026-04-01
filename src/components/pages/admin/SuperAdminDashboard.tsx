import { useState, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { supabase } from '../../../lib/supabase';
import { 
  Users, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  Activity, 
  Search, 
  Filter,
  ArrowUpRight,
  MoreVertical,
  Globe,
  Settings
} from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { useAuth } from '../../../contexts/AuthContext';
import type { Database } from '../../../types/database.types';

export function SuperAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrgs: 0,
    totalRevenue: 0,
    activeSubscribers: 0
  });
  const [recentOrgs, setRecentOrgs] = useState<Database['public']['Tables']['organizations']['Row'][]>([]);

  useEffect(() => {
    loadGlobalStats();
  }, []);

  const loadGlobalStats = async () => {
    try {
      const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: orgCount } = await supabase.from('organizations').select('*', { count: 'exact', head: true });
      const { data: invoices } = await supabase.from('invoices').select('total');
      
      const revenue = invoices?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0;

      const { data: orgs } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: userCount || 0,
        totalOrgs: orgCount || 0,
        totalRevenue: revenue,
        activeSubscribers: orgCount || 0
      });
      setRecentOrgs(orgs || []);
    } catch (error) {
      console.error('Error loading global stats:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Global System Administration</span>
          </div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight italic">Platform Overview</h1>
          <p className="text-muted-foreground mt-1 italic font-medium">Monitoring all tenants and global system health</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadGlobalStats} className="rounded-xl font-bold">
            <Activity className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <Button className="rounded-xl font-bold shadow-lg shadow-primary/20">
            <Settings className="w-4 h-4 mr-2" />
            System Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 italic">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { label: 'Organizations', value: stats.totalOrgs, icon: Building2, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
          { label: 'Active Subscriptions', value: stats.activeSubscribers, icon: Globe, color: 'text-purple-600', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="hover:scale-[1.02] transition-transform cursor-pointer border-none shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.bg} rounded-2xl`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +12.5%
                </div>
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-foreground tracking-tight">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 dark:shadow-none italic overflow-hidden">
          <div className="p-6 border-b border-border/50 bg-muted/5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">Recent Organizations</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search tenants..." 
                  className="pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all w-64"
                />
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl"><Filter className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="p-0">
            <table className="w-full text-left">
              <thead className="bg-muted/30 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Organization</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-xs">
                          {org.name.charAt(0)}
                        </div>
                        <span className="font-bold text-foreground">{org.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success">Active</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border/50 text-center">
             <Button variant="ghost" className="text-primary font-bold text-sm">View All Organizations</Button>
          </div>
        </Card>

        <div className="space-y-6 italic">
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-6">System Health</h3>
              <div className="space-y-6">
                {[
                  { label: 'Database Performance', status: 'Healthy', value: 98, color: 'bg-emerald-500' },
                  { label: 'Storage Usage', status: 'Optimal', value: 42, color: 'bg-blue-500' },
                  { label: 'API Response Time', status: 'Stable', value: 120, color: 'bg-emerald-500', unit: 'ms' },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-foreground">{item.label}</span>
                      <span className="text-muted-foreground font-medium">{item.status}</span>
                    </div>
                    {item.value <= 100 ? (
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className={`${item.color} h-full transition-all`} style={{ width: `${item.value}%` }} />
                      </div>
                    ) : (
                      <div className="text-lg font-black text-primary">{item.value}{item.unit}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-primary text-primary-foreground overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <ShieldCheck className="w-24 h-24" />
            </div>
            <div className="p-6 relative z-10">
              <h3 className="text-xl font-bold mb-2">Pro Maintenance</h3>
              <p className="text-sm opacity-90 mb-4 font-medium">Scheduled maintenance in 4 hours. All systems operational.</p>
              <Button variant="secondary" className="w-full font-bold">Broadcast Message</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
