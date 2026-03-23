-- Create inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  provider_id TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Available',
  pricing TEXT NOT NULL,
  price NUMERIC DEFAULT 0,
  distance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create impact_metrics table
CREATE TABLE IF NOT EXISTS public.impact_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meals_saved INTEGER DEFAULT 0,
  waste_reduced INTEGER DEFAULT 0,
  communities_served INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;

-- Create public policies (for testing with custom auth)
CREATE POLICY "Public Access Inventory" ON public.inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Impact" ON public.impact_metrics FOR ALL USING (true) WITH CHECK (true);

-- Insert initial impact metrics if empty
INSERT INTO public.impact_metrics (meals_saved, waste_reduced, communities_served)
SELECT 1240, 450, 12
WHERE NOT EXISTS (SELECT 1 FROM public.impact_metrics);