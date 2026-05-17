
CREATE TABLE public.free_plan_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  plan subscription_plan NOT NULL DEFAULT 'basic',
  duration_days integer NOT NULL DEFAULT 30,
  notes text,
  created_by uuid NOT NULL,
  used_by uuid,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.free_plan_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins manage tickets"
ON public.free_plan_tickets FOR ALL
USING (has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Authenticated can read ticket by code"
ON public.free_plan_tickets FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can redeem ticket"
ON public.free_plan_tickets FOR UPDATE
TO authenticated
USING (used_by IS NULL)
WITH CHECK (used_by = auth.uid());

CREATE INDEX idx_free_plan_tickets_code ON public.free_plan_tickets(code);
