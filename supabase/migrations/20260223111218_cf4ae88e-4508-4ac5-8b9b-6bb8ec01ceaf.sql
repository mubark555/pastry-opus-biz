
-- =============================================
-- 1. ROLE ENUM & USER ROLES TABLE
-- =============================================
CREATE TYPE public.app_role AS ENUM ('super_admin', 'sales_admin', 'kitchen', 'delivery', 'finance');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles app_role[])
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles));
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- 2. PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin', 'finance']::app_role[]));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage profiles" ON public.profiles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 3. PRODUCTS TABLE
-- =============================================
CREATE TYPE public.unit_type AS ENUM ('piece', 'tray', 'carton');

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  unit_type unit_type NOT NULL DEFAULT 'piece',
  base_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  preparation_time INT NOT NULL DEFAULT 0,
  shelf_life INT NOT NULL DEFAULT 0,
  min_order_quantity INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sales/Admin can manage products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin']::app_role[]));
CREATE POLICY "Sales/Admin can update products" ON public.products FOR UPDATE TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin']::app_role[]));
CREATE POLICY "Super admin can delete products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- 4. CLIENTS TABLE
-- =============================================
CREATE TYPE public.payment_terms_type AS ENUM ('7', '14', '30');
CREATE TYPE public.account_status AS ENUM ('active', 'suspended');

CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  commercial_reg_number TEXT DEFAULT '',
  contact_person TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  credit_limit NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_terms INT NOT NULL DEFAULT 30,
  account_status account_status NOT NULL DEFAULT 'active',
  is_prepaid BOOLEAN NOT NULL DEFAULT false,
  notes TEXT DEFAULT '',
  outstanding_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view clients" ON public.clients FOR SELECT TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin', 'kitchen', 'delivery', 'finance']::app_role[]));
CREATE POLICY "Sales can manage clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin']::app_role[]));
CREATE POLICY "Sales can update clients" ON public.clients FOR UPDATE TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin', 'finance']::app_role[]));
CREATE POLICY "Super admin can delete clients" ON public.clients FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- 5. CLIENT PRODUCT PRICING
-- =============================================
CREATE TABLE public.client_product_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  fixed_price NUMERIC(12,2),
  tiers JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.client_product_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view pricing" ON public.client_product_pricing FOR SELECT TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin', 'finance']::app_role[]));
CREATE POLICY "Sales can manage pricing" ON public.client_product_pricing FOR INSERT TO authenticated WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin']::app_role[]));
CREATE POLICY "Sales can update pricing" ON public.client_product_pricing FOR UPDATE TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin']::app_role[]));
CREATE POLICY "Sales can delete pricing" ON public.client_product_pricing FOR DELETE TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin']::app_role[]));

-- =============================================
-- 6. ORDERS TABLE (Extended with new statuses)
-- =============================================
CREATE TYPE public.order_status AS ENUM (
  'pending_review', 'approved', 'rejected', 'modification_requested',
  'waiting_payment', 'in_production', 'packaging', 'ready',
  'out_for_delivery', 'delivered', 'cancelled'
);
CREATE TYPE public.delivery_type AS ENUM ('pickup', 'delivery');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  client_name TEXT NOT NULL,
  delivery_type delivery_type NOT NULL DEFAULT 'delivery',
  requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
  requested_time TEXT DEFAULT '10:00',
  notes TEXT DEFAULT '',
  status order_status NOT NULL DEFAULT 'pending_review',
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  driver_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view orders" ON public.orders FOR SELECT TO authenticated 
  USING (
    public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin', 'finance']::app_role[])
    OR (public.has_role(auth.uid(), 'kitchen') AND status IN ('approved', 'in_production', 'packaging', 'ready'))
    OR (public.has_role(auth.uid(), 'delivery') AND status IN ('ready', 'out_for_delivery', 'delivered'))
  );
CREATE POLICY "Sales can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin']::app_role[]));
CREATE POLICY "Staff can update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin', 'kitchen', 'delivery', 'finance']::app_role[]));
CREATE POLICY "Super admin can delete orders" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- 7. ORDER ITEMS
-- =============================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view order items" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (
    public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin', 'finance']::app_role[])
    OR (public.has_role(auth.uid(), 'kitchen') AND o.status IN ('approved', 'in_production', 'packaging', 'ready'))
    OR (public.has_role(auth.uid(), 'delivery') AND o.status IN ('ready', 'out_for_delivery', 'delivered'))
  ))
);
CREATE POLICY "Sales can manage order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin']::app_role[]));
CREATE POLICY "Sales can update order items" ON public.order_items FOR UPDATE TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin']::app_role[]));
CREATE POLICY "Sales can delete order items" ON public.order_items FOR DELETE TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin']::app_role[]));

-- =============================================
-- 8. DRIVERS
-- =============================================
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view drivers" ON public.drivers FOR SELECT TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin', 'delivery']::app_role[]));
CREATE POLICY "Admin can manage drivers" ON public.drivers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- 9. INVENTORY MOVEMENTS
-- =============================================
CREATE TABLE public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) NOT NULL,
  product_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('in', 'out')),
  quantity INT NOT NULL,
  reason TEXT DEFAULT '',
  order_id UUID REFERENCES public.orders(id),
  created_by UUID REFERENCES auth.users(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view inventory" ON public.inventory_movements FOR SELECT TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin', 'kitchen', 'finance']::app_role[]));
CREATE POLICY "Staff can add movements" ON public.inventory_movements FOR INSERT TO authenticated WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin', 'kitchen']::app_role[]));

-- =============================================
-- 10. PAYMENTS TABLE
-- =============================================
CREATE TYPE public.payment_method AS ENUM ('cash', 'transfer', 'cheque');
CREATE TYPE public.payment_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  client_name TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  amount NUMERIC(12,2) NOT NULL,
  method payment_method NOT NULL DEFAULT 'cash',
  reference_number TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status payment_status NOT NULL DEFAULT 'pending',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view payments" ON public.payments FOR SELECT TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin', 'finance']::app_role[]));
CREATE POLICY "Staff can create payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin', 'finance']::app_role[]));
CREATE POLICY "Finance can update payments" ON public.payments FOR UPDATE TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'finance']::app_role[]));

-- =============================================
-- 11. PAYMENT RECEIPTS (Feature 2)
-- =============================================
CREATE TYPE public.receipt_status AS ENUM ('pending_review', 'approved', 'rejected');

CREATE TABLE public.payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  bank_name TEXT NOT NULL DEFAULT '',
  transfer_reference TEXT NOT NULL DEFAULT '',
  transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image/jpeg', 'image/png', 'application/pdf')),
  file_size INT NOT NULL,
  status receipt_status NOT NULL DEFAULT 'pending_review',
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finance and admins can view receipts" ON public.payment_receipts FOR SELECT TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin', 'finance']::app_role[]));
CREATE POLICY "Sales can upload receipts" ON public.payment_receipts FOR INSERT TO authenticated WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin']::app_role[]));
CREATE POLICY "Finance can review receipts" ON public.payment_receipts FOR UPDATE TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'finance']::app_role[]));

-- =============================================
-- 12. INVOICES (Feature 4)
-- =============================================
CREATE TYPE public.invoice_status AS ENUM ('draft', 'issued', 'paid', 'cancelled');

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  order_id UUID REFERENCES public.orders(id) NOT NULL,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  client_name TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 15.00,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'draft',
  items JSONB NOT NULL DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view invoices" ON public.invoices FOR SELECT TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin', 'finance']::app_role[]));
CREATE POLICY "Finance can create invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin', 'finance']::app_role[]));
CREATE POLICY "Finance can update invoices" ON public.invoices FOR UPDATE TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'finance']::app_role[]));

-- Invoice sequence
CREATE SEQUENCE public.invoice_seq START 1000;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('public.invoice_seq')::TEXT, 5, '0');
END;
$$;

-- =============================================
-- 13. AUDIT LOG
-- =============================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  old_values JSONB,
  new_values JSONB,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin', 'finance']::app_role[]));
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- =============================================
-- 14. HELPER FUNCTIONS
-- =============================================

-- Credit validation function
CREATE OR REPLACE FUNCTION public.validate_client_credit(
  _client_id UUID, _order_amount NUMERIC
)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _client RECORD;
  _remaining NUMERIC;
BEGIN
  SELECT credit_limit, outstanding_balance INTO _client FROM public.clients WHERE id = _client_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('valid', false, 'reason', 'Client not found'); END IF;
  
  _remaining := _client.credit_limit - _client.outstanding_balance;
  IF _order_amount > _remaining THEN
    RETURN jsonb_build_object('valid', false, 'remaining', _remaining, 'requested', _order_amount, 'reason', 'Credit limit exceeded');
  END IF;
  
  RETURN jsonb_build_object('valid', true, 'remaining', _remaining - _order_amount);
END;
$$;

-- Order number generator
CREATE SEQUENCE public.order_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('public.order_seq')::TEXT, 5, '0');
END;
$$;

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pricing_updated_at BEFORE UPDATE ON public.client_product_pricing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 15. STORAGE BUCKET FOR RECEIPTS (Private)
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

CREATE POLICY "Staff can upload receipts" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'receipts' AND public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin']::app_role[]));

CREATE POLICY "Authorized can view receipts" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'receipts' AND public.has_any_role(auth.uid(), ARRAY['super_admin', 'sales_admin', 'finance']::app_role[]));

CREATE POLICY "Admin can delete receipts" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'receipts' AND public.has_role(auth.uid(), 'super_admin'));
