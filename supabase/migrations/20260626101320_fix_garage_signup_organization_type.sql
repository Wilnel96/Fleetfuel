-- Fix the garage signup function to set organization_type = 'garage'
-- Find and update the approve_garage_signup function which creates the organization

CREATE OR REPLACE FUNCTION approve_garage_signup(
  p_garage_id uuid,
  p_contact_email text,
  p_contact_password text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_garage record;
  v_contact_person jsonb;
  v_contact_name text;
  v_contact_surname text;
  v_contact_mobile text;
  v_organization_id uuid;
  v_result jsonb;
BEGIN
  -- Get garage details
  SELECT * INTO v_garage FROM garages WHERE id = p_garage_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Garage not found';
  END IF;

  -- Get primary contact person
  SELECT cp INTO v_contact_person
  FROM jsonb_array_elements(v_garage.contact_persons) cp
  WHERE (cp->>'is_primary')::boolean = true
  LIMIT 1;

  IF v_contact_person IS NULL THEN
    SELECT cp INTO v_contact_person
    FROM jsonb_array_elements(v_garage.contact_persons) cp
    LIMIT 1;
  END IF;

  v_contact_name := v_contact_person->>'name';
  v_contact_surname := v_contact_person->>'surname';
  v_contact_mobile := v_contact_person->>'mobile_phone';

  -- Create or reuse organization for the garage, always typed as 'garage'
  IF v_garage.organization_id IS NOT NULL THEN
    v_organization_id := v_garage.organization_id;
    UPDATE organizations
    SET organization_type = 'garage'
    WHERE id = v_organization_id;
  ELSE
    v_organization_id := gen_random_uuid();
    INSERT INTO organizations (
      id,
      name,
      organization_type,
      is_management_org,
      status,
      created_at
    ) VALUES (
      v_organization_id,
      v_garage.name,
      'garage',
      false,
      'active',
      now()
    );

    -- Link the garage to its new organisation
    UPDATE garages SET organization_id = v_organization_id WHERE id = p_garage_id;
  END IF;

  -- Update garage to active
  UPDATE garages SET status = 'active' WHERE id = p_garage_id;

  SELECT jsonb_build_object(
    'garage_id', p_garage_id,
    'organization_id', v_organization_id,
    'status', 'approved'
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Also fix the link_garage_user_to_organization function to ensure org type is correct
CREATE OR REPLACE FUNCTION link_garage_user_to_organization(
  p_organization_id uuid,
  p_user_id uuid,
  p_name text,
  p_surname text,
  p_mobile_phone text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure the organisation is typed as 'garage'
  UPDATE organizations SET organization_type = 'garage' WHERE id = p_organization_id;

  INSERT INTO organization_users (
    organization_id,
    user_id,
    role,
    first_name,
    surname,
    title,
    phone_mobile,
    phone_office,
    is_main_user,
    is_active
  ) VALUES (
    p_organization_id,
    p_user_id,
    'garage_user',
    p_name,
    p_surname,
    'Garage Administrator',
    p_mobile_phone,
    NULL,
    true,
    true
  )
  ON CONFLICT (user_id, organization_id) DO UPDATE
    SET first_name = p_name,
        surname = p_surname,
        role = 'garage_user',
        is_active = true;

  INSERT INTO profiles (
    id,
    role,
    full_name,
    organization_id
  ) VALUES (
    p_user_id,
    'garage_user',
    p_name || ' ' || p_surname,
    p_organization_id
  )
  ON CONFLICT (id) DO UPDATE
    SET role = 'garage_user',
        organization_id = p_organization_id;
END;
$$;

GRANT EXECUTE ON FUNCTION link_garage_user_to_organization(uuid, uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_garage_signup(uuid, text, text) TO authenticated;