import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Building2, User, Bell, Lock, Save, Globe, Smartphone, UserCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import type { Database } from '../../types/database.types';

export function Settings() {
  const { user, profile, organization, role, refreshAuth } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('organization');
  const [saving, setSaving] = useState(false);

  const [orgData, setOrgData] = useState({
    name: organization?.name || '',
    email: organization?.email || '',
    phone: organization?.phone || '',
    address: organization?.address || '',
    currency: organization?.currency || 'USD',
    tax_rate: organization?.tax_rate || 0,
    slug: organization?.slug || '',
  });

  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
  });

  const handleSaveOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: orgData.name,
          email: orgData.email,
          phone: orgData.phone,
          address: orgData.address,
          currency: orgData.currency,
          tax_rate: Number(orgData.tax_rate),
        })
        .eq('id', organization.id);

      if (error) throw error;
      showToast('Organization settings saved successfully');
      refreshAuth();
    } catch (error) {
      console.error('Error saving organization:', error);
      showToast('Failed to save organization settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profileData.full_name,
        })
        .eq('id', user.id);

      if (error) throw error;
      showToast('Profile updated successfully');
      refreshAuth();
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'taxes', label: 'Tax Rates', icon: ShieldCheck },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and organization preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-medium scale-[1.02]'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'organization' && (
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Organization Profile</h3>
                    <p className="text-sm text-muted-foreground">This information will be displayed on your invoices</p>
                  </div>
                  {role === 'owner' && (
                    <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Owner Access
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveOrganization} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Organization Name"
                      value={orgData.name}
                      onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                      required
                      placeholder="e.g. Acme Corp"
                    />
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Organization URL (Slug)</label>
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border border-border text-muted-foreground text-sm">
                        <span>bntec.app/</span>
                        <span className="font-medium text-foreground">{orgData.slug}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Business Email"
                      type="email"
                      value={orgData.email}
                      onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                      placeholder="billing@company.com"
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      value={orgData.phone}
                      onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <Input
                    label="Business Address"
                    value={orgData.address}
                    onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                    placeholder="123 Business St, Suite 100, Capital City"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Default Currency</label>
                      <select
                        value={orgData.currency}
                        onChange={(e) => setOrgData({ ...orgData, currency: e.target.value })}
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      >
                        <option value="USD">USD - US Dollar ($)</option>
                        <option value="EUR">EUR - Euro (€)</option>
                        <option value="GBP">GBP - British Pound (£)</option>
                        <option value="MAD">MAD - Moroccan Dirham (DH)</option>
                      </select>
                    </div>

                    <Input
                      label="Default Tax Rate (%)"
                      type="number"
                      step="0.01"
                      value={orgData.tax_rate}
                      onChange={(e) => setOrgData({ ...orgData, tax_rate: Number(e.target.value) })}
                    />
                  </div>

                  <div className="flex justify-end pt-6 border-t border-border">
                    <Button type="submit" disabled={saving || role !== 'owner'} className="px-8">
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}

          {activeTab === 'taxes' && (
            <TaxesManager />
          )}

          {activeTab === 'profile' && (
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <UserCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Personal Profile</h3>
                    <p className="text-sm text-muted-foreground">Manage your personal information and credentials</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="Full Name" 
                      value={profileData.full_name} 
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      placeholder="Your name"
                    />
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Email Address</label>
                      <div className="px-3 py-2 bg-muted rounded-lg border border-border text-muted-foreground text-sm">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Organization Role</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border text-foreground capitalize w-fit">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      {role || 'member'}
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-border">
                    <Button type="submit" disabled={saving} className="px-8">
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Notifications</h3>
                    <p className="text-sm text-muted-foreground">Stay updated on your business activity</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { id: 'inv', title: 'Invoice Updates', desc: 'Get notified when an invoice is paid or becomes overdue' },
                    { id: 'stock', title: 'Low Stock Alerts', desc: 'Get notified when products reach their low stock threshold' },
                    { id: 'pay', title: 'Payment Reminders', desc: 'Automatic reminders for clients with pending payments' },
                  ].map((item, idx) => (
                    <div key={item.id} className={`flex items-center justify-between py-6 ${idx !== 2 ? 'border-b border-border' : ''}`}>
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground text-lg">{item.title}</p>
                        <p className="text-sm text-muted-foreground max-w-md">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Security Settings</h3>
                    <p className="text-sm text-muted-foreground">Protect your account with a strong password</p>
                  </div>
                </div>

                <div className="max-w-md space-y-6">
                  <div className="p-4 bg-amber-500/10 border border-amber-200 rounded-xl flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <p className="text-sm text-amber-800">
                      Changing your password will log you out from all other devices.
                    </p>
                  </div>
                  <Input label="New Password" type="password" placeholder="Min 6 characters" />
                  <Input label="Confirm New Password" type="password" />
                  <div className="flex justify-end">
                    <Button onClick={() => showToast('Password reset email sent!', 'success')}>
                      Update Password
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function TaxesManager() {
  const { organization } = useAuth();
  const { showToast } = useToast();
  const [taxes, setTaxes] = useState<Database['public']['Tables']['taxes']['Row'][]>([]);
  const [loading, setLoading] = useState(true);

  const loadTaxes = async () => {
    if (!organization?.id) return;
    try {
      const { data, error } = await supabase
        .from('taxes')
        .select('*')
        .eq('organization_id', organization.id);
      if (error) throw error;
      setTaxes(data || []);
    } catch (error) {
      console.error('Error loading taxes:', error);
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    loadTaxes();
  });

  const handleDeleteTax = async (id: string) => {
    try {
      const { error } = await supabase.from('taxes').delete().eq('id', id);
      if (error) throw error;
      showToast('Tax rate deleted');
      loadTaxes();
    } catch (error) {
       console.error('Error deleting tax:', error);
       showToast('Failed to delete tax', 'error');
    }
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Tax Configurations</h3>
              <p className="text-sm text-muted-foreground">Manage regional tax rates for your invoices</p>
            </div>
          </div>
          <Button size="sm" onClick={() => showToast('New tax rate window coming soon!')}>Add Tax Rate</Button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p>Loading tax rates...</p>
          ) : taxes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No custom tax rates set. Using global default.</p>
          ) : (
            taxes.map((tax) => (
              <div key={tax.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                <div>
                  <p className="font-bold">{tax.name}</p>
                  <p className="text-sm text-muted-foreground">{tax.rate}% {tax.is_default && '(Default)'}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => handleDeleteTax(tax.id)}>Delete</Button>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
