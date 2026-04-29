/*
  # Fix complete_client_signup function — correct column names

  ## Problem
  The previous version used column name `registration_number` but the actual
  column on the organizations table is `company_registration_number`.
  Also `email` does not exist on organizations — it should be stored on
  organization_users. These typos caused org data entered during signup to be
  silently discarded.

  ## Changes
  - Replace the function body to use correct column names
  - Store org contact email on organization_users.email (already there)
  - Store phone on organizations.phone_number (correct)
*/

CREATE OR REPLACE FUNCTION complete_client_signup(
  p_user_id uuid,
  p_registration_number text DEFAULT NULL,
  p_vat_number text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_phone_number text DEFAULT NULL,
  p_address_line_1 text DEFAULT NULL,
  p_address_line_2 text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_province text DEFAULT NULL,
  p_postal_code text DEFAULT NULL,
  p_payment_option text DEFAULT NULL,
  p_mobile_phone text DEFAULT NULL,
  p_id_number text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Get the organization_id for this user
  SELECT organization_id INTO v_org_id
  FROM profiles
  WHERE id = p_user_id;

  IF v_org_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No organization found for user');
  END IF;

  -- Update organization with signup data using correct column names
  UPDATE organizations SET
    company_registration_number = COALESCE(NULLIF(p_registration_number, ''), company_registration_number),
    vat_number                  = NULLIF(p_vat_number, ''),
    phone_number                = NULLIF(p_phone_number, ''),
    address_line_1              = NULLIF(p_address_line_1, ''),
    address_line_2              = NULLIF(p_address_line_2, ''),
    city                        = NULLIF(p_city, ''),
    province                    = NULLIF(p_province, ''),
    postal_code                 = NULLIF(p_postal_code, ''),
    payment_option              = COALESCE(NULLIF(p_payment_option, ''), payment_option),
    organization_type           = 'client',
    is_management_org           = false
  WHERE id = v_org_id;

  -- Update organization_users: email, mobile phone, id_number
  UPDATE organization_users SET
    email        = COALESCE(NULLIF(p_email, ''), email),
    mobile_phone = NULLIF(p_mobile_phone, ''),
    id_number    = NULLIF(p_id_number, '')
  WHERE user_id = p_user_id AND organization_id = v_org_id;

  -- Update profile id_number if provided
  IF p_id_number IS NOT NULL AND p_id_number != '' THEN
    UPDATE profiles SET id_number = p_id_number WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'organization_id', v_org_id);
END;
$$;

GRANT EXECUTE ON FUNCTION complete_client_signup(uuid, text, text, text, text, text, text, text, text, text, text, text, text) TO anon, authenticated;
