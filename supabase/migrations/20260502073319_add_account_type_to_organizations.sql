/*
  # Add account_type to organizations

  ## Purpose
  Distinguish between individual person accounts and company/organization accounts
  within the client organization_type. This is separate from organization_type
  which distinguishes client/garage/management.

  ## Changes
  - Add account_type column: 'company' | 'individual', defaults to 'company'
  - Backfill existing orgs: if any organization_users row has id_number set, mark as individual
  - Update complete_client_signup to accept and store account_type
*/

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS account_type text
DEFAULT 'company'
CHECK (account_type IN ('company', 'individual'));

-- Backfill: mark as individual where the main user has an id_number
UPDATE organizations o
SET account_type = 'individual'
WHERE EXISTS (
  SELECT 1 FROM organization_users ou
  WHERE ou.organization_id = o.id
  AND ou.id_number IS NOT NULL
  AND ou.id_number != ''
);

CREATE INDEX IF NOT EXISTS idx_organizations_account_type ON organizations(account_type);
