import { Product, Client, ClientProductPricing, Order, Payment, Driver, InventoryMovement } from '@/types';

export const products: Product[] = [
  { id: 'p1', name: 'Premium Baklava Tray', category: 'Baklava', unitType: 'tray', basePrice: 120, costPrice: 65, preparationTime: 90, shelfLife: 14, minOrderQuantity: 2, isActive: true, stock: 45 },
  { id: 'p2', name: 'Kunafa Classic', category: 'Kunafa', unitType: 'tray', basePrice: 95, costPrice: 48, preparationTime: 60, shelfLife: 3, minOrderQuantity: 3, isActive: true, stock: 30 },
  { id: 'p3', name: 'Maamoul Date Box', category: 'Maamoul', unitType: 'carton', basePrice: 80, costPrice: 40, preparationTime: 120, shelfLife: 30, minOrderQuantity: 5, isActive: true, stock: 60 },
  { id: 'p4', name: 'Basbousa Tray', category: 'Basbousa', unitType: 'tray', basePrice: 70, costPrice: 32, preparationTime: 45, shelfLife: 5, minOrderQuantity: 3, isActive: true, stock: 25 },
  { id: 'p5', name: 'Mixed Sweets Carton', category: 'Assorted', unitType: 'carton', basePrice: 200, costPrice: 110, preparationTime: 150, shelfLife: 10, minOrderQuantity: 1, isActive: true, stock: 15 },
  { id: 'p6', name: 'Halawet El Jibn', category: 'Specialty', unitType: 'tray', basePrice: 110, costPrice: 55, preparationTime: 75, shelfLife: 4, minOrderQuantity: 2, isActive: true, stock: 20 },
  { id: 'p7', name: 'Turkish Delight Box', category: 'Turkish Delight', unitType: 'carton', basePrice: 60, costPrice: 28, preparationTime: 180, shelfLife: 60, minOrderQuantity: 10, isActive: true, stock: 80 },
  { id: 'p8', name: 'Pistachio Rolls', category: 'Baklava', unitType: 'piece', basePrice: 8, costPrice: 4, preparationTime: 90, shelfLife: 14, minOrderQuantity: 20, isActive: false, stock: 0 },
];

export const clients: Client[] = [
  { id: 'c1', companyName: 'Grand Palace Hotel', commercialRegNumber: 'CR-2024-001', contactPerson: 'Ahmed Al-Rashid', phone: '+966 50 123 4567', email: 'purchasing@grandpalace.com', creditLimit: 50000, paymentTerms: 30, accountStatus: 'active', notes: 'Premium client, weekly orders', outstandingBalance: 12500 },
  { id: 'c2', companyName: 'Café Arabica Chain', commercialRegNumber: 'CR-2024-002', contactPerson: 'Sara Hassan', phone: '+966 55 234 5678', email: 'orders@cafearabica.com', creditLimit: 30000, paymentTerms: 14, accountStatus: 'active', notes: '12 branches, bulk orders', outstandingBalance: 28500 },
  { id: 'c3', companyName: 'Royal Events Co.', commercialRegNumber: 'CR-2024-003', contactPerson: 'Khalid Mohammed', phone: '+966 54 345 6789', email: 'catering@royalevents.com', creditLimit: 100000, paymentTerms: 30, accountStatus: 'active', notes: 'Event-based, large orders', outstandingBalance: 45000 },
  { id: 'c4', companyName: 'Desert Rose Restaurant', commercialRegNumber: 'CR-2024-004', contactPerson: 'Fatima Al-Zahrani', phone: '+966 56 456 7890', email: 'kitchen@desertrose.com', creditLimit: 15000, paymentTerms: 7, accountStatus: 'active', notes: 'Small regular orders', outstandingBalance: 14800 },
  { id: 'c5', companyName: 'Oasis Catering', commercialRegNumber: 'CR-2024-005', contactPerson: 'Omar Bakri', phone: '+966 53 567 8901', email: 'info@oasiscatering.com', creditLimit: 25000, paymentTerms: 14, accountStatus: 'suspended', notes: 'Account suspended - overdue payments', outstandingBalance: 26000 },
];

export const clientPricing: ClientProductPricing[] = [
  { id: 'cp1', clientId: 'c1', productId: 'p1', tiers: [{ minQty: 1, maxQty: 10, price: 115 }, { minQty: 11, maxQty: 30, price: 108 }, { minQty: 31, maxQty: null, price: 100 }] },
  { id: 'cp2', clientId: 'c1', productId: 'p2', fixedPrice: 88 },
  { id: 'cp3', clientId: 'c2', productId: 'p1', fixedPrice: 110 },
  { id: 'cp4', clientId: 'c2', productId: 'p3', tiers: [{ minQty: 1, maxQty: 20, price: 75 }, { minQty: 21, maxQty: 50, price: 70 }, { minQty: 51, maxQty: null, price: 65 }] },
  { id: 'cp5', clientId: 'c3', productId: 'p5', fixedPrice: 180 },
  { id: 'cp6', clientId: 'c3', productId: 'p1', tiers: [{ minQty: 1, maxQty: 20, price: 112 }, { minQty: 21, maxQty: null, price: 102 }] },
];

export const orders: Order[] = [
  { id: 'o1', orderNumber: 'ORD-2024-0001', clientId: 'c1', clientName: 'Grand Palace Hotel', items: [{ productId: 'p1', productName: 'Premium Baklava Tray', quantity: 15, unitPrice: 108, total: 1620 }, { productId: 'p2', productName: 'Kunafa Classic', quantity: 10, unitPrice: 88, total: 880 }], deliveryType: 'delivery', requestedDate: '2026-02-18', requestedTime: '10:00', notes: 'For hotel breakfast buffet', status: 'in_production', totalAmount: 2500, createdAt: '2026-02-17T14:30:00' },
  { id: 'o2', orderNumber: 'ORD-2024-0002', clientId: 'c2', clientName: 'Café Arabica Chain', items: [{ productId: 'p3', productName: 'Maamoul Date Box', quantity: 40, unitPrice: 70, total: 2800 }], deliveryType: 'delivery', requestedDate: '2026-02-18', requestedTime: '08:00', notes: 'Distribute to 12 branches', status: 'ready', totalAmount: 2800, createdAt: '2026-02-17T09:00:00' },
  { id: 'o3', orderNumber: 'ORD-2024-0003', clientId: 'c3', clientName: 'Royal Events Co.', items: [{ productId: 'p5', productName: 'Mixed Sweets Carton', quantity: 25, unitPrice: 180, total: 4500 }, { productId: 'p1', productName: 'Premium Baklava Tray', quantity: 30, unitPrice: 102, total: 3060 }], deliveryType: 'delivery', requestedDate: '2026-02-19', requestedTime: '16:00', notes: 'Wedding reception - VIP', status: 'approved', totalAmount: 7560, createdAt: '2026-02-17T11:00:00' },
  { id: 'o4', orderNumber: 'ORD-2024-0004', clientId: 'c4', clientName: 'Desert Rose Restaurant', items: [{ productId: 'p4', productName: 'Basbousa Tray', quantity: 5, unitPrice: 70, total: 350 }, { productId: 'p6', productName: 'Halawet El Jibn', quantity: 3, unitPrice: 110, total: 330 }], deliveryType: 'pickup', requestedDate: '2026-02-18', requestedTime: '14:00', notes: '', status: 'new', totalAmount: 680, createdAt: '2026-02-18T07:00:00' },
  { id: 'o5', orderNumber: 'ORD-2024-0005', clientId: 'c1', clientName: 'Grand Palace Hotel', items: [{ productId: 'p7', productName: 'Turkish Delight Box', quantity: 20, unitPrice: 55, total: 1100 }], deliveryType: 'delivery', requestedDate: '2026-02-18', requestedTime: '11:00', notes: '', status: 'out_for_delivery', totalAmount: 1100, createdAt: '2026-02-17T16:00:00' },
  { id: 'o6', orderNumber: 'ORD-2024-0006', clientId: 'c2', clientName: 'Café Arabica Chain', items: [{ productId: 'p1', productName: 'Premium Baklava Tray', quantity: 8, unitPrice: 110, total: 880 }], deliveryType: 'pickup', requestedDate: '2026-02-17', requestedTime: '15:00', notes: '', status: 'delivered', totalAmount: 880, createdAt: '2026-02-16T10:00:00' },
  { id: 'o7', orderNumber: 'ORD-2024-0007', clientId: 'c3', clientName: 'Royal Events Co.', items: [{ productId: 'p2', productName: 'Kunafa Classic', quantity: 50, unitPrice: 90, total: 4500 }], deliveryType: 'delivery', requestedDate: '2026-02-18', requestedTime: '09:00', notes: 'Corporate event', status: 'packaging', totalAmount: 4500, createdAt: '2026-02-17T08:00:00' },
  { id: 'o8', orderNumber: 'ORD-2024-0008', clientId: 'c4', clientName: 'Desert Rose Restaurant', items: [{ productId: 'p4', productName: 'Basbousa Tray', quantity: 3, unitPrice: 70, total: 210 }], deliveryType: 'pickup', requestedDate: '2026-02-17', requestedTime: '12:00', notes: '', status: 'delivered', totalAmount: 210, createdAt: '2026-02-16T14:00:00' },
];

export const payments: Payment[] = [
  { id: 'pay1', clientId: 'c1', clientName: 'Grand Palace Hotel', amount: 5000, method: 'transfer', referenceNumber: 'TRF-20240215-001', notes: 'Partial payment', date: '2026-02-15' },
  { id: 'pay2', clientId: 'c2', clientName: 'Café Arabica Chain', amount: 3000, method: 'cheque', referenceNumber: 'CHQ-7892', notes: '', date: '2026-02-10' },
  { id: 'pay3', clientId: 'c3', clientName: 'Royal Events Co.', amount: 15000, method: 'transfer', referenceNumber: 'TRF-20240212-003', notes: 'Wedding advance', date: '2026-02-12' },
  { id: 'pay4', clientId: 'c4', clientName: 'Desert Rose Restaurant', amount: 1200, method: 'cash', referenceNumber: 'CASH-0044', notes: '', date: '2026-02-14' },
];

export const drivers: Driver[] = [
  { id: 'd1', name: 'Mohammed Ali', phone: '+966 50 111 2222', isAvailable: true },
  { id: 'd2', name: 'Youssef Karim', phone: '+966 55 333 4444', isAvailable: false },
  { id: 'd3', name: 'Hassan Ibrahim', phone: '+966 54 555 6666', isAvailable: true },
];

export const inventoryMovements: InventoryMovement[] = [
  { id: 'im1', productId: 'p1', productName: 'Premium Baklava Tray', type: 'in', quantity: 30, reason: 'Production batch', date: '2026-02-17' },
  { id: 'im2', productId: 'p1', productName: 'Premium Baklava Tray', type: 'out', quantity: 15, reason: 'Order ORD-2024-0001', date: '2026-02-18' },
  { id: 'im3', productId: 'p2', productName: 'Kunafa Classic', type: 'in', quantity: 20, reason: 'Production batch', date: '2026-02-17' },
  { id: 'im4', productId: 'p3', productName: 'Maamoul Date Box', type: 'out', quantity: 40, reason: 'Order ORD-2024-0002', date: '2026-02-18' },
  { id: 'im5', productId: 'p7', productName: 'Turkish Delight Box', type: 'in', quantity: 50, reason: 'Production batch', date: '2026-02-16' },
];

export const orderStatusLabels: Record<string, string> = {
  new: 'New',
  approved: 'Approved',
  in_production: 'In Production',
  packaging: 'Packaging',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const orderStatusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  approved: 'bg-indigo-100 text-indigo-800',
  in_production: 'bg-amber-100 text-amber-800',
  packaging: 'bg-purple-100 text-purple-800',
  ready: 'bg-emerald-100 text-emerald-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};
