import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { products as initialProducts } from '@/data/mockData';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Product, UnitType } from '@/types';

const categories = ['All', 'Baklava', 'Kunafa', 'Maamoul', 'Basbousa', 'Assorted', 'Specialty', 'Turkish Delight'];

const Products = () => {
  const { t } = useLanguage();
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

  const unitLabel = (unit: string) => {
    const map: Record<string, string> = { piece: t.products.piece, tray: t.products.tray, carton: t.products.carton };
    return map[unit] || unit;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.products.title}</h1>
          <p className="text-sm text-muted-foreground">{t.products.subtitle}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> {t.products.addProduct}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{t.products.addNewProduct}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>{t.products.productName}</Label>
                <Input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
              </div>
              <div>
                <Label>{t.products.category}</Label>
                <Select value={newProduct.category} onValueChange={v => setNewProduct({ ...newProduct, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t.products.unitType}</Label>
                <Select value={newProduct.unitType} onValueChange={v => setNewProduct({ ...newProduct, unitType: v as UnitType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">{t.products.piece}</SelectItem>
                    <SelectItem value="tray">{t.products.tray}</SelectItem>
                    <SelectItem value="carton">{t.products.carton}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>{t.products.basePrice} ({t.currency})</Label><Input type="number" value={newProduct.basePrice} onChange={e => setNewProduct({ ...newProduct, basePrice: +e.target.value })} /></div>
              <div><Label>{t.products.costPrice} ({t.currency})</Label><Input type="number" value={newProduct.costPrice} onChange={e => setNewProduct({ ...newProduct, costPrice: +e.target.value })} /></div>
              <div><Label>{t.products.prepTime}</Label><Input type="number" value={newProduct.preparationTime} onChange={e => setNewProduct({ ...newProduct, preparationTime: +e.target.value })} /></div>
              <div><Label>{t.products.shelfLife}</Label><Input type="number" value={newProduct.shelfLife} onChange={e => setNewProduct({ ...newProduct, shelfLife: +e.target.value })} /></div>
              <div><Label>{t.products.minQty}</Label><Input type="number" value={newProduct.minOrderQuantity} onChange={e => setNewProduct({ ...newProduct, minOrderQuantity: +e.target.value })} /></div>
              <div><Label>{t.products.initialStock}</Label><Input type="number" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: +e.target.value })} /></div>
            </div>
            <div className="flex justify-end mt-4"><Button onClick={handleAdd} disabled={!newProduct.name}>{t.products.addProduct}</Button></div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.products.searchProducts} className="ps-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c === 'All' ? t.all : c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.products.productName}</TableHead>
                <TableHead>{t.products.category}</TableHead>
                <TableHead>{t.products.unit}</TableHead>
                <TableHead className="text-end">{t.products.basePrice}</TableHead>
                <TableHead className="text-end">{t.products.cost}</TableHead>
                <TableHead className="text-end">{t.products.stock}</TableHead>
                <TableHead className="text-end">{t.products.minQty}</TableHead>
                <TableHead className="text-center">{t.active}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product, i) => (
                <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border">
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell><span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">{product.category}</span></TableCell>
                  <TableCell>{unitLabel(product.unitType)}</TableCell>
                  <TableCell className="text-end">{t.currency} {product.basePrice}</TableCell>
                  <TableCell className="text-end">{t.currency} {product.costPrice}</TableCell>
                  <TableCell className="text-end">
                    <span className={product.stock < 10 ? 'text-status-danger font-semibold' : ''}>{product.stock}</span>
                  </TableCell>
                  <TableCell className="text-end">{product.minOrderQuantity}</TableCell>
                  <TableCell className="text-center"><Switch checked={product.isActive} onCheckedChange={() => toggleActive(product.id)} /></TableCell>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{t.products.noProducts}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
