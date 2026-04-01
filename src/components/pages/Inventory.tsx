import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Plus, Search, AlertTriangle, Edit, Trash2, Package, Tag, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import type { Database } from '../../types/database.types';

type Product = Database['public']['Tables']['products']['Row'] & { suppliers: { name: string } | null };
type Supplier = Database['public']['Tables']['suppliers']['Row'];

export function Inventory() {
  const { organization, isManager } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const loadData = useCallback(async () => {
    if (!organization?.id) return;
    setLoading(true);

    try {
      const [productsRes, suppliersRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, suppliers(name)')
          .eq('organization_id', organization.id)
          .order('name', { ascending: true }),
        supabase
          .from('suppliers')
          .select('*')
          .eq('organization_id', organization.id)
          .order('name', { ascending: true }),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (suppliersRes.error) throw suppliersRes.error;

      setProducts((productsRes.data || []) as Product[]);
      setSuppliers(suppliersRes.data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
      showToast('Failed to load inventory data', 'error');
    } finally {
      setLoading(false);
    }
  }, [organization?.id, showToast]);

  useEffect(() => {
    if (organization?.id) {
      loadData();
    }
  }, [organization?.id, loadData]);

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.sku?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This may affect existing invoices.')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      showToast('Product deleted successfully');
      loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete product';
      console.error('Error deleting product:', error);
      showToast(message, 'error');
    }
  };

  const getStockBadge = (quantity: number, threshold: number) => {
    if (quantity === 0) return <Badge variant="danger" className="font-semibold uppercase text-[10px]">Out of stock</Badge>;
    if (quantity <= threshold) return <Badge variant="warning" className="font-semibold uppercase text-[10px]">Low stock</Badge>;
    return <Badge variant="success" className="font-semibold uppercase text-[10px]">In stock</Badge>;
  };

  const currency = organization?.currency || 'USD';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory & Warehouse</h1>
          <p className="text-muted-foreground mt-1">Monitor stock levels, pricing, and product catalog</p>
        </div>
        {isManager && (
          <Button onClick={handleCreateProduct} className="shadow-lg shadow-primary/20 scale-105 transition-transform active:scale-100">
            <Plus className="w-4 h-4 mr-2" />
            New Product
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 p-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Items</p>
              <p className="text-2xl font-bold text-foreground">{products.length}</p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 p-6">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Tag className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inventory Value</p>
              <p className="text-2xl font-bold text-foreground">
                {(products.reduce((acc, p) => acc + (p.price * p.quantity), 0)).toLocaleString()} {currency}
              </p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 p-6">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Low Stock</p>
              <p className="text-2xl font-bold text-amber-600">
                {products.filter(p => p.quantity > 0 && p.quantity <= (p.low_stock_threshold ?? 10)).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 p-6">
            <div className="p-3 bg-destructive/10 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Out of Stock</p>
              <p className="text-2xl font-bold text-destructive font-mono">
                {products.filter(p => p.quantity === 0).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden border-none shadow-xl shadow-foreground/[0.02]">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-accent/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full md:w-[180px] px-4 py-2.5 bg-accent/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground text-sm cursor-pointer"
              >
                <option value="all">Every Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="py-4 font-semibold uppercase text-[11px] tracking-widest">Product Details</TableHead>
                  <TableHead className="py-4 font-semibold uppercase text-[11px] tracking-widest">SKU</TableHead>
                  <TableHead className="py-4 font-semibold uppercase text-[11px] tracking-widest">Pricing</TableHead>
                  <TableHead className="py-4 font-semibold uppercase text-[11px] tracking-widest text-center">Quantity</TableHead>
                  <TableHead className="py-4 font-semibold uppercase text-[11px] tracking-widest">Stock Health</TableHead>
                  <TableHead className="py-4 font-semibold uppercase text-[11px] tracking-widest text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell colSpan={6} className="h-16 py-4">
                        <div className="h-4 bg-muted rounded-md w-full opacity-50" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="w-12 h-12 opacity-10 mb-2" />
                        <p className="font-semibold text-lg">No products found</p>
                        <p>Try adjusting your filters or add a new item.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} className="group hover:bg-accent/30 transition-colors">
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{product.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold uppercase">{product.category || 'Uncategorized'}</span>
                            {product.suppliers?.name && (
                              <span className="text-[10px] text-muted-foreground">via {product.suppliers.name}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{product.sku || 'N/A'}</TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-foreground">{product.price.toLocaleString()} <span className="text-[10px] font-medium text-muted-foreground">{currency}</span></p>
                          {product.cost > 0 && (
                            <p className="text-[10px] text-emerald-500 font-medium">Margin: {(((product.price - product.cost) / product.price) * 100).toFixed(0)}%</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-sm font-bold ${product.quantity <= (product.low_stock_threshold || 10) ? 'text-amber-500' : 'text-foreground'}`}>
                          {product.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{getStockBadge(product.quantity, product.low_stock_threshold ?? 10)}</TableCell>
                      <TableCell className="text-right py-4">
                        {isManager ? (
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="p-2 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                              title="Edit Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">View Only</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedProduct ? 'Update Inventory Item' : 'New Inventory Item'}>
        <ProductForm
          product={selectedProduct}
          suppliers={suppliers}
          onClose={() => setShowModal(false)}
          onSuccess={loadData}
        />
      </Modal>
    </div>
  );
}

interface ProductFormProps {
  product: Product | null;
  suppliers: Supplier[];
  onClose: () => void;
  onSuccess: () => void;
}

function ProductForm({ product, suppliers, onClose, onSuccess }: ProductFormProps) {
  const { organization } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    category: product?.category || '',
    price: product?.price.toString() || '',
    cost: product?.cost.toString() || '',
    quantity: product?.quantity.toString() || '',
    low_stock_threshold: product?.low_stock_threshold?.toString() || '10',
    supplier_id: product?.supplier_id || '',
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
        description: formData.description.trim() || null,
        sku: formData.sku.trim() || null,
        barcode: formData.barcode.trim() || null,
        category: formData.category.trim() || null,
        organization_id: organization.id,
        price: parseFloat(formData.price.toString()) || 0,
        cost: parseFloat(formData.cost.toString()) || 0,
        quantity: parseInt(formData.quantity.toString()) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold.toString()) || 10,
        supplier_id: formData.supplier_id || null,
      };

      if (product) {
        const { error } = await supabase.from('products').update(data).eq('id', product.id);
        if (error) throw error;
        showToast('Product updated successfully!');
      } else {
        const { error } = await supabase.from('products').insert(data);
        if (error) throw error;
        showToast('Product added successfully!');
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save product';
      console.error('Error saving product:', error);
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4 pb-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Product Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="e.g. Premium Coffee Beans"
        />
        <Input
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="e.g. Beverage, Snack"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Product Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          placeholder="Enter details about materials, dimensions, or usage..."
          className="w-full px-4 py-3 bg-accent/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground resize-none text-sm transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Input
          label="SKU"
          value={formData.sku}
          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          placeholder="SKU-XXXX"
        />
        <Input
          label="Barcode"
          value={formData.barcode}
          onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
          placeholder="UPC / EAN identifier"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Input
          label={`Selling Price (${organization?.currency || 'USD'})`}
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
          className="font-bold text-primary"
        />
        <Input
          label={`Unit Cost (${organization?.currency || 'USD'})`}
          type="number"
          step="0.01"
          value={formData.cost}
          onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
          placeholder="For margin calculation"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Input
          label="Current Stock"
          type="number"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          required
        />
        <Input
          label="Low Stock Alert Level"
          type="number"
          value={formData.low_stock_threshold}
          onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
          placeholder="Min level before alert"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Preferred Supplier</label>
        <select
          value={formData.supplier_id}
          onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
          className="w-full px-4 py-3 bg-accent/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground text-sm cursor-pointer transition-all"
        >
          <option value="">No specific supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-8 border-t border-border">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting} className="px-6">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="px-10">
          {isSubmitting ? 'Saving...' : product ? 'Confirm Update' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
