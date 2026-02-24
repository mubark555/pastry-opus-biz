
-- Step 2: Update RLS policies with demo isolation

-- CLIENTS SELECT
DROP POLICY IF EXISTS "Staff can view clients" ON public.clients;
CREATE POLICY "Staff can view clients" ON public.clients FOR SELECT TO authenticated
USING (
  CASE
    WHEN has_role(auth.uid(), 'demo_admin') THEN is_demo = true
    WHEN has_role(auth.uid(), 'client') THEN id = (SELECT client_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
    ELSE has_any_role(auth.uid(), ARRAY['super_admin','sales_admin','kitchen','delivery','finance']::app_role[]) AND is_demo = false
  END
);

-- ORDERS SELECT
DROP POLICY IF EXISTS "Staff can view orders" ON public.orders;
CREATE POLICY "Staff can view orders" ON public.orders FOR SELECT TO authenticated
USING (
  CASE
    WHEN has_role(auth.uid(), 'demo_admin') THEN is_demo = true
    WHEN has_role(auth.uid(), 'client') THEN client_id = (SELECT client_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) AND is_demo = false
    WHEN has_role(auth.uid(), 'kitchen') THEN status = ANY(ARRAY['approved','in_production','packaging','ready']::order_status[]) AND is_demo = false
    WHEN has_role(auth.uid(), 'delivery') THEN status = ANY(ARRAY['ready','out_for_delivery','delivered']::order_status[]) AND is_demo = false
    ELSE has_any_role(auth.uid(), ARRAY['super_admin','sales_admin','finance']::app_role[]) AND is_demo = false
  END
);

-- INVOICES SELECT
DROP POLICY IF EXISTS "Staff can view invoices" ON public.invoices;
CREATE POLICY "Staff can view invoices" ON public.invoices FOR SELECT TO authenticated
USING (
  CASE
    WHEN has_role(auth.uid(), 'demo_admin') THEN is_demo = true
    WHEN has_role(auth.uid(), 'client') THEN client_id = (SELECT client_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) AND is_demo = false
    ELSE has_any_role(auth.uid(), ARRAY['super_admin','sales_admin','finance']::app_role[]) AND is_demo = false
  END
);

-- PAYMENTS SELECT
DROP POLICY IF EXISTS "Staff can view payments" ON public.payments;
CREATE POLICY "Staff can view payments" ON public.payments FOR SELECT TO authenticated
USING (
  CASE
    WHEN has_role(auth.uid(), 'demo_admin') THEN is_demo = true
    WHEN has_role(auth.uid(), 'client') THEN client_id = (SELECT client_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) AND is_demo = false
    ELSE has_any_role(auth.uid(), ARRAY['super_admin','sales_admin','finance']::app_role[]) AND is_demo = false
  END
);

-- CLIENTS INSERT with demo isolation
DROP POLICY IF EXISTS "Sales can manage clients" ON public.clients;
CREATE POLICY "Sales can manage clients" ON public.clients FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN has_role(auth.uid(), 'demo_admin') THEN is_demo = true
    ELSE has_any_role(auth.uid(), ARRAY['super_admin','sales_admin']::app_role[]) AND is_demo = false
  END
);

-- CLIENTS UPDATE with demo isolation
DROP POLICY IF EXISTS "Sales can update clients" ON public.clients;
CREATE POLICY "Sales can update clients" ON public.clients FOR UPDATE TO authenticated
USING (
  CASE
    WHEN has_role(auth.uid(), 'demo_admin') THEN is_demo = true
    ELSE has_any_role(auth.uid(), ARRAY['super_admin','sales_admin','finance']::app_role[]) AND is_demo = false
  END
);

-- ORDERS INSERT with demo isolation
DROP POLICY IF EXISTS "Sales can create orders" ON public.orders;
CREATE POLICY "Sales can create orders" ON public.orders FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN has_role(auth.uid(), 'demo_admin') THEN is_demo = true
    ELSE has_any_role(auth.uid(), ARRAY['super_admin','sales_admin']::app_role[]) AND is_demo = false
  END
);

-- ORDERS UPDATE with demo isolation
DROP POLICY IF EXISTS "Staff can update orders" ON public.orders;
CREATE POLICY "Staff can update orders" ON public.orders FOR UPDATE TO authenticated
USING (
  CASE
    WHEN has_role(auth.uid(), 'demo_admin') THEN is_demo = true
    ELSE has_any_role(auth.uid(), ARRAY['super_admin','sales_admin','kitchen','delivery','finance']::app_role[]) AND is_demo = false
  END
);
