import { useState } from 'react';
import { motion } from 'framer-motion';
import { Warehouse, AlertTriangle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { products, inventoryMovements } from '@/data/mockData';
import { useLanguage } from '@/i18n/LanguageContext';

const LOW_STOCK_THRESHOLD = 20;

const Inventory = () => {
  const { t } = useLanguage();
  const lowStockProducts = products.filter(p => p.isActive && p.stock < LOW_STOCK_THRESHOLD);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Warehouse className="w-6 h-6" /> {t.inventory.title}</h1>
        <p className="text-sm text-muted-foreground">{t.inventory.subtitle}</p>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-s-4 border-status-warning shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-status-warning" /> {t.inventory.lowStockAlerts}</h3>
            <div className="flex flex-wrap gap-3">
              {lowStockProducts.map(p => (
                <span key={p.id} className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded-lg text-xs font-medium">
                  {p.name}: <strong>{p.stock}</strong> {t.inventory.remaining}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">{t.inventory.currentStockLevels}</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.inventory.product}</TableHead>
                <TableHead>{t.inventory.category}</TableHead>
                <TableHead>{t.inventory.unit}</TableHead>
                <TableHead className="text-end">{t.products.stock}</TableHead>
                <TableHead className="text-center">{t.orders.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.filter(p => p.isActive).map((product, i) => (
                <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border">
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-sm">{product.category}</TableCell>
                  <TableCell className="text-sm">{product.unitType}</TableCell>
                  <TableCell className="text-end font-semibold">{product.stock}</TableCell>
                  <TableCell className="text-center">
                    {product.stock < LOW_STOCK_THRESHOLD ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-danger text-status-danger-foreground">{t.inventory.lowStock}</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-safe text-status-safe-foreground">{t.inventory.inStock}</span>
                    )}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">{t.inventory.stockMovementLog}</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.date}</TableHead>
                <TableHead>{t.inventory.product}</TableHead>
                <TableHead className="text-center">{t.orders.type}</TableHead>
                <TableHead className="text-end">{t.inventory.quantity}</TableHead>
                <TableHead>{t.inventory.reason}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryMovements.map(movement => (
                <TableRow key={movement.id}>
                  <TableCell className="text-sm">{movement.date}</TableCell>
                  <TableCell className="font-medium">{movement.productName}</TableCell>
                  <TableCell className="text-center">
                    {movement.type === 'in' ? (
                      <span className="inline-flex items-center gap-1 text-status-safe text-xs font-medium"><ArrowUpCircle className="w-3 h-3" /> {t.inventory.in}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-status-danger text-xs font-medium"><ArrowDownCircle className="w-3 h-3" /> {t.inventory.out}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-end font-semibold">{movement.quantity}</TableCell>
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
