import { motion } from 'framer-motion';
import { ShoppingCart, DollarSign, ChefHat, CheckCircle, Truck, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orders, orderStatusLabels, orderStatusColors } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const todayOrders = orders.filter(o => o.requestedDate === '2026-02-18');
const yesterdayOrders = orders.filter(o => o.requestedDate === '2026-02-17');
const todaySales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
const yesterdaySales = yesterdayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

const stats = [
  { label: 'Orders Today', value: todayOrders.length, yesterday: yesterdayOrders.length, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
  { label: 'Sales Today', value: `SAR ${todaySales.toLocaleString()}`, yesterday: `SAR ${yesterdaySales.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', isUp: todaySales >= yesterdaySales },
  { label: 'In Production', value: orders.filter(o => o.status === 'in_production').length, icon: ChefHat, color: 'bg-amber-50 text-amber-600' },
  { label: 'Ready / Packaging', value: orders.filter(o => ['ready', 'packaging'].includes(o.status)).length, icon: CheckCircle, color: 'bg-purple-50 text-purple-600' },
  { label: 'Out for Delivery', value: orders.filter(o => o.status === 'out_for_delivery').length, icon: Truck, color: 'bg-cyan-50 text-cyan-600' },
  { label: 'Delivered Today', value: orders.filter(o => o.status === 'delivered').length, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
];

// Production summary: aggregate quantities per product for today
const productionSummary: Record<string, number> = {};
todayOrders.forEach(order => {
  order.items.forEach(item => {
    productionSummary[item.productName] = (productionSummary[item.productName] || 0) + item.quantity;
  });
});
const chartData = Object.entries(productionSummary).map(([name, qty]) => ({
  name: name.length > 18 ? name.substring(0, 18) + '...' : name,
  quantity: qty,
}));

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Daily operations overview — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                {stat.yesterday !== undefined && (
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-0.5">
                    {stat.isUp !== undefined ? (stat.isUp ? <ArrowUpRight className="w-3 h-3 text-status-safe" /> : <ArrowDownRight className="w-3 h-3 text-status-danger" />) : null}
                    Yesterday: {stat.yesterday}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Today's Production Quantities</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 90%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-10 text-center">No production data for today</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 6).map(order => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{order.clientName}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${orderStatusColors[order.status]}`}>
                      {orderStatusLabels[order.status]}
                    </span>
                    <p className="text-xs font-medium text-foreground mt-1">SAR {order.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
