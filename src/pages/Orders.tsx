import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { orders as initialOrders, clients, products, clientPricing, orderStatusLabels, orderStatusColors } from '@/data/mockData';
import type { Order, OrderStatus, OrderItem, DeliveryType } from '@/types';

const getClientPrice = (clientId: string, productId: string, quantity: number): number => {
  const pricing = clientPricing.find(cp => cp.clientId === clientId && cp.productId === productId);
  if (!pricing) {
    const product = products.find(p => p.id === productId);
    return product?.basePrice || 0;
  }
  if (pricing.fixedPrice !== undefined) return pricing.fixedPrice;
  if (pricing.tiers) {
    const tier = pricing.tiers.find(t => quantity >= t.minQty && (t.maxQty === null || quantity <= t.maxQty));
    return tier?.price || pricing.tiers[0]?.price || 0;
  }
  return 0;
};

const statusOrder: OrderStatus[] = ['new', 'approved', 'in_production', 'packaging', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

const Orders = () => {
  const [orderList, setOrderList] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [notes, setNotes] = useState('');

  const filtered = orderList.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const addOrderItem = () => setOrderItems([...orderItems, { productId: products[0].id, quantity: 1 }]);

  const updateOrderItem = (index: number, field: string, value: string | number) => {
    const updated = [...orderItems];
    (updated[index] as any)[field] = value;
    setOrderItems(updated);
  };

  const handleCreateOrder = () => {
    const client = clients.find(c => c.id === selectedClient);
    if (!client) return;
    const items: OrderItem[] = orderItems.map(oi => {
      const product = products.find(p => p.id === oi.productId)!;
      const unitPrice = getClientPrice(selectedClient, oi.productId, oi.quantity);
      return { productId: oi.productId, productName: product.name, quantity: oi.quantity, unitPrice, total: unitPrice * oi.quantity };
    });
    const totalAmount = items.reduce((s, i) => s + i.total, 0);
    
    // Credit check
    const remainingCredit = client.creditLimit - client.outstandingBalance;
    if (totalAmount > remainingCredit) {
      alert(`Credit limit exceeded! Remaining credit: SAR ${remainingCredit.toLocaleString()}`);
      return;
    }

    const order: Order = {
      id: `o${Date.now()}`, orderNumber: `ORD-${Date.now()}`, clientId: selectedClient, clientName: client.companyName,
      items, deliveryType, requestedDate: new Date().toISOString().split('T')[0], requestedTime: '10:00',
      notes, status: 'new', totalAmount, createdAt: new Date().toISOString(),
    };
    setOrderList([order, ...orderList]);
    setDialogOpen(false);
    setOrderItems([]);
    setSelectedClient('');
    setNotes('');
  };

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrderList(orderList.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const getNextStatus = (status: OrderStatus): OrderStatus | null => {
    const idx = statusOrder.indexOf(status);
    if (idx < 0 || idx >= statusOrder.length - 2) return null; // skip cancelled
    return statusOrder[idx + 1];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground">{orderList.length} total orders</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> New Order</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create New Order</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>{clients.filter(c => c.accountStatus === 'active').map(c => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}</SelectContent>
                  </Select>
                  {selectedClient && (() => {
                    const cl = clients.find(c => c.id === selectedClient)!;
                    const remaining = cl.creditLimit - cl.outstandingBalance;
                    return <p className="text-xs text-muted-foreground mt-1">Credit remaining: SAR {remaining.toLocaleString()}</p>;
                  })()}
                </div>
                <div>
                  <Label>Delivery Type</Label>
                  <Select value={deliveryType} onValueChange={v => setDeliveryType(v as DeliveryType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="pickup">Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Order Items</Label>
                  <Button variant="outline" size="sm" onClick={addOrderItem}>Add Item</Button>
                </div>
                {orderItems.map((item, idx) => {
                  const unitPrice = selectedClient ? getClientPrice(selectedClient, item.productId, item.quantity) : 0;
                  return (
                    <div key={idx} className="grid grid-cols-4 gap-2 mb-2 items-end">
                      <div className="col-span-2">
                        <Select value={item.productId} onValueChange={v => updateOrderItem(idx, 'productId', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{products.filter(p => p.isActive).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <Input type="number" min={1} value={item.quantity} onChange={e => updateOrderItem(idx, 'quantity', +e.target.value)} placeholder="Qty" />
                      <p className="text-sm text-muted-foreground pb-2">SAR {(unitPrice * item.quantity).toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>

              <div><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} /></div>
            </div>
            <div className="flex justify-end mt-4"><Button onClick={handleCreateOrder} disabled={!selectedClient || orderItems.length === 0}>Create Order</Button></div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOrder.map(s => <SelectItem key={s} value={s}>{orderStatusLabels[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead>Date / Time</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order, i) => {
                const next = getNextStatus(order.status);
                return (
                  <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border">
                    <TableCell className="font-medium text-sm">{order.orderNumber}</TableCell>
                    <TableCell>{order.clientName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{order.items.length} item(s)</TableCell>
                    <TableCell className="text-center capitalize text-sm">{order.deliveryType}</TableCell>
                    <TableCell className="text-sm">{order.requestedDate} {order.requestedTime}</TableCell>
                    <TableCell className="text-right font-medium">SAR {order.totalAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${orderStatusColors[order.status]}`}>{orderStatusLabels[order.status]}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {next && <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => updateStatus(order.id, next)}>{orderStatusLabels[next]}</Button>}
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
