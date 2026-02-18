export type UnitType = 'piece' | 'tray' | 'carton';
export type PaymentTerms = 7 | 14 | 30;
export type AccountStatus = 'active' | 'suspended';
export type DeliveryType = 'pickup' | 'delivery';
export type OrderStatus = 'new' | 'approved' | 'in_production' | 'packaging' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash' | 'transfer' | 'cheque';

export interface Product {
  id: string;
  name: string;
  category: string;
  unitType: UnitType;
  basePrice: number;
  costPrice: number;
  preparationTime: number;
  shelfLife: number;
  minOrderQuantity: number;
  isActive: boolean;
  imageUrl?: string;
  stock: number;
}

export interface Client {
  id: string;
  companyName: string;
  commercialRegNumber: string;
  contactPerson: string;
  phone: string;
  email: string;
  creditLimit: number;
  paymentTerms: PaymentTerms;
  accountStatus: AccountStatus;
  notes: string;
  outstandingBalance: number;
}

export interface PricingTier {
  minQty: number;
  maxQty: number | null;
  price: number;
}

export interface ClientProductPricing {
  id: string;
  clientId: string;
  productId: string;
  fixedPrice?: number;
  tiers?: PricingTier[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  items: OrderItem[];
  deliveryType: DeliveryType;
  requestedDate: string;
  requestedTime: string;
  notes: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  driverId?: string;
}

export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  method: PaymentMethod;
  referenceNumber: string;
  notes: string;
  date: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  isAvailable: boolean;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  date: string;
}
