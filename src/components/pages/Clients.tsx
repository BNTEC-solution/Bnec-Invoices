import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Plus, Search, Edit, Trash2, Mail, Phone, MapPin, Users, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import type { Database } from '../../types/database.types';

type Client = Database['public']['Tables']['clients']['Row'];

export function Clients() {
  const { organization } = useAuth();
  const { showToast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadClients = useCallback(async () => {
    if (!organization?.id) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', organization.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      showToast('Failed to load clients', 'error');
    } finally {
      setLoading(false);
    }
  }, [organization?.id, showToast]);

  useEffect(() => {
    if (organization?.id) {
      loadClients();
    }
  }, [organization?.id, loadClients]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (client.phone || '').includes(searchQuery)
  );

  const handleCreateClient = () => {
    setSelectedClient(null);
    setShowModal(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client? This will not delete their invoices but will remove their contact link.')) return;

    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      showToast('Client removed successfully');
      loadClients();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete client';
      console.error('Error deleting client:', error);
      showToast(message, 'error');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Clients Directory</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your customer base and contact information</p>
        </div>
        <Button onClick={handleCreateClient} className="shadow-lg shadow-primary/20 scale-105 transition-transform active:scale-100">
          <Plus className="w-4 h-4 mr-2" />
          New Client
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-none">
          <div className="flex items-center gap-4 p-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total Clients</p>
              <p className="text-2xl font-bold text-foreground">{clients.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="md:col-span-2 border-none shadow-sm bg-accent/10">
          <div className="p-6 flex items-center justify-between h-full">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all text-sm"
              />
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Filter className="w-3.5 h-3.5" />
              Showing {filteredClients.length} of {clients.length} results
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
                  <TableHead className="py-5 font-bold uppercase text-[10px] tracking-[0.2em] pl-6 text-muted-foreground">Client Profile</TableHead>
                  <TableHead className="py-5 font-bold uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Contact Details</TableHead>
                  <TableHead className="py-5 font-bold uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Location</TableHead>
                  <TableHead className="py-5 font-bold uppercase text-[10px] tracking-[0.2em] text-right pr-6 text-muted-foreground">Manage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell colSpan={4} className="py-6 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-muted rounded-full" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-muted rounded w-1/4" />
                            <div className="h-3 bg-muted rounded w-1/2 opacity-50" />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-24 text-muted-foreground">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-muted rounded-full">
                          <Plus className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="font-bold text-lg text-foreground">No clients found</p>
                        <p className="text-sm max-w-xs mx-auto">Start building your relationship database by adding your first client.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id} className="group hover:bg-primary/[0.02] transition-colors border-b border-border/40 last:border-0">
                      <TableCell className="py-5 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-primary/10 text-primary flex items-center justify-center rounded-xl font-bold text-sm shadow-sm border border-primary/5 group-hover:scale-110 transition-transform">
                            {getInitials(client.name)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-base leading-tight">{client.name}</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight mt-1 opacity-60">Customer ID: {client.id.split('-')[0]}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="space-y-1.5">
                          {client.email ? (
                            <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
                              <Mail className="w-3.5 h-3.5 opacity-70" />
                              {client.email}
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground/40 italic">No email provided</span>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-3.5 h-3.5 opacity-70" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-start gap-2 max-w-[240px]">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 text-muted-foreground opacity-70 shrink-0" />
                          <span className="text-sm text-muted-foreground line-clamp-2">
                            {client.address || 'Address not listed'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <button
                            onClick={() => handleEditClient(client)}
                            className="p-2.5 hover:bg-primary/10 text-primary rounded-xl transition-all"
                            title="Edit Profile"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="p-2.5 hover:bg-destructive/10 text-destructive rounded-xl transition-all"
                            title="Remove Client"
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedClient ? 'Update Client Information' : 'Create New Client Profile'}>
        <ClientForm
          client={selectedClient}
          onClose={() => setShowModal(false)}
          onSuccess={loadClients}
        />
      </Modal>
    </div>
  );
}

interface ClientFormProps {
  client: Client | null;
  onClose: () => void;
  onSuccess: () => void;
}

function ClientForm({ client, onClose, onSuccess }: ClientFormProps) {
  const { organization } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    notes: client?.notes || '',
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

      if (client) {
        const { error } = await supabase.from('clients').update(data).eq('id', client.id);
        if (error) throw error;
        showToast('Client profile updated!');
      } else {
        const { error } = await supabase.from('clients').insert(data);
        if (error) throw error;
        showToast('New client added successfully!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save client';
      console.error('Error saving client:', error);
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <Input
        label="Client Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        placeholder="e.g. Acme Corporation or John Doe"
        className="font-semibold"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="contact@company.com"
        />

        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Billing Address</label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={3}
          placeholder="Full address for invoice generation..."
          className="w-full px-4 py-3 bg-accent/20 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground resize-none text-sm transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Internal Notes (Optional)</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
          placeholder="Private notes about this client..."
          className="w-full px-4 py-3 bg-accent/20 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground resize-none text-sm transition-all"
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-border">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting} className="px-6">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="px-10">
          {isSubmitting ? 'Saving...' : client ? 'Confirm Update' : 'Create Profile'}
        </Button>
      </div>
    </form>
  );
}
