/*
  # Add complete_client_signup SECURITY DEFINER function

  ## Purpose
  After a new client signs up via ClientSignup.tsx, the code tries to update
  the organization with all the entered details (address, phone, VAT, etc.) using
  the newly created user's session. This fails silently because:
  - The user may not have an active session yet (timing/email confirmation)
  - Even with a session, the organizations UPDATE RLS policy may not yet reflect
    the new organization_users row that was just created by the trigger

  This function runs as SECURITY DEFINER (superuser context), bypassing RLS,
  and performs all post-signup data updates atomically in one call.

  ## Parameters
  - p_user_id: the new user's auth.uid()
  - p_registration_number: company reg or individual ID number
  - p_vat_number: VAT number (org accounts only)
  - p_email: organization contact email
  - p_phone_number: organization phone
  - p_address_line_1..postal_code: address fields
  - p_payment_option: 'Card Payment' or 'Local Account'
  - p_mobile_phone: user's mobile phone for organization_users
  - p_id_number: individual ID number for organization_users/profiles

  ## Security
  - Validates p_user_id matches a real profile before updating
  - Only updates the organization linked to that user's profile
  - Does not expose any other user's data
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

  -- Update organization with all signup data
  UPDATE organizations SET
    registration_number = COALESCE(p_registration_number, registration_number),
    vat_number = p_vat_number,
    email = COALESCE(p_email, email),
    phone_number = p_phone_number,
    address_line_1 = p_address_line_1,
    address_line_2 = p_address_line_2,
    city = p_city,
    province = p_province,
    postal_code = p_postal_code,
    payment_option = COALESCE(p_payment_option, payment_option),
    organization_type = 'client',
    is_management_org = false
  WHERE id = v_org_id;

  -- Update organization_users with mobile phone / id_number
  UPDATE organization_users SET
    mobile_phone = p_mobile_phone,
    id_number = p_id_number
  WHERE user_id = p_user_id AND organization_id = v_org_id;

  -- Update profile with id_number if provided
  IF p_id_number IS NOT NULL THEN
    UPDATE profiles SET
      id_number = p_id_number
    WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'organization_id', v_org_id);
END;
$$;

-- Allow anon and authenticated roles to call this function
-- (needed because signUp may complete before a session is established)
GRANT EXECUTE ON FUNCTION complete_client_signup(uuid, text, text, text, text, text, text, text, text, text, text, text, text) TO anon, authenticated;
