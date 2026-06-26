DO $$
DECLARE
  v_org_id uuid;
  v_user_id uuid;
  v_garage_id uuid := 'df72ab81-8537-464c-aac8-236d552e929f';
BEGIN

  -- Create an organisation for TotalEnergies Route 62
  INSERT INTO organizations (
    id,
    name,
    is_management_org,
    status
  ) VALUES (
    gen_random_uuid(),
    'TotalEnergies Route 62',
    false,
    'active'
  )
  RETURNING id INTO v_org_id;

  -- Link the garage to its new organisation
  UPDATE garages
  SET organization_id = v_org_id
  WHERE id = v_garage_id;

  -- Create auth user for Cheryl Nel
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'totalr62@gmail.com',
    crypt('cn9591@C', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('name', 'Cheryl', 'surname', 'Nel', 'organization_id', v_org_id),
    now(),
    now(),
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO v_user_id;

  -- Create profile with garage_user role
  INSERT INTO profiles (id, role, full_name, organization_id)
  VALUES (v_user_id, 'garage_user', 'Cheryl Nel', v_org_id)
  ON CONFLICT (id) DO UPDATE
    SET role = 'garage_user', organization_id = v_org_id;

  -- Link to organisation_users with garage_user role
  INSERT INTO organization_users (
    user_id,
    organization_id,
    email,
    first_name,
    surname,
    role,
    title,
    is_main_user,
    is_active
  ) VALUES (
    v_user_id,
    v_org_id,
    'totalr62@gmail.com',
    'Cheryl',
    'Nel',
    'garage_user',
    'Garage Administrator',
    true,
    true
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Done. org_id=%, user_id=%', v_org_id, v_user_id;
END;
$$;