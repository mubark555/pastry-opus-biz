import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { clients, products, clientPricing as initialPricing } from '@/data/mockData';
import type { ClientProductPricing, PricingTier } from '@/types';

const ClientPricing = () => {
  const [pricingList, setPricingList] = useState<ClientProductPricing[]>(initialPricing);
  const [selectedClient, setSelectedClient] = useState(clients[0]?.id || '');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPricing, setEditPricing] = useState<{ productId: string; type: 'fixed' | 'tier'; fixedPrice: number; tiers: PricingTier[] }>({
    productId: products[0]?.id || '', type: 'fixed', fixedPrice: 0, tiers: [{ minQty: 1, maxQty: 20, price: 0 }, { minQty: 21, maxQty: null, price: 0 }],
  });

  const clientPricingEntries = pricingList.filter(cp => cp.clientId === selectedClient);
  const client = clients.find(c => c.id === selectedClient);

  const handleSave = () => {
    const entry: ClientProductPricing = {
      id: `cp${Date.now()}`, clientId: selectedClient, productId: editPricing.productId,
      ...(editPricing.type === 'fixed' ? { fixedPrice: editPricing.fixedPrice } : { tiers: editPricing.tiers }),
    };
    // Remove existing pricing for same client+product
    const updated = pricingList.filter(cp => !(cp.clientId === selectedClient && cp.productId === editPricing.productId));
    setPricingList([...updated, entry]);
    setDialogOpen(false);
  };

  const addTier = () => {
    const lastTier = editPricing.tiers[editPricing.tiers.length - 1];
    const newMin = (lastTier?.maxQty || 0) + 1;
    setEditPricing({ ...editPricing, tiers: [...editPricing.tiers, { minQty: newMin, maxQty: null, price: 0 }] });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Client Pricing</h1>
          <p className="text-sm text-muted-foreground">Manage client-specific product pricing and tier discounts</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Add Pricing Rule</Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}</SelectContent>
            </Select>
            {client && <span className="text-xs text-muted-foreground">Payment terms: {client.paymentTerms} days</span>}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Pricing Type</TableHead>
                <TableHead>Client Price / Tiers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientPricingEntries.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No custom pricing for this client. Base prices apply.</TableCell></TableRow>
              ) : (
                clientPricingEntries.map(cp => {
                  const product = products.find(p => p.id === cp.productId);
                  return (
                    <TableRow key={cp.id}>
                      <TableCell className="font-medium">{product?.name || cp.productId}</TableCell>
                      <TableCell className="text-muted-foreground">SAR {product?.basePrice}</TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">
                          {cp.fixedPrice !== undefined ? 'Fixed Price' : 'Tier Pricing'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {cp.fixedPrice !== undefined ? (
                          <span className="font-semibold text-accent">SAR {cp.fixedPrice}</span>
                        ) : (
                          <div className="space-y-0.5">
                            {cp.tiers?.map((tier, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="text-muted-foreground">{tier.minQty}–{tier.maxQty ?? '∞'} units:</span>{' '}
                                <span className="font-semibold text-accent">SAR {tier.price}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Pricing Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Pricing Rule for {client?.companyName}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product</Label>
              <Select value={editPricing.productId} onValueChange={v => setEditPricing({ ...editPricing, productId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{products.filter(p => p.isActive).map(p => <SelectItem key={p.id} value={p.id}>{p.name} (Base: SAR {p.basePrice})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pricing Type</Label>
              <Select value={editPricing.type} onValueChange={v => setEditPricing({ ...editPricing, type: v as 'fixed' | 'tier' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="tier">Tier Pricing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editPricing.type === 'fixed' ? (
              <div><Label>Fixed Price (SAR)</Label><Input type="number" value={editPricing.fixedPrice} onChange={e => setEditPricing({ ...editPricing, fixedPrice: +e.target.value })} /></div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between"><Label>Tiers</Label><Button variant="outline" size="sm" onClick={addTier}>Add Tier</Button></div>
                {editPricing.tiers.map((tier, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2">
                    <div><Label className="text-xs">Min Qty</Label><Input type="number" value={tier.minQty} onChange={e => { const t = [...editPricing.tiers]; t[idx] = { ...t[idx], minQty: +e.target.value }; setEditPricing({ ...editPricing, tiers: t }); }} /></div>
                    <div><Label className="text-xs">Max Qty</Label><Input type="number" value={tier.maxQty ?? ''} placeholder="∞" onChange={e => { const t = [...editPricing.tiers]; t[idx] = { ...t[idx], maxQty: e.target.value ? +e.target.value : null }; setEditPricing({ ...editPricing, tiers: t }); }} /></div>
                    <div><Label className="text-xs">Price (SAR)</Label><Input type="number" value={tier.price} onChange={e => { const t = [...editPricing.tiers]; t[idx] = { ...t[idx], price: +e.target.value }; setEditPricing({ ...editPricing, tiers: t }); }} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end mt-4"><Button onClick={handleSave}>Save Pricing</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientPricing;
