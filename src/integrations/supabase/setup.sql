-- Add volunteer_id to transactions table
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS volunteer_id UUID REFERENCES auth.users(id);

-- Update RLS policies for transactions to include volunteers and broader visibility for Admins
DROP POLICY IF EXISTS "Users can see their own transactions" ON public.transactions;
CREATE POLICY "Users can see their own transactions" ON public.transactions
FOR SELECT TO authenticated 
USING (
  (auth.uid() = provider_id) OR 
  (auth.uid() = beneficiary_id) OR 
  (auth.uid() = volunteer_id) OR
  (status = 'Approved') -- Allow volunteers to see approved tasks to claim them
);

DROP POLICY IF EXISTS "Involved parties can update transactions" ON public.transactions;
CREATE POLICY "Involved parties can update transactions" ON public.transactions
FOR UPDATE TO authenticated 
USING (
  (auth.uid() = provider_id) OR 
  (auth.uid() = beneficiary_id) OR 
  (auth.uid() = volunteer_id)
);