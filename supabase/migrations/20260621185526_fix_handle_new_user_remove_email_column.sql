
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id uuid;
  org_name text;
  user_name text;
  user_surname text;
  is_org_user boolean;
BEGIN
  -- If created by edge function (has organization_id in metadata), skip
  is_org_user := (NEW.raw_user_meta_data->>'organization_id') IS NOT NULL;
  IF is_org_user THEN
    RETURN NEW;
  END IF;

  org_name := COALESCE(NEW.raw_user_meta_data->>'organization_name', 'Organization');
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', '');
  user_surname := COALESCE(NEW.raw_user_meta_data->>'surname', '');

  -- Create organization
  INSERT INTO organizations (name, status)
  VALUES (org_name, 'active')
  RETURNING id INTO org_id;

  -- Create profile (no email column on profiles table)
  INSERT INTO profiles (id, organization_id, full_name, role)
  VALUES (NEW.id, org_id, user_name || ' ' || user_surname, 'admin');

  -- Create Main User row
  INSERT INTO organization_users (
    user_id, organization_id, is_main_user, is_active, role,
    title, first_name, surname, email
  )
  VALUES (
    NEW.id, org_id, true, true, 'main_user',
    'Main User', user_name, user_surname, NEW.email
  );

  -- Create Billing User row
  INSERT INTO organization_users (
    user_id, organization_id, is_main_user, is_active, role,
    title, first_name, surname, email
  )
  VALUES (
    NEW.id, org_id, false, true, 'user',
    'Billing User', user_name, user_surname, NEW.email
  );

  RETURN NEW;
END;
$$;
