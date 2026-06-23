-- Fix: Deleted vehicles were not showing their "Deleted" status in the UI.
-- Root cause: Multiple overlapping SELECT policies on the vehicles table. 
-- Some policies applied no deleted_at filter, meaning the query returned 
-- vehicles correctly — but the SELECT query itself never fetched deleted_at,
-- OR a policy was filtering out deleted rows before they reached the app.
--
-- Solution: Drop all existing vehicles SELECT policies and replace with 
-- clean, explicit policies that always include deleted vehicles for 
-- authenticated users (so the UI can show their Deleted status).

-- Drop all known vehicles SELECT policies
DROP POLICY IF EXISTS "vehicles_select_policy" ON vehicles;
DROP POLICY IF EXISTS "Users can view vehicles in their organization" ON vehicles;
DROP POLICY IF EXISTS "Users can view all vehicles in their organization" ON vehicles;
DROP POLICY IF EXISTS "Users can view active vehicles in their organization" ON vehicles;
DROP POLICY IF EXISTS "Super admin can view all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Super admin can view all vehicles including deleted" ON vehicles;
DROP POLICY IF EXISTS "Parent orgs can view child org vehicles" ON vehicles;
DROP POLICY IF EXISTS "Anonymous users can view active vehicles for driver app" ON vehicles;
DROP POLICY IF EXISTS "Management users can view all client vehicles" ON vehicles;
DROP POLICY IF EXISTS "vehicles_authenticated_select" ON vehicles;
DROP POLICY IF EXISTS "vehicles_super_admin_select" ON vehicles;
DROP POLICY IF EXISTS "vehicles_anon_select" ON vehicles;

-- Authenticated users see ALL vehicles (including deleted) in their org or child orgs
-- The UI is responsible for rendering deleted_at appropriately
CREATE POLICY "vehicles_org_select"
  ON vehicles FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    OR
    organization_id IN (
      SELECT id FROM organizations
      WHERE parent_org_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'management')
    )
  );

-- Anonymous (driver app) only sees active vehicles
CREATE POLICY "vehicles_anon_active_select"
  ON vehicles FOR SELECT
  TO anon
  USING (deleted_at IS NULL);
