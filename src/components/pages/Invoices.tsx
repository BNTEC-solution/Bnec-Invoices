import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Plus, Search, Filter, Download, CreditCard as Edit, Trash2, Mail, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Database } from '../../types/database.types';
import { useTranslation } from 'react-i18next';

type Invoice = Database['public']['Tables']['invoices']['Row'] & {
  items: Database['public']['Tables']['invoice_items']['Row'][];
  client?: Database['public']['Tables']['clients']['Row'];
};

type Client = Database['public']['Tables']['clients']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type InvoiceItem = {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export function Invoices() {
  const { organization } = useAuth();
  const { showToast } = useToast();
  const { isLimitReached } = usePlanLimits();
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (organization) {
      loadData();
    }
  }, [organization]);

  const loadData = async () => {
    if (!organization) return;
    try {
      setLoading(true);
      const [invoicesRes, clientsRes, productsRes] = await Promise.all([
        supabase
          .from('invoices')
          .select(`
            *,
            items:invoice_items(*),
            client:clients(*)
          `)
          .eq('organization_id', organization.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('clients')
          .select('*')
          .eq('organization_id', organization.id),
        supabase
          .from('products')
          .select('*')
          .eq('organization_id', organization.id)
      ]);

      if (invoicesRes.data) setInvoices(invoicesRes.data as Invoice[]);
      if (clientsRes.data) setClients(clientsRes.data);
      if (productsRes.data) setProducts(productsRes.data);
    } catch (error) {
      showToast('Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      setInvoices(invoices.filter(inv => inv.id !== id));
      showToast('Invoice deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete invoice', 'error');
    }
  };

  const exportPDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.number}`, 20, 40);
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, 45);
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 20, 50);
    
    if (invoice.client) {
      doc.text('Bill To:', 140, 40);
      doc.text(invoice.client.name, 140, 45);
      if (invoice.client.email) doc.text(invoice.client.email, 140, 50);
    }

    autoTable(doc, {
      startY: 60,
      head: [['Description', 'Quantity', 'Unit Price', 'Total']],
      body: invoice.items.map(item => [
        item.description,
        item.quantity,
        `$${item.unit_price.toLocaleString()}`,
        `$${item.total.toLocaleString()}`
      ]),
      foot: [['', '', 'Total', `$${invoice.total.toLocaleString()}`]],
    });

    doc.save(`invoice-${invoice.number}.pdf`);
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.client?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1 underline italic">Manage your billing and payments</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedInvoice(null);
            setIsModalOpen(true);
          }}
          disabled={isLimitReached('invoices')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {isLimitReached('invoices') && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5" />
          <div className="flex-1">
             <p className="text-sm font-bold uppercase tracking-tight">You've reached your free invoice limit</p>
             <p className="text-xs opacity-90 font-medium">Upgrade to Pro for unlimited invoices and professional features.</p>
          </div>
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white border-none rounded-lg text-xs font-bold uppercase tracking-widest px-4">Upgrade Now</Button>
        </div>
      )}

      <Card>
        <div className="flex items-center gap-4 mb-6 p-6 pb-0">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">
                  Loading invoices...
                </TableCell>
              </TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="group">
                  <TableCell className="font-medium">{invoice.number}</TableCell>
                  <TableCell>{invoice.client?.name || 'Unknown'}</TableCell>
                  <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-widest ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                      invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {invoice.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${invoice.total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Button variant="ghost" size="icon" onClick={() => exportPDF(invoice)} title="Download PDF">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteInvoice(invoice.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedInvoice ? 'Edit Invoice' : 'Create Invoice'}
      >
        <InvoiceForm 
          invoice={selectedInvoice}
          clients={clients}
          products={products}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            loadData();
            setIsModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

interface InvoiceFormProps {
  invoice: Invoice | null;
  clients: Client[];
  products: Product[];
  onClose: () => void;
  onSuccess: () => void;
}

function InvoiceForm({ invoice, clients, products, onClose, onSuccess }: InvoiceFormProps) {
  const { organization, user } = useAuth();
  const { showToast } = useToast();
  const { checkLimit, incrementUsage } = usePlanLimits();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>(invoice?.items || [
    { description: '', quantity: 1, unit_price: 0, total: 0 }
  ]);

  const total = items.reduce((sum, item) => sum + item.total, 0);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      item.total = Number(item.quantity) * Number(item.unit_price);
    }
    newItems[index] = item;
    setItems(newItems);
  };

  const selectProduct = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateItem(index, 'description', product.name);
      updateItem(index, 'unit_price', Number(product.price));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !user) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const client_id = formData.get('client_id') as string;
    const number = formData.get('number') as string;
    const due_date = formData.get('due_date') as string;

    if (!client_id || !number || items.length === 0) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Check Plan Limits only for new invoices
    if (!invoice) {
        const limitCheck = await checkLimit('invoices');
        if (!limitCheck.allowed) {
            showToast(limitCheck.message, 'error');
            return;
        }
    }

    setIsSubmitting(true);
    try {
      const invoiceData = {
        organization_id: organization.id,
        client_id,
        number,
        total,
        status: (formData.get('status') as any) || 'draft',
        due_date,
        created_by: user.id
      };

      let currentInvoiceId = invoice?.id;

      if (invoice) {
        // Update existing invoice
        const { error } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', invoice.id);
        if (error) throw error;
        
        // Delete existing items to replace them
        await supabase.from('invoice_items').delete().eq('invoice_id', invoice.id);
      } else {
        // Create new invoice
        const { data, error } = await supabase
          .from('invoices')
          .insert(invoiceData)
          .select()
          .single();
        if (error) throw error;
        currentInvoiceId = data.id;

        // Increment usage for new invoices
        await incrementUsage('invoices');
      }

      // Insert items
      const { error: itemsError } = await supabase.from('invoice_items').insert(
        items.map(item => ({
          invoice_id: currentInvoiceId as string,
          organization_id: organization.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total
        }))
      );

      if (itemsError) throw itemsError;

      showToast(`Invoice ${invoice ? 'updated' : 'created'} successfully`, 'success');
      onSuccess();
    } catch (error) {
      showToast(`Failed to ${invoice ? 'update' : 'create'} invoice`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Client</label>
          <select 
            name="client_id" 
            defaultValue={invoice?.client_id}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
            required
          >
            <option value="">Select a client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Invoice Number</label>
          <Input 
            name="number" 
            defaultValue={invoice?.number || `INV-${Date.now().toString().slice(-6)}`} 
            placeholder="INV-001" 
            required 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Due Date</label>
          <Input 
            name="due_date" 
            type="date" 
            defaultValue={invoice?.due_date?.split('T')[0]} 
            required 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <select 
            name="status" 
            defaultValue={invoice?.status || 'draft'}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium italic">Invoice Items</h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
        
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-3 items-end p-4 bg-muted/20 rounded-xl relative group">
            <div className="col-span-12 md:col-span-5 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description / Product</label>
              <div className="flex gap-2">
                <select 
                  className="w-24 rounded-lg border border-border bg-input px-2 py-1.5 text-xs text-muted-foreground"
                  onChange={(e) => selectProduct(index, e.target.value)}
                  defaultValue=""
                >
                  <option value="">Select...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <Input
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Service or part description"
                  className="flex-1 h-9"
                  required
                />
              </div>
            </div>
            <div className="col-span-4 md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Qty</label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                min="1"
                className="h-9"
                required
              />
            </div>
            <div className="col-span-4 md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Price</label>
              <Input
                type="number"
                value={item.unit_price}
                onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                min="0"
                className="h-9"
                required
              />
            </div>
            <div className="col-span-4 md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total</label>
              <div className="h-9 flex items-center px-1 font-bold">
                ${item.total.toLocaleString()}
              </div>
            </div>
            <div className="col-span-12 md:col-span-1 flex justify-end">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                className="text-red-500 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-end gap-2 pt-6 border-t border-border mt-8">
        <div className="flex gap-8 text-lg italic">
          <span className="text-muted-foreground font-medium">Subtotal</span>
          <span className="font-bold font-sans">${total.toLocaleString()}</span>
        </div>
        <div className="flex gap-8 text-2xl">
          <span className="text-foreground font-extrabold uppercase italic tracking-tighter">Total Due</span>
          <span className="font-sans font-black text-primary">${total.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 sticky bottom-0 bg-background pt-6">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="px-10 shadow-lg shadow-primary/20">
          {isSubmitting ? 'Processing...' : invoice ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
}
