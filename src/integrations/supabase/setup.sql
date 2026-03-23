-- Create custom types for roles and status
CREATE TYPE user_role AS ENUM ('Admin', 'Provider', 'NGO', 'Beneficiary', 'Volunteer');
CREATE TYPE food_status AS ENUM ('Available', 'Requested', 'Allocated', 'Delivered');
CREATE TYPE pricing_type AS ENUM ('Donated', 'Base-price', 'Discounted');

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role user_role DEFAULT 'Beneficiary',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Raw' or 'Cooked'
  quantity TEXT NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider_name TEXT,
  location TEXT,
  status food_status DEFAULT 'Available',
  pricing pricing_type DEFAULT 'Donated',
  price NUMERIC DEFAULT 0,
  distance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create impact_metrics table
CREATE TABLE impact_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meals_saved INTEGER DEFAULT 0,
  waste_reduced INTEGER DEFAULT 0,
  communities_served INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for inventory
CREATE POLICY "Inventory is viewable by everyone" ON inventory FOR SELECT USING (true);
CREATE POLICY "Providers can insert inventory" ON inventory FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Providers can update own inventory" ON inventory FOR UPDATE USING (auth.uid() = provider_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'Admin');

-- Policies for impact_metrics
CREATE POLICY "Impact metrics are viewable by everyone" ON impact_metrics FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update impact metrics" ON impact_metrics FOR UPDATE USING (auth.role() = 'authenticated');

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    -- First user becomes Admin, others default to Beneficiary
    CASE WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN 'Admin'::user_role ELSE 'Beneficiary'::user_role END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Initialize impact metrics if empty
INSERT INTO impact_metrics (meals_saved, waste_reduced, communities_served)
SELECT 1240, 450, 12
WHERE NOT EXISTS (SELECT 1 FROM impact_metrics);