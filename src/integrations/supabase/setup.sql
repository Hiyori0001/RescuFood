-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'Beneficiary',
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  provider_id UUID REFERENCES auth.users(id),
  provider_name TEXT,
  location TEXT,
  status TEXT DEFAULT 'Available',
  pricing TEXT,
  price NUMERIC DEFAULT 0,
  distance NUMERIC DEFAULT 0,
  is_safety_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.inventory(id),
  provider_id UUID REFERENCES auth.users(id),
  beneficiary_id UUID REFERENCES auth.users(id),
  volunteer_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create impact_metrics table
CREATE TABLE IF NOT EXISTS public.impact_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meals_saved INTEGER DEFAULT 0,
  waste_reduced INTEGER DEFAULT 0,
  communities_served INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Policies for inventory
CREATE POLICY "Public Access Inventory" ON public.inventory FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies for transactions
CREATE POLICY "Users can see their own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = provider_id OR auth.uid() = beneficiary_id OR auth.uid() = volunteer_id);
CREATE POLICY "Beneficiaries can create transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = beneficiary_id);
CREATE POLICY "Involved parties can update transactions" ON public.transactions FOR UPDATE TO authenticated USING (auth.uid() = provider_id OR auth.uid() = beneficiary_id OR auth.uid() = volunteer_id);

-- Policies for impact_metrics
CREATE POLICY "Public Access Impact" ON public.impact_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger for new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_first_user BOOLEAN;
  assigned_role TEXT;
BEGIN
  -- Check if this is the very first user in the system
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;
  
  -- Get role from metadata, default to Beneficiary if not provided
  assigned_role := COALESCE(new.raw_user_meta_data ->> 'role', 'Beneficiary');
  
  -- Force Admin role for the first user regardless of choice
  IF is_first_user THEN
    assigned_role := 'Admin';
  END IF;

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    assigned_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();