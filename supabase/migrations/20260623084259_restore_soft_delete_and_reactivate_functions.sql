-- Restore soft_delete_vehicle, soft_delete_driver, reactivate_vehicle, reactivate_driver
-- These functions were lost from the schema cache and need to be recreated.

-- ============================================================
-- soft_delete_vehicle
-- ============================================================
CREATE OR REPLACE FUNCTION soft_delete_vehicle(vehicle_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  user_org_id uuid;
  vehicle_org_id uuid;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT organization_id INTO user_org_id FROM profiles WHERE id = current_user_id;
  SELECT organization_id INTO vehicle_org_id FROM vehicles WHERE id = vehicle_id;

  IF vehicle_org_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Vehicle not found');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = current_user_id AND role = 'super_admin')
     AND vehicle_org_id != user_org_id
     AND vehicle_org_id NOT IN (SELECT id FROM organizations WHERE parent_org_id = user_org_id)
  THEN
    RETURN json_build_object('success', false, 'error', 'Permission denied');
  END IF;

  UPDATE vehicles
  SET deleted_at = now(), deleted_by = current_user_id
  WHERE id = vehicle_id AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Vehicle already deleted or not found');
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION soft_delete_vehicle(uuid) TO authenticated;

-- ============================================================
-- reactivate_vehicle
-- ============================================================
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
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT organization_id INTO user_org_id FROM profiles WHERE id = current_user_id;
  SELECT organization_id INTO vehicle_org_id FROM vehicles WHERE id = vehicle_id;

  IF vehicle_org_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Vehicle not found');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = current_user_id AND role = 'super_admin')
     AND vehicle_org_id != user_org_id
     AND vehicle_org_id NOT IN (SELECT id FROM organizations WHERE parent_org_id = user_org_id)
  THEN
    RETURN json_build_object('success', false, 'error', 'Permission denied');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM vehicles WHERE id = vehicle_id AND deleted_at IS NOT NULL) THEN
    RETURN json_build_object('success', false, 'error', 'Vehicle is not deleted');
  END IF;

  UPDATE vehicles SET deleted_at = NULL, deleted_by = NULL WHERE id = vehicle_id;

  RETURN json_build_object('success', true, 'message', 'Vehicle reactivated successfully');
END;
$$;

GRANT EXECUTE ON FUNCTION reactivate_vehicle(uuid) TO authenticated;

-- ============================================================
-- soft_delete_driver
-- ============================================================
CREATE OR REPLACE FUNCTION soft_delete_driver(driver_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  user_org_id uuid;
  driver_org_id uuid;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT organization_id INTO user_org_id FROM profiles WHERE id = current_user_id;
  SELECT organization_id INTO driver_org_id FROM drivers WHERE id = driver_id;

  IF driver_org_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Driver not found');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = current_user_id AND role = 'super_admin')
     AND driver_org_id != user_org_id
     AND driver_org_id NOT IN (SELECT id FROM organizations WHERE parent_org_id = user_org_id)
  THEN
    RETURN json_build_object('success', false, 'error', 'Permission denied');
  END IF;

  UPDATE drivers
  SET deleted_at = now(), deleted_by = current_user_id
  WHERE id = driver_id AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Driver already deleted or not found');
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION soft_delete_driver(uuid) TO authenticated;

-- ============================================================
-- reactivate_driver
-- ============================================================
CREATE OR REPLACE FUNCTION reactivate_driver(driver_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  user_org_id uuid;
  driver_org_id uuid;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT organization_id INTO user_org_id FROM profiles WHERE id = current_user_id;
  SELECT organization_id INTO driver_org_id FROM drivers WHERE id = driver_id;

  IF driver_org_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Driver not found');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = current_user_id AND role = 'super_admin')
     AND driver_org_id != user_org_id
     AND driver_org_id NOT IN (SELECT id FROM organizations WHERE parent_org_id = user_org_id)
  THEN
    RETURN json_build_object('success', false, 'error', 'Permission denied');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM drivers WHERE id = driver_id AND deleted_at IS NOT NULL) THEN
    RETURN json_build_object('success', false, 'error', 'Driver is not deleted');
  END IF;

  UPDATE drivers SET deleted_at = NULL, deleted_by = NULL WHERE id = driver_id;

  RETURN json_build_object('success', true, 'message', 'Driver reactivated successfully');
END;
$$;

GRANT EXECUTE ON FUNCTION reactivate_driver(uuid) TO authenticated;
