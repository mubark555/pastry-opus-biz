import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, CheckCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { orders as initialOrders, drivers, orderStatusLabels, orderStatusColors } from '@/data/mockData';
import type { Order, OrderStatus } from '@/types';

const Delivery = () => {
  const [orderList, setOrderList] = useState<Order[]>(initialOrders);

  const deliveryOrders = orderList.filter(o => o.deliveryType === 'delivery' && ['ready', 'out_for_delivery', 'delivered'].includes(o.status));

  const assignDriver = (orderId: string, driverId: string) => {
    setOrderList(orderList.map(o => o.id === orderId ? { ...o, driverId } : o));
  };

  const updateStatus = (orderId: string, status: OrderStatus) => {
    setOrderList(orderList.map(o => o.id === orderId ? { ...o, status } : o));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Truck className="w-6 h-6" /> Delivery Management</h1>
        <p className="text-sm text-muted-foreground">Manage delivery assignments and tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Drivers */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Drivers</h3>
            {drivers.map(driver => (
              <div key={driver.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{driver.name}</p>
                  <p className="text-xs text-muted-foreground">{driver.phone}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${driver.isAvailable ? 'bg-status-safe text-status-safe-foreground' : 'bg-status-warning text-status-warning-foreground'}`}>
                  {driver.isAvailable ? 'Available' : 'On Route'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Delivery Orders */}
        <div className="md:col-span-2 space-y-3">
          {deliveryOrders.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center text-muted-foreground">No delivery orders</CardContent>
            </Card>
          )}
          {deliveryOrders.map((order, i) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm font-bold text-foreground">{order.orderNumber}</span>
                      <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${orderStatusColors[order.status]}`}>{orderStatusLabels[order.status]}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">SAR {order.totalAmount.toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-foreground mb-1">{order.clientName}</p>
                  <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.requestedDate} at {order.requestedTime}</p>
                  
                  <div className="flex items-center gap-3">
                    {order.status === 'ready' && (
                      <>
                        <Select value={order.driverId || ''} onValueChange={v => assignDriver(order.id, v)}>
                          <SelectTrigger className="w-48"><SelectValue placeholder="Assign driver" /></SelectTrigger>
                          <SelectContent>{drivers.filter(d => d.isAvailable).map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button size="sm" disabled={!order.driverId} onClick={() => updateStatus(order.id, 'out_for_delivery')} className="gap-1">
                          <Truck className="w-3 h-3" /> Dispatch
                        </Button>
                      </>
                    )}
                    {order.status === 'out_for_delivery' && (
                      <Button size="sm" className="gap-1 bg-status-safe text-status-safe-foreground hover:bg-status-safe/90" onClick={() => updateStatus(order.id, 'delivered')}>
                        <CheckCircle className="w-3 h-3" /> Confirm Delivered
                      </Button>
                    )}
                    {order.status === 'delivered' && (
                      <span className="text-xs text-status-safe font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Delivered</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Delivery;
