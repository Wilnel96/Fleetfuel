
-- Allow sold/deleted vehicles to be re-registered by a new owner.
-- 
-- Problem: registration_number had a global UNIQUE constraint, so even
-- soft-deleted vehicles (belonging to previous owners) block new clients
-- from registering the same vehicle after purchase.
--
-- Solution:
-- 1. Drop the global unique constraint
-- 2. Add a partial unique index that only enforces uniqueness among ACTIVE
--    vehicles (deleted_at IS NULL), allowing deleted records to share a
--    registration number with a new active record
-- 3. Add a helper function for the frontend to detect "sold vehicle" scenarios

-- Step 1: Drop the global unique constraint
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_registration_number_key;

-- Step 2: Partial unique index — only active vehicles must have unique reg numbers
CREATE UNIQUE INDEX IF NOT EXISTS vehicles_registration_number_active_unique
  ON vehicles(registration_number)
  WHERE deleted_at IS NULL;

-- Step 3: Function to check if a registration number belongs to a deleted vehicle
-- Returns the previous org name so the UI can show a helpful message
CREATE OR REPLACE FUNCTION check_registration_number_availability(p_reg_number text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active_count int;
  v_deleted_count int;
  v_prev_org_name text;
BEGIN
  -- Check for active vehicle with this reg number
  SELECT COUNT(*) INTO v_active_count
  FROM vehicles
  WHERE registration_number = UPPER(TRIM(p_reg_number))
    AND deleted_at IS NULL;

  IF v_active_count > 0 THEN
    RETURN jsonb_build_object(
      'available', false,
      'reason', 'active',
      'message', 'This registration number is already registered to an active vehicle.'
    );
  END IF;

  -- Check for deleted (sold) vehicle with this reg number
  SELECT COUNT(*), MAX(o.name)
  INTO v_deleted_count, v_prev_org_name
  FROM vehicles v
  JOIN organizations o ON o.id = v.organization_id
  WHERE v.registration_number = UPPER(TRIM(p_reg_number))
    AND v.deleted_at IS NOT NULL;

  IF v_deleted_count > 0 THEN
    RETURN jsonb_build_object(
      'available', true,
      'reason', 'previously_registered',
      'message', 'This vehicle was previously registered to ' || COALESCE(v_prev_org_name, 'another client') || '. You can register it to your fleet.'
    );
  END IF;

  RETURN jsonb_build_object(
    'available', true,
    'reason', 'new',
    'message', 'Registration number is available.'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION check_registration_number_availability(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_registration_number_availability(text) TO anon;

COMMENT ON FUNCTION check_registration_number_availability IS
'Checks if a vehicle registration number can be used. Active vehicles block re-use. Deleted (sold) vehicles allow re-registration by a new owner.';
