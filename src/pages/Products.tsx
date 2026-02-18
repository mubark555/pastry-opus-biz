import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { products as initialProducts } from '@/data/mockData';
import type { Product, UnitType } from '@/types';

const categories = ['All', 'Baklava', 'Kunafa', 'Maamoul', 'Basbousa', 'Assorted', 'Specialty', 'Turkish Delight'];

const Products = () => {
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Baklava', unitType: 'tray' as UnitType, basePrice: 0, costPrice: 0, preparationTime: 0, shelfLife: 0, minOrderQuantity: 1, stock: 0 });

  const filtered = productList.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleAdd = () => {
    const product: Product = { ...newProduct, id: `p${Date.now()}`, isActive: true };
    setProductList([...productList, product]);
    setDialogOpen(false);
    setNewProduct({ name: '', category: 'Baklava', unitType: 'tray', basePrice: 0, costPrice: 0, preparationTime: 0, shelfLife: 0, minOrderQuantity: 1, stock: 0 });
  };

  const toggleActive = (id: string) => {
    setProductList(productList.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Product Name</Label>
                <Input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="e.g. Premium Baklava Tray" />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={newProduct.category} onValueChange={v => setNewProduct({ ...newProduct, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unit Type</Label>
                <Select value={newProduct.unitType} onValueChange={v => setNewProduct({ ...newProduct, unitType: v as UnitType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="tray">Tray</SelectItem>
                    <SelectItem value="carton">Carton</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Base Price (SAR)</Label><Input type="number" value={newProduct.basePrice} onChange={e => setNewProduct({ ...newProduct, basePrice: +e.target.value })} /></div>
              <div><Label>Cost Price (SAR)</Label><Input type="number" value={newProduct.costPrice} onChange={e => setNewProduct({ ...newProduct, costPrice: +e.target.value })} /></div>
              <div><Label>Prep Time (min)</Label><Input type="number" value={newProduct.preparationTime} onChange={e => setNewProduct({ ...newProduct, preparationTime: +e.target.value })} /></div>
              <div><Label>Shelf Life (days)</Label><Input type="number" value={newProduct.shelfLife} onChange={e => setNewProduct({ ...newProduct, shelfLife: +e.target.value })} /></div>
              <div><Label>Min Order Qty</Label><Input type="number" value={newProduct.minOrderQuantity} onChange={e => setNewProduct({ ...newProduct, minOrderQuantity: +e.target.value })} /></div>
              <div><Label>Initial Stock</Label><Input type="number" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: +e.target.value })} /></div>
            </div>
            <div className="flex justify-end mt-4"><Button onClick={handleAdd} disabled={!newProduct.name}>Add Product</Button></div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Base Price</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Min Qty</TableHead>
                <TableHead className="text-center">Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product, i) => (
                <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border">
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell><span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">{product.category}</span></TableCell>
                  <TableCell className="capitalize">{product.unitType}</TableCell>
                  <TableCell className="text-right">SAR {product.basePrice}</TableCell>
                  <TableCell className="text-right">SAR {product.costPrice}</TableCell>
                  <TableCell className="text-right">
                    <span className={product.stock < 10 ? 'text-status-danger font-semibold' : ''}>{product.stock}</span>
                  </TableCell>
                  <TableCell className="text-right">{product.minOrderQuantity}</TableCell>
                  <TableCell className="text-center"><Switch checked={product.isActive} onCheckedChange={() => toggleActive(product.id)} /></TableCell>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No products found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
