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
import { Textarea } from '@/components/ui/textarea';
import { clients as initialClients } from '@/data/mockData';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Client, PaymentTerms } from '@/types';

const Clients = () => {
  const { t } = useLanguage();

  const getCreditStatus = (client: Client) => {
    const ratio = client.outstandingBalance / client.creditLimit;
    if (ratio >= 1) return { label: t.clients.overLimit, className: 'bg-status-danger text-status-danger-foreground' };
    if (ratio >= 0.8) return { label: t.clients.nearLimit, className: 'bg-status-warning text-status-warning-foreground' };
    return { label: t.clients.safe, className: 'bg-status-safe text-status-safe-foreground' };
  };

  const [clientList, setClientList] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({ companyName: '', commercialRegNumber: '', contactPerson: '', phone: '', email: '', creditLimit: 10000, paymentTerms: 14 as PaymentTerms, notes: '' });

  const filtered = clientList.filter(c => c.companyName.toLowerCase().includes(search.toLowerCase()) || c.contactPerson.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    const client: Client = { ...newClient, id: `c${Date.now()}`, accountStatus: 'active', outstandingBalance: 0 };
    setClientList([...clientList, client]);
    setDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.clients.title}</h1>
          <p className="text-sm text-muted-foreground">{t.clients.subtitle}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> {t.clients.addClient}</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{t.clients.addNewClient}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label>{t.clients.companyName}</Label><Input value={newClient.companyName} onChange={e => setNewClient({ ...newClient, companyName: e.target.value })} /></div>
              <div><Label>{t.clients.crNumber}</Label><Input value={newClient.commercialRegNumber} onChange={e => setNewClient({ ...newClient, commercialRegNumber: e.target.value })} /></div>
              <div><Label>{t.clients.contactPerson}</Label><Input value={newClient.contactPerson} onChange={e => setNewClient({ ...newClient, contactPerson: e.target.value })} /></div>
              <div><Label>{t.clients.phone}</Label><Input value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} /></div>
              <div><Label>{t.clients.email}</Label><Input value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} /></div>
              <div><Label>{t.clients.creditLimit} ({t.currency})</Label><Input type="number" value={newClient.creditLimit} onChange={e => setNewClient({ ...newClient, creditLimit: +e.target.value })} /></div>
              <div>
                <Label>{t.clients.paymentTerms}</Label>
                <Select value={String(newClient.paymentTerms)} onValueChange={v => setNewClient({ ...newClient, paymentTerms: +v as PaymentTerms })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 {t.days}</SelectItem>
                    <SelectItem value="14">14 {t.days}</SelectItem>
                    <SelectItem value="30">30 {t.days}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>{t.notes}</Label><Textarea value={newClient.notes} onChange={e => setNewClient({ ...newClient, notes: e.target.value })} /></div>
            </div>
            <div className="flex justify-end mt-4"><Button onClick={handleAdd} disabled={!newClient.companyName}>{t.clients.addClient}</Button></div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.clients.searchClients} className="ps-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.clients.company}</TableHead>
                <TableHead>{t.clients.contact}</TableHead>
                <TableHead>{t.clients.phone}</TableHead>
                <TableHead className="text-end">{t.clients.creditLimit}</TableHead>
                <TableHead className="text-end">{t.clients.outstanding}</TableHead>
                <TableHead className="text-center">{t.clients.terms}</TableHead>
                <TableHead className="text-center">{t.clients.creditStatus}</TableHead>
                <TableHead className="text-center">{t.clients.account}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client, i) => {
                const creditStatus = getCreditStatus(client);
                return (
                  <motion.tr key={client.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border">
                    <TableCell className="font-medium">{client.companyName}</TableCell>
                    <TableCell>{client.contactPerson}</TableCell>
                    <TableCell className="text-sm">{client.phone}</TableCell>
                    <TableCell className="text-end">{t.currency} {client.creditLimit.toLocaleString()}</TableCell>
                    <TableCell className="text-end font-medium">{t.currency} {client.outstandingBalance.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{client.paymentTerms} {t.days}</TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${creditStatus.className}`}>{creditStatus.label}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${client.accountStatus === 'active' ? 'bg-status-safe text-status-safe-foreground' : 'bg-status-danger text-status-danger-foreground'}`}>
                        {client.accountStatus === 'active' ? t.active : t.suspended}
                      </span>
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

export default Clients;
