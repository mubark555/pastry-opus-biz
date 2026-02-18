import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { clients as initialClients, payments as initialPayments } from '@/data/mockData';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Client, Payment, PaymentMethod } from '@/types';

const Finance = () => {
  const { t } = useLanguage();

  const getCreditStatus = (client: Client) => {
    const ratio = client.outstandingBalance / client.creditLimit;
    if (ratio >= 1) return { label: t.clients.overLimit, color: 'border-status-danger', bg: 'bg-red-50', text: 'text-status-danger' };
    if (ratio >= 0.8) return { label: t.clients.nearLimit, color: 'border-status-warning', bg: 'bg-amber-50', text: 'text-status-warning' };
    return { label: t.clients.safe, color: 'border-status-safe', bg: 'bg-emerald-50', text: 'text-status-safe' };
  };

  const [clientList, setClientList] = useState<Client[]>(initialClients);
  const [paymentList, setPaymentList] = useState<Payment[]>(initialPayments);
  const [paymentDialog, setPaymentDialog] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({ amount: 0, method: 'transfer' as PaymentMethod, referenceNumber: '', notes: '', date: new Date().toISOString().split('T')[0] });

  const handleRecordPayment = () => {
    if (!paymentDialog) return;
    const client = clientList.find(c => c.id === paymentDialog)!;
    const payment: Payment = { id: `pay${Date.now()}`, clientId: paymentDialog, clientName: client.companyName, ...paymentForm };
    setPaymentList([payment, ...paymentList]);
    setClientList(clientList.map(c => c.id === paymentDialog ? { ...c, outstandingBalance: Math.max(0, c.outstandingBalance - paymentForm.amount) } : c));
    setPaymentDialog(null);
    setPaymentForm({ amount: 0, method: 'transfer', referenceNumber: '', notes: '', date: new Date().toISOString().split('T')[0] });
  };

  const totalOutstanding = clientList.reduce((s, c) => s + c.outstandingBalance, 0);
  const totalCreditLimit = clientList.reduce((s, c) => s + c.creditLimit, 0);
  const overdueClients = clientList.filter(c => c.outstandingBalance / c.creditLimit >= 1);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><CreditCard className="w-6 h-6" /> {t.finance.title}</h1>
        <p className="text-sm text-muted-foreground">{t.finance.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-muted-foreground">{t.finance.totalOutstanding}</p><p className="text-2xl font-bold text-foreground">{t.currency} {totalOutstanding.toLocaleString()}</p></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-muted-foreground">{t.finance.totalCreditLimit}</p><p className="text-2xl font-bold text-foreground">{t.currency} {totalCreditLimit.toLocaleString()}</p></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-muted-foreground">{t.finance.overLimitClients}</p><p className="text-2xl font-bold text-status-danger">{overdueClients.length}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientList.map((client, i) => {
          const status = getCreditStatus(client);
          const remaining = client.creditLimit - client.outstandingBalance;
          const usagePercent = Math.min(100, (client.outstandingBalance / client.creditLimit) * 100);
          return (
            <motion.div key={client.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`border-s-4 ${status.color} shadow-sm`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-foreground">{client.companyName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.bg} ${status.text}`}>{status.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">{t.clients.outstanding}</span><p className="font-semibold text-foreground">{t.currency} {client.outstandingBalance.toLocaleString()}</p></div>
                    <div><span className="text-muted-foreground">{t.clients.creditLimit}</span><p className="font-semibold text-foreground">{t.currency} {client.creditLimit.toLocaleString()}</p></div>
                    <div><span className="text-muted-foreground">{t.finance.remaining}</span><p className={`font-semibold ${remaining < 0 ? 'text-status-danger' : 'text-status-safe'}`}>{t.currency} {remaining.toLocaleString()}</p></div>
                    <div><span className="text-muted-foreground">{t.clients.terms}</span><p className="font-semibold text-foreground">{client.paymentTerms} {t.days}</p></div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${usagePercent >= 100 ? 'bg-status-danger' : usagePercent >= 80 ? 'bg-status-warning' : 'bg-status-safe'}`} style={{ width: `${Math.min(100, usagePercent)}%` }} />
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setPaymentDialog(client.id)}>
                    <DollarSign className="w-3 h-3 me-1" /> {t.finance.recordPayment}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">{t.finance.paymentHistory}</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.date}</TableHead>
                <TableHead>{t.orders.client}</TableHead>
                <TableHead className="text-end">{t.finance.amount}</TableHead>
                <TableHead>{t.finance.method}</TableHead>
                <TableHead>{t.finance.reference}</TableHead>
                <TableHead>{t.notes}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentList.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell className="text-sm">{payment.date}</TableCell>
                  <TableCell className="font-medium">{payment.clientName}</TableCell>
                  <TableCell className="text-end font-medium text-status-safe">{t.currency} {payment.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">
                    {payment.method === 'cash' ? t.finance.cash : payment.method === 'transfer' ? t.finance.bankTransfer : t.finance.cheque}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{payment.referenceNumber}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{payment.notes || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!paymentDialog} onOpenChange={() => setPaymentDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.finance.recordPaymentFor} — {clientList.find(c => c.id === paymentDialog)?.companyName}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{t.finance.amount} ({t.currency})</Label><Input type="number" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: +e.target.value })} /></div>
            <div>
              <Label>{t.finance.paymentMethod}</Label>
              <Select value={paymentForm.method} onValueChange={v => setPaymentForm({ ...paymentForm, method: v as PaymentMethod })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t.finance.cash}</SelectItem>
                  <SelectItem value="transfer">{t.finance.bankTransfer}</SelectItem>
                  <SelectItem value="cheque">{t.finance.cheque}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>{t.finance.referenceNumber}</Label><Input value={paymentForm.referenceNumber} onChange={e => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })} /></div>
            <div><Label>{t.date}</Label><Input type="date" value={paymentForm.date} onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })} /></div>
            <div><Label>{t.notes}</Label><Textarea value={paymentForm.notes} onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })} /></div>
          </div>
          <div className="flex justify-end mt-4"><Button onClick={handleRecordPayment} disabled={paymentForm.amount <= 0}>{t.finance.recordPayment}</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Finance;
