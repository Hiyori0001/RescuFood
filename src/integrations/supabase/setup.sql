-- Remove the default 'Volunteer' role from the profiles table
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

-- Update the handle_new_user function to remove the default role assignment
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
  -- Check if this is the very first user in the system
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;
  
  -- Get role from metadata (will be NULL if not provided)
  assigned_role := new.raw_user_meta_data ->> 'role';
  
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
$function$;