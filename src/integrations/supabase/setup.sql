-- Add location column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;

-- Update handle_new_user to include location from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  is_first_user BOOLEAN;
  assigned_role TEXT;
BEGIN
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;
  
  assigned_role := new.raw_user_meta_data ->> 'role';
  
  IF is_first_user THEN
    assigned_role := 'Admin';
  END IF;

  INSERT INTO public.profiles (id, full_name, role, location)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    assigned_role,
    new.raw_user_meta_data ->> 'location'
  );
  RETURN new;
END;
$function$;