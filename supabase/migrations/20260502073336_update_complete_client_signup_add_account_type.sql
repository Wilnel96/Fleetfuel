/*
  # Update complete_client_signup to accept account_type

  ## Changes
  - Add p_account_type parameter (defaults to 'company')
  - Store account_type on organizations table
  - Individual accounts skip address fields, store id_number on organization_users
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
  p_id_number text DEFAULT NULL,
  p_account_type text DEFAULT 'company'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM profiles
  WHERE id = p_user_id;

  IF v_org_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No organization found for user');
  END IF;

  UPDATE organizations SET
    company_registration_number = COALESCE(NULLIF(p_registration_number, ''), company_registration_number),
    vat_number                  = COALESCE(NULLIF(p_vat_number, ''), vat_number),
    phone_number                = COALESCE(NULLIF(p_phone_number, ''), phone_number),
    address_line_1              = COALESCE(NULLIF(p_address_line_1, ''), address_line_1),
    address_line_2              = COALESCE(NULLIF(p_address_line_2, ''), address_line_2),
    city                        = COALESCE(NULLIF(p_city, ''), city),
    province                    = COALESCE(NULLIF(p_province, ''), province),
    postal_code                 = COALESCE(NULLIF(p_postal_code, ''), postal_code),
    payment_option              = COALESCE(NULLIF(p_payment_option, ''), payment_option),
    account_type                = COALESCE(NULLIF(p_account_type, ''), 'company'),
    organization_type           = 'client',
    is_management_org           = false
  WHERE id = v_org_id;

  UPDATE organization_users SET
    email        = COALESCE(NULLIF(p_email, ''), email),
    phone_mobile = COALESCE(NULLIF(p_mobile_phone, ''), phone_mobile),
    id_number    = COALESCE(NULLIF(p_id_number, ''), id_number)
  WHERE user_id = p_user_id AND organization_id = v_org_id;

  RETURN jsonb_build_object('success', true, 'organization_id', v_org_id);
END;
$$;

GRANT EXECUTE ON FUNCTION complete_client_signup(uuid, text, text, text, text, text, text, text, text, text, text, text, text, text) TO anon, authenticated;
