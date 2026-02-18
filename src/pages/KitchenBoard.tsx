import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Clock, Play, CheckCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { orders as initialOrders, orderStatusColors } from '@/data/mockData';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Order, OrderStatus } from '@/types';

const kitchenStatuses: OrderStatus[] = ['approved', 'in_production', 'packaging', 'ready'];

const KitchenBoard = () => {
  const { t } = useLanguage();
  const [orderList, setOrderList] = useState<Order[]>(initialOrders);

  const kitchenOrders = orderList.filter(o => kitchenStatuses.includes(o.status));

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrderList(orderList.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const todayOrders = orderList.filter(o => o.requestedDate === '2026-02-18' && o.status !== 'cancelled');
  const productionSummary: Record<string, { quantity: number }> = {};
  todayOrders.forEach(order => {
    order.items.forEach(item => {
      if (!productionSummary[item.productName]) productionSummary[item.productName] = { quantity: 0 };
      productionSummary[item.productName].quantity += item.quantity;
    });
  });

  const getActionButton = (order: Order) => {
    switch (order.status) {
      case 'approved': return <Button size="sm" className="gap-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => updateStatus(order.id, 'in_production')}><Play className="w-3 h-3" /> {t.kitchen.start}</Button>;
      case 'in_production': return <Button size="sm" variant="outline" className="gap-1" onClick={() => updateStatus(order.id, 'packaging')}><Package className="w-3 h-3" /> {t.kitchen.pack}</Button>;
      case 'packaging': return <Button size="sm" className="gap-1 bg-status-safe text-status-safe-foreground hover:bg-status-safe/90" onClick={() => updateStatus(order.id, 'ready')}><CheckCircle className="w-3 h-3" /> {t.kitchen.ready}</Button>;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><ChefHat className="w-6 h-6" /> {t.kitchen.title}</h1>
        <p className="text-sm text-muted-foreground">{t.kitchen.subtitle}</p>
      </div>

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">{t.kitchen.productionBoard}</TabsTrigger>
          <TabsTrigger value="summary">{t.kitchen.dailySummary}</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kitchenStatuses.map(status => (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${orderStatusColors[status]}`}>
                    {t.orderStatus[status as keyof typeof t.orderStatus]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({kitchenOrders.filter(o => o.status === status).length})
                  </span>
                </div>
                <div className="space-y-3">
                  {kitchenOrders.filter(o => o.status === status).map((order, i) => (
                    <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="border shadow-sm">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-foreground">{order.orderNumber}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">{order.deliveryType === 'delivery' ? t.orders.delivery : t.orders.pickup}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{order.clientName}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {order.requestedDate} {t.kitchen.at} {order.requestedTime}
                          </div>
                          <div className="border-t border-border pt-2">
                            {order.items.map(item => (
                              <div key={item.productId} className="flex justify-between text-xs py-0.5">
                                <span className="text-foreground">{item.productName}</span>
                                <span className="font-semibold text-foreground">×{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          {order.notes && <p className="text-xs text-muted-foreground italic">📝 {order.notes}</p>}
                          {getActionButton(order)}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  {kitchenOrders.filter(o => o.status === status).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">{t.kitchen.noOrders}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          <Card className="border-0 shadow-sm max-w-lg">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">{t.kitchen.todaysProduction}</h3>
              {Object.entries(productionSummary).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(productionSummary).map(([name, data]) => (
                    <div key={name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm text-foreground">{name}</span>
                      <span className="text-lg font-bold text-accent">{data.quantity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">{t.kitchen.noProduction}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KitchenBoard;
