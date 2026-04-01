import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Plus, Search, Edit, Trash2, Mail, Phone, Building2, MapPin, Truck, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import type { Database } from '../../types/database.types';

type Supplier = Database['public']['Tables']['suppliers']['Row'];

export function Suppliers() {
  const { organization } = useAuth();
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadSuppliers = useCallback(async () => {
    if (!organization?.id) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('organization_id', organization.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      showToast('Failed to load suppliers', 'error');
    } finally {
      setLoading(false);
    }
  }, [organization?.id, showToast]);

  useEffect(() => {
    if (organization?.id) {
      loadSuppliers();
    }
  }, [organization?.id, loadSuppliers]);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (supplier.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (supplier.phone || '').includes(searchQuery)
  );

  const handleCreateSupplier = () => {
    setSelectedSupplier(null);
    setShowModal(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowModal(true);
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier? This may affect linked products in inventory.')) return;

    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw error;
      showToast('Supplier removed successfully');
      loadSuppliers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete supplier';
      console.error('Error deleting supplier:', error);
      showToast(message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Supply Chain & Partners</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your vendors, manufacturers, and service providers</p>
        </div>
        <Button onClick={handleCreateSupplier} className="shadow-lg shadow-primary/20 scale-105 transition-transform active:scale-100">
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-500/5 to-transparent border-none">
          <div className="flex items-center gap-4 p-6">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <Truck className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Active Vendors</p>
              <p className="text-2xl font-bold text-foreground font-mono">{suppliers.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="md:col-span-2 border-none shadow-sm bg-accent/10">
          <div className="p-6 flex items-center justify-between h-full">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by business name, email or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all text-sm"
              />
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Filter className="w-3.5 h-3.5" />
              Showing {filteredSuppliers.length} partners
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-none shadow-xl shadow-foreground/[0.02] overflow-hidden">
        <div className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="py-5 font-bold uppercase text-[10px] tracking-[0.2em] pl-6 text-muted-foreground">Supplier Business</TableHead>
                  <TableHead className="py-5 font-bold uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Contact Details</TableHead>
                  <TableHead className="py-5 font-bold uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Headquarters</TableHead>
                  <TableHead className="py-5 font-bold uppercase text-[10px] tracking-[0.2em] text-right pr-6 text-muted-foreground">Manage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell colSpan={4} className="py-6 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-muted rounded-xl" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-muted rounded w-1/3" />
                            <div className="h-3 bg-muted rounded w-1/2 opacity-50" />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-24 text-muted-foreground">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-muted rounded-full">
                          <Building2 className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="font-bold text-lg text-foreground">No suppliers found</p>
                        <p className="text-sm max-w-xs mx-auto">Keep your supply chain organized by adding your first vendor.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id} className="group hover:bg-primary/[0.02] transition-colors border-b border-border/40 last:border-0">
                      <TableCell className="py-5 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-accent/50 text-foreground flex items-center justify-center rounded-xl font-bold text-sm shadow-sm border border-border group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-base leading-tight">{supplier.name}</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight mt-1 opacity-60">Vendor Code: {supplier.id.split('-')[0].toUpperCase()}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="space-y-1.5">
                          {supplier.email ? (
                            <a href={`mailto:${supplier.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit font-medium">
                              <Mail className="w-3.5 h-3.5 opacity-70" />
                              {supplier.email}
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground/40 italic font-medium">No contact email</span>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                              <Phone className="w-3.5 h-3.5 opacity-70" />
                              {supplier.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-start gap-2 max-w-[240px]">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 text-muted-foreground opacity-70 shrink-0" />
                          <span className="text-sm text-muted-foreground line-clamp-2">
                            {supplier.address || 'Location unspecified'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <button
                            onClick={() => handleEditSupplier(supplier)}
                            className="p-2.5 hover:bg-primary/10 text-primary rounded-xl transition-all"
                            title="Edit Supplier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSupplier(supplier.id)}
                            className="p-2.5 hover:bg-destructive/10 text-destructive rounded-xl transition-all"
                            title="Remove Partner"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedSupplier ? 'Update Partner Details' : 'Onboard New Supplier'}>
        <SupplierForm
          supplier={selectedSupplier}
          onClose={() => setShowModal(false)}
          onSuccess={loadSuppliers}
        />
      </Modal>
    </div>
  );
}

interface SupplierFormProps {
  supplier: Supplier | null;
  onClose: () => void;
  onSuccess: () => void;
}

function SupplierForm({ supplier, onClose, onSuccess }: SupplierFormProps) {
  const { organization } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
    notes: supplier?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organization?.id) {
      console.error('Submission aborted: Organization context not loaded.');
      showToast('Workspace initializing, please wait a moment...', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = { 
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        notes: formData.notes.trim() || null,
        organization_id: organization.id 
      };

      if (supplier) {
        const { error } = await supabase.from('suppliers').update(data).eq('id', supplier.id);
        if (error) throw error;
        showToast('Supplier profile updated!');
      } else {
        const { error } = await supabase.from('suppliers').insert(data);
        if (error) throw error;
        showToast('New supplier added successfully!');
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save supplier';
      console.error('Error saving supplier:', error);
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <Input
        label="Business Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        placeholder="e.g. Global Tech Solutions Ltd."
        className="font-bold text-lg"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Corporate Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="sales@vendor.com"
        />

        <Input
          label="Business Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+1 (800) 123-4567"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Operational Address</label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={3}
          placeholder="Full address of the supplier headquarters..."
          className="w-full px-4 py-3 bg-accent/20 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground resize-none text-sm transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Partnership Notes (Optional)</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
          placeholder="Lead times, payment terms, or custom agreements..."
          className="w-full px-4 py-3 bg-accent/20 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground resize-none text-sm transition-all"
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-border">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting} className="px-6">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="px-10">
          {isSubmitting ? 'Saving...' : supplier ? 'Update Partner' : 'Onboard Partner'}
        </Button>
      </div>
    </form>
  );
}
