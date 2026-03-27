-- Add volunteer_id column to track who is delivering the food
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS volunteer_id UUID REFERENCES auth.users(id);

-- Update SELECT policy to allow volunteers to see 'Approved' tasks (available for pickup)
DROP POLICY IF EXISTS "Users can see their own transactions" ON public.transactions;
CREATE POLICY "Users can see relevant transactions" ON public.transactions
FOR SELECT TO authenticated 
USING (
  auth.uid() = provider_id OR 
  auth.uid() = beneficiary_id OR 
  auth.uid() = volunteer_id OR 
  status = 'Approved'
);

-- Update UPDATE policy to allow volunteers to claim 'Approved' tasks
DROP POLICY IF EXISTS "Involved parties can update transactions" ON public.transactions;
CREATE POLICY "Involved parties can update transactions" ON public.transactions
FOR UPDATE TO authenticated 
USING (
  auth.uid() = provider_id OR 
  auth.uid() = beneficiary_id OR 
  auth.uid() = volunteer_id OR
  (status = 'Approved' AND volunteer_id IS NULL)
);