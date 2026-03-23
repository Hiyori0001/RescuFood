-- 1. Clean up existing objects (Safe for re-running)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS impact_metrics;
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS food_status;
DROP TYPE IF EXISTS pricing_type;

-- 2. Create custom types
CREATE TYPE user_role AS ENUM ('Admin', 'Provider', 'NGO', 'Beneficiary', 'Volunteer');
CREATE TYPE food_status AS ENUM ('Available', 'Requested', 'Allocated', 'Delivered');
CREATE TYPE pricing_type AS ENUM ('Donated', 'Base-price', 'Discounted');

-- 3. Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role user_role DEFAULT 'Beneficiary',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create inventory table
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

-- 5. Create impact_metrics table
CREATE TABLE impact_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meals_saved INTEGER DEFAULT 0,
  waste_reduced INTEGER DEFAULT 0,
  communities_served INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_metrics ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies
-- Profiles: Everyone can see profiles, users can only edit their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Inventory: Everyone can see items, providers can list/edit their own
CREATE POLICY "Inventory is viewable by everyone" ON inventory FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert inventory" ON inventory FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own inventory" ON inventory FOR UPDATE USING (auth.uid() = provider_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'Admin');

-- Impact Metrics: Everyone can see, authenticated users can update (via app logic)
CREATE POLICY "Impact metrics are viewable by everyone" ON impact_metrics FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update impact metrics" ON impact_metrics FOR UPDATE USING (auth.role() = 'authenticated');

-- 8. Create Trigger for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    -- The very first user to sign up becomes Admin, others are Beneficiaries
    CASE WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN 'Admin'::user_role ELSE 'Beneficiary'::user_role END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Seed initial impact data
INSERT INTO impact_metrics (meals_saved, waste_reduced, communities_served)
VALUES (1240, 450, 12);