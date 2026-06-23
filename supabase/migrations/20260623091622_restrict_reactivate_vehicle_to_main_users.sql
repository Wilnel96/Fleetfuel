-- Restrict reactivate_vehicle to Main Users, Secondary Main Users, and Super Admins only.
-- Regular users with can_delete_vehicles permission can delete but cannot reactivate.
-- This protects audit integrity — only authorised principals can restore deleted records.

CREATE OR REPLACE FUNCTION reactivate_vehicle(vehicle_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  user_org_id uuid;
  vehicle_org_id uuid;
  is_super boolean;
  is_main  boolean;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check super admin
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = current_user_id AND role = 'super_admin'
  ) INTO is_super;

  SELECT organization_id INTO user_org_id FROM profiles WHERE id = current_user_id;
  SELECT organization_id INTO vehicle_org_id FROM vehicles WHERE id = vehicle_id;

  IF vehicle_org_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Vehicle not found');
  END IF;

  -- Ownership check (super admins bypass)
  IF NOT is_super
     AND vehicle_org_id != user_org_id
     AND vehicle_org_id NOT IN (SELECT id FROM organizations WHERE parent_org_id = user_org_id)
  THEN
    RETURN json_build_object('success', false, 'error', 'Permission denied');
  END IF;

  -- Authorization check: must be Main User, Secondary Main User, or Super Admin
  IF NOT is_super THEN
    SELECT EXISTS (
      SELECT 1 FROM organization_users
      WHERE user_id = current_user_id
        AND is_active = true
        AND (is_main_user = true OR is_secondary_main_user = true)
    ) INTO is_main;

    IF NOT is_main THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Only a Main User or Secondary Main User can reactivate a deleted vehicle. Please contact your account Main User to restore this vehicle.'
      );
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM vehicles WHERE id = vehicle_id AND deleted_at IS NOT NULL) THEN
    RETURN json_build_object('success', false, 'error', 'Vehicle is not deleted');
  END IF;

  UPDATE vehicles SET deleted_at = NULL, deleted_by = NULL WHERE id = vehicle_id;

  RETURN json_build_object('success', true, 'message', 'Vehicle reactivated successfully');
END;
$$;

GRANT EXECUTE ON FUNCTION reactivate_vehicle(uuid) TO authenticated;
