import { useState } from 'react';
import { motion } from 'framer-motion';
import { Warehouse, AlertTriangle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { products, inventoryMovements } from '@/data/mockData';

const LOW_STOCK_THRESHOLD = 20;

const Inventory = () => {
  const lowStockProducts = products.filter(p => p.isActive && p.stock < LOW_STOCK_THRESHOLD);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Warehouse className="w-6 h-6" /> Inventory</h1>
        <p className="text-sm text-muted-foreground">Stock levels and movement tracking</p>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="border-l-4 border-status-warning shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-status-warning" /> Low Stock Alerts</h3>
            <div className="flex flex-wrap gap-3">
              {lowStockProducts.map(p => (
                <span key={p.id} className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded-lg text-xs font-medium">
                  {p.name}: <strong>{p.stock}</strong> {p.unitType}s remaining
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Levels */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Current Stock Levels</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.filter(p => p.isActive).map((product, i) => (
                <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border">
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-sm">{product.category}</TableCell>
                  <TableCell className="capitalize text-sm">{product.unitType}</TableCell>
                  <TableCell className="text-right font-semibold">{product.stock}</TableCell>
                  <TableCell className="text-center">
                    {product.stock < LOW_STOCK_THRESHOLD ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-danger text-status-danger-foreground">Low Stock</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-safe text-status-safe-foreground">In Stock</span>
                    )}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Movement Log */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Stock Movement Log</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryMovements.map(movement => (
                <TableRow key={movement.id}>
                  <TableCell className="text-sm">{movement.date}</TableCell>
                  <TableCell className="font-medium">{movement.productName}</TableCell>
                  <TableCell className="text-center">
                    {movement.type === 'in' ? (
                      <span className="inline-flex items-center gap-1 text-status-safe text-xs font-medium"><ArrowUpCircle className="w-3 h-3" /> In</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-status-danger text-xs font-medium"><ArrowDownCircle className="w-3 h-3" /> Out</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{movement.quantity}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{movement.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
