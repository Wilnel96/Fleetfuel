-- Mark all organizations that are linked to a garage as organization_type = 'garage'
UPDATE organizations o
SET organization_type = 'garage'
WHERE EXISTS (
  SELECT 1 FROM garages g WHERE g.organization_id = o.id
);

-- Also mark any organization where all users have role = 'garage_user'
-- (catches cases where garage org exists but garage link was removed)
UPDATE organizations o
SET organization_type = 'garage'
WHERE id IN (
  SELECT DISTINCT organization_id
  FROM organization_users
  WHERE role = 'garage_user'
)
AND NOT EXISTS (
  SELECT 1 FROM organization_users
  WHERE organization_id = o.id AND role != 'garage_user'
)
AND is_management_org = false;

-- Add a check constraint on organization_type to enforce known values
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS check_organization_type;
ALTER TABLE organizations ADD CONSTRAINT check_organization_type
  CHECK (organization_type IN ('client', 'garage', 'management'));

-- Update the management org type
UPDATE organizations SET organization_type = 'management' WHERE is_management_org = true;